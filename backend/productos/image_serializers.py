from rest_framework import serializers
from .product_images import ProductImage
from .models import ProductoOfertado, ProductoDisponible

class ProductImageSerializer(serializers.ModelSerializer):
    """
    Serializer para imágenes de productos procesadas.
    Incluye URLs para las diferentes versiones de la imagen.
    """
    thumbnail = serializers.SerializerMethodField()
    standard = serializers.SerializerMethodField()
    large = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductImage
        fields = [
            'id', 'title', 'original', 'thumbnail', 'standard', 
            'large', 'alt_text', 'order', 'is_featured',
            'created_at', 'updated_at'
        ]
    
    def get_thumbnail(self, obj):
        if obj.thumbnail:
            return self.context['request'].build_absolute_uri(obj.thumbnail.url)
        return None
    
    def get_standard(self, obj):
        if obj.standard:
            return self.context['request'].build_absolute_uri(obj.standard.url)
        return None
    
    def get_large(self, obj):
        if obj.large:
            return self.context['request'].build_absolute_uri(obj.large.url)
        return None

# Actualizar los serializers existentes para incluir información sobre imágenes

class ProductoOfertadoImageSerializerMixin:
    """
    Mixin para añadir información de imágenes procesadas a los serializers de ProductoOfertado
    """
    def get_featured_image(self, obj):
        request = self.context.get('request')
        if not request:
            return None
            
        featured = obj.featured_image
        if not featured:
            return None
            
        return {
            'id': featured.id,
            'thumbnail': request.build_absolute_uri(featured.thumbnail.url),
            'standard': request.build_absolute_uri(featured.standard.url)
        }

class ProductoDisponibleImageSerializerMixin:
    """
    Mixin para añadir información de imágenes procesadas a los serializers de ProductoDisponible
    """
    def get_featured_image(self, obj):
        request = self.context.get('request')
        if not request:
            return None
            
        featured = obj.featured_image
        if not featured:
            return None
            
        return {
            'id': featured.id,
            'thumbnail': request.build_absolute_uri(featured.thumbnail.url),
            'standard': request.build_absolute_uri(featured.standard.url)
        }
