# backend/proformas/serializers.py

from rest_framework import serializers
from .models import (
    Proforma, ProformaItem, ProformaHistorial, 
    SecuenciaProforma, ConfiguracionProforma
)

class ProformaItemSerializer(serializers.ModelSerializer):
    """Serializer para el modelo ProformaItem"""
    unidad_nombre = serializers.CharField(source='unidad.nombre', read_only=True)
    
    class Meta:
        model = ProformaItem
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'total')
    
    def validate(self, data):
        """Validación personalizada para debugging"""
        print(f"[DEBUG] ProformaItemSerializer - Validating data: {data}")
        
        # Verificar que la unidad existe
        if 'unidad' in data:
            from basic.models import Unidad
            try:
                unidad = Unidad.objects.get(pk=data['unidad'].pk if hasattr(data['unidad'], 'pk') else data['unidad'])
                print(f"[DEBUG] Unidad encontrada: {unidad}")
            except Unidad.DoesNotExist:
                raise serializers.ValidationError({'unidad': 'La unidad especificada no existe'})
        
        # Validar que las referencias a productos existen si se especifican
        if data.get('producto_disponible'):
            from productos.models import ProductoDisponible
            try:
                pd_id = data['producto_disponible'].pk if hasattr(data['producto_disponible'], 'pk') else data['producto_disponible']
                producto = ProductoDisponible.objects.get(pk=pd_id)
                print(f"[DEBUG] ProductoDisponible encontrado: {producto}")
            except ProductoDisponible.DoesNotExist:
                print(f"[DEBUG] ProductoDisponible con ID {pd_id} no existe")
                raise serializers.ValidationError({'producto_disponible': f'ProductoDisponible con ID {pd_id} no existe'})
        
        if data.get('producto_ofertado'):
            from productos.models import ProductoOfertado
            try:
                po_id = data['producto_ofertado'].pk if hasattr(data['producto_ofertado'], 'pk') else data['producto_ofertado']
                producto = ProductoOfertado.objects.get(pk=po_id)
                print(f"[DEBUG] ProductoOfertado encontrado: {producto}")
            except ProductoOfertado.DoesNotExist:
                print(f"[DEBUG] ProductoOfertado con ID {po_id} no existe")
                raise serializers.ValidationError({'producto_ofertado': f'ProductoOfertado con ID {po_id} no existe'})
        
        return data
        
    def to_representation(self, instance):
        """Personaliza la representación del objeto"""
        ret = super().to_representation(instance)
        # Añadir referencias de productos según el tipo_item
        if instance.tipo_item == ProformaItem.TipoItem.PRODUCTO_OFERTADO and instance.producto_ofertado:
            ret['producto_nombre'] = instance.producto_ofertado.nombre
        elif instance.tipo_item == ProformaItem.TipoItem.PRODUCTO_DISPONIBLE and instance.producto_disponible:
            ret['producto_nombre'] = instance.producto_disponible.nombre
        elif instance.tipo_item == ProformaItem.TipoItem.INVENTARIO and instance.inventario:
            ret['producto_nombre'] = instance.inventario.nombre
        return ret


class ProformaHistorialSerializer(serializers.ModelSerializer):
    """Serializer para el modelo ProformaHistorial"""
    created_by_nombre = serializers.CharField(source='created_by.get_full_name', read_only=True)
    accion_display = serializers.CharField(source='get_accion_display', read_only=True)
    
    class Meta:
        model = ProformaHistorial
        fields = '__all__'
        read_only_fields = ('created_at',)


class SecuenciaProformaSerializer(serializers.ModelSerializer):
    """Serializer para el modelo SecuenciaProforma"""
    class Meta:
        model = SecuenciaProforma
        fields = '__all__'
        read_only_fields = ('ultima_actualizacion',)


class ConfiguracionProformaSerializer(serializers.ModelSerializer):
    """Serializer para el modelo ConfiguracionProforma"""
    empresa_predeterminada_nombre = serializers.CharField(
        source='empresa_predeterminada.nombre', 
        read_only=True
    )
    
    class Meta:
        model = ConfiguracionProforma
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class ProformaSerializer(serializers.ModelSerializer):
    """Serializer básico para el modelo Proforma"""
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    empresa_nombre = serializers.CharField(source='empresa.nombre', read_only=True)
    tipo_contratacion_nombre = serializers.CharField(source='tipo_contratacion.nombre', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    
    class Meta:
        model = Proforma
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'numero', 'subtotal', 'impuesto', 'total')
        
    def to_representation(self, instance):
        """Personaliza la representación del objeto"""
        ret = super().to_representation(instance)
        # Añadir campos adicionales o transformar datos si es necesario
        return ret


# Serializers con datos anidados para vistas detalladas

class ProformaDetalladoSerializer(serializers.ModelSerializer):
    """Serializer detallado para el modelo Proforma con ítems e historial"""
    items = ProformaItemSerializer(many=True, read_only=True)
    historial = ProformaHistorialSerializer(many=True, read_only=True)
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    empresa_nombre = serializers.CharField(source='empresa.nombre', read_only=True)
    tipo_contratacion_nombre = serializers.CharField(source='tipo_contratacion.nombre', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    
    # Datos adicionales del cliente
    cliente_ruc = serializers.CharField(source='cliente.ruc', read_only=True)
    cliente_direccion = serializers.CharField(source='cliente.direccion', read_only=True)
    cliente_email = serializers.CharField(source='cliente.email', read_only=True)
    cliente_telefono = serializers.CharField(source='cliente.telefono', read_only=True)
    
    # Datos adicionales de la empresa
    empresa_ruc = serializers.CharField(source='empresa.ruc', read_only=True)
    empresa_direccion = serializers.CharField(source='empresa.direccion', read_only=True)
    empresa_correo = serializers.CharField(source='empresa.correo', read_only=True)
    empresa_telefono = serializers.CharField(source='empresa.telefono', read_only=True)
    
    class Meta:
        model = Proforma
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'numero', 'subtotal', 'impuesto', 'total')
    
    def to_representation(self, instance):
        """Personaliza la representación del objeto"""
        ret = super().to_representation(instance)
        # Calcular días entre fecha de emisión y vencimiento
        from datetime import datetime
        dias_validez = (instance.fecha_vencimiento - instance.fecha_emision).days
        ret['dias_validez'] = dias_validez
        
        # Añadir conteo de ítems
        ret['cantidad_items'] = instance.items.count()
        
        return ret


class ProformaItemDetalladoSerializer(serializers.ModelSerializer):
    """Serializer detallado para el modelo ProformaItem con información del producto"""
    unidad_nombre = serializers.CharField(source='unidad.nombre', read_only=True)
    proforma_numero = serializers.CharField(source='proforma.numero', read_only=True)
    proforma_nombre = serializers.CharField(source='proforma.nombre', read_only=True)
    
    class Meta:
        model = ProformaItem
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'total')
    
    def to_representation(self, instance):
        """Personaliza la representación del objeto"""
        ret = super().to_representation(instance)
        
        # Añadir detalles específicos según el tipo de producto
        if instance.tipo_item == ProformaItem.TipoItem.PRODUCTO_OFERTADO and instance.producto_ofertado:
            ret['producto_nombre'] = instance.producto_ofertado.nombre
            ret['producto_detalle'] = {
                'id': instance.producto_ofertado.id,
                'codigo': instance.producto_ofertado.codigo,
                # Añadir más campos específicos del producto ofertado
            }
        elif instance.tipo_item == ProformaItem.TipoItem.PRODUCTO_DISPONIBLE and instance.producto_disponible:
            ret['producto_nombre'] = instance.producto_disponible.nombre
            ret['producto_detalle'] = {
                'id': instance.producto_disponible.id,
                'codigo': instance.producto_disponible.codigo,
                # Añadir más campos específicos del producto disponible
            }
        elif instance.tipo_item == ProformaItem.TipoItem.INVENTARIO and instance.inventario:
            ret['producto_nombre'] = instance.inventario.nombre
            ret['producto_detalle'] = {
                'id': instance.inventario.id,
                'codigo': instance.inventario.codigo,
                # Añadir más campos específicos del producto de inventario
            }
        
        # Cálculos adicionales
        ret['precio_con_descuento'] = instance.precio_unitario * (1 - (instance.porcentaje_descuento / 100))
        
        return ret


class ProformaReporteSerializer(serializers.ModelSerializer):
    """Serializer específico para generar reportes de proformas"""
    items = ProformaItemSerializer(many=True, read_only=True)
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    cliente_ruc = serializers.CharField(source='cliente.ruc', read_only=True)
    cliente_direccion = serializers.CharField(source='cliente.direccion', read_only=True)
    
    empresa_nombre = serializers.CharField(source='empresa.nombre', read_only=True)
    empresa_ruc = serializers.CharField(source='empresa.ruc', read_only=True)
    empresa_direccion = serializers.CharField(source='empresa.direccion', read_only=True)
    empresa_telefono = serializers.CharField(source='empresa.telefono', read_only=True)
    empresa_correo = serializers.CharField(source='empresa.correo', read_only=True)
    
    tipo_contratacion_nombre = serializers.CharField(source='tipo_contratacion.nombre', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    
    class Meta:
        model = Proforma
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')