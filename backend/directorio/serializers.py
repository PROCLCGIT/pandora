# backend/directorio/serializers.py

from rest_framework import serializers
from .models import (
    Cliente,
    Proveedor,
    Vendedor,
    Contacto,
    RelacionBlue,
    Tag,
)
from basic.serializers import CiudadSerializer

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name", "color_code", "created_at", "updated_at"]
        read_only_fields = ("created_at", "updated_at")

class ContactoSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Contacto"""

    tags = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, required=False
    )

    class Meta:
        model = Contacto
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['tags'] = TagSerializer(instance.tags.all(), many=True).data
        return ret

class ClienteSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Cliente.

    Al extender `ModelSerializer` y **no** sobrescribir los campos `zona`, `ciudad` y
    `tipo_cliente`, éstos permanecen como `PrimaryKeyRelatedField` por defecto,
    lo que permite que el cliente envíe los respectivos *IDs* en las operaciones
    de creación y actualización.

    Para mantener la respuesta enriquecida (con nombre e id) se sobreescribe
    `to_representation`.
    """

    tags = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, required=False
    )

    class Meta:
        model = Cliente
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

    def to_representation(self, instance):
        """Agrega información detallada de las FK en la salida JSON."""
        ret = super().to_representation(instance)

        # Sustituir los IDs por un objeto con id y nombre para mayor claridad
        ret['zona'] = (
            {'id': instance.zona.id, 'nombre': instance.zona.nombre}
            if instance.zona else None
        )

        ret['ciudad'] = (
            {'id': instance.ciudad.id, 'nombre': instance.ciudad.nombre}
            if instance.ciudad else None
        )

        ret['tipo_cliente'] = (
            {
                'id': instance.tipo_cliente.id,
                'nombre': instance.tipo_cliente.nombre,
            }
            if instance.tipo_cliente else None
        )

        ret['tags'] = TagSerializer(instance.tags.all(), many=True).data

        return ret

class ProveedorSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Proveedor"""
    ciudad = CiudadSerializer(read_only=True)
    tags = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, required=False
    )

    class Meta:
        model = Proveedor
        fields = [
            'id', 'ruc', 'razon_social', 'nombre', 'direccion1',
            'direccion2', 'correo', 'telefono', 'tipo_primario',
            'activo', 'created_at', 'updated_at', 'ciudad', 'tags'
        ]
        read_only_fields = ('created_at', 'updated_at')

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['tags'] = TagSerializer(instance.tags.all(), many=True).data
        return ret

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
    """Serializer detallado para el modelo Cliente que incluye relaciones
    anidadas y mantiene un formato consistente con `ClienteSerializer`."""

    relaciones = RelacionBlueSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Cliente
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

    def to_representation(self, instance):
        """Devuelve zona/ciudad/tipo_cliente como objeto {id, nombre}."""
        ret = super().to_representation(instance)

        ret['zona'] = (
            {'id': instance.zona.id, 'nombre': instance.zona.nombre}
            if instance.zona else None
        )

        ret['ciudad'] = (
            {'id': instance.ciudad.id, 'nombre': instance.ciudad.nombre}
            if instance.ciudad else None
        )

        ret['tipo_cliente'] = (
            {
                'id': instance.tipo_cliente.id,
                'nombre': instance.tipo_cliente.nombre,
            }
            if instance.tipo_cliente else None
        )

        # Eliminamos los campos *_nombre antiguos para evitar duplicidad
        ret.pop('zona_nombre', None)
        ret.pop('ciudad_nombre', None)
        ret.pop('tipo_cliente_nombre', None)

        return ret

class ProveedorDetalladoSerializer(serializers.ModelSerializer):
    """Serializer detallado para el modelo Proveedor con relaciones anidadas"""
    vendedores = VendedorSerializer(many=True, read_only=True)
    ciudad = CiudadSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Proveedor
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class ContactoDetalladoSerializer(serializers.ModelSerializer):
    """Serializer detallado para el modelo Contacto con relaciones anidadas"""
    relaciones = RelacionBlueSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    
    class Meta:
        model = Contacto
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
