from rest_framework import serializers
from .models import Brief, BriefItem, BriefHistory
from directorio.models import Cliente
from users.models import User
from productos.models import ProductoDisponible
from basic.models import Unidad


class BriefItemSerializer(serializers.ModelSerializer):
    unit_display = serializers.CharField(source='unit.nombre', read_only=True)
    product_reference_display = serializers.SerializerMethodField()
    total_estimado = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = BriefItem
        fields = [
            'id', 'product', 'product_reference', 'product_reference_display',
            'quantity', 'unit', 'unit_display', 'specifications', 'notes',
            'precio_estimado', 'total_estimado', 'orden'
        ]
        
    def get_product_reference_display(self, obj):
        if obj.product_reference:
            return {
                'id': obj.product_reference.id,
                'codigo': obj.product_reference.codigo,
                'nombre': obj.product_reference.nombre
            }
        return None


class BriefHistorySerializer(serializers.ModelSerializer):
    changed_by_display = serializers.CharField(source='changed_by.get_full_name', read_only=True)
    
    class Meta:
        model = BriefHistory
        fields = [
            'id', 'changed_by', 'changed_by_display', 'change_date',
            'field_changed', 'old_value', 'new_value', 'change_reason'
        ]
        read_only_fields = ['id', 'change_date']


class BriefListSerializer(serializers.ModelSerializer):
    client_display = serializers.CharField(source='client.nombre', read_only=True)
    operador_display = serializers.CharField(source='operador.get_full_name', read_only=True)
    created_by_display = serializers.CharField(source='created_by.get_full_name', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    priority_color = serializers.CharField(read_only=True)
    status_color = serializers.CharField(read_only=True)
    items_count = serializers.IntegerField(source='items.count', read_only=True)
    
    class Meta:
        model = Brief
        fields = [
            'id', 'code', 'title', 'client', 'client_display',
            'priority', 'priority_display', 'priority_color',
            'estado', 'estado_display', 'status_color',
            'operador', 'operador_display', 'fecha_emision',
            'due_date', 'created_by_display', 'items_count'
        ]


class BriefDetailSerializer(serializers.ModelSerializer):
    client_display = serializers.CharField(source='client.nombre', read_only=True)
    operador_display = serializers.CharField(source='operador.get_full_name', read_only=True)
    created_by_display = serializers.CharField(source='created_by.get_full_name', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    origin_display = serializers.CharField(source='get_origin_display', read_only=True)
    forma_pago_display = serializers.CharField(source='get_forma_pago_display', read_only=True)
    destino_display = serializers.CharField(source='get_destino_display', read_only=True)
    priority_color = serializers.CharField(read_only=True)
    status_color = serializers.CharField(read_only=True)
    items = BriefItemSerializer(many=True, read_only=True)
    history = BriefHistorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Brief
        fields = '__all__'
        read_only_fields = ['id', 'code', 'fecha_emision', 'created_at', 'updated_at']


class BriefCreateUpdateSerializer(serializers.ModelSerializer):
    items = BriefItemSerializer(many=True, required=False)
    
    class Meta:
        model = Brief
        fields = [
            'title', 'client', 'origin', 'description', 'priority',
            'presupuesto', 'tiempo_entrega', 'forma_pago', 'destino',
            'estado', 'operador', 'due_date', 'observaciones_internas',
            'archivo_adjunto', 'items'
        ]
        
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        validated_data['created_by'] = self.context['request'].user
        brief = Brief.objects.create(**validated_data)
        
        for item_data in items_data:
            BriefItem.objects.create(brief=brief, **item_data)
            
        return brief
        
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        # Actualizar campos del brief
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Si se enviaron items, actualizar
        if items_data is not None:
            # Eliminar items existentes
            instance.items.all().delete()
            
            # Crear nuevos items
            for item_data in items_data:
                BriefItem.objects.create(brief=instance, **item_data)
                
        return instance