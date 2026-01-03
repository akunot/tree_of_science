from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import uuid

# Estados del sistema
USER_STATES = (
    ('PENDING', 'Pendiente de verificación'),
    ('ACTIVE', 'Activo'),
    ('SUSPENDED', 'Suspendido'),
    ('INVITED', 'Invitado'),
)

INVITATION_STATES = (
    ('PENDING', 'Pendiente'),
    ('ACCEPTED', 'Aceptada'),
    ('EXPIRED', 'Expirada'),
    ('CANCELLED', 'Cancelada'),
)


class User(AbstractUser):
    """
    Modelo de usuario personalizado con sistema de roles y estados
    """
    # Campos básicos ya heredados de AbstractUser: username, password, email, 
    # first_name, last_name, is_staff, is_active, date_joined, etc.
    
    # Estados del usuario
    user_state = models.CharField(
        max_length=10, 
        choices=USER_STATES, 
        default='ACTIVE'
    )
    
    # Verificación
    is_verified = models.BooleanField(default=True) # Cambiar a false mas adelante
    verification_token = models.CharField(max_length=100, blank=True, null=True)
    verification_date = models.DateTimeField(blank=True, null=True)
    
    # Se requiere que el correo sea unico
    email = models.EmailField('email address', unique=True, blank=False)
    
    # Campos adicionales
    phone = models.CharField(max_length=20, blank=True, null=True)
    organization = models.CharField(max_length=100, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    
    # Invitación relacionada
    invited_by = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='invited_users'
    )
    invitation_accepted = models.BooleanField(default=True) # Cambiar a false mas adelante
    
    # Campos de auditoría
    last_login_ip = models.GenericIPAddressField(blank=True, null=True)
    login_attempts = models.PositiveIntegerField(default=0)
    locked_until = models.DateTimeField(blank=True, null=True)
    
    # Meta
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    def get_full_name(self):
        """Retorna el nombre completo del usuario"""
        return f"{self.first_name} {self.last_name}".strip()
    
    @property
    def is_admin(self):
        """Determina si el usuario es administrador"""
        return self.is_staff or self.is_superuser
    
    @property
    def is_regular_user(self):
        """Determina si es un usuario regular"""
        return not self.is_admin
    
    def can_accept_invitations(self):
        """Verifica si el usuario puede enviar invitaciones"""
        return self.is_active and self.user_state == 'ACTIVE' and self.is_verified
    
    def is_locked(self):
        """Verifica si la cuenta está bloqueada temporalmente"""
        if self.locked_until:
            return timezone.now() < self.locked_until
        return False
    
    def increment_login_attempts(self):
        """Incrementa los intentos de login fallidos"""
        self.login_attempts += 1
        if self.login_attempts >= 5:  # Bloquear después de 5 intentos
            self.locked_until = timezone.now() + timezone.timedelta(minutes=30)
        self.save()
    
    def reset_login_attempts(self):
        """Resetea los intentos de login"""
        self.login_attempts = 0
        self.locked_until = None
        self.save()
    
    def activate(self):
        """Activa la cuenta del usuario"""
        self.is_active = True
        self.user_state = 'ACTIVE'
        self.is_verified = True
        self.verification_date = timezone.now()
        self.verification_token = None
        self.save()
    
    def generate_verification_token(self):
        """Genera un token de verificación"""
        self.verification_token = str(uuid.uuid4())
        self.save()
        return self.verification_token
    
    def accept_invitation(self, invitation_token):
        """Acepta una invitación usando el token"""
        try:
            invitation = Invitation.objects.get(
                token=invitation_token,
                email=self.email,
                state='PENDING'
            )
            
            self.invited_by = invitation.inviter
            self.invitation_accepted = True
            self.user_state = 'INVITED'
            self.generate_verification_token()
            self.save()
            
            invitation.state = 'ACCEPTED'
            invitation.save()
            
            return True
        except Invitation.DoesNotExist:
            return False
    
    class Meta:
        db_table = 'auth_user'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        indexes = [
            models.Index(fields=['user_state']),
            models.Index(fields=['email']),
            models.Index(fields=['is_verified']),
        ]


class Invitation(models.Model):
    """
    Sistema de invitaciones para registro por invitación
    """
    # Token único de invitación
    token = models.SlugField(unique=True, default=uuid.uuid4)
    
    # Usuario que invita
    inviter = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='sent_invitations'
    )
    
    # Email del invitado
    email = models.EmailField()
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    
    # Mensaje opcional
    message = models.TextField(blank=True, null=True)
    
    # Estado de la invitación
    state = models.CharField(
        max_length=10, 
        choices=INVITATION_STATES, 
        default='PENDING'
    )
    
    # Metadatos
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    accepted_at = models.DateTimeField(blank=True, null=True)
    
    # Campos adicionales
    organization = models.CharField(max_length=100, blank=True, null=True)
    
    def save(self, *args, **kwargs):
        # Configurar fecha de expiración (7 días por defecto)
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(days=7)
        super().save(*args, **kwargs)
    
    def is_expired(self):
        """Verifica si la invitación ha expirado"""
        return timezone.now() > self.expires_at
    
    def is_valid(self):
        """Verifica si la invitación es válida"""
        return (
            self.state == 'PENDING' and 
            not self.is_expired() and
            self.inviter.can_accept_invitations()
        )
    
    def expire(self):
        """Marca la invitación como expirada"""
        if self.state == 'PENDING':
            self.state = 'EXPIRED'
            self.save()
    
    def cancel(self):
        """Cancela la invitación"""
        if self.state == 'PENDING':
            self.state = 'CANCELLED'
            self.save()
    
    def accept(self, user):
        """Acepta la invitación (crear usuario)"""
        if not self.is_valid():
            return None
            
        # Crear usuario si no existe
        try:
            existing_user = User.objects.get(email=self.email)
            # Si el usuario ya existe, vincular la invitación
            user = existing_user
        except User.DoesNotExist:
            # Generar username único basado en email
            base_username = self.email.split('@')[0]
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}_{counter}"
                counter += 1
            
            user = User.objects.create_user(
                username=username,
                email=self.email,
                first_name=self.first_name,
                last_name=self.last_name,
                is_active=False,  # Requiere verificación
                invited_by=self.inviter
            )
        
        # Vincular usuario con la invitación
        success = user.accept_invitation(str(self.token))
        
        if success:
            self.state = 'ACCEPTED'
            self.accepted_at = timezone.now()
            self.save()
            return user
        
        return None
    
    def __str__(self):
        return f"Invitación para {self.email} por {self.inviter.get_full_name()}"
    
    class Meta:
        db_table = 'invitations'
        verbose_name = 'Invitación'
        verbose_name_plural = 'Invitaciones'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['state']),
            models.Index(fields=['expires_at']),
        ]


class UserActivity(models.Model):
    """
    Registro de actividad de usuarios para auditoría
    """
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='activities'
    )
    
    # Tipos de actividad
    ACTIVITY_TYPES = (
        ('LOGIN', 'Inicio de sesión'),
        ('LOGOUT', 'Cierre de sesión'),
        ('LOGIN_FAILED', 'Intento de login fallido'),
        ('INVITATION_SENT', 'Invitación enviada'),
        ('INVITATION_ACCEPTED', 'Invitación aceptada'),
        ('PROFILE_UPDATED', 'Perfil actualizado'),
        ('PASSWORD_CHANGED', 'Contraseña cambiada'),
        ('ACCOUNT_ACTIVATED', 'Cuenta activada'),
        ('ACCOUNT_SUSPENDED', 'Cuenta suspendida'),
        ('ADMIN_ACTION', 'Acción administrativa'),
    )
    
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    description = models.TextField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_activity_type_display()}"
    
    class Meta:
        db_table = 'user_activities'
        verbose_name = 'Actividad de Usuario'
        verbose_name_plural = 'Actividades de Usuarios'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['activity_type']),
        ]


class Query(models.Model):
    """
    Modelo para almacenar queries/documentos de usuarios
    """
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='queries'
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Archivo de datos
    data_file = models.FileField(upload_to='queries/%Y/%m/%d/')
    
    # Estado del procesamiento
    PROCESSING_STATES = (
        ('PENDING', 'Pendiente'),
        ('PROCESSING', 'Procesando'),
        ('COMPLETED', 'Completado'),
        ('FAILED', 'Error'),
    )
    
    processing_state = models.CharField(
        max_length=10, 
        choices=PROCESSING_STATES, 
        default='PENDING'
    )
    
    # Resultados
    tree_data = models.JSONField(blank=True, null=True)
    stats = models.JSONField(blank=True, null=True)
    
    # Metadatos
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    processed_at = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.title} - {self.user.get_full_name()}"
    
    def is_processed(self):
        """Verifica si el query ha sido procesado"""
        return self.processing_state == 'COMPLETED'
    
    def start_processing(self):
        """Inicia el procesamiento"""
        self.processing_state = 'PROCESSING'
        self.save()
    
    def complete_processing(self, tree_data, stats):
        """Completa el procesamiento"""
        self.tree_data = tree_data
        self.stats = stats
        self.processing_state = 'COMPLETED'
        self.processed_at = timezone.now()
        self.save()
    
    def fail_processing(self):
        """Marca el procesamiento como fallido"""
        self.processing_state = 'FAILED'
        self.save()
    
    class Meta:
        db_table = 'queries'
        verbose_name = 'Query'
        verbose_name_plural = 'Queries'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['processing_state']),
        ]

class AdminRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('approved', 'Aprobada'),
        ('rejected', 'Rechazada'),
    ]
    
    email = models.EmailField()
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    affiliation = models.CharField(max_length=200, verbose_name='Afiliación Institucional')
    justification = models.TextField(verbose_name='Justificación')
    phone = models.CharField(max_length=20, blank=True, verbose_name='Teléfono')
    
    status = models.CharField(
        max_length=10, 
        choices=STATUS_CHOICES, 
        default='pending',
        verbose_name='Estado'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')
    reviewed_at = models.DateTimeField(null=True, blank=True, verbose_name='Fecha de Revisión')
    reviewed_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='reviewed_admin_requests',
        verbose_name='Revisado por'
    )
    review_notes = models.TextField(blank=True, verbose_name='Notas de Revisión')
    
    class Meta:
        verbose_name = 'Solicitud de Administrador'
        verbose_name_plural = 'Solicitudes de Administrador'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.email}"
    
    @property
    def is_pending(self):
        return self.status == 'pending'
    
    @property
    def is_approved(self):
        return self.status == 'approved'
    
    @property
    def is_rejected(self):
        return self.status == 'rejected'