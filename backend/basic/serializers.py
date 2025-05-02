# backend/basic/serializers.py

from rest_framework import serializers
from .models import (
    Categoria, Ciudad, EmpresaClc, Especialidad, Marca, 
    Procedencia, TipoCliente, TipoContratacion, Unidad, Zona, ZonaCiudad
)


class CategoriaSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Categoria"""
    class Meta:
        model = Categoria
        fields = '__all__'
        read_only_fields = ('level', 'path')  # Calculados automáticamente


class CiudadSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Ciudad"""
    class Meta:
        model = Ciudad
        fields = '__all__'


class EmpresaClcSerializer(serializers.ModelSerializer):
    """Serializer para el modelo EmpresaClc"""
    class Meta:
        model = EmpresaClc
        fields = '__all__'


class EspecialidadSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Especialidad"""
    class Meta:
        model = Especialidad
        fields = '__all__'


class MarcaSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Marca"""
    class Meta:
        model = Marca
        fields = '__all__'


class ProcedenciaSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Procedencia"""
    class Meta:
        model = Procedencia
        fields = '__all__'


class TipoClienteSerializer(serializers.ModelSerializer):
    """Serializer para el modelo TipoCliente"""
    class Meta:
        model = TipoCliente
        fields = '__all__'


class TipoContratacionSerializer(serializers.ModelSerializer):
    """Serializer para el modelo TipoContratacion"""
    class Meta:
        model = TipoContratacion
        fields = '__all__'


class UnidadSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Unidad"""
    class Meta:
        model = Unidad
        fields = '__all__'


class ZonaSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Zona"""
    class Meta:
        model = Zona
        fields = '__all__'


class ZonaCiudadSerializer(serializers.ModelSerializer):
    """Serializer para el modelo ZonaCiudad"""
    class Meta:
        model = ZonaCiudad
        fields = '__all__'


class ZonaDetalleSerializer(serializers.ModelSerializer):
    """Serializer detallado para Zona con ciudades relacionadas"""
    ciudades = serializers.SerializerMethodField()
    
    class Meta:
        model = Zona
        fields = '__all__'
    
    def get_ciudades(self, obj):
        zona_ciudades = ZonaCiudad.objects.filter(zona=obj)
        ciudades = [relacion.ciudad for relacion in zona_ciudades]
        return CiudadSerializer(ciudades, many=True).data


class CategoriaHijoSerializer(serializers.ModelSerializer):
    """Serializer para obtener categorías hijas"""
    class Meta:
        model = Categoria
        fields = ('id', 'nombre', 'code', 'level', 'path', 'is_active')


class CategoriaDetalleSerializer(serializers.ModelSerializer):
    """Serializer detallado para Categoria con hijos"""
    hijos = serializers.SerializerMethodField()
    
    class Meta:
        model = Categoria
        fields = '__all__'
    
    def get_hijos(self, obj):
        hijos = Categoria.objects.filter(parent=obj)
        return CategoriaHijoSerializer(hijos, many=True).data