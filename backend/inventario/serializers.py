# backend/inventario/serializers.py

from rest_framework import serializers
from .models import (
    Unidad, Categoria, ProductoInventario, Almacen, Ubicacion, 
    Existencia, MovimientoInventario, Proveedor, OrdenCompra,
    LineaOrdenCompra, Cliente, OrdenVenta, LineaOrdenVenta,
    ReservaInventario
)

# Serializadores básicos
class UnidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unidad
        fields = '__all__'

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = '__all__'

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'

class AlmacenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Almacen
        fields = '__all__'

class UbicacionSerializer(serializers.ModelSerializer):
    almacen_codigo = serializers.ReadOnlyField(source='almacen.codigo')
    
    class Meta:
        model = Ubicacion
        fields = '__all__'

# Serializadores con relaciones
class ProductoInventarioSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.ReadOnlyField(source='categoria.nombre')
    unidad_abreviatura = serializers.ReadOnlyField(source='unidad.abreviatura')
    
    class Meta:
        model = ProductoInventario
        fields = '__all__'

class ExistenciaSerializer(serializers.ModelSerializer):
    producto_sku = serializers.ReadOnlyField(source='producto.sku')
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')
    almacen_codigo = serializers.ReadOnlyField(source='almacen.codigo')
    ubicacion_codigo = serializers.ReadOnlyField(source='ubicacion.codigo', default='-')
    
    class Meta:
        model = Existencia
        fields = '__all__'

class MovimientoInventarioSerializer(serializers.ModelSerializer):
    producto_sku = serializers.ReadOnlyField(source='producto.sku')
    almacen_codigo = serializers.ReadOnlyField(source='almacen.codigo')
    
    class Meta:
        model = MovimientoInventario
        fields = '__all__'

class LineaOrdenCompraSerializer(serializers.ModelSerializer):
    producto_sku = serializers.ReadOnlyField(source='producto.sku')
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')
    
    class Meta:
        model = LineaOrdenCompra
        fields = '__all__'

class OrdenCompraSerializer(serializers.ModelSerializer):
    proveedor_nombre = serializers.ReadOnlyField(source='proveedor.nombre')
    almacen_codigo = serializers.ReadOnlyField(source='almacen.codigo')
    lineas = LineaOrdenCompraSerializer(many=True, read_only=True)
    
    class Meta:
        model = OrdenCompra
        fields = '__all__'

class LineaOrdenVentaSerializer(serializers.ModelSerializer):
    producto_sku = serializers.ReadOnlyField(source='producto.sku')
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')
    
    class Meta:
        model = LineaOrdenVenta
        fields = '__all__'

class OrdenVentaSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.ReadOnlyField(source='cliente.nombre')
    almacen_codigo = serializers.ReadOnlyField(source='almacen.codigo')
    lineas = LineaOrdenVentaSerializer(many=True, read_only=True)
    
    class Meta:
        model = OrdenVenta
        fields = '__all__'

class ReservaInventarioSerializer(serializers.ModelSerializer):
    producto_sku = serializers.ReadOnlyField(source='producto.sku')
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')
    almacen_codigo = serializers.ReadOnlyField(source='almacen.codigo')
    
    class Meta:
        model = ReservaInventario
        fields = '__all__'

# Serializadores detallados (para endpoints específicos)
class ProductoInventarioDetalleSerializer(serializers.ModelSerializer):
    categoria = CategoriaSerializer(read_only=True)
    unidad = UnidadSerializer(read_only=True)
    existencias = ExistenciaSerializer(many=True, read_only=True)
    
    class Meta:
        model = ProductoInventario
        fields = '__all__'

class OrdenCompraDetalleSerializer(serializers.ModelSerializer):
    proveedor = ProveedorSerializer(read_only=True)
    almacen = AlmacenSerializer(read_only=True)
    lineas = LineaOrdenCompraSerializer(many=True, read_only=True)
    
    class Meta:
        model = OrdenCompra
        fields = '__all__'

class OrdenVentaDetalleSerializer(serializers.ModelSerializer):
    cliente = ClienteSerializer(read_only=True)
    almacen = AlmacenSerializer(read_only=True)
    lineas = LineaOrdenVentaSerializer(many=True, read_only=True)
    
    class Meta:
        model = OrdenVenta
        fields = '__all__'