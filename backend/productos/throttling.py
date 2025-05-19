# backend/productos/throttling.py

from rest_framework.throttling import UserRateThrottle, AnonRateThrottle

class BurstRateThrottle(AnonRateThrottle):
    """
    Límite de tasa para ráfagas de solicitudes de usuarios anónimos.
    Útil para limitar solicitudes API en periodos cortos para productos.
    """
    scope = 'burst'
    rate = '60/min'  # 60 solicitudes por minuto

class SustainedRateThrottle(AnonRateThrottle):
    """
    Límite de tasa sostenido para usuarios anónimos.
    Protege contra uso excesivo de la API de productos a largo plazo.
    """
    scope = 'sustained'
    rate = '1000/day'  # 1000 solicitudes por día

class UserBurstRateThrottle(UserRateThrottle):
    """
    Límite de tasa para ráfagas de solicitudes de usuarios autenticados.
    Permite más solicitudes para usuarios autenticados en operaciones
    frecuentes como consultas de productos o precios.
    """
    scope = 'user_burst'
    rate = '100/min'  # 100 solicitudes por minuto

class UserSustainedRateThrottle(UserRateThrottle):
    """
    Límite de tasa sostenido para usuarios autenticados.
    Para mantener uso razonable de la API incluso por usuarios autorizados.
    """
    scope = 'user_sustained'
    rate = '5000/day'  # 5000 solicitudes por día

class ProductsUploadThrottle(UserRateThrottle):
    """
    Límite de tasa específico para operaciones de carga de imágenes y documentos
    de productos, que pueden ser más intensivas en recursos.
    """
    scope = 'products_upload'
    rate = '100/hour'  # 100 subidas por hora