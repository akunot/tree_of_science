from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import exceptions


class CookieJWTAuthentication(JWTAuthentication):
    """
    Autenticación JWT que también lee el access_token desde cookies HttpOnly.
    - Primero intenta header Authorization.
    - Si no hay, intenta cookie 'access_token'.
    """

    def authenticate(self, request):
        # 1) Intentar autenticación estándar (Authorization: Bearer ...)
        header = self.get_header(request)
        if header is not None:
            return super().authenticate(request)

        # 2) Si no hay header, buscamos en cookies
        raw_token = request.COOKIES.get("access_token")
        if not raw_token:
          return None  # No hay token → DRF seguirá a otros authenticators (o rechazará)

        # Si el token existe pero es inválido o expirado, NO lanzar excepción.
        # Retornar None permite que DRF continúe y evalúe los permisos normalmente.
        # Sin esto, vistas con AllowAny también reciben 401 por cookie corrupta.
        try:
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
        except Exception:
            return None