"""
Vista personalizada de refresh token que maneja cookies httpOnly
"""
from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])
def cookie_refresh_token(request):
    """
    Refresh token usando cookies httpOnly en lugar del body
    
    ✅ SEGURIDAD: Los tokens nunca se exponen al JavaScript
    ✅ UX: El refresh es automático y transparente para el usuario
    """
    try:
        # Obtener refresh token de la cookie
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not refresh_token:
            logger.warning("Intento de refresh sin cookie de refresh_token")
            return Response(
                {'error': 'No se encontró token de refresco'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Validar y crear nuevo access token
        refresh = RefreshToken(refresh_token)
        access_token = str(refresh.access_token)
        
        # Crear respuesta con el nuevo access token en cookie
        response = Response({'message': 'Token refrescado exitosamente'})
        
        # Configurar cookie de access token (1 hora)
        response.set_cookie(
            key='access_token',
            value=access_token,
            httponly=True,
            secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
            samesite='Lax',
            max_age=60 * 60,  # 1 hora
            path=settings.SIMPLE_JWT.get('AUTH_COOKIE_PATH', '/')
        )
        
        logger.info(f"Token refrescado para usuario desde IP: {request.META.get('REMOTE_ADDR')}")
        return response
        
    except (InvalidToken, TokenError) as e:
        logger.warning(f"Token de refresh inválido: {str(e)}")
        # Borrar cookies inválidas
        response = Response(
            {'error': 'Token de refresco inválido o expirado'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response
        
    except Exception as e:
        logger.error(f"Error inesperado en refresh token: {str(e)}")
        return Response(
            {'error': 'Error del servidor'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
