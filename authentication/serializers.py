from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, Invitation, UserActivity, AdminRequest
from django.utils import timezone

# =============== SERIALIZERS COMPATIBLES CON TU SISTEMA ACTUAL ===============

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    invitation_token = serializers.CharField(required=False, allow_blank=True)  # Nuevo campo

    class Meta:
        model = User
        fields = ('email', 'password', 'password_confirm', 'first_name', 'last_name', 'invitation_token')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Las contraseñas no coinciden.")
        return attrs

    def validate_email(self, value):
        # Verificar que el email no esté ya registrado
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email ya está registrado.")
        return value

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        invitation_token = validated_data.pop('invitation_token', None)
        
        # Crear usuario con tu estructura actual
        user = User.objects.create_user(
            username=validated_data['email'],  # Usar email como username
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        
        # Si hay token de invitación, manejarlo
        if invitation_token:
            try:
                invitation = Invitation.objects.get(
                    token=invitation_token,
                    state='PENDING',
                    email=user.email
                )
                if invitation.is_valid():
                    user.invited_by = invitation.inviter
                    user.invitation_accepted = True
                    user.user_state = 'INVITED'
                    user.generate_verification_token()
                    user.save()
            except Invitation.DoesNotExist:
                pass  # Ignorar si la invitación no existe
        
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            try:
                user = User.objects.get(email=email)
                
                # Verificar que la contraseña sea correcta
                if not user.check_password(password):
                    raise serializers.ValidationError('Credenciales inválidas.')
                
                # Verificar si la cuenta está bloqueada
                if user.is_locked():
                    raise serializers.ValidationError('Cuenta bloqueada temporalmente. Intente más tarde.')
                
                # VERIFICACIONES ADICIONALES PARA TU MODELO
                
                # 1. Verificar que la cuenta esté VERIFICADA
                if hasattr(user, 'is_verified') and not user.is_verified:
                    raise serializers.ValidationError('Cuenta no verificada. Revise su correo electrónico para verificar su cuenta.')
                
                # 2. Verificar que la invitación haya sido ACEPTADA
                if hasattr(user, 'invitation_accepted') and not user.invitation_accepted:
                    raise serializers.ValidationError('Debe aceptar la invitación antes de iniciar sesión.')
                
                # 3. Verificar estado de la cuenta
                if user.user_state not in ['ACTIVE', 'INVITED']:
                    raise serializers.ValidationError('Cuenta no activa. Contacte al administrador.')
                
                attrs['user'] = user
                return attrs
                
            except User.DoesNotExist:
                raise serializers.ValidationError('Credenciales inválidas.')
        else:
            raise serializers.ValidationError('Debe proporcionar email y contraseña.')


class UserSerializer(serializers.ModelSerializer):
    # NO retorna 'Activo', 'Pendiente', 'Suspendido', 'Invitado'
    
    # Campo adicional: si necesitas mostrar el texto legible
    user_state_display = serializers.CharField(source='get_user_state_display', read_only=True)
    
    is_verified = serializers.BooleanField(read_only=True)
    is_staff = serializers.BooleanField(read_only=True)
    invited_by_name = serializers.CharField(source='invited_by.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'date_joined', 
                 'user_state', 'user_state_display', 'is_verified', 'is_staff', 'invited_by_name')
        read_only_fields = ('id', 'date_joined', 'user_state', 'user_state_display', 'is_verified', 'is_staff', 'invited_by_name')


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar perfil de usuario"""
    
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'phone', 'organization', 'bio')
    
    def validate_phone(self, value):
        if value and len(value) < 10:
            raise serializers.ValidationError('El número de teléfono debe tener al menos 10 dígitos.')
        return value
    
    def validate_bio(self, value):
        if value and len(value) > 500:
            raise serializers.ValidationError('La biografía no puede exceder los 500 caracteres.')
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    
    def validate_email(self, value):
        # Verificar que el email exista (pero no revelarlo en el error)
        try:
            user = User.objects.get(email=value)
            if not user.is_active or user.user_state != 'ACTIVE':
                raise serializers.ValidationError('No se puede recuperar la contraseña para esta cuenta.')
        except User.DoesNotExist:
            # No revelar si el email existe o no
            pass
        return value


class PasswordResetSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    new_password_confirm = serializers.CharField()
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("Las contraseñas no coinciden.")
        return attrs
    
    def validate_new_password(self, value):
        # Validación básica de contraseña
        if len(value) < 8:
            raise serializers.ValidationError('La contraseña debe tener al menos 8 caracteres.')
        return value


# =============== NUEVOS SERIALIZERS PARA INVITACIONES ===============

class InvitationSerializer(serializers.ModelSerializer):
    """Serializer para invitaciones (nuevo)"""
    inviter_name = serializers.CharField(source='inviter.get_full_name', read_only=True)
    is_expired = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()
    
    state_display = serializers.CharField(source='get_state_display', read_only=True, allow_null=True)
    
    is_used = serializers.SerializerMethodField()
    used_by = serializers.SerializerMethodField()
    
    class Meta:
        model = Invitation
        fields = ('id', 'token', 'email', 'first_name', 'last_name', 
                 'message', 'state', 'state_display', 'inviter_name', 'created_at', 
                 'expires_at', 'is_expired', 'days_remaining', 'is_used', 'used_by',
                 'organization')
        read_only_fields = ('id', 'token', 'state', 'state_display', 'inviter_name', 
                           'created_at', 'expires_at', 'is_expired', 'days_remaining', 'is_used', 'used_by')
    
    def get_is_expired(self, obj):
        """Verificar si la invitación expiró"""
        return obj.is_expired()
    
    def get_is_used(self, obj):
        """Verificar si la invitación fue usada"""
        return obj.state == 'ACCEPTED'
    
    def get_used_by(self, obj):
        """Obtener el usuario que aceptó la invitación"""
        if obj.state == 'ACCEPTED':
            try:
                user = User.objects.get(email=obj.email, invitation_accepted=True)
                return {
                    'id': user.id,
                    'email': user.email,
                    'name': user.get_full_name()
                }
            except User.DoesNotExist:
                return None
        return None
    
    def get_days_remaining(self, obj):
        from django.utils import timezone
        if obj.expires_at:
            days_left = (obj.expires_at - timezone.now()).days
            return max(0, days_left)
        return 0
    
    def validate_email(self, value):
        # Verificar que el email no esté ya registrado
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Este email ya está registrado en el sistema.')
        return value
    
    def create(self, validated_data):
        # Agregar el inviter (usuario actual)
        validated_data['inviter'] = self.context['request'].user
        return super().create(validated_data)


# =============== SERIALIZER PARA ACTIVIDADES ===============

class UserActivitySerializer(serializers.ModelSerializer):
    """Serializer para actividades de usuario (nuevo)"""
    activity_type_display = serializers.CharField(source='get_activity_type_display', read_only=True)
    
    class Meta:
        model = UserActivity
        fields = ('id', 'activity_type', 'activity_type_display', 
                 'description', 'ip_address', 'created_at')
        read_only_fields = ('id', 'activity_type', 'activity_type_display', 
                           'ip_address', 'created_at')


# =============== SERIALIZER PARA VERIFICACIÓN DE EMAIL ===============

class EmailVerificationSerializer(serializers.Serializer):
    """Serializer para verificación de email (nuevo)"""
    token = serializers.CharField()
    
    def validate_token(self, value):
        try:
            user = User.objects.get(verification_token=value)
            if user.is_verified:
                raise serializers.ValidationError('El email ya ha sido verificado.')
        except User.DoesNotExist:
            raise serializers.ValidationError('Token de verificación inválido.')
        return value


# =============== SERIALIZER PARA ENVÍO DE INVITACIONES ===============

class SendInvitationSerializer(serializers.Serializer):
    """Serializer para enviar invitaciones (nuevo)"""
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=30)
    last_name = serializers.CharField(max_length=30)
    message = serializers.CharField(required=False, allow_blank=True)
    organization = serializers.CharField(required=False, allow_blank=True)
    
    def validate_email(self, value):
        # Verificar que el email no esté ya registrado
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Este email ya está registrado en el sistema.')
        
        # Verificar que no existe una invitación pendiente
        if Invitation.objects.filter(email=value, state='PENDING').exists():
            raise serializers.ValidationError('Ya existe una invitación pendiente para este email.')
        
        return value
    
    def validate_first_name(self, value):
        if not value.strip():
            raise serializers.ValidationError('El nombre es requerido.')
        return value.strip()
    
    def validate_last_name(self, value):
        if not value.strip():
            raise serializers.ValidationError('El apellido es requerido.')
        return value.strip()


# =============== SERIALIZER PARA ADMINISTRADORES ===============

class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """Serializer para que administradores actualicen usuarios"""
    
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'user_state', 'is_active', 'is_staff')
    
    def validate_user_state(self, value):
        valid_states = ['PENDING', 'ACTIVE', 'SUSPENDED', 'INVITED']
        if value not in valid_states:
            raise serializers.ValidationError('Estado de usuario inválido.')
        return value


class AdminRequestSerializer(serializers.ModelSerializer):
    time_since_created = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = AdminRequest
        fields = [
            'id', 'email', 'first_name', 'last_name', 'affiliation', 
            'justification', 'phone', 'status', 'status_display',
            'created_at', 'reviewed_at', 'reviewed_by', 'review_notes',
            'time_since_created'
        ]
        read_only_fields = [
            'id', 'status', 'created_at', 'reviewed_at', 'reviewed_by', 'review_notes',
            'status_display', 'time_since_created'
        ]

    def get_time_since_created(self, obj):
        """Calcular tiempo transcurrido desde la creación"""
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.days > 0:
            return f"{diff.days} día{'s' if diff.days != 1 else ''} atrás"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} hora{'s' if hours != 1 else ''} atrás"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes} minuto{'s' if minutes != 1 else ''} atrás"
        else:
            return "Hace un momento"


class AdminRequestCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    affiliation = serializers.CharField(max_length=200)
    justification = serializers.CharField(write_only=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)

    def validate_justification(self, value):
        """Validar que la justificación tenga suficiente contenido"""
        if len(value.strip()) < 50:
            raise serializers.ValidationError(
                "La justificación debe tener al menos 50 caracteres para explicar adecuadamente su solicitud."
            )
        return value.strip()

    def validate_email(self, value):
        """Validar que el email sea institucional"""
        email = value.lower().strip()
        
        # Verificar que no sea un email ya registrado
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError(
                "Ya existe una cuenta con este email. Por favor, inicie sesión directamente."
            )
        
        # Verificar que no haya una solicitud pendiente
        if AdminRequest.objects.filter(email=email, status='pending').exists():
            raise serializers.ValidationError(
                "Ya existe una solicitud pendiente para este email."
            )
        
        return email
    
# =============== SERIALIZER PARA ESTADÍSTICAS DEL DASHBOARD ===============
class DashboardStatsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    admin_users = serializers.IntegerField()
    active_invitations = serializers.IntegerField()
    pending_requests = serializers.IntegerField()
    users_by_status = serializers.DictField()

    def validate_total_users(self, value):
        if value < 0:
            raise serializers.ValidationError('El número de usuarios no puede ser negativo')
        return value
    
    def validate_admin_users(self, value):
        if value < 0:
            raise serializers.ValidationError('El número de usuarios administradores no puede ser negativo')
        return value
    
    def validate_active_invitations(self, value):
        if value < 0:
            raise serializers.ValidationError('El número de invitaciones activas no puede ser negativo')
        return value
    
    def validate_pending_requests(self, value):
        if value < 0:
            raise serializers.ValidationError('El número de solicitudes pendientes no puede ser negativo')
        return value