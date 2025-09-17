from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer, PasswordResetRequestSerializer, PasswordResetSerializer
from .models import User

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Registro de nuevo usuario
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Inicio de sesión de usuario
    """
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """
    Solicitar recuperación de contraseña
    """
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            
            # En un entorno real, enviarías un email con el token
            # Por ahora, solo lo devolvemos en la respuesta para pruebas
            reset_url = f"http://localhost:3000/reset-password?token={token}&user_id={user.id}"
            
            # Simular envío de email (en consola)
            send_mail(
                'Recuperación de contraseña',
                f'Use este enlace para restablecer su contraseña: {reset_url}',
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False,
            )
            
            return Response({
                'message': 'Se ha enviado un enlace de recuperación a su email.',
                'reset_token': token,  # Solo para desarrollo
                'user_id': user.id     # Solo para desarrollo
            })
        except User.DoesNotExist:
            return Response({
                'message': 'Se ha enviado un enlace de recuperación a su email.'
            })  # No revelar si el email existe o no
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
            if default_token_generator.check_token(user, token):
                user.set_password(new_password)
                user.save()
                return Response({'message': 'Contraseña restablecida exitosamente.'})
            else:
                return Response({'error': 'Token inválido o expirado.'}, 
                              status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado.'}, 
                          status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)