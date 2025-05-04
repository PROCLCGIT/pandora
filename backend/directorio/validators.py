# backend/directorio/validators.py

from django.core.exceptions import ValidationError
import re
from datetime import datetime

def validate_ruc_ecuatoriano(value):
    """
    Validador para el RUC ecuatoriano.
    El RUC debe tener 13 dígitos y cumplir con las reglas específicas de validación.
    """
    # Verificar longitud
    if len(value) != 13:
        raise ValidationError('El RUC debe tener 13 dígitos')
    
    # Verificar que solo contiene dígitos
    if not value.isdigit():
        raise ValidationError('El RUC debe contener solo dígitos')
    
    # Aquí podrías agregar validaciones específicas del algoritmo de RUC ecuatoriano
    # como verificación de provincia, tipo de contribuyente, etc.
    
    return value

def validate_telefono_ecuador(value):
    """
    Validador para números de teléfono ecuatorianos.
    Formato válido: +593 (código de área) número, o 0 (código de área) número
    """
    # Eliminar espacios y guiones para la validación
    cleaned = value.replace(' ', '').replace('-', '')
    
    # Patrones válidos para Ecuador
    pattern1 = r'^\+5939\d{8}$'  # Formato internacional para celulares
    pattern2 = r'^\+5932\d{7}$'  # Formato internacional para teléfonos fijos (Quito)
    pattern3 = r'^\+5934\d{7}$'  # Formato internacional para teléfonos fijos (Guayaquil)
    pattern4 = r'^09\d{8}$'      # Formato nacional para celulares
    pattern5 = r'^0[2-7]\d{7}$'  # Formato nacional para teléfonos fijos
    
    if (re.match(pattern1, cleaned) or re.match(pattern2, cleaned) or 
        re.match(pattern3, cleaned) or re.match(pattern4, cleaned) or 
        re.match(pattern5, cleaned)):
        return value
    
    raise ValidationError('Formato de teléfono no válido para Ecuador')

def validate_email_corporativo(value):
    """
    Validador para asegurar que el email sea corporativo y no de servicios gratuitos.
    """
    # Lista de dominios de correo gratuitos comunes
    free_domains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com', 'live.com', 'aol.com']
    
    domain = value.split('@')[-1].lower()
    
    if domain in free_domains:
        raise ValidationError('Por favor utilice un correo corporativo en lugar de un servicio gratuito')
    
    return value

def validate_fechas(fecha_inicio, fecha_fin):
    """
    Validador para asegurar que una fecha de inicio sea anterior a una fecha de fin.
    """
    if isinstance(fecha_inicio, str):
        fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d')
    if isinstance(fecha_fin, str):
        fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d')
        
    if fecha_inicio >= fecha_fin:
        raise ValidationError('La fecha de inicio debe ser anterior a la fecha de fin')
    
    return True