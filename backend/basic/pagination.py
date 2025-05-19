from rest_framework.pagination import PageNumberPagination, LimitOffsetPagination

class BasicStandardResultsSetPagination(PageNumberPagination):
    """
    Paginación estándar para la mayoría de las vistas en la app Basic.
    Compatible con las clases de paginación de directorio.
    Uso: ?page=2
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class BasicLargeResultsSetPagination(PageNumberPagination):
    """
    Paginación para resultados más grandes en la app Basic.
    Uso: ?page=2&page_size=50
    """
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 1000

class BasicLimitOffsetPagination(LimitOffsetPagination):
    """
    Paginación basada en límite y desplazamiento para la app Basic.
    Uso: ?limit=10&offset=30
    """
    default_limit = 10
    max_limit = 100