# backend/directorio/pagination.py

from rest_framework.pagination import PageNumberPagination, LimitOffsetPagination

class StandardResultsSetPagination(PageNumberPagination):
    """
    Paginación estándar para la mayoría de las vistas.
    Uso: ?page=2
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class LargeResultsSetPagination(PageNumberPagination):
    """
    Paginación para resultados más grandes.
    Uso: ?page=2&page_size=50
    """
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 1000

class CustomLimitOffsetPagination(LimitOffsetPagination):
    """
    Paginación basada en límite y desplazamiento.
    Uso: ?limit=10&offset=30
    """
    default_limit = 10
    max_limit = 100