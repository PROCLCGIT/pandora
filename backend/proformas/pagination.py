# backend/proformas/pagination.py

from rest_framework.pagination import PageNumberPagination, LimitOffsetPagination

class ProformaStandardResultsSetPagination(PageNumberPagination):
    """
    Paginación estándar para la mayoría de las vistas en la app Proformas.
    Compatible con las clases de paginación de las otras aplicaciones.
    Uso: ?page=2
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class ProformaLargeResultsSetPagination(PageNumberPagination):
    """
    Paginación para resultados más grandes en la app Proformas.
    Uso: ?page=2&page_size=50
    """
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 1000

class ProformaLimitOffsetPagination(LimitOffsetPagination):
    """
    Paginación basada en límite y desplazamiento para la app Proformas.
    Uso: ?limit=10&offset=30
    """
    default_limit = 10
    max_limit = 100