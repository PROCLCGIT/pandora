from rest_framework.throttling import UserRateThrottle, AnonRateThrottle

# Clases de limitación de tasa para usuarios autenticados
class CategoryRateThrottle(UserRateThrottle):
    """Límite de tasa para operaciones de categorías - usuarios autenticados"""
    rate = '20/minute'  # Más permisivo para usuarios autenticados
    scope = 'categories'

class TagRateThrottle(UserRateThrottle):
    """Límite de tasa para operaciones de etiquetas - usuarios autenticados"""
    rate = '20/minute'  # Más permisivo para usuarios autenticados
    scope = 'tags'

class DocumentRateThrottle(UserRateThrottle):
    """Límite de tasa para operaciones de documentos - usuarios autenticados"""
    rate = '30/minute'  # Límite para operaciones con documentos
    scope = 'documents'

class GroupRateThrottle(UserRateThrottle):
    """Límite de tasa para operaciones de grupos - usuarios autenticados"""
    rate = '20/minute'
    scope = 'groups'

class CollectionRateThrottle(UserRateThrottle):
    """Límite de tasa para operaciones de colecciones - usuarios autenticados"""
    rate = '25/minute'
    scope = 'collections'

# Clases de limitación de tasa para usuarios anónimos
class CategoryAnonRateThrottle(AnonRateThrottle):
    """Límite de tasa para operaciones de categorías - usuarios anónimos"""
    rate = '5/minute'  # Más restrictivo para usuarios anónimos
    scope = 'categories_anon'

class TagAnonRateThrottle(AnonRateThrottle):
    """Límite de tasa para operaciones de etiquetas - usuarios anónimos"""
    rate = '5/minute'  # Más restrictivo para usuarios anónimos
    scope = 'tags_anon'

class DocumentAnonRateThrottle(AnonRateThrottle):
    """Límite de tasa para operaciones de documentos - usuarios anónimos"""
    rate = '10/minute'  # Límite para operaciones anónimas con documentos
    scope = 'documents_anon'

class GroupAnonRateThrottle(AnonRateThrottle):
    """Límite de tasa para operaciones de grupos - usuarios anónimos"""
    rate = '5/minute'
    scope = 'groups_anon'

class CollectionAnonRateThrottle(AnonRateThrottle):
    """Límite de tasa para operaciones de colecciones - usuarios anónimos"""
    rate = '8/minute'
    scope = 'collections_anon'