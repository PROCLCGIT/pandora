# Estructura de Almacenamiento de Archivos Multimedia

## Resumen

La estructura de almacenamiento organiza los archivos multimedia con procesamiento automático de imágenes para generar múltiples versiones optimizadas.

## Estructura de Directorios

```
media/
└── productos/
    ├── productosofertados/
    │   ├── imagenes/
    │   │   └── [CODIGO]/
    │   │       ├── originales/
    │   │       │   └── original_20240519_143022.jpg
    │   │       ├── miniaturas/
    │   │       │   └── miniatura_20240519_143022.jpg
    │   │       └── webp/
    │   │           └── webp_20240519_143022.webp
    │   └── documentos/
    │       └── [CODIGO]/
    │           ├── manual_20240519_143105.pdf
    │           └── catalogo_20240519_143120.pdf
    └── productosdisponibles/
        ├── imagenes/
        │   └── [CODIGO]/
        │       ├── originales/
        │       ├── miniaturas/
        │       └── webp/
        └── documentos/
            └── [CODIGO]/
```

## Procesamiento de Imágenes

Cuando se sube una imagen, el sistema automáticamente:

1. **Guarda la imagen original** en la carpeta `originales/`
2. **Crea una miniatura** (150x150px) en la carpeta `miniaturas/`
3. **Genera una versión WebP** optimizada (800x600px) en la carpeta `webp/`

### Configuración de Procesamiento

En `settings.py`:

```python
# Tamaños de imagen
PRODUCT_IMAGE_SIZES = {
    'thumbnail': (150, 150),    # Miniatura pequeña
    'webp': (800, 600),         # WebP optimizado para web
    'original': None,           # Mantener tamaño original
}

# Calidad para cada formato
IMAGE_QUALITY_SETTINGS = {
    'thumbnail': 75,
    'webp': 85,
    'original': 100,
}

# Configuraciones de procesamiento
IMAGE_PROCESSING_CONFIG = {
    'preserve_original': True,
    'create_thumbnail': True,
    'create_webp': True,
    'webp_quality': 85,
    'thumbnail_quality': 75,
    'original_folder': 'originales',
    'thumbnail_folder': 'miniaturas',
    'webp_folder': 'webp',
}
```

## Modelos Actualizados

Los modelos de imagen ahora incluyen campos para cada versión:

```python
class ImagenReferenciaProductoOfertado(models.Model):
    # ... campos existentes ...
    
    # Rutas de las versiones de imagen
    imagen_original = models.CharField(max_length=500, blank=True)
    imagen_thumbnail = models.CharField(max_length=500, blank=True)
    imagen_webp = models.CharField(max_length=500, blank=True)
    
    # Propiedades para acceder a las URLs
    @property
    def original_url(self):
        return self.imagen_original
    
    @property
    def thumbnail_url(self):
        return self.imagen_thumbnail
    
    @property
    def webp_url(self):
        return self.imagen_webp
```

## Uso

### Subir una Imagen

```python
from productos.file_handler import FileHandler

# Subir imagen con procesamiento automático
success, error, resultado = FileHandler.process_image(
    image_file=archivo,
    producto=producto_ofertado,
    metadata={'descripcion': 'Vista frontal'},
    user=request.user
)

# El resultado incluye las rutas de todas las versiones:
# resultado['versions'] = {
#     'original': 'productos/productosofertados/imagenes/PRD001/originales/original_timestamp.jpg',
#     'thumbnail': 'productos/productosofertados/imagenes/PRD001/miniaturas/miniatura_timestamp.jpg',
#     'webp': 'productos/productosofertados/imagenes/PRD001/webp/webp_timestamp.webp'
# }
```

### Acceder a las Versiones

```python
# En el modelo
imagen = ImagenReferenciaProductoOfertado.objects.get(pk=1)

# URLs de las diferentes versiones
original_url = imagen.original_url
thumbnail_url = imagen.thumbnail_url
webp_url = imagen.webp_url

# Diccionario con todas las URLs
urls = imagen.get_version_urls()
```

## Ventajas del Sistema

1. **Optimización Automática**: Las imágenes se optimizan automáticamente
2. **Múltiples Formatos**: WebP para navegadores modernos, JPEG para compatibilidad
3. **Miniaturas Rápidas**: Carga rápida en listados y galerías
4. **Original Preservado**: Siempre se mantiene la imagen original
5. **Estructura Organizada**: Cada versión en su propia carpeta

## Notas Importantes

- Todas las versiones se crean automáticamente al subir una imagen
- El formato WebP ofrece mejor compresión que JPEG con calidad similar
- Las miniaturas usan menor calidad (75%) para optimizar tamaño
- La imagen original se preserva al 100% de calidad
- Los timestamps garantizan nombres únicos