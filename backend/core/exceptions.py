"""
Manejadores personalizados de excepciones para la API.
"""
import logging
from rest_framework.views import exception_handler
from rest_framework import status
from rest_framework.response import Response
from django.http import Http404
from django.core.exceptions import PermissionDenied
from django.db import DatabaseError, IntegrityError

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Manejador personalizado de excepciones para la API.
    Proporciona respuestas más detalladas y consistentes.
    """
    # Primero, obtener la respuesta estándar
    response = exception_handler(exc, context)
    
    # Si ya hay una respuesta, personalizarla
    if response is not None:
        return response
    
    # Manejar excepciones que DRF no maneja por defecto
    if isinstance(exc, Http404):
        return Response(
            {'detail': 'El recurso solicitado no existe.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if isinstance(exc, PermissionDenied):
        return Response(
            {'detail': 'No tiene permiso para realizar esta acción.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if isinstance(exc, DatabaseError):
        logger.error(f"Error de base de datos: {str(exc)}")
        return Response(
            {'detail': 'Error interno del servidor en la base de datos.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    if isinstance(exc, IntegrityError):
        logger.error(f"Error de integridad: {str(exc)}")
        return Response(
            {'detail': 'Error de integridad en los datos.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Para cualquier otra excepción no manejada
    import traceback
    import sys

    # Obtener traceback completo
    exc_type, exc_value, exc_traceback = sys.exc_info()
    tb_lines = traceback.format_exception(exc_type, exc_value, exc_traceback)
    tb_text = ''.join(tb_lines)

    # Registrar detalles completos
    logger.error(f"Excepción no manejada: {str(exc)}")
    logger.error(f"Traceback:\n{tb_text}")

    # También mostrar en consola para debugging inmediato
    print(f"\n❌❌❌ CRITICAL ERROR: {exc}")
    print(f"In {context['view'].__class__.__name__}.{context['request'].method}")
    print(f"URL: {context['request'].path}")
    print("Traceback:")
    traceback.print_exc(file=sys.stdout)

    # Devolver respuesta amigable para el cliente
    return Response(
        {'detail': 'Ha ocurrido un error inesperado en el servidor.'},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )