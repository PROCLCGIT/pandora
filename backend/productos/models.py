# backend/productos/models.py

from django.db import models
from django.conf import settings
from django.utils import timezone
import logging
import os
from datetime import datetime
from PIL import Image

logger = logging.getLogger(__name__)

# Funciones upload_to personalizadas
def upload_imagen_producto_ofertado(instance, filename):
    """
    Función personalizada para definir la ruta de subida de imágenes de productos ofertados.
    La imagen se procesará para crear múltiples versiones.
    """
    # Solo almacenar temporalmente, el save() del modelo manejará el procesamiento
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
    return f'temp/uploads/{timestamp}_{filename}'

def upload_documento_producto_ofertado(instance, filename):
    """
    Función personalizada para definir la ruta de subida de documentos de productos ofertados.
    Formato: productos/productosofertados/documentos/{codigo}/{tipo_documento}_{timestamp}.{ext}
    """
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
    codigo = instance.producto_ofertado.code
    tipo_doc = instance.tipo_documento.replace(' ', '_').replace('/', '-')
    ext = filename.split('.')[-1]
    
    # Usar solo el código como nombre de carpeta
    carpeta = codigo
    nuevo_nombre = f"{tipo_doc}_{timestamp}.{ext}"
    
    return f'productos/productosofertados/documentos/{carpeta}/{nuevo_nombre}'

def upload_imagen_producto_disponible(instance, filename):
    """
    Función personalizada para definir la ruta de subida de imágenes de productos disponibles.
    La imagen se procesará para crear múltiples versiones.
    """
    # Solo almacenar temporalmente, el save() del modelo manejará el procesamiento
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
    return f'temp/uploads/{timestamp}_{filename}'

def upload_documento_producto_disponible(instance, filename):
    """
    Función personalizada para definir la ruta de subida de documentos de productos disponibles.
    Formato: productos/productosdisponibles/documentos/{codigo}/{tipo_documento}_{timestamp}.{ext}
    """
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
    codigo = instance.producto_disponible.code
    tipo_doc = instance.tipo_documento.replace(' ', '_').replace('/', '-')
    ext = filename.split('.')[-1]
    
    # Usar solo el código como nombre de carpeta
    carpeta = codigo
    nuevo_nombre = f"{tipo_doc}_{timestamp}.{ext}"
    
    return f'productos/productosdisponibles/documentos/{carpeta}/{nuevo_nombre}'

class ProductoOfertado(models.Model):
    """
    Modelo para productos ofertados por la empresa.
    Representa el catálogo de productos que la empresa ofrece a sus clientes.
    """
    id_categoria = models.ForeignKey(
        'basic.Categoria',
        on_delete=models.CASCADE,
        related_name='productos_ofertados',
        verbose_name='Categoría'
    )
    code = models.CharField(max_length=100, unique=True, verbose_name='Código')
    cudim = models.CharField(max_length=100, unique=True, verbose_name='CUDIM')
    nombre = models.CharField(max_length=255, verbose_name='Nombre')
    descripcion = models.TextField(blank=True, verbose_name='Descripción')
    # Campo especialidad para integración con Especialidad
    especialidad = models.ForeignKey(
        'basic.Especialidad',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='productos_ofertados',
        verbose_name='Especialidad'
    )
    # Campo de compatibilidad para mantener el texto original de especialidad
    # Esto es necesario debido a la migración from CharField to ForeignKey
    especialidad_texto = models.CharField(
        max_length=255,
        blank=True,
        default='',  # Valor por defecto para evitar errores al crear nuevos registros
        verbose_name='Texto de Especialidad'
    )

    def save(self, *args, **kwargs):
        # Sincronizar especialidad_texto con especialidad.nombre si está disponible
        if self.especialidad and not self.especialidad_texto:
            self.especialidad_texto = self.especialidad.nombre
        super().save(*args, **kwargs)
    referencias = models.TextField(blank=True, verbose_name='Referencias')
    is_active = models.BooleanField(default=True, verbose_name='Activo')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='productos_ofertados_creados',
        verbose_name='Creado por'
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='productos_ofertados_actualizados',
        verbose_name='Actualizado por'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')

    class Meta:
        verbose_name = 'Producto Ofertado'
        verbose_name_plural = 'Productos Ofertados'
        ordering = ['nombre']

    def __str__(self):
        return f"{self.code} - {self.nombre}"

class ImagenReferenciaProductoOfertado(models.Model):
    """
    Modelo para imágenes de referencia asociadas a productos ofertados.
    Permite asociar múltiples imágenes a un producto con orden y una imagen principal.
    """
    producto_ofertado = models.ForeignKey(
        ProductoOfertado, 
        on_delete=models.CASCADE, 
        related_name='imagenes',
        verbose_name='Producto Ofertado'
    )
    imagen = models.FileField(upload_to=upload_imagen_producto_ofertado, verbose_name='Imagen', null=True, blank=True)
    descripcion = models.CharField(max_length=255, blank=True, verbose_name='Descripción')
    orden = models.IntegerField(default=0, verbose_name='Orden')
    is_primary = models.BooleanField(default=False, verbose_name='Imagen principal')
    # Nuevos campos para mejor gestión
    titulo = models.CharField(max_length=255, blank=True, verbose_name='Título')
    alt_text = models.CharField(max_length=255, blank=True, verbose_name='Texto alternativo')
    tags = models.CharField(max_length=500, blank=True, verbose_name='Etiquetas')
    # Campos de metadatos
    file_size = models.PositiveIntegerField(null=True, blank=True, verbose_name='Tamaño (bytes)')
    width = models.PositiveIntegerField(null=True, blank=True, verbose_name='Ancho')
    height = models.PositiveIntegerField(null=True, blank=True, verbose_name='Alto')
    format = models.CharField(max_length=10, blank=True, verbose_name='Formato')
    # Tracking
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='imagenes_producto_ofertado_creadas',
        verbose_name='Creado por'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')
    # Campos adicionales para las versiones de imagen
    imagen_original = models.CharField(max_length=500, blank=True, verbose_name='Ruta imagen original')
    imagen_thumbnail = models.CharField(max_length=500, blank=True, verbose_name='Ruta miniatura')
    imagen_webp = models.CharField(max_length=500, blank=True, verbose_name='Ruta WebP')

    class Meta:
        verbose_name = 'Imagen de Referencia'
        verbose_name_plural = 'Imágenes de Referencia'
        ordering = ['orden']

    def __str__(self):
        return f"Imagen {self.orden} de {self.producto_ofertado}"
    
    @property
    def original_url(self):
        """Retorna la URL de la imagen original"""
        if self.imagen_original:
            return f"{settings.MEDIA_URL}{self.imagen_original}"
        return None
    
    @property
    def thumbnail_url(self):
        """Retorna la URL de la miniatura"""
        if self.imagen_thumbnail:
            return f"{settings.MEDIA_URL}{self.imagen_thumbnail}"
        return None
    
    @property
    def webp_url(self):
        """Retorna la URL de la versión WebP"""
        if self.imagen_webp:
            return f"{settings.MEDIA_URL}{self.imagen_webp}"
        return None
    
    @property
    def get_absolute_url(self):
        """Retorna la URL principal de la imagen (WebP preferida)"""
        if self.webp_url:
            return self.webp_url
        elif self.thumbnail_url:
            return self.thumbnail_url
        elif self.original_url:
            return self.original_url
        elif self.imagen:
            return self.imagen.url
        return None
    
    def save(self, *args, **kwargs):
        # Si es una imagen nueva y no ha sido procesada
        if self.imagen and hasattr(self.imagen, 'file') and not self.pk:
            from productos.image_processor import ImageProcessor
            from django.core.files.storage import default_storage
            import os
            import re
            
            processor = ImageProcessor()
            
            # Obtener la ruta base para las imágenes
            codigo = self.producto_ofertado.code
            base_path = f'productos/productosofertados/imagenes/{codigo}'
            media_root = settings.MEDIA_ROOT
            full_base_path = os.path.join(media_root, base_path)
            
            try:
                # Procesar la imagen y obtener las rutas de las versiones
                versions = processor.process_image(self.imagen, full_base_path)
                
                # Extraer el timestamp de la ruta de la imagen para asegurar consistencia
                # El formato es: webp_YYYYMMDD_HHMMSS_microseconds.webp o similar
                timestamp = None
                if 'webp' in versions:
                    webp_filename = os.path.basename(versions['webp'])
                    match = re.search(r'webp_(\d{8}_\d{6}_\d+)', webp_filename)
                    if match:
                        timestamp = match.group(1)
                    else:
                        # Intentar extraer timestamp sin microsegundos como fallback
                        match = re.search(r'webp_(\d{8}_\d{6})', webp_filename)
                        if match:
                            timestamp = match.group(1)
                
                # Guardar las rutas relativas
                if 'original' in versions:
                    self.imagen_original = os.path.relpath(versions['original'], media_root)
                if 'thumbnail' in versions:
                    self.imagen_thumbnail = os.path.relpath(versions['thumbnail'], media_root)
                if 'webp' in versions:
                    self.imagen_webp = os.path.relpath(versions['webp'], media_root)
                
                # Ya procesamos la imagen, pero debemos establecer el campo imagen
                # para que las relaciones funcionen correctamente en el frontend
                # IMPORTANTE: El campo `imagen` debe tener siempre un valor
                # Usamos preferiblemente la versión WebP como la imagen principal
                if 'webp' in versions and self.imagen_webp:
                    self.imagen = self.imagen_webp  # Asignar la ruta webp al campo imagen
                elif 'thumbnail' in versions and self.imagen_thumbnail:
                    self.imagen = self.imagen_thumbnail  # O la miniatura si no hay webp
                elif 'original' in versions and self.imagen_original:
                    self.imagen = self.imagen_original  # O el original como último recurso
                
                # Asegurarnos de que imagen se guarde correctamente
                if not self.imagen and (self.imagen_webp or self.imagen_thumbnail or self.imagen_original):
                    if self.imagen_webp:
                        self.imagen = self.imagen_webp
                    elif self.imagen_thumbnail:
                        self.imagen = self.imagen_thumbnail
                    elif self.imagen_original:
                        self.imagen = self.imagen_original
                
                # Obtener metadatos de la imagen original
                if versions.get('original'):
                    img = Image.open(versions['original'])
                    self.width = img.width
                    self.height = img.height
                    self.format = img.format
                    self.file_size = os.path.getsize(versions['original'])
                
            except Exception as e:
                logger.error(f"Error al procesar imagen: {e}")
                raise
        
        # Establecer título y alt_text si no existen
        if not self.titulo:
            self.titulo = f"Imagen {self.orden + 1} - {self.producto_ofertado.nombre}"
        if not self.alt_text:
            self.alt_text = f"{self.producto_ofertado.nombre} - {self.descripcion or 'Imagen del producto'}"
        
        # Si es la imagen principal, quitar ese estado de otras imágenes
        if self.is_primary and self.pk is None:
            ImagenReferenciaProductoOfertado.objects.filter(
                producto_ofertado=self.producto_ofertado,
                is_primary=True
            ).update(is_primary=False)
        
        super().save(*args, **kwargs)
    
    def extract_timestamp(self):
        """Extrae el timestamp de la imagen para uso en búsqueda de versiones"""
        import re
        # Primero intentamos extraer el timestamp con microsegundos
        if self.imagen_webp:
            match = re.search(r'webp_(\d{8}_\d{6}_\d+)', self.imagen_webp)
            if match:
                return match.group(1)
            # Si no hay microsegundos, intentamos con solo fecha y hora
            match = re.search(r'webp_(\d{8}_\d{6})', self.imagen_webp)
            if match:
                return match.group(1)
        elif self.imagen_thumbnail:
            match = re.search(r'miniatura_(\d{8}_\d{6}_\d+)', self.imagen_thumbnail)
            if match:
                return match.group(1)
            # Si no hay microsegundos, intentamos con solo fecha y hora
            match = re.search(r'miniatura_(\d{8}_\d{6})', self.imagen_thumbnail)
            if match:
                return match.group(1)
        elif self.imagen_original:
            match = re.search(r'original_(\d{8}_\d{6}_\d+)', self.imagen_original)
            if match:
                return match.group(1)
            # Si no hay microsegundos, intentamos con solo fecha y hora
            match = re.search(r'original_(\d{8}_\d{6})', self.imagen_original)
            if match:
                return match.group(1)
        # Logging para depuración
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"No se pudo extraer timestamp para imagen ID {self.id}, rutas: webp={self.imagen_webp}, thumbnail={self.imagen_thumbnail}, original={self.imagen_original}")
        return None
        
    def get_version_urls(self):
        """Retorna un diccionario con todas las URLs disponibles"""
        # Extraer timestamp para obtener versiones específicas
        timestamp = self.extract_timestamp()
        
        # Si tenemos un timestamp, usar ImageProcessor para obtener versiones específicas
        if timestamp and any([self.imagen_original, self.imagen_thumbnail, self.imagen_webp]):
            from productos.image_processor import ImageProcessor
            from django.conf import settings
            import os
            
            # Obtener la ruta base
            codigo = self.producto_ofertado.code
            base_path = f'productos/productosofertados/imagenes/{codigo}'
                
            media_root = settings.MEDIA_ROOT
            full_base_path = os.path.join(media_root, base_path)
            
            # Obtener versiones específicas para esta imagen usando el timestamp
            versions = ImageProcessor.get_image_versions(full_base_path, timestamp)
            
            # Generar URLs para cada versión
            urls = {'timestamp': timestamp}
            
            # Convertir rutas de sistema a URLs relativas a MEDIA_URL
            if 'original' in versions:
                urls['original'] = f"{settings.MEDIA_URL}{os.path.relpath(versions['original'], media_root)}"
            else:
                urls['original'] = self.original_url
                
            if 'thumbnail' in versions:
                urls['thumbnail'] = f"{settings.MEDIA_URL}{os.path.relpath(versions['thumbnail'], media_root)}"
            else:
                urls['thumbnail'] = self.thumbnail_url
                
            if 'webp' in versions:
                urls['webp'] = f"{settings.MEDIA_URL}{os.path.relpath(versions['webp'], media_root)}"
            else:
                urls['webp'] = self.webp_url
                
            # URL por defecto, priorizando webp
            urls['default'] = urls['webp'] or urls['thumbnail'] or urls['original'] or self.get_absolute_url
            
            return urls
        
        # Fallback al comportamiento anterior
        return {
            'original': self.original_url,
            'thumbnail': self.thumbnail_url,
            'webp': self.webp_url,
            'default': self.get_absolute_url,
            'timestamp': timestamp
        }

class DocumentoProductoOfertado(models.Model):
    """
    Modelo para documentos asociados a productos ofertados.
    Permite asociar múltiples documentos a un producto con visibilidad pública o privada.
    """
    producto_ofertado = models.ForeignKey(
        ProductoOfertado, 
        on_delete=models.CASCADE, 
        related_name='documentos',
        verbose_name='Producto Ofertado'
    )
    documento = models.FileField(upload_to=upload_documento_producto_ofertado, verbose_name='Documento')
    tipo_documento = models.CharField(max_length=100, verbose_name='Tipo de documento')
    titulo = models.CharField(max_length=255, verbose_name='Título')
    descripcion = models.TextField(blank=True, verbose_name='Descripción')
    is_public = models.BooleanField(default=False, verbose_name='Público')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='documentos_producto_ofertado_creados',
        verbose_name='Creado por'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')

    class Meta:
        verbose_name = 'Documento de Producto Ofertado'
        verbose_name_plural = 'Documentos de Productos Ofertados'
        ordering = ['titulo']

    def __str__(self):
        return f"{self.titulo} ({self.tipo_documento})"

class ProductoDisponible(models.Model):
    """
    Modelo para productos disponibles para la venta.
    Representa los productos específicos que la empresa tiene disponibles en inventario,
    con detalles como marca, modelo, precios y características.
    """
    id_categoria = models.ForeignKey(
        'basic.Categoria', 
        on_delete=models.CASCADE, 
        related_name='productos_disponibles',
        verbose_name='Categoría'
    )
    id_producto_ofertado = models.ForeignKey(
        ProductoOfertado, 
        on_delete=models.CASCADE, 
        related_name='productos_disponibles',
        verbose_name='Producto Ofertado',
        null=True,
        blank=True
    )
    code = models.CharField(max_length=100, unique=True, verbose_name='Código')
    nombre = models.CharField(max_length=255, verbose_name='Nombre')
    id_marca = models.ForeignKey(
        'basic.Marca', 
        on_delete=models.CASCADE, 
        related_name='productos',
        verbose_name='Marca',
        null=True,
        blank=True
    )
    modelo = models.CharField(max_length=255, verbose_name='Modelo')
    unidad_presentacion = models.ForeignKey(
        'basic.Unidad', 
        on_delete=models.CASCADE, 
        related_name='productos',
        verbose_name='Unidad de Presentación',
        null=True,
        blank=True
    )
    procedencia = models.ForeignKey(
        'basic.Procedencia', 
        on_delete=models.CASCADE, 
        related_name='productos',
        verbose_name='Procedencia',
        null=True,
        blank=True
    )
    referencia = models.CharField(max_length=255, blank=True, verbose_name='Referencia')
    id_especialidad = models.ForeignKey(
        'basic.Especialidad',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='productos_disponibles',
        verbose_name='Especialidad'
    )
    tz_oferta = models.IntegerField(default=0, verbose_name='TZ Oferta')
    tz_demanda = models.IntegerField(default=0, verbose_name='TZ Demanda')
    tz_inflacion = models.IntegerField(default=0, verbose_name='TZ Inflación')
    tz_calidad = models.IntegerField(default=0, verbose_name='TZ Calidad')
    tz_eficiencia = models.IntegerField(default=0, verbose_name='TZ Eficiencia')
    tz_referencial = models.IntegerField(default=0, verbose_name='TZ Referencial')
    costo_referencial = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0,
        verbose_name='Costo Referencial'
    )
    precio_sie_referencial = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0,
        verbose_name='Precio SIE Referencial'
    )
    precio_sie_tipob = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0,
        verbose_name='Precio SIE Tipo B'
    )
    precio_venta_privado = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0,
        verbose_name='Precio Venta Privado'
    )
    is_active = models.BooleanField(default=True, verbose_name='Activo')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='productos_disponibles_creados',
        verbose_name='Creado por'
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='productos_disponibles_actualizados',
        verbose_name='Actualizado por'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')

    class Meta:
        verbose_name = 'Producto Disponible'
        verbose_name_plural = 'Productos Disponibles'
        ordering = ['nombre']

    def __str__(self):
        marca_nombre = self.id_marca.nombre if self.id_marca else "Sin marca"
        return f"{self.code} - {self.nombre} ({marca_nombre})"

class ImagenProductoDisponible(models.Model):
    """
    Modelo para imágenes asociadas a productos disponibles.
    Permite asociar múltiples imágenes a un producto con orden y una imagen principal.
    """
    producto_disponible = models.ForeignKey(
        ProductoDisponible, 
        on_delete=models.CASCADE, 
        related_name='imagenes',
        verbose_name='Producto Disponible'
    )
    imagen = models.FileField(upload_to=upload_imagen_producto_disponible, verbose_name='Imagen')
    descripcion = models.CharField(max_length=255, blank=True, verbose_name='Descripción')
    orden = models.IntegerField(default=0, verbose_name='Orden')
    is_primary = models.BooleanField(default=False, verbose_name='Imagen principal')
    # Nuevos campos para mejor gestión
    titulo = models.CharField(max_length=255, blank=True, verbose_name='Título')
    alt_text = models.CharField(max_length=255, blank=True, verbose_name='Texto alternativo')
    tags = models.CharField(max_length=500, blank=True, verbose_name='Etiquetas')
    # Campos de metadatos
    file_size = models.PositiveIntegerField(null=True, blank=True, verbose_name='Tamaño (bytes)')
    width = models.PositiveIntegerField(null=True, blank=True, verbose_name='Ancho')
    height = models.PositiveIntegerField(null=True, blank=True, verbose_name='Alto')
    format = models.CharField(max_length=10, blank=True, verbose_name='Formato')
    # Tracking
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='imagenes_producto_disponible_creadas',
        verbose_name='Creado por'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')
    # Campos adicionales para las versiones de imagen
    imagen_original = models.CharField(max_length=500, blank=True, verbose_name='Ruta imagen original')
    imagen_thumbnail = models.CharField(max_length=500, blank=True, verbose_name='Ruta miniatura')
    imagen_webp = models.CharField(max_length=500, blank=True, verbose_name='Ruta WebP')

    class Meta:
        verbose_name = 'Imagen de Producto Disponible'
        verbose_name_plural = 'Imágenes de Productos Disponibles'
        ordering = ['orden']

    def __str__(self):
        return f"Imagen {self.orden} de {self.producto_disponible}"
    
    @property
    def original_url(self):
        """Retorna la URL de la imagen original"""
        if self.imagen_original:
            return f"{settings.MEDIA_URL}{self.imagen_original}"
        return None
    
    @property
    def thumbnail_url(self):
        """Retorna la URL de la miniatura"""
        if self.imagen_thumbnail:
            return f"{settings.MEDIA_URL}{self.imagen_thumbnail}"
        return None
    
    @property
    def webp_url(self):
        """Retorna la URL de la versión WebP"""
        if self.imagen_webp:
            return f"{settings.MEDIA_URL}{self.imagen_webp}"
        return None
    
    @property
    def get_absolute_url(self):
        """Retorna la URL principal de la imagen (WebP preferida)"""
        if self.webp_url:
            return self.webp_url
        elif self.thumbnail_url:
            return self.thumbnail_url
        elif self.original_url:
            return self.original_url
        elif self.imagen:
            return self.imagen.url
        return None
    
    def save(self, *args, **kwargs):
        # Si es una imagen nueva y no ha sido procesada
        if self.imagen and not self.pk:
            from productos.image_processor import ImageProcessor
            from django.core.files.storage import default_storage
            import os
            
            processor = ImageProcessor()
            
            # Obtener la ruta base para las imágenes
            codigo = self.producto_disponible.code
            base_path = f'productos/productosdisponibles/imagenes/{codigo}'
            media_root = settings.MEDIA_ROOT
            full_base_path = os.path.join(media_root, base_path)
            
            try:
                # Procesar la imagen y obtener las rutas de las versiones
                versions = processor.process_image(self.imagen, full_base_path)
                
                # Guardar las rutas relativas
                if 'original' in versions:
                    self.imagen_original = os.path.relpath(versions['original'], media_root)
                if 'thumbnail' in versions:
                    self.imagen_thumbnail = os.path.relpath(versions['thumbnail'], media_root)
                if 'webp' in versions:
                    self.imagen_webp = os.path.relpath(versions['webp'], media_root)
                    # Usar la versión WebP como imagen principal
                    self.imagen = self.imagen_webp
                
                # Obtener metadatos de la imagen original
                if versions.get('original'):
                    img = Image.open(versions['original'])
                    self.width = img.width
                    self.height = img.height
                    self.format = img.format
                    self.file_size = os.path.getsize(versions['original'])
                
            except Exception as e:
                logger.error(f"Error al procesar imagen: {e}")
                raise
        
        # Establecer título y alt_text si no existen
        if not self.titulo:
            self.titulo = f"Imagen {self.orden + 1} - {self.producto_disponible.nombre}"
        if not self.alt_text:
            self.alt_text = f"{self.producto_disponible.nombre} - {self.descripcion or 'Imagen del producto'}"
        
        # Si es la imagen principal, quitar ese estado de otras imágenes
        if self.is_primary and self.pk is None:
            ImagenProductoDisponible.objects.filter(
                producto_disponible=self.producto_disponible,
                is_primary=True
            ).update(is_primary=False)
        
        super().save(*args, **kwargs)
    
    def extract_timestamp(self):
        """Extrae el timestamp de la imagen para uso en búsqueda de versiones"""
        import re
        # Primero intentamos extraer el timestamp con microsegundos
        if self.imagen_webp:
            match = re.search(r'webp_(\d{8}_\d{6}_\d+)', self.imagen_webp)
            if match:
                return match.group(1)
            # Si no hay microsegundos, intentamos con solo fecha y hora
            match = re.search(r'webp_(\d{8}_\d{6})', self.imagen_webp)
            if match:
                return match.group(1)
        elif self.imagen_thumbnail:
            match = re.search(r'miniatura_(\d{8}_\d{6}_\d+)', self.imagen_thumbnail)
            if match:
                return match.group(1)
            # Si no hay microsegundos, intentamos con solo fecha y hora
            match = re.search(r'miniatura_(\d{8}_\d{6})', self.imagen_thumbnail)
            if match:
                return match.group(1)
        elif self.imagen_original:
            match = re.search(r'original_(\d{8}_\d{6}_\d+)', self.imagen_original)
            if match:
                return match.group(1)
            # Si no hay microsegundos, intentamos con solo fecha y hora
            match = re.search(r'original_(\d{8}_\d{6})', self.imagen_original)
            if match:
                return match.group(1)
        # Logging para depuración
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"No se pudo extraer timestamp para imagen ID {self.id}, rutas: webp={self.imagen_webp}, thumbnail={self.imagen_thumbnail}, original={self.imagen_original}")
        return None
        
    def get_version_urls(self):
        """Retorna un diccionario con todas las URLs disponibles"""
        # Extraer timestamp para obtener versiones específicas
        timestamp = self.extract_timestamp()
        
        # Si tenemos un timestamp, usar ImageProcessor para obtener versiones específicas
        if timestamp and any([self.imagen_original, self.imagen_thumbnail, self.imagen_webp]):
            from productos.image_processor import ImageProcessor
            from django.conf import settings
            import os
            
            # Obtener la ruta base
            codigo = self.producto_disponible.code
            base_path = f'productos/productosdisponibles/imagenes/{codigo}'
                
            media_root = settings.MEDIA_ROOT
            full_base_path = os.path.join(media_root, base_path)
            
            # Obtener versiones específicas para esta imagen usando el timestamp
            versions = ImageProcessor.get_image_versions(full_base_path, timestamp)
            
            # Generar URLs para cada versión
            urls = {'timestamp': timestamp}
            
            # Convertir rutas de sistema a URLs relativas a MEDIA_URL
            if 'original' in versions:
                urls['original'] = f"{settings.MEDIA_URL}{os.path.relpath(versions['original'], media_root)}"
            else:
                urls['original'] = self.original_url
                
            if 'thumbnail' in versions:
                urls['thumbnail'] = f"{settings.MEDIA_URL}{os.path.relpath(versions['thumbnail'], media_root)}"
            else:
                urls['thumbnail'] = self.thumbnail_url
                
            if 'webp' in versions:
                urls['webp'] = f"{settings.MEDIA_URL}{os.path.relpath(versions['webp'], media_root)}"
            else:
                urls['webp'] = self.webp_url
                
            # URL por defecto, priorizando webp
            urls['default'] = urls['webp'] or urls['thumbnail'] or urls['original'] or self.get_absolute_url
            
            return urls
        
        # Fallback al comportamiento anterior
        return {
            'original': self.original_url,
            'thumbnail': self.thumbnail_url,
            'webp': self.webp_url,
            'default': self.get_absolute_url,
            'timestamp': timestamp
        }

class DocumentoProductoDisponible(models.Model):
    """
    Modelo para documentos asociados a productos disponibles.
    Permite asociar múltiples documentos a un producto con visibilidad pública o privada.
    """
    producto_disponible = models.ForeignKey(
        ProductoDisponible, 
        on_delete=models.CASCADE, 
        related_name='documentos',
        verbose_name='Producto Disponible'
    )
    documento = models.FileField(upload_to=upload_documento_producto_disponible, verbose_name='Documento')
    tipo_documento = models.CharField(max_length=100, verbose_name='Tipo de documento')
    titulo = models.CharField(max_length=255, verbose_name='Título')
    descripcion = models.TextField(blank=True, verbose_name='Descripción')
    is_public = models.BooleanField(default=False, verbose_name='Público')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='documentos_producto_disponible_creados',
        verbose_name='Creado por'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')

    class Meta:
        verbose_name = 'Documento de Producto Disponible'
        verbose_name_plural = 'Documentos de Productos Disponibles'
        ordering = ['titulo']

    def __str__(self):
        return f"{self.titulo} ({self.tipo_documento})"

class ProductsPrice(models.Model):
    """
    Modelo para el historial de precios de productos disponibles.
    Permite registrar los cambios de precios a lo largo del tiempo.
    """
    producto_disponible = models.ForeignKey(
        ProductoDisponible, 
        on_delete=models.CASCADE, 
        related_name='precios',
        verbose_name='Producto Disponible'
    )
    valor = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='Valor')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')

    class Meta:
        verbose_name = 'Precio de Producto'
        verbose_name_plural = 'Precios de Productos'
        ordering = ['-created_at']

    def __str__(self):
        return f"Precio de {self.producto_disponible} - {self.valor}"

class HistorialDeCompras(models.Model):
    """
    Modelo para el registro de compras de productos.
    Permite llevar un control de las compras realizadas a proveedores.
    """
    producto = models.ForeignKey(
        ProductoDisponible, 
        on_delete=models.CASCADE, 
        related_name='compras',
        verbose_name='Producto'
    )
    proveedor = models.ForeignKey(
        'directorio.Proveedor', 
        on_delete=models.CASCADE, 
        related_name='ventas',
        verbose_name='Proveedor'
    )
    empresa = models.ForeignKey(
        'basic.EmpresaClc',
        on_delete=models.CASCADE, 
        related_name='compras',
        verbose_name='Empresa'
    )
    fecha = models.DateField(verbose_name='Fecha')
    factura = models.CharField(max_length=100, unique=True, verbose_name='Número de Factura')
    valor = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='Valor')
    iva = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='IVA')
    cantidad = models.IntegerField(verbose_name='Cantidad')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de registro')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')

    class Meta:
        verbose_name = 'Historial de Compra'
        verbose_name_plural = 'Historial de Compras'
        ordering = ['-fecha']

    def __str__(self):
        return f"Compra a {self.proveedor} - Factura: {self.factura}"

    @property
    def valor_total(self):
        """Calcula el valor total de la compra incluyendo IVA"""
        return self.valor + self.iva

class HistorialDeVentas(models.Model):
    """
    Modelo para el registro de ventas de productos.
    Permite llevar un control de las ventas realizadas a clientes.
    """
    producto = models.ForeignKey(
        ProductoDisponible, 
        on_delete=models.CASCADE, 
        related_name='ventas',
        verbose_name='Producto'
    )
    cliente = models.ForeignKey(
        'directorio.Cliente', 
        on_delete=models.CASCADE, 
        related_name='compras',
        verbose_name='Cliente'
    )
    empresa = models.ForeignKey(
        'basic.EmpresaClc',
        on_delete=models.CASCADE, 
        related_name='ventas',
        verbose_name='Empresa'
    )
    fecha = models.DateField(verbose_name='Fecha')
    factura = models.CharField(max_length=100, unique=True, verbose_name='Número de Factura')
    valor = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='Valor')
    iva = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='IVA')
    cantidad = models.IntegerField(verbose_name='Cantidad')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de registro')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')

    class Meta:
        verbose_name = 'Historial de Venta'
        verbose_name_plural = 'Historial de Ventas'
        ordering = ['-fecha']

    def __str__(self):
        return f"Venta a {self.cliente} - Factura: {self.factura}"

    @property
    def valor_total(self):
        """Calcula el valor total de la venta incluyendo IVA"""
        return self.valor + self.iva