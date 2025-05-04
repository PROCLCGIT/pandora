"""
Middleware personalizado para manejo de errores de autenticación.
"""
import json
import logging
from django.http import JsonResponse
from rest_framework import status
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

logger = logging.getLogger(__name__)

class AuthenticationErrorMiddleware:
    """
    Middleware personalizado para manejar errores de autenticación JWT.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Verifica si hay errores 401 en respuestas de API
        if response.status_code == 401 and 'application/json' in response.get('Content-Type', ''):
            # Si es una respuesta de API JSON con error 401, verifica si hay cookies
            if 'access_token' in request.COOKIES:
                # Registra el intento fallido con cookie
                logger.warning("Intento de autenticación fallido a pesar de tener cookies JWT")
            
        return response

    def process_exception(self, request, exception):
        """
        Procesa excepciones relacionadas con la autenticación JWT.
        """
        if isinstance(exception, (InvalidToken, TokenError)):
            logger.warning(f"Error de autenticación JWT: {str(exception)}")
            
            # Determina si la solicitud usaba autenticación por cookie o por header
            using_cookie_auth = 'access_token' in request.COOKIES
            
            response = JsonResponse(
                {'detail': 'Token inválido o expirado. Por favor, inicie sesión nuevamente.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
            
            # Si la autenticación era por cookie, borramos las cookies
            if using_cookie_auth:
                response.delete_cookie('access_token')
                response.delete_cookie('refresh_token')
                
            return response
            
        return None