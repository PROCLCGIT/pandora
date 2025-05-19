# backend/proformas/validators.py

from django.core.exceptions import ValidationError
import re
from datetime import datetime, date
from decimal import Decimal

def validate_fecha_emision(value):
    """
    Validador para la fecha de emisión de una proforma.
    La fecha de emisión no puede estar en el futuro.
    """
    if value > date.today():
        raise ValidationError('La fecha de emisión no puede estar en el futuro')
    
    return value

def validate_fecha_vencimiento(fecha_emision, fecha_vencimiento):
    """
    Validador para asegurar que la fecha de vencimiento sea posterior a la fecha de emisión.
    """
    if fecha_vencimiento <= fecha_emision:
        raise ValidationError('La fecha de vencimiento debe ser posterior a la fecha de emisión')
    
    # Opcionalmente, verificar que el período de validez no sea excesivamente largo
    dias_diferencia = (fecha_vencimiento - fecha_emision).days
    if dias_diferencia > 365:
        raise ValidationError('El período de validez no puede ser mayor a un año')
    
    return True

def validate_cantidad_positiva(value):
    """
    Validador para asegurar que la cantidad sea un número positivo.
    """
    if value <= 0:
        raise ValidationError('La cantidad debe ser mayor a cero')
    
    return value

def validate_precio_positivo(value):
    """
    Validador para asegurar que el precio unitario sea un número positivo.
    """
    if value <= 0:
        raise ValidationError('El precio unitario debe ser mayor a cero')
    
    return value

def validate_porcentaje(value):
    """
    Validador para asegurar que un porcentaje esté entre 0 y 100.
    """
    if value < 0 or value > 100:
        raise ValidationError('El porcentaje debe estar entre 0 y 100')
    
    return value

def validate_impuesto_ecuatoriano(value):
    """
    Validador para el porcentaje de impuesto en Ecuador.
    Valores típicos: 0%, 12%, 14%
    """
    valores_validos = [0, 12, 14]
    
    # Tolerancia para comparación con decimales
    for val in valores_validos:
        if abs(Decimal(str(value)) - Decimal(str(val))) < Decimal('0.01'):
            return value
    
    raise ValidationError(f'El porcentaje de impuesto debe ser uno de los siguientes valores: {", ".join(map(str, valores_validos))}%')

def validate_transicion_estado(estado_actual, nuevo_estado):
    """
    Validador para asegurar que las transiciones de estado sean válidas.
    """
    # Definir las transiciones permitidas como un diccionario
    # donde las claves son estados actuales y los valores son listas de estados permitidos
    transiciones_permitidas = {
        'borrador': ['borrador', 'enviada', 'vencida'],
        'enviada': ['enviada', 'aprobada', 'rechazada', 'vencida'],
        'aprobada': ['aprobada', 'convertida'],
        'rechazada': ['rechazada'],
        'vencida': ['vencida'],
        'convertida': ['convertida']
    }
    
    if nuevo_estado not in transiciones_permitidas.get(estado_actual, []):
        estados_permitidos = ', '.join(transiciones_permitidas.get(estado_actual, []))
        raise ValidationError(f'No se puede cambiar de {estado_actual} a {nuevo_estado}. Estados permitidos: {estados_permitidos}')
    
    return True

def validate_item_tipo_producto(tipo_item, producto_ofertado, producto_disponible, inventario):
    """
    Validador para asegurar que los ítems tengan los campos correctos según su tipo.
    """
    if tipo_item == 'producto_ofertado' and producto_ofertado is None:
        raise ValidationError('Para ítems de tipo "producto_ofertado" debe seleccionar un producto ofertado')
    
    if tipo_item == 'producto_disponible' and producto_disponible is None:
        raise ValidationError('Para ítems de tipo "producto_disponible" debe seleccionar un producto disponible')
    
    if tipo_item == 'inventario' and inventario is None:
        raise ValidationError('Para ítems de tipo "inventario" debe seleccionar un producto de inventario')
    
    # Validar que solo se seleccione un tipo de producto
    productos_seleccionados = 0
    if producto_ofertado is not None:
        productos_seleccionados += 1
    if producto_disponible is not None:
        productos_seleccionados += 1
    if inventario is not None:
        productos_seleccionados += 1
    
    if productos_seleccionados > 1:
        raise ValidationError('Solo debe seleccionar un tipo de producto')
    
    return True

def validate_numero_proforma(value):
    """
    Validador para el número de proforma.
    Formato: PRO-YYYY-XXXX donde YYYY es el año y XXXX es un número secuencial.
    """
    pattern = r'^PRO-\d{4}-\d{4}$'
    
    if not re.match(pattern, value):
        raise ValidationError('El número de proforma debe tener el formato PRO-YYYY-XXXX')
    
    return value

def validate_decimales(value, max_decimales=2):
    """
    Validador para asegurar que un valor decimal no tenga más decimales de los permitidos.
    """
    decimal_value = Decimal(str(value))
    decimal_tuple = decimal_value.as_tuple()
    
    # Si es un número negativo, el signo será 1, de lo contrario 0
    if decimal_tuple.sign == 1:
        decimal_value = abs(decimal_value)  # Convertir a positivo para la validación
    
    # Convertir a string y verificar decimales
    value_str = str(decimal_value)
    if '.' in value_str:
        decimales = len(value_str.split('.')[1])
        if decimales > max_decimales:
            raise ValidationError(f'El valor no debe tener más de {max_decimales} decimales')
    
    return value