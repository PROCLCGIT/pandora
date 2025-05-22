# backend/productos/serializers.py

from rest_framework import serializers
from .models import (
    ProductoOfertado, ImagenReferenciaProductoOfertado, DocumentoProductoOfertado,
    ProductoDisponible, ImagenProductoDisponible, DocumentoProductoDisponible,
    ProductsPrice, HistorialDeCompras, HistorialDeVentas
)
from basic.serializers import (
    CategoriaSerializer, MarcaSerializer, UnidadSerializer, ProcedenciaSerializer
)
from directorio.serializers import ProveedorSerializer, ClienteSerializer


class ImagenReferenciaProductoOfertadoSerializer(serializers.ModelSerializer):
    """Serializer para el modelo ImagenReferenciaProductoOfertado"""
    imagen_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    webp_url = serializers.SerializerMethodField()
    original_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ImagenReferenciaProductoOfertado
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
    
    def get_imagen_url(self, obj):
        """Devuelve la URL completa de la imagen principal (webp o la original)"""
        request = self.context.get('request')
        # Usar las propiedades del modelo que ya incluyen /media/
        url = obj.webp_url or obj.thumbnail_url or obj.original_url or (obj.imagen.url if obj.imagen else None)
        if url and request:
            return request.build_absolute_uri(url)
        return url
    
    def get_thumbnail_url(self, obj):
        """Devuelve la URL de la miniatura"""
        if obj.imagen_thumbnail:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.thumbnail_url)
            return obj.thumbnail_url  # Usar la propiedad que agrega /media/
        return None
    
    def get_webp_url(self, obj):
        """Devuelve la URL de la versión WebP"""
        if obj.imagen_webp:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.webp_url)
            return obj.webp_url  # Usar la propiedad que agrega /media/
        return None
    
    def get_original_url(self, obj):
        """Devuelve la URL de la imagen original"""
        if obj.imagen_original:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.original_url)
            return obj.original_url  # Usar la propiedad que agrega /media/
        return None


class DocumentoProductoOfertadoSerializer(serializers.ModelSerializer):
    """Serializer para el modelo DocumentoProductoOfertado"""
    documento_url = serializers.SerializerMethodField()
    
    class Meta:
        model = DocumentoProductoOfertado
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
    
    def get_documento_url(self, obj):
        """Devuelve la URL completa del documento"""
        if obj.documento:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.documento.url)
            return obj.documento.url
        return None


class ProductoOfertadoSerializer(serializers.ModelSerializer):
    """Serializer para el modelo ProductoOfertado"""
    categoria_nombre = serializers.CharField(source='id_categoria.nombre', read_only=True)
    especialidad_nombre = serializers.SerializerMethodField()
    especialidad_data = serializers.SerializerMethodField()
    imagenes = ImagenReferenciaProductoOfertadoSerializer(many=True, read_only=True)

    class Meta:
        model = ProductoOfertado
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

    def get_especialidad_nombre(self, obj):
        """Obtiene el nombre de la especialidad de forma segura"""
        try:
            if obj.especialidad:
                return obj.especialidad.nombre
            return ""
        except:
            return ""
            
    def get_especialidad_data(self, obj):
        """Obtiene los datos de especialidad como objeto para el frontend"""
        try:
            if obj.especialidad:
                return {
                    'id': obj.especialidad.id,
                    'nombre': obj.especialidad.nombre,
                    'code': getattr(obj.especialidad, 'code', '')
                }
            return None
        except Exception as e:
            print(f"Error al obtener datos de especialidad: {e}")
            return None
            
    def validate_especialidad(self, value):
        """Valida que la especialidad exista en la base de datos"""
        if value is None:
            return None
            
        from basic.models import Especialidad
        try:
            # Si el value no es un objeto Especialidad sino un ID
            if not isinstance(value, Especialidad):
                try:
                    # Intentar convertir a entero si es string
                    if isinstance(value, str) and value.strip():
                        value = int(value)
                    especialidad = Especialidad.objects.get(id=value)
                    return especialidad
                except (ValueError, TypeError, Especialidad.DoesNotExist):
                    raise serializers.ValidationError(f"Especialidad con ID {value} no existe")
            return value
        except Exception as e:
            import traceback
            traceback.print_exc()
            raise serializers.ValidationError(f"Error al validar especialidad: {str(e)}")
            
    def to_internal_value(self, data):
        """Preprocesa los datos antes de la validación"""
        # Hacer una copia de los datos para no modificar el original
        data_copy = data.copy() if hasattr(data, 'copy') else dict(data)
        
        # Manejar especialidad vacía o 'none'
        if 'especialidad' in data_copy:
            esp_value = data_copy['especialidad']
            if esp_value == '' or esp_value == 'none' or esp_value is None:
                data_copy['especialidad'] = None
        
        return super().to_internal_value(data_copy)


class ProductoDisponibleSerializer(serializers.ModelSerializer):
    """Serializer para el modelo ProductoDisponible"""
    categoria_nombre = serializers.CharField(source='id_categoria.nombre', read_only=True)
    producto_ofertado_nombre = serializers.CharField(source='id_producto_ofertado.nombre', read_only=True)
    marca_nombre = serializers.CharField(source='id_marca.nombre', read_only=True)
    unidad_nombre = serializers.CharField(source='unidad_presentacion.nombre', read_only=True)
    procedencia_nombre = serializers.CharField(source='procedencia.nombre', read_only=True)
    
    class Meta:
        model = ProductoDisponible
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class ImagenProductoDisponibleSerializer(serializers.ModelSerializer):
    """Serializer para el modelo ImagenProductoDisponible"""
    imagen_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    webp_url = serializers.SerializerMethodField()
    original_url = serializers.SerializerMethodField()
    urls = serializers.SerializerMethodField()
    
    class Meta:
        model = ImagenProductoDisponible
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
    
    def get_imagen_url(self, obj):
        """Devuelve la URL completa de la imagen principal (webp o la original)"""
        request = self.context.get('request')
        # Usar las propiedades del modelo que ya incluyen /media/
        url = obj.webp_url or obj.thumbnail_url or obj.original_url or (obj.imagen.url if obj.imagen else None)
        if url and request:
            return request.build_absolute_uri(url)
        return url
    
    def get_thumbnail_url(self, obj):
        """Devuelve la URL de la miniatura"""
        if obj.imagen_thumbnail:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.thumbnail_url)
            return obj.thumbnail_url  # Usar la propiedad que agrega /media/
        return None
    
    def get_webp_url(self, obj):
        """Devuelve la URL de la versión WebP"""
        if obj.imagen_webp:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.webp_url)
            return obj.webp_url  # Usar la propiedad que agrega /media/
        return None
    
    def get_original_url(self, obj):
        """Devuelve la URL de la imagen original"""
        if obj.imagen_original:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.original_url)
            return obj.original_url  # Usar la propiedad que agrega /media/
        return None
    
    def get_urls(self, obj):
        """Devuelve un diccionario con las URLs de todas las versiones de la imagen"""
        version_urls = obj.get_version_urls()
        request = self.context.get('request')
        
        # Si tenemos un request, convertir las URLs relativas a absolutas
        if request:
            for key in ['original', 'thumbnail', 'webp', 'default']:
                if key in version_urls and version_urls[key]:
                    # Solo convertir si no es una URL absoluta
                    if not version_urls[key].startswith('http'):
                        version_urls[key] = request.build_absolute_uri(version_urls[key])
        
        return version_urls


class DocumentoProductoDisponibleSerializer(serializers.ModelSerializer):
    """Serializer para el modelo DocumentoProductoDisponible"""
    class Meta:
        model = DocumentoProductoDisponible
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class ProductsPriceSerializer(serializers.ModelSerializer):
    """Serializer para el modelo ProductsPrice"""
    producto_nombre = serializers.CharField(source='producto_disponible.nombre', read_only=True)
    
    class Meta:
        model = ProductsPrice
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class HistorialDeComprasSerializer(serializers.ModelSerializer):
    """Serializer para el modelo HistorialDeCompras"""
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    proveedor_nombre = serializers.CharField(source='proveedor.nombre', read_only=True)
    empresa_nombre = serializers.CharField(source='empresa.nombre', read_only=True)
    valor_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = HistorialDeCompras
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'valor_total')


class HistorialDeVentasSerializer(serializers.ModelSerializer):
    """Serializer para el modelo HistorialDeVentas"""
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    empresa_nombre = serializers.CharField(source='empresa.nombre', read_only=True)
    valor_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = HistorialDeVentas
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'valor_total')


# Serializers detallados para vistas específicas

class ProductoOfertadoDetalladoSerializer(serializers.ModelSerializer):
    """Serializer detallado para el modelo ProductoOfertado con relaciones anidadas"""
    categoria = CategoriaSerializer(source='id_categoria', read_only=True)
    imagenes = ImagenReferenciaProductoOfertadoSerializer(many=True, read_only=True)
    documentos = DocumentoProductoOfertadoSerializer(many=True, read_only=True)
    productos_disponibles_count = serializers.IntegerField(read_only=True)
    especialidad_data = serializers.SerializerMethodField()

    class Meta:
        model = ProductoOfertado
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

    def get_especialidad_data(self, obj):
        """Obtiene los datos de la especialidad de forma segura"""
        try:
            if obj.especialidad:
                return {
                    'id': obj.especialidad.id,
                    'nombre': obj.especialidad.nombre,
                    'code': obj.especialidad.code
                }
            return None
        except:
            return None


class ProductoDisponibleDetalladoSerializer(serializers.ModelSerializer):
    """Serializer detallado para el modelo ProductoDisponible con relaciones anidadas"""
    categoria = CategoriaSerializer(source='id_categoria', read_only=True)
    producto_ofertado = ProductoOfertadoSerializer(source='id_producto_ofertado', read_only=True)
    marca = MarcaSerializer(source='id_marca', read_only=True)
    unidad = UnidadSerializer(source='unidad_presentacion', read_only=True)
    procedencia = ProcedenciaSerializer(source='procedencia', read_only=True)
    imagenes = ImagenProductoDisponibleSerializer(many=True, read_only=True)
    documentos = DocumentoProductoDisponibleSerializer(many=True, read_only=True)
    precios = ProductsPriceSerializer(many=True, read_only=True)
    
    class Meta:
        model = ProductoDisponible
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class CompraDetalladaSerializer(serializers.ModelSerializer):
    """Serializer detallado para el modelo HistorialDeCompras con relaciones anidadas"""
    producto = ProductoDisponibleSerializer(read_only=True)
    proveedor = ProveedorSerializer(read_only=True)
    
    class Meta:
        model = HistorialDeCompras
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class VentaDetalladaSerializer(serializers.ModelSerializer):
    """Serializer detallado para el modelo HistorialDeVentas con relaciones anidadas"""
    producto = ProductoDisponibleSerializer(read_only=True)
    cliente = ClienteSerializer(read_only=True)
    
    class Meta:
        model = HistorialDeVentas
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')