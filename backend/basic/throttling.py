from rest_framework.throttling import UserRateThrottle, AnonRateThrottle

class BasicBurstRateThrottle(AnonRateThrottle):
    """
    Límite de tasa para ráfagas de solicitudes de usuarios anónimos.
    Compatible con las clases de throttling de directorio.
    """
    scope = 'burst'
    rate = '60/min'  # 60 solicitudes por minuto

class BasicSustainedRateThrottle(AnonRateThrottle):
    """
    Límite de tasa sostenido para usuarios anónimos.
    Compatible con las clases de throttling de directorio.
    """
    scope = 'sustained'
    rate = '1000/day'  # 1000 solicitudes por día

class BasicUserBurstRateThrottle(UserRateThrottle):
    """
    Límite de tasa para ráfagas de solicitudes de usuarios autenticados.
    Compatible con las clases de throttling de directorio.
    """
    scope = 'user_burst'
    rate = '100/min'  # 100 solicitudes por minuto

class BasicUserSustainedRateThrottle(UserRateThrottle):
    """
    Límite de tasa sostenido para usuarios autenticados.
    Compatible con las clases de throttling de directorio.
    """
    scope = 'user_sustained'
    rate = '5000/day'  # 5000 solicitudes por día