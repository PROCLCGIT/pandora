# backend/proformas/serializers.py

from rest_framework import serializers
from .models import (
    Proforma, ProformaItem, ProformaHistorial, 
    SecuenciaProforma, ConfiguracionProforma
)

class ProformaItemSerializer(serializers.ModelSerializer):
    """Serializer para el modelo ProformaItem"""
    unidad_nombre = serializers.CharField(source='unidad.nombre', read_only=True)
    campo_identificador = serializers.CharField(source='get_campo_identificador', read_only=True)
    precio_con_descuento = serializers.DecimalField(source='precio_con_descuento', max_digits=15, decimal_places=2, read_only=True)
    valor_descuento = serializers.DecimalField(source='valor_descuento', max_digits=15, decimal_places=2, read_only=True)
    
    class Meta:
        model = ProformaItem
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'total')
    
    def validate(self, data):
        """Validación personalizada según el modelo de template de la proforma"""
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
        
        # Validar campos requeridos según el modelo de template de la proforma
        if self.instance and self.instance.proforma:
            self._validar_campos_segun_modelo(data, self.instance.proforma)
        elif 'proforma' in data:
            proforma = data['proforma']
            self._validar_campos_segun_modelo(data, proforma)
        
        return data
    
    def _validar_campos_segun_modelo(self, data, proforma):
        """Valida campos requeridos según el modelo de template de la proforma"""
        config = proforma.get_campos_visibles()
        campos_requeridos = config['requeridos']
        
        errores = {}
        for campo in campos_requeridos:
            # Verificar si el campo está en los datos o en la instancia existente
            valor = data.get(campo)
            if self.instance and not valor:
                valor = getattr(self.instance, campo, None)
            
            if not valor or (isinstance(valor, str) and not valor.strip()):
                nombre_campo = config['headers'][config['campos'].index(campo)] if campo in config['campos'] else campo
                errores[campo] = f'El campo {nombre_campo} es requerido para el modelo {proforma.get_titulo_modelo()}'
        
        if errores:
            raise serializers.ValidationError(errores)
        
    def to_representation(self, instance):
        """Personaliza la representación del objeto"""
        ret = super().to_representation(instance)
        
        # Añadir referencias de productos según el tipo_item
        if instance.tipo_item == ProformaItem.TipoItem.PRODUCTO_OFERTADO and instance.producto_ofertado:
            ret['producto_nombre'] = instance.producto_ofertado.nombre
        elif instance.tipo_item == ProformaItem.TipoItem.PRODUCTO_DISPONIBLE and instance.producto_disponible:
            ret['producto_nombre'] = instance.producto_disponible.nombre
        # elif instance.tipo_item == ProformaItem.TipoItem.INVENTARIO and instance.inventario:
        #     ret['producto_nombre'] = instance.inventario.nombre
        
        # Formatear fecha de vencimiento para mejor visualización
        if instance.fecha_vencimiento:
            ret['fecha_vencimiento_formatted'] = instance.fecha_vencimiento.strftime('%d/%m/%Y')
        
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
    modelo_template_display = serializers.CharField(source='get_modelo_template_display', read_only=True)
    titulo_modelo = serializers.CharField(source='get_titulo_modelo', read_only=True)
    campos_visibles = serializers.SerializerMethodField()
    puede_ser_enviada = serializers.BooleanField(source='puede_ser_enviada', read_only=True)
    esta_vencida = serializers.BooleanField(source='esta_vencida', read_only=True)
    dias_hasta_vencimiento = serializers.IntegerField(source='dias_hasta_vencimiento', read_only=True)
    cantidad_items = serializers.IntegerField(source='cantidad_items', read_only=True)
    
    class Meta:
        model = Proforma
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'numero', 'subtotal', 'impuesto', 'total')
    
    def get_campos_visibles(self, obj):
        """Retorna la configuración de campos visibles según el modelo"""
        return obj.get_campos_visibles()
    
    def validate(self, data):
        """Validación personalizada para la proforma"""
        # Si se está cambiando el modelo de template, validar que sea compatible con los ítems existentes
        if self.instance and 'modelo_template' in data:
            nuevo_modelo = data['modelo_template']
            if nuevo_modelo != self.instance.modelo_template:
                # Crear una proforma temporal para obtener la nueva configuración
                temp_proforma = Proforma(modelo_template=nuevo_modelo)
                nueva_config = temp_proforma.get_campos_visibles()
                nuevos_campos_requeridos = nueva_config['requeridos']
                
                # Validar que los ítems existentes cumplan con los nuevos requerimientos
                items_con_errores = []
                for item in self.instance.items.all():
                    errores_item = []
                    for campo in nuevos_campos_requeridos:
                        valor = getattr(item, campo, None)
                        if not valor or (isinstance(valor, str) and not valor.strip()):
                            errores_item.append(campo)
                    
                    if errores_item:
                        items_con_errores.append({
                            'item_id': item.id,
                            'descripcion': item.descripcion[:50],
                            'campos_faltantes': errores_item
                        })
                
                if items_con_errores:
                    raise serializers.ValidationError({
                        'modelo_template': f'No se puede cambiar al modelo {temp_proforma.get_titulo_modelo()} '
                                         f'porque {len(items_con_errores)} ítem(s) no cumplen con los campos requeridos.',
                        'items_con_errores': items_con_errores
                    })
        
        return data
        
    def to_representation(self, instance):
        """Personaliza la representación del objeto"""
        ret = super().to_representation(instance)
        # Añadir información adicional si es necesario
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
    modelo_template_display = serializers.CharField(source='get_modelo_template_display', read_only=True)
    titulo_modelo = serializers.CharField(source='get_titulo_modelo', read_only=True)
    campos_visibles = serializers.SerializerMethodField()
    items_validacion = serializers.SerializerMethodField()
    puede_ser_enviada = serializers.BooleanField(source='puede_ser_enviada', read_only=True)
    esta_vencida = serializers.BooleanField(source='esta_vencida', read_only=True)
    dias_hasta_vencimiento = serializers.IntegerField(source='dias_hasta_vencimiento', read_only=True)
    
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
    
    def get_campos_visibles(self, obj):
        """Retorna la configuración de campos visibles según el modelo"""
        return obj.get_campos_visibles()
    
    def get_items_validacion(self, obj):
        """Retorna la validación de ítems según el modelo seleccionado"""
        return obj.validar_items_segun_modelo()
    
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
    proforma_modelo_template = serializers.CharField(source='proforma.modelo_template', read_only=True)
    proforma_titulo_modelo = serializers.CharField(source='proforma.get_titulo_modelo', read_only=True)
    campo_identificador = serializers.CharField(source='get_campo_identificador', read_only=True)
    precio_con_descuento = serializers.DecimalField(source='precio_con_descuento', max_digits=15, decimal_places=2, read_only=True)
    valor_descuento = serializers.DecimalField(source='valor_descuento', max_digits=15, decimal_places=2, read_only=True)
    
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
                'nombre': instance.producto_ofertado.nombre,
                'descripcion': getattr(instance.producto_ofertado, 'descripcion', ''),
                # Añadir más campos específicos del producto ofertado
            }
        elif instance.tipo_item == ProformaItem.TipoItem.PRODUCTO_DISPONIBLE and instance.producto_disponible:
            ret['producto_nombre'] = instance.producto_disponible.nombre
            ret['producto_detalle'] = {
                'id': instance.producto_disponible.id,
                'codigo': instance.producto_disponible.codigo,
                'nombre': instance.producto_disponible.nombre,
                'descripcion': getattr(instance.producto_disponible, 'descripcion', ''),
                # Añadir más campos específicos del producto disponible
            }
        # elif instance.tipo_item == ProformaItem.TipoItem.INVENTARIO and instance.inventario:
        #     ret['producto_nombre'] = instance.inventario.nombre
        #     ret['producto_detalle'] = {
        #         'id': instance.inventario.id,
        #         'codigo': instance.inventario.codigo,
        #         # Añadir más campos específicos del producto de inventario
        #     }
        
        # Formatear fechas para mejor visualización
        if instance.fecha_vencimiento:
            ret['fecha_vencimiento_formatted'] = instance.fecha_vencimiento.strftime('%d/%m/%Y')
        
        # Añadir información sobre qué campos son visibles para este ítem según el modelo de la proforma
        if instance.proforma:
            ret['campos_visibles_config'] = instance.proforma.get_campos_visibles()
        
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
    modelo_template_display = serializers.CharField(source='get_modelo_template_display', read_only=True)
    titulo_modelo = serializers.CharField(source='get_titulo_modelo', read_only=True)
    campos_visibles = serializers.SerializerMethodField()
    
    class Meta:
        model = Proforma
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
    
    def get_campos_visibles(self, obj):
        """Retorna la configuración de campos visibles según el modelo"""
        return obj.get_campos_visibles()


# Serializer simplificado para selección de modelos de template

class ModeloTemplateChoicesSerializer(serializers.Serializer):
    """Serializer para obtener las opciones disponibles de modelos de template"""
    value = serializers.CharField()
    label = serializers.CharField()
    description = serializers.CharField()
    campos = serializers.ListField(child=serializers.CharField())
    headers = serializers.ListField(child=serializers.CharField())
    requeridos = serializers.ListField(child=serializers.CharField())
    
    @classmethod
    def get_opciones(cls):
        """Retorna todas las opciones de modelos de template disponibles"""
        opciones = []
        for choice_value, choice_label in Proforma.ModeloTemplate.choices:
            # Crear una proforma temporal para obtener la configuración
            temp_proforma = Proforma(modelo_template=choice_value)
            config = temp_proforma.get_campos_visibles()
            
            opciones.append({
                'value': choice_value,
                'label': choice_label,
                'description': choice_label,
                'campos': config['campos'],
                'headers': config['headers'],
                'requeridos': config['requeridos'],
                'anchos': config['anchos']
            })
        
        return opciones


# Serializer para validación masiva de ítems

class ProformaItemsValidacionSerializer(serializers.Serializer):
    """Serializer para validar múltiples ítems contra un modelo de template específico"""
    modelo_template = serializers.ChoiceField(choices=Proforma.ModeloTemplate.choices)
    items = ProformaItemSerializer(many=True)
    
    def validate(self, data):
        """Valida que todos los ítems cumplan con los requerimientos del modelo"""
        modelo_template = data['modelo_template']
        items = data['items']
        
        # Crear una proforma temporal para obtener la configuración
        temp_proforma = Proforma(modelo_template=modelo_template)
        config = temp_proforma.get_campos_visibles()
        campos_requeridos = config['requeridos']
        
        items_con_errores = []
        
        for i, item_data in enumerate(items):
            errores_item = []
            for campo in campos_requeridos:
                valor = item_data.get(campo)
                if not valor or (isinstance(valor, str) and not valor.strip()):
                    errores_item.append(campo)
            
            if errores_item:
                items_con_errores.append({
                    'index': i,
                    'descripcion': item_data.get('descripcion', ''),
                    'campos_faltantes': errores_item
                })
        
        if items_con_errores:
            raise serializers.ValidationError({
                'items_con_errores': items_con_errores,
                'mensaje': f'Algunos ítems no cumplen con los campos requeridos para el modelo {temp_proforma.get_titulo_modelo()}'
            })
        
        return data
