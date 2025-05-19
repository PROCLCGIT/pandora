# backend/productos/pagination.py

from rest_framework.pagination import PageNumberPagination, LimitOffsetPagination, CursorPagination

class StandardResultsSetPagination(PageNumberPagination):
    """
    Paginación estándar para la mayoría de vistas de productos.
    Uso: ?page=2
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class ProductCatalogPagination(PageNumberPagination):
    """
    Paginación optimizada para catálogos de productos.
    Muestra más productos por página para facilitar navegación.
    Uso: ?page=2&page_size=24
    """
    page_size = 24
    page_size_query_param = 'page_size'
    max_page_size = 100

class LargeResultsSetPagination(PageNumberPagination):
    """
    Paginación para listados completos de productos.
    Útil para reportes o pantallas de administración.
    Uso: ?page=2&page_size=50
    """
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 1000

class CustomLimitOffsetPagination(LimitOffsetPagination):
    """
    Paginación basada en límite y desplazamiento.
    Ideal para búsquedas avanzadas o filtrados complejos.
    Uso: ?limit=10&offset=30
    """
    default_limit = 10
    max_limit = 100

class HistoricalRecordsPagination(CursorPagination):
    """
    Paginación por cursor para registros históricos como precios,
    compras o ventas que pueden ser muy numerosos.
    Uso: [obtiene automáticamente el cursor para la siguiente página]
    """
    page_size = 20
    ordering = '-created_at'
    cursor_query_param = 'cursor'