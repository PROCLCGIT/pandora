# backend/proformas/validators.py

from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
import re
from datetime import datetime, date, timedelta
from decimal import Decimal

def validate_fecha_emision(value):
    """
    Validador para la fecha de emisión de una proforma.
    La fecha de emisión no puede estar en el futuro.
    """
    if value > date.today():
        raise ValidationError(_('La fecha de emisión no puede estar en el futuro'))
    
    return value

def validate_fecha_vencimiento(fecha_emision, fecha_vencimiento):
    """
    Validador para asegurar que la fecha de vencimiento sea posterior a la fecha de emisión.
    """
    if fecha_vencimiento <= fecha_emision:
        raise ValidationError(_('La fecha de vencimiento debe ser posterior a la fecha de emisión'))
    
    # Opcionalmente, verificar que el período de validez no sea excesivamente largo
    dias_diferencia = (fecha_vencimiento - fecha_emision).days
    if dias_diferencia > 365:
        raise ValidationError(_('El período de validez no puede ser mayor a un año'))
    
    return True

def validate_cantidad_positiva(value):
    """
    Validador para asegurar que la cantidad sea un número positivo.
    """
    if value <= 0:
        raise ValidationError(_('La cantidad debe ser mayor a cero'))
    
    return value

def validate_precio_positivo(value):
    """
    Validador para asegurar que el precio unitario sea un número positivo.
    """
    if value <= 0:
        raise ValidationError(_('El precio unitario debe ser mayor a cero'))
    
    return value

def validate_porcentaje(value):
    """
    Validador para asegurar que un porcentaje esté entre 0 y 100.
    """
    if value < 0 or value > 100:
        raise ValidationError(_('El porcentaje debe estar entre 0 y 100'))
    
    return value

def validate_impuesto_ecuatoriano(value):
    """
    Validador para el porcentaje de impuesto en Ecuador.
    Valores típicos: 0%, 12%, 15%
    """
    valores_validos = [0, 12, 15]
    
    # Tolerancia para comparación con decimales
    for val in valores_validos:
        if abs(Decimal(str(value)) - Decimal(str(val))) < Decimal('0.01'):
            return value
    
    raise ValidationError(
        _('El porcentaje de impuesto debe ser uno de los siguientes valores: {}%').format(
            ', '.join(map(str, valores_validos))
        )
    )

def validate_transicion_estado(estado_actual, nuevo_estado):
    """
    Validador para asegurar que las transiciones de estado sean válidas.
    """
    # Definir las transiciones permitidas como un diccionario
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
        raise ValidationError(
            _('No se puede cambiar de {} a {}. Estados permitidos: {}').format(
                estado_actual, nuevo_estado, estados_permitidos
            )
        )
    
    return True

def validate_item_tipo_producto(tipo_item, producto_ofertado, producto_disponible, inventario=None):
    """
    Validador para asegurar que los ítems tengan los campos correctos según su tipo.
    """
    if tipo_item == 'producto_ofertado' and producto_ofertado is None:
        raise ValidationError(_('Para ítems de tipo "producto_ofertado" debe seleccionar un producto ofertado'))
    
    if tipo_item == 'producto_disponible' and producto_disponible is None:
        raise ValidationError(_('Para ítems de tipo "producto_disponible" debe seleccionar un producto disponible'))
    
    if tipo_item == 'inventario' and inventario is None:
        raise ValidationError(_('Para ítems de tipo "inventario" debe seleccionar un producto de inventario'))
    
    # Validar que solo se seleccione un tipo de producto
    productos_seleccionados = sum([
        1 for p in [producto_ofertado, producto_disponible, inventario] if p is not None
    ])
    
    if productos_seleccionados > 1:
        raise ValidationError(_('Solo debe seleccionar un tipo de producto'))
    
    return True

def validate_numero_proforma(value):
    """
    Validador para el número de proforma.
    Formato: PRO-YYYY-XXXX donde YYYY es el año y XXXX es un número secuencial.
    """
    pattern = r'^[A-Z]{2,5}-\d{4}-\d{3,10}$'
    
    if not re.match(pattern, value):
        raise ValidationError(_('El número de proforma debe tener el formato prefijo-YYYY-número'))
    
    return value

def validate_decimales(value, max_decimales=2):
    """
    Validador para asegurar que un valor decimal no tenga más decimales de los permitidos.
    """
    decimal_value = Decimal(str(value))
    decimal_tuple = decimal_value.as_tuple()
    
    # Si es un número negativo, el signo será 1, de lo contrario 0
    if decimal_tuple.sign == 1:
        decimal_value = abs(decimal_value)
    
    # Convertir a string y verificar decimales
    value_str = str(decimal_value)
    if '.' in value_str:
        decimales = len(value_str.split('.')[1])
        if decimales > max_decimales:
            raise ValidationError(
                _('El valor no debe tener más de {} decimales').format(max_decimales)
            )
    
    return value

# NUEVOS VALIDADORES PARA LOS CAMPOS AGREGADOS

def validate_cpc_code(value):
    """
    Validador para el código CPC (Clasificación de Productos y Servicios).
    Formato típico: números de 6-10 dígitos
    """
    if not value:
        return value
    
    pattern = r'^\d{6,10}$'
    if not re.match(pattern, value):
        raise ValidationError(_('El código CPC debe contener entre 6 y 10 dígitos'))
    
    return value

def validate_cudim_code(value):
    """
    Validador para el código CUDIM (Código Único de Dispositivos Médicos).
    """
    if not value:
        return value
    
    # El CUDIM puede tener diferentes formatos según el país
    # Por ahora, validamos que sea alfanumérico con guiones
    pattern = r'^[A-Z0-9\-]{5,20}$'
    if not re.match(pattern, value.upper()):
        raise ValidationError(_('El código CUDIM debe ser alfanumérico con guiones, entre 5 y 20 caracteres'))
    
    return value.upper()

def validate_registro_sanitario(value):
    """
    Validador para el registro sanitario en Ecuador.
    Formato: ARCSA-XXX-XXX-XXX
    """
    if not value:
        return value
    
    # Formato típico de ARCSA en Ecuador
    pattern = r'^(ARCSA|INV|NOT)-\d{2,3}-\d{2,3}-\d{6,8}$'
    if not re.match(pattern, value.upper()):
        raise ValidationError(
            _('El registro sanitario debe tener el formato ARCSA-XXX-XXX-XXXXXX o similar')
        )
    
    return value.upper()

def validate_lote_code(value):
    """
    Validador para el código de lote.
    """
    if not value:
        return value
    
    # Los lotes suelen ser alfanuméricos
    pattern = r'^[A-Z0-9\-\.]{2,20}$'
    if not re.match(pattern, value.upper()):
        raise ValidationError(_('El código de lote debe ser alfanumérico, entre 2 y 20 caracteres'))
    
    return value.upper()

def validate_serial_number(value):
    """
    Validador para número de serie.
    """
    if not value:
        return value
    
    # Los seriales pueden ser alfanuméricos con algunos símbolos
    pattern = r'^[A-Z0-9\-\.\/]{3,30}$'
    if not re.match(pattern, value.upper()):
        raise ValidationError(_('El número de serie debe ser alfanumérico, entre 3 y 30 caracteres'))
    
    return value.upper()

def validate_fecha_vencimiento_producto(value):
    """
    Validador para la fecha de vencimiento de productos.
    La fecha debe ser futura y no mayor a 10 años.
    """
    if not value:
        return value
    
    hoy = date.today()
    
    if value <= hoy:
        raise ValidationError(_('La fecha de vencimiento debe ser futura'))
    
    # No más de 10 años en el futuro (productos con vencimiento muy largo son raros)
    fecha_limite = hoy + timedelta(days=3650)  # 10 años
    if value > fecha_limite:
        raise ValidationError(_('La fecha de vencimiento no puede ser mayor a 10 años'))
    
    return value

def validate_especificaciones_tecnicas(value):
    """
    Validador para especificaciones técnicas.
    Verifica que no esté vacío y tenga un mínimo de contenido útil.
    """
    if not value:
        return value
    
    # Limpiar espacios en blanco
    value_clean = value.strip()
    
    if len(value_clean) < 10:
        raise ValidationError(_('Las especificaciones técnicas deben tener al menos 10 caracteres'))
    
    # Verificar que no sea solo números o caracteres especiales
    if not re.search(r'[a-zA-Z]', value_clean):
        raise ValidationError(_('Las especificaciones técnicas deben contener texto descriptivo'))
    
    return value_clean

def validate_marca_comercial(value):
    """
    Validador para marca comercial.
    """
    if not value:
        return value
    
    # Las marcas suelen ser texto con posibles números y algunos símbolos
    pattern = r'^[A-Za-z0-9\s\-\.&®™©]{2,50}$'
    if not re.match(pattern, value):
        raise ValidationError(_('La marca debe contener solo letras, números y símbolos permitidos (2-50 caracteres)'))
    
    return value.strip()

def validate_modelo_producto(value):
    """
    Validador para modelo de producto.
    """
    if not value:
        return value
    
    # Los modelos pueden ser alfanuméricos con guiones y puntos
    pattern = r'^[A-Za-z0-9\s\-\.]{2,30}$'
    if not re.match(pattern, value):
        raise ValidationError(_('El modelo debe ser alfanumérico con guiones y puntos (2-30 caracteres)'))
    
    return value.strip()

def validate_nombre_generico(value):
    """
    Validador para nombre genérico de productos.
    """
    if not value:
        return value
    
    value_clean = value.strip()
    
    if len(value_clean) < 3:
        raise ValidationError(_('El nombre genérico debe tener al menos 3 caracteres'))
    
    # Verificar que contenga principalmente letras
    if not re.search(r'^[A-Za-z\s\-\.]{3,200}$', value_clean):
        raise ValidationError(_('El nombre genérico debe contener principalmente letras (3-200 caracteres)'))
    
    return value_clean

def validate_presentacion_comercial(value):
    """
    Validador para presentación comercial del producto.
    """
    if not value:
        return value
    
    value_clean = value.strip()
    
    if len(value_clean) < 2:
        raise ValidationError(_('La presentación debe tener al menos 2 caracteres'))
    
    # Permitir texto, números y unidades de medida
    pattern = r'^[A-Za-z0-9\s\-\.\,\/\(\)]{2,100}$'
    if not re.match(pattern, value_clean):
        raise ValidationError(_('La presentación contiene caracteres no permitidos (2-100 caracteres)'))
    
    return value_clean

def validate_business_rules_proforma(proforma_data):
    """
    Validador de reglas de negocio para proformas completas.
    """
    errors = []
    
    # Validar que tenga al menos un ítem
    if 'items' in proforma_data and not proforma_data['items']:
        errors.append(_('La proforma debe tener al menos un ítem'))
    
    # Validar coherencia de fechas
    if 'fecha_emision' in proforma_data and 'fecha_vencimiento' in proforma_data:
        fecha_emision = proforma_data['fecha_emision']
        fecha_vencimiento = proforma_data['fecha_vencimiento']
        
        if isinstance(fecha_emision, str):
            fecha_emision = datetime.strptime(fecha_emision, '%Y-%m-%d').date()
        if isinstance(fecha_vencimiento, str):
            fecha_vencimiento = datetime.strptime(fecha_vencimiento, '%Y-%m-%d').date()
        
        if fecha_vencimiento <= fecha_emision:
            errors.append(_('La fecha de vencimiento debe ser posterior a la fecha de emisión'))
    
    # Validar totales
    if 'total' in proforma_data and proforma_data['total'] <= 0:
        errors.append(_('El total de la proforma debe ser mayor a cero'))
    
    if errors:
        raise ValidationError(errors)
    
    return True
