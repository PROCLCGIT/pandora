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
        return response

    def process_exception(self, request, exception):
        """
        Procesa excepciones relacionadas con la autenticación JWT.
        """
        if isinstance(exception, (InvalidToken, TokenError)):
            logger.warning(f"Error de autenticación JWT: {str(exception)}")
            return JsonResponse(
                {'detail': 'Token inválido o expirado. Por favor, inicie sesión nuevamente.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        return None