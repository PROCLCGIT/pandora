"""
Backend de autenticación personalizado para procesar tokens JWT desde cookies.
"""
from rest_framework.authentication import BaseAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
import logging

logger = logging.getLogger(__name__)

class CookieTokenAuthentication(BaseAuthentication):
    """
    Backend de autenticación personalizado para procesar tokens JWT desde cookies.
    
    Este backend puede registrarse en settings.py para que Django Rest Framework
    pueda autenticar automáticamente a los usuarios usando cookies HttpOnly.
    """
    def authenticate(self, request):
        from django.conf import settings
        
        # Usar el nombre de cookie definido en settings
        cookie_name = settings.SIMPLE_JWT.get('AUTH_COOKIE', 'access_token')
        access_token = request.COOKIES.get(cookie_name)
        
        if not access_token:
            return None
        
        try:
            # Validamos el token y obtenemos el payload
            jwt_auth = JWTAuthentication()
            validated_token = jwt_auth.get_validated_token(access_token)
            user = jwt_auth.get_user(validated_token)
            
            # DRF se encarga de guardar user en request.user al retornar esta tupla
            return (user, validated_token)
        except (InvalidToken, TokenError) as e:
            # Errores específicos de validación de token
            # No logueamos estos errores porque son comunes (e.g. token expirado)
            return None
        except Exception as e:
            # Otros errores inesperados que deberían ser registrados
            logger.error(f"Error inesperado al autenticar con token de cookies: {str(e)}")
            return None
    
    def authenticate_header(self, request):
        """
        Retorna el valor de la cabecera WWW-Authenticate en caso de fallo.
        
        Esto permite a los clientes HTTP entender el esquema de autenticación
        requerido cuando reciben un status 401 Unauthorized.
        """
        return 'Bearer'