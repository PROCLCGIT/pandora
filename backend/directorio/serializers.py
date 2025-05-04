from rest_framework import serializers
from .models import Cliente, Proveedor, Vendedor, Contacto, RelacionBlue
from drf_yasg.utils import swagger_serializer_method

class ContactoSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Contacto"""
    class Meta:
        model = Contacto
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class ClienteSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Cliente"""
    class Meta:
        model = Cliente
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
        
    def to_representation(self, instance):
        """Personaliza la representación del objeto"""
        ret = super().to_representation(instance)
        # Añadir campos adicionales o transformar datos si es necesario
        return ret

class ProveedorSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Proveedor"""
    class Meta:
        model = Proveedor
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class VendedorSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Vendedor"""
    proveedor_nombre = serializers.CharField(source='proveedor.nombre', read_only=True)
    
    class Meta:
        model = Vendedor
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class RelacionBlueSerializer(serializers.ModelSerializer):
    """Serializer para el modelo RelacionBlue"""
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    contacto_nombre = serializers.CharField(source='contacto.nombre', read_only=True)
    
    class Meta:
        model = RelacionBlue
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

# Serializers con datos anidados para vistas detalladas

class ClienteDetalladoSerializer(serializers.ModelSerializer):
    """Serializer detallado para el modelo Cliente con relaciones anidadas"""
    relaciones = RelacionBlueSerializer(many=True, read_only=True)
    zona_nombre = serializers.CharField(source='zona.nombre', read_only=True)
    ciudad_nombre = serializers.CharField(source='ciudad.nombre', read_only=True)
    tipo_cliente_nombre = serializers.CharField(source='tipo_cliente.nombre', read_only=True)
    
    class Meta:
        model = Cliente
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class ProveedorDetalladoSerializer(serializers.ModelSerializer):
    """Serializer detallado para el modelo Proveedor con relaciones anidadas"""
    vendedores = VendedorSerializer(many=True, read_only=True)
    ciudad_nombre = serializers.CharField(source='ciudad.nombre', read_only=True)
    
    class Meta:
        model = Proveedor
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class ContactoDetalladoSerializer(serializers.ModelSerializer):
    """Serializer detallado para el modelo Contacto con relaciones anidadas"""
    relaciones = RelacionBlueSerializer(many=True, read_only=True)
    
    class Meta:
        model = Contacto
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')