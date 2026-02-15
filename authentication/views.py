import contextlib
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django.db import transaction
from django.db.models import Count
from django.db.models import Q

from .serializers import (
    UserRegistrationSerializer, 
    UserLoginSerializer, 
    UserSerializer, 
    InvitationSerializer,
    PasswordResetRequestSerializer, 
    PasswordResetSerializer,
    UserProfileUpdateSerializer,
    AdminRequestSerializer,
    DashboardStatsSerializer,
    UserActivitySerializer
)
from .models import User, Invitation, UserActivity, AdminRequest

# =============== UTILIDADES ===============

def generate_verification_token(user):
    """Genera token de verificación único"""
    from uuid import uuid4
    return str(uuid4())

def get_client_ip(request):
    """Obtiene IP del cliente"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    return (
        x_forwarded_for.split(',')[0]
        if x_forwarded_for
        else request.META.get('REMOTE_ADDR')
    )

def send_verification_email(user, request):
    """Envía email de verificación"""
    token = user.generate_verification_token()
    verification_url = f"http://localhost:3000/verify-email?token={token}"
    
    subject = 'Verifica tu cuenta - Tree of Science'
    message = f'''
    Hola {user.get_full_name()},
    
    Gracias por registrarte en Tree of Science. Para activar tu cuenta, 
    por favor haz clic en el siguiente enlace:
    
    {verification_url}
    
    Este enlace expirará en 24 horas.
    
    Si no solicitaste esta cuenta, ignora este email.
    
    Saludos,
    Equipo de Tree of Science
    '''
    
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error enviando email de verificación: {e}")
        return False

def send_invitation_email(invitation, request):
    """Envía email de invitación"""
    registration_url = f"http://localhost:3000/register?token={invitation.token}"
    
    subject = 'Invitación para unirse a Tree of Science'
    message = f'''
    Hola {invitation.first_name},
    
    Has sido invitado a unirte a Tree of Science por {invitation.inviter.get_full_name()}.
    
    {invitation.message or 'Te esperamos para comenzar a analizar la ciencia de manera innovadora.'}
    
    Para aceptar la invitación, registra tu cuenta en:
    {registration_url}
    
    Esta invitación expirará el {invitation.expires_at.strftime('%d/%m/%Y')}.
    
    Saludos,
    Equipo de Tree of Science
    '''
    
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [invitation.email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error enviando email de invitación: {e}")
        return False

def log_user_activity(user, activity_type, description, request=None):
    """Registra actividad de usuario"""
    return UserActivity.objects.create(
        user=user,
        activity_type=activity_type,
        description=description,
        ip_address=get_client_ip(request) if request else None,
        user_agent=request.META.get('HTTP_USER_AGENT') if request else None,
    )

# =============== VISTAS DE AUTENTICACIÓN ===============

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Registro de nuevo usuario - ADAPTADO PARA INVITACIONES
    """
    serializer = UserRegistrationSerializer(data=request.data)

    if serializer.is_valid():
        invitation_token = request.data.get('invitation_token')

        try:
            with transaction.atomic():
                if invitation_token:
                    # Registro por invitación
                    invitation = Invitation.objects.get(
                        token=invitation_token,
                        state='PENDING'
                    )

                    if not invitation.is_valid():
                        return Response({
                            'error': 'Invitación inválida o expirada'
                        }, status=status.HTTP_400_BAD_REQUEST)

                    # Verificar que el email coincide
                    if invitation.email != serializer.validated_data['email']:
                        return Response({
                            'error': 'El email debe coincidir con la invitación'
                        }, status=status.HTTP_400_BAD_REQUEST)

                    user = invitation.accept(request.user)
                    if not user:
                        return Response({
                            'error': 'Error al procesar la invitación'
                        }, status=status.HTTP_400_BAD_REQUEST)

                    # Establecer contraseña y activar usuario
                    user.set_password(serializer.validated_data['password'])
                    user.is_active = True
                    user.user_state = 'ACTIVE'
                    if hasattr(user, 'is_verified'):
                        user.is_verified = True
                else:
                    # Registro normal (solo para administradores)
                    if not request.user.is_authenticated or not request.user.is_admin:
                        return Response({
                            'error': 'El registro directo está deshabilitado. Use una invitación.'
                        }, status=status.HTTP_400_BAD_REQUEST)

                    user = serializer.save()
                    user.is_active = False  # Requiere verificación
                    user.user_state = 'PENDING'
                    user.generate_verification_token()
                user.save()

                # Enviar email de verificación
                send_verification_email(user, request)

                # Generar tokens JWT
                refresh = RefreshToken.for_user(user)

                return Response({
                    'user': UserSerializer(user).data,
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'message': 'Registro exitoso. Revisa tu email para verificar tu cuenta.'
                }, status=status.HTTP_201_CREATED)

        except Invitation.DoesNotExist:
            return Response({
                'error': 'Token de invitación inválido'
            }, status=status.HTTP_400_BAD_REQUEST)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Inicio de sesión de usuario - VERSIÓN CORREGIDA
    """
    serializer = UserLoginSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.validated_data['user']

        # Verificar si la cuenta está bloqueada
        if user.is_locked():
            log_user_activity(
                user, 
                'LOGIN_FAILED', 
                f'Intento de login con cuenta bloqueada desde IP: {get_client_ip(request)}',
                request
            )
            return Response({
                'error': 'Cuenta bloqueada temporalmente. Intente más tarde.'
            }, status=status.HTTP_423_LOCKED)

         # 1. Verificar estado de la cuenta (prioritario: suspendida / pendiente, etc.)
        if user.user_state not in ['ACTIVE', 'INVITED']:
            log_user_activity(
                user,
                'LOGIN_FAILED',
                f'Intento de login con cuenta no activa. Estado: {user.get_user_state_display()}',
                request
            )
            return Response({
                'error': 'Cuenta no activa. Contacte al administrador.'
            }, status=status.HTTP_403_FORBIDDEN)

        # 2. Verificar que la cuenta esté VERIFICADA
        is_verified = getattr(user, 'is_verified', True)
        if not is_verified:
            log_user_activity(
                user,
                'LOGIN_FAILED',
                'Intento de login con cuenta no verificada',
                request,
            )
            return Response({
                'error': 'Cuenta no verificada. Revise su correo electrónico para verificar su cuenta.'
            }, status=status.HTTP_403_FORBIDDEN)

        # 3. Verificar que la invitación haya sido ACEPTADA
        invitation_accepted = getattr(user, 'invitation_accepted', True)
        if not invitation_accepted:
            log_user_activity(
                user,
                'LOGIN_FAILED',
                'Intento de login con invitación no aceptada',
                request,
            )
            return Response({
                'error': 'Debe aceptar la invitación antes de iniciar sesión.'
            }, status=status.HTTP_403_FORBIDDEN)

        # Login exitoso
        refresh = RefreshToken.for_user(user)

        # Actualizar último login
        user.last_login_ip = get_client_ip(request)
        user.reset_login_attempts()
        user.save()

        # Registrar actividad
        log_user_activity(
            user, 
            'LOGIN', 
            'Inicio de sesión exitoso',
            request
        )

        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })

    # Login fallido - registrar intento
    email = request.data.get('email', '')
    with contextlib.suppress(User.DoesNotExist):
        user = User.objects.get(email=email)
        user.increment_login_attempts()
        log_user_activity(
            user, 
            'LOGIN_FAILED', 
            f'Intento de login fallido. IP: {get_client_ip(request)}',
            request
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    with contextlib.suppress(Exception):
        log_user_activity(
            request.user,
            'LOGOUT',
            'Cierre de sesión',
            request
        )
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    """
    Verificación de email usando token
    """
    token = request.data.get('token')
    
    if not token:
        return Response({
            'error': 'Token de verificación requerido'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(verification_token=token)
        
        # Activar usuario
        user.activate()
        
        # Registrar actividad
        log_user_activity(
            user, 
            'EMAIL_VERIFIED', 
            'Email verificado exitosamente',
            request
        )
        
        # Generar nuevos tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Email verificado exitosamente',
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
        
    except User.DoesNotExist:
        return Response({
            'error': 'Token de verificación inválido'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """
    Solicitar recuperación de contraseña
    """
    serializer = PasswordResetRequestSerializer(data=request.data)

    if serializer.is_valid():
        email = serializer.validated_data['email']

        with contextlib.suppress(User.DoesNotExist):
            user = User.objects.get(email=email)

            # Verificar que el usuario esté activo
            if not user.is_active or user.user_state != 'ACTIVE':
                return Response({
                    'message': 'Se ha enviado un enlace de recuperación a su email.'
                })

            # Generar token de recuperación
            token = default_token_generator.make_token(user)

            # URL de recuperación
            reset_url = f"http://localhost:3000/reset-password?token={token}&user_id={user.id}"

            # Enviar email
            send_mail(
                'Recuperación de contraseña - Tree of Science',
                f'''
                Hola {user.get_full_name()},
                
                Has solicitado restablecer tu contraseña. Usa el siguiente enlace:
                {reset_url}
                
                Este enlace expirará en 24 horas.
                
                Si no solicitaste este cambio, ignora este email.
                
                Saludos,
                Equipo de Tree of Science
                ''',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )

            # Registrar actividad
            log_user_activity(
                user, 
                'PASSWORD_RESET_REQUESTED', 
                'Solicitud de recuperación de contraseña',
                request
            )

        return Response({
            'message': 'Se ha enviado un enlace de recuperación a su email.'
        })

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """
    Restablecer contraseña usando token
    """
    serializer = PasswordResetSerializer(data=request.data)
    
    if serializer.is_valid():
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        user_id = request.data.get('user_id')
        
        try:
            user = User.objects.get(id=user_id)
            
            # Verificar token
            if not default_token_generator.check_token(user, token):
                return Response({
                    'error': 'Token inválido o expirado.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Cambiar contraseña
            user.set_password(new_password)
            user.save()
            
            # Registrar actividad
            log_user_activity(
                user, 
                'PASSWORD_CHANGED', 
                'Contraseña cambiada exitosamente',
                request
            )
            
            return Response({
                'message': 'Contraseña restablecida exitosamente.'
            })
            
        except User.DoesNotExist:
            return Response({
                'error': 'Usuario no encontrado.'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =============== VISTAS DE INVITACIONES ===============

@api_view(['POST'])
@permission_classes([AllowAny])
def validate_invitation(request):
    """
    Valida un token de invitación y devuelve datos básicos
    (email, nombre, etc.) para el formulario de registro.
    """
    token = request.data.get('token')

    if not token:
        return Response(
            {'error': 'Token de invitación requerido'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        invitation = Invitation.objects.get(token=token)

        # Verificar que esté pendiente y sea válida
        if invitation.state != 'PENDING' or not invitation.is_valid():
            return Response(
                {'error': 'Invitación inválida o expirada'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({
            'email': invitation.email,
            'first_name': invitation.first_name,
            'last_name': invitation.last_name,
            'invitation_token': invitation.token,
        })
    except Invitation.DoesNotExist:
        return Response(
            {'error': 'Token de invitación inválido'},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_invitation(request):
    """
    Enviar invitación - Solo administradores
    """
    # Verificar permisos
    if not request.user.can_accept_invitations():
        log_user_activity(
            request.user, 
            'INVITATION_DENIED', 
            'Intento de enviar invitación sin permisos',
            request
        )
        return Response({
            'error': 'No tiene permisos para enviar invitaciones'
        }, status=status.HTTP_403_FORBIDDEN)

    serializer = InvitationSerializer(data=request.data)

    if serializer.is_valid():
        try:
            with transaction.atomic():
                if existing_invitation := Invitation.objects.filter(
                    email=serializer.validated_data['email'], state='PENDING'
                ).first():
                    return Response({
                        'error': 'Ya existe una invitación pendiente para este email'
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Verificar que el usuario no existe
                if User.objects.filter(email=serializer.validated_data['email']).exists():
                    return Response({
                        'error': 'Este email ya está registrado'
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Crear invitación
                invitation = Invitation.objects.create(
                    inviter=request.user,
                    **serializer.validated_data
                )

                # Enviar email
                send_invitation_email(invitation, request)

                # Registrar actividad
                log_user_activity(
                    request.user, 
                    'INVITATION_SENT', 
                    f'Invitación enviada a {invitation.email}',
                    request
                )

                return Response({
                    'message': 'Invitación enviada exitosamente',
                    'invitation': InvitationSerializer(invitation).data
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'error': f'Error al enviar invitación: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_invitations(request):
    """
    Obtener invitaciones enviadas por el usuario actual
    """
    invitations = Invitation.objects.filter(
        inviter=request.user
    ).order_by('-created_at')
    
    serializer = InvitationSerializer(invitations, many=True)
    
    return Response({
        'invitations': serializer.data
    })



# =============== VISTAS DE PERFIL ===============

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile(request):
    """
    Obtener o actualizar perfil de usuario
    """
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserProfileUpdateSerializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Registrar actividad
            log_user_activity(
                user, 
                'PROFILE_UPDATED', 
                'Perfil actualizado',
                request
            )
            
            return Response({
                'user': UserSerializer(user).data,
                'message': 'Perfil actualizado exitosamente'
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_activities(request):
    """
    Obtener actividades del usuario
    """
    activities = UserActivity.objects.filter(
        user=request.user
    ).order_by('-created_at')[:50]  # Últimas 50 actividades
    
    from .serializers import UserActivitySerializer
    
    serializer = UserActivitySerializer(activities, many=True)
    
    return Response({
        'activities': serializer.data
    })


# =============== VISTAS DE ADMINISTRACIÓN ===============

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users_list(request):
    if not request.user.is_admin:
        return Response({
            'error': 'Requiere permisos de administrador'
        }, status=status.HTTP_403_FORBIDDEN)

    users = User.objects.all().order_by('-date_joined')

    if search := request.query_params.get('search'):
        users = users.filter(
            Q(first_name__icontains=search) | 
            Q(last_name__icontains=search) | 
            Q(email__icontains=search)
        )

    # 2. Filtro por Estado (state)
    # Nota: React envía 'status', asegúrate de capturar el nombre correcto
    state = request.query_params.get('status') or request.query_params.get('state')
    if state and state != 'all':
        users = users.filter(user_state=state)

    # 3. Filtro por Rol
    role = request.query_params.get('role')
    if role and role != 'all':
        if role == 'administrator':
            users = users.filter(is_staff=True)
        else:
            users = users.filter(is_staff=False)

    serializer = UserSerializer(users, many=True)
    return Response({
        'users': serializer.data
    })


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def admin_update_user(request, user_id):
    """
    Ver o actualizar usuario (solo administradores).
    GET: devuelve datos del usuario.
    PUT: actualiza first_name, last_name e is_staff.
    """
    # Solo admins
    if not request.user.is_staff and not getattr(request.user, 'is_admin', False):
        return Response(
            {'error': 'No tiene permisos para administrar usuarios'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'Usuario no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)

    if request.method == 'PUT':
        data = request.data

        # Solo permitimos editar estos campos desde el panel admin
        first_name = data.get('first_name', user.first_name)
        last_name = data.get('last_name', user.last_name)
        is_staff = data.get('is_staff', user.is_staff)

        user.first_name = first_name
        user.last_name = last_name
        user.is_staff = bool(is_staff)
        user.save()

        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_delete_user(request, user_id):
    """
    Eliminar usuario (solo administradores)
    """
    # Asegurar que solo admins puedan borrar
    if not request.user.is_staff and not getattr(request.user, 'is_admin', False):
        return Response(
            {'error': 'No tiene permisos para eliminar usuarios'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'Usuario no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )

    # (Opcional) evitar que un admin se borre a sí mismo:
    if user.id == request.user.id:
        return Response(
            {'error': 'No puede eliminar su propia cuenta'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_activate_user(request, user_id):
    """
    Activar usuario manualmente (solo administradores)
    """
    if not request.user.is_admin:
        return Response({
            'error': 'Requiere permisos de administrador'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
        user.activate()
        
        # Registrar actividad
        log_user_activity(
            request.user, 
            'ADMIN_ACTION', 
            f'Activó usuario {user.email}',
            request
        )
        log_user_activity(
            user, 
            'ACCOUNT_ACTIVATED', 
            'Cuenta activada por administrador',
            request
        )
        
        return Response({
            'message': 'Usuario activado exitosamente'
        })
        
    except User.DoesNotExist:
        return Response({
            'error': 'Usuario no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_suspend_user(request, user_id):
    """
    Suspender usuario (solo administradores)
    """
    if not request.user.is_staff and not getattr(request.user, 'is_admin', False):
        return Response(
            {'error': 'No tiene permisos para suspender usuarios'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'Usuario no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Opcional: evitar que un admin se suspenda a sí mismo
    if user.id == request.user.id:
        return Response(
            {'error': 'No puede suspender su propia cuenta'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user.user_state = 'SUSPENDED'
    user.is_active = False
    if hasattr(user, 'is_verified'):
        user.is_verified = False
    user.save()

    return Response({'message': 'Usuario suspendido correctamente'})
    
@api_view(['POST'])
@permission_classes([AllowAny])
def request_admin_access(request):
    serializer = AdminRequestSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            # Guardar la solicitud
            admin_request = serializer.save()
            
            return Response({
                'success': True,
                'message': 'Solicitud enviada exitosamente. Será revisada por los administradores.',
                'data': {
                    'id': admin_request.id,
                    'email': admin_request.email,
                    'first_name': admin_request.first_name,
                    'last_name': admin_request.last_name,
                    'status': admin_request.status,
                    'created_at': admin_request.created_at
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': f'Error al procesar solicitud: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_requests(request):
    """
    Obtiene la lista de solicitudes de administrador (solo para administradores)
    GET /api/auth/admin/requests/
    
    Query params opcionales:
    - status: pending, approved, rejected
    - search: buscar por nombre o email
    """
    
    # Query base
    queryset = AdminRequest.objects.all().order_by('-created_at')

    # Filtro por estado
    status_filter = request.query_params.get('status')
    if status_filter and status_filter != 'all':
        queryset = queryset.filter(status=status_filter)

    if search := request.query_params.get('search'):
        queryset = queryset.filter(
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(email__icontains=search)
        )

    # Serializar
    serializer = AdminRequestSerializer(queryset, many=True)

    return Response({
        'count': queryset.count(),
        'results': serializer.data,
        'pending_count': AdminRequest.objects.filter(status='pending').count(),
        'approved_count': AdminRequest.objects.filter(status='approved').count(),
        'rejected_count': AdminRequest.objects.filter(status='rejected').count(),
    }, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def review_admin_request(request, request_id):
    """
    Revisa y decide sobre una solicitud de administrador
    PATCH /api/auth/admin/requests/<request_id>/review/
    
    Body esperado:
    {
        "status": "approved" o "rejected",
        "review_notes": "Notas opcionales sobre la decisión"
    }
    """
    
    try:
        admin_request = AdminRequest.objects.get(id=request_id)
    except AdminRequest.DoesNotExist:
        return Response({
            'error': 'Solicitud no encontrada'
        }, status=status.HTTP_404_NOT_FOUND)

    # Validar que no haya sido revisada ya
    if admin_request.status != 'pending':
        return Response({
            'error': 'Esta solicitud ya ha sido revisada'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Obtener datos de la solicitud
    new_status = request.data.get('status')
    review_notes = request.data.get('review_notes', '')

    # Validar estado
    if new_status not in ['approved', 'rejected']:
        return Response({
            'error': 'Estado inválido. Use "approved" o "rejected"'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Actualizar solicitud
        admin_request.status = new_status
        admin_request.review_notes = review_notes
        admin_request.reviewed_by = request.user
        admin_request.save()

        # Si es aprobada, crear invitación automáticamente
        invitation_url = None
        if new_status == 'approved':
            try:
                invitation = Invitation.objects.create(
                    email=admin_request.email,
                    first_name=admin_request.first_name,
                    last_name=admin_request.last_name,
                    inviter=request.user,
                    message='Has sido invitado a ser administrador de Árbol de la Ciencia',
                )
                invitation_url = f"http://localhost:3000/register?token={invitation.token}"
            except Exception as e:
                print(f"⚠️ Error creando invitación: {e}")

        # Serializar la solicitud actualizada
        serializer = AdminRequestSerializer(admin_request)

        return Response({
            'success': True,
            'message': f'Solicitud {new_status}',
            'data': serializer.data,
            'invitation_url': invitation_url
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'error': f'Error al procesar solicitud: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_invitation(request):
    """
    Crea una nueva invitación para un usuario
    """
    email = request.data.get('email', '').strip().lower()
    first_name = request.data.get('first_name', '').strip()
    last_name = request.data.get('last_name', '').strip()
    affiliation = request.data.get('affiliation', '').strip()
    justification = request.data.get('justification', '').strip()
    phone = request.data.get('phone', '').strip()

    # Validaciones
    if not all([email, first_name, last_name, affiliation, justification]):
        return Response(
            {'error': 'Todos los campos son requeridos'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(justification) < 50:
        return Response(
            {'error': 'La justificación debe tener al menos 50 caracteres'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Verificar que el email no esté ya registrado
    if User.objects.filter(email=email).exists():
        return Response(
            {'error': 'Ya existe una cuenta con este email. Inicie sesión directamente.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if existing_request := AdminRequest.objects.filter(
        email=email, status='pending'
    ).first():
        return Response(
            {'error': 'Ya existe una solicitud pendiente para este email.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        admin_request = AdminRequest.objects.create(
            email=email,
            first_name=first_name,
            last_name=last_name,
            affiliation=affiliation,
            justification=justification,
            phone=phone
        )

        # Aquí podrías enviar un email de notificación a los administradores
        # send_admin_notification(admin_request)

        return Response({
            'success': True,
            'message': 'Solicitud enviada exitosamente. Será revisada por los administradores.',
            'request': {
                'id': admin_request.id,
                'email': admin_request.email,
                'first_name': admin_request.first_name,
                'last_name': admin_request.last_name,
                'status': admin_request.status,
                'created_at': admin_request.created_at
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {'error': f'Error al procesar solicitud: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_invitations(request):
    """
    Obtiene invitaciones según el rol del usuario
    """
    if request.user.is_staff:
        # Admin: ver solo invitaciones NO canceladas
        invitations = Invitation.objects.exclude(
            state='CANCELLED'
        ).order_by('-created_at')
    else:
        # Usuario normal: ver solo sus invitaciones NO canceladas
        invitations = Invitation.objects.filter(
            inviter=request.user
        ).exclude(state='CANCELLED').order_by('-created_at')
    
    serializer = InvitationSerializer(invitations, many=True)
    
    # ✅ CAMBIO: Retornar { invitations: [...] } en lugar de [...]
    return Response({
        'invitations': serializer.data,  # ← Array dentro de objeto
        'total': invitations.count(),
        'pending_count': invitations.filter(state='PENDING').count(),
        'accepted_count': invitations.filter(state='ACCEPTED').count(),
        'expired_count': invitations.filter(state='EXPIRED').count(),
        'cancelled_count': invitations.filter(state='CANCELLED').count(),
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def revoke_invitation(request, invitation_id):
    """
    Revoca una invitación (marca su estado como CANCELLED)
    """
    try:
        invitation = Invitation.objects.get(id=invitation_id)
    except Invitation.DoesNotExist:
        return Response({
            'error': 'Invitación no encontrada'
        }, status=status.HTTP_404_NOT_FOUND)

    # Cambiar estado a CANCELLED, aunque esté expirada o usada
    invitation.state = 'CANCELLED'
    invitation.save(update_fields=['state'])

    return Response({
        'success': True,
        'message': 'Invitación revocada exitosamente'
    }, status=status.HTTP_200_OK)

# =============== VISTAS DE ESTADÍSTICAS DEL DASHBOARD ===============

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_stats(request):
    # 1. Calculamos los datos manualmente
    
    data = {
        'total_users': User.objects.count(),
        'admin_users': User.objects.filter(is_staff=True).count(),
        'active_invitations': Invitation.objects.filter(state='PENDING').count(),
        'pending_requests': AdminRequest.objects.filter(status='pending').count(),
        'users_by_status': {
            item['user_state']: item['total'] 
            for item in User.objects.values('user_state').annotate(total=Count('user_state'))
        }
    }

    # 2. Se los pasamos al serializer para que los valide y formatee
    serializer = DashboardStatsSerializer(data=data)
    if serializer.is_valid():
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

# =============== ACTIVIDADES DE USUARIOS ===============
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recent_activity(request):
    # Obtenemos las 10 actividades más recientes ordenadas por fecha
    activities = UserActivity.objects.all().order_by('-created_at')[:10]
    serializer = UserActivitySerializer(activities, many=True)
    return Response(serializer.data)

    
