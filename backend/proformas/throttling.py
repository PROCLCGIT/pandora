# backend/proformas/throttling.py

from rest_framework.throttling import UserRateThrottle, AnonRateThrottle

class ProformaBurstRateThrottle(AnonRateThrottle):
    """
    Límite de tasa para ráfagas de solicitudes de usuarios anónimos.
    Compatible con las clases de throttling de las otras aplicaciones.
    """
    scope = 'burst'
    rate = '60/min'  # 60 solicitudes por minuto

class ProformaSustainedRateThrottle(AnonRateThrottle):
    """
    Límite de tasa sostenido para usuarios anónimos.
    Compatible con las clases de throttling de las otras aplicaciones.
    """
    scope = 'sustained'
    rate = '1000/day'  # 1000 solicitudes por día

class ProformaUserBurstRateThrottle(UserRateThrottle):
    """
    Límite de tasa para ráfagas de solicitudes de usuarios autenticados.
    Compatible con las clases de throttling de las otras aplicaciones.
    """
    scope = 'user_burst'
    rate = '100/min'  # 100 solicitudes por minuto

class ProformaUserSustainedRateThrottle(UserRateThrottle):
    """
    Límite de tasa sostenido para usuarios autenticados.
    Compatible con las clases de throttling de las otras aplicaciones.
    """
    scope = 'user_sustained'
    rate = '5000/day'  # 5000 solicitudes por día

class ProformaReportThrottle(UserRateThrottle):
    """
    Límite de tasa específico para la generación de reportes de proformas.
    Más restrictivo para evitar sobrecarga del servidor.
    """
    scope = 'proforma_report'
    rate = '30/hour'  # 30 reportes por hora