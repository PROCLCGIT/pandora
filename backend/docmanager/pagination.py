from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class StandardResultsSetPagination(PageNumberPagination):
    """
    Paginación estándar para vistas generales con metadatos extendidos.
    Devuelve:
    - count: total de elementos
    - next/previous: URLs de paginación
    - results: los elementos actuales
    - pages: número total de páginas
    - current_page: página actual (number)
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100
    
    def get_paginated_response(self, data):
        # Obtener número total de páginas
        count = self.page.paginator.count
        total_pages = count // self.page_size
        if count % self.page_size > 0:
            total_pages += 1
            
        return Response({
            'count': count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data,
            'pages': total_pages,
            'current_page': self.page.number
        })

class SmallResultsSetPagination(StandardResultsSetPagination):
    """Paginación con menos elementos por página para listados densos"""
    page_size = 8
    max_page_size = 50

class LargeResultsSetPagination(StandardResultsSetPagination):
    """Paginación con más elementos por página para listados simples"""
    page_size = 20
    max_page_size = 200