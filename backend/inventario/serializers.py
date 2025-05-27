from rest_framework import serializers
from .models import (
    Almacen, Stock, TipoMovimiento, 
    Movimiento, DetalleMovimiento, AlertaStock
)
from productos.serializers import ProductoDisponibleSerializer
from directorio.serializers import ProveedorSerializer, ClienteSerializer

class AlmacenSerializer(serializers.ModelSerializer):
    responsable_nombre = serializers.CharField(source='responsable.get_full_name', read_only=True)
    
    class Meta:
        model = Almacen
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class StockSerializer(serializers.ModelSerializer):
    producto_detalle = ProductoDisponibleSerializer(source='producto', read_only=True)
    almacen_nombre = serializers.CharField(source='almacen.nombre', read_only=True)
    cantidad_disponible = serializers.DecimalField(max_digits=14, decimal_places=4, read_only=True)
    estado_stock = serializers.CharField(read_only=True)
    
    class Meta:
        model = Stock
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'ultimo_movimiento')

class TipoMovimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoMovimiento
        fields = '__all__'

class DetalleMovimientoSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    unidad_medida_nombre = serializers.CharField(source='unidad_medida.nombre', read_only=True)
    subtotal = serializers.SerializerMethodField()
    
    class Meta:
        model = DetalleMovimiento
        fields = '__all__'
    
    def get_subtotal(self, obj):
        return obj.cantidad * obj.costo_unitario

class MovimientoSerializer(serializers.ModelSerializer):
    detalles = DetalleMovimientoSerializer(many=True, read_only=True)
    tipo_movimiento_nombre = serializers.CharField(source='tipo_movimiento.nombre', read_only=True)
    usuario_nombre = serializers.CharField(source='usuario.get_full_name', read_only=True)
    total = serializers.SerializerMethodField()
    
    class Meta:
        model = Movimiento
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'usuario')
    
    def get_total(self, obj):
        return sum(d.cantidad * d.costo_unitario for d in obj.detalles.all())

class MovimientoCreateSerializer(serializers.ModelSerializer):
    detalles = DetalleMovimientoSerializer(many=True)
    
    class Meta:
        model = Movimiento
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
    
    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles')
        movimiento = Movimiento.objects.create(**validated_data)
        
        for detalle_data in detalles_data:
            DetalleMovimiento.objects.create(movimiento=movimiento, **detalle_data)
        
        return movimiento

class AlertaStockSerializer(serializers.ModelSerializer):
    stock_info = StockSerializer(source='stock', read_only=True)
    
    class Meta:
        model = AlertaStock
        fields = '__all__'
        read_only_fields = ('created_at',)
