# backend/directorio/throttling.py
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle

class BurstRateThrottle(AnonRateThrottle):
    """
    Límite de tasa para ráfagas de solicitudes de usuarios anónimos.
    """
    scope = 'burst'
    rate = '60/min'  # 60 solicitudes por minuto

class SustainedRateThrottle(AnonRateThrottle):
    """
    Límite de tasa sostenido para usuarios anónimos.
    """
    scope = 'sustained'
    rate = '1000/day'  # 1000 solicitudes por día

class UserBurstRateThrottle(UserRateThrottle):
    """
    Límite de tasa para ráfagas de solicitudes de usuarios autenticados.
    """
    scope = 'user_burst'
    rate = '100/min'  # 100 solicitudes por minuto

class UserSustainedRateThrottle(UserRateThrottle):
    """
    Límite de tasa sostenido para usuarios autenticados.
    """
    scope = 'user_sustained'
    rate = '5000/day'  # 5000 solicitudes por día