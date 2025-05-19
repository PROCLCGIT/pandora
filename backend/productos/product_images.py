from django.db import models
from imagekit.models import ImageSpecField
from imagekit.processors import ResizeToFill, ResizeToFit, Transpose
from django.conf import settings
import os
from PIL import Image, ImageOps
from io import BytesIO
from django.core.files.base import ContentFile
import uuid
from .models import ProductoOfertado, ProductoDisponible

class ProductImage(models.Model):
    """
    Modelo mejorado para imágenes de productos con procesamiento automático.
    Genera automáticamente diferentes tamaños de imágenes optimizados.
    """
    # Relaciones con los modelos existentes (opcionales, solo uno debe estar presente)
    producto_ofertado = models.ForeignKey(
        ProductoOfertado,
        on_delete=models.CASCADE,
        related_name='imagenes_procesadas',
        verbose_name='Producto Ofertado',
        null=True,
        blank=True
    )
    producto_disponible = models.ForeignKey(
        ProductoDisponible,
        on_delete=models.CASCADE,
        related_name='imagenes_procesadas',
        verbose_name='Producto Disponible',
        null=True,
        blank=True
    )
    
    # Campos principales
    title = models.CharField(max_length=200, blank=True, verbose_name='Título')
    original = models.ImageField(upload_to='products/original/', verbose_name='Imagen Original')
    
    # Versiones procesadas automáticamente
    thumbnail = ImageSpecField(
        source='original',
        processors=[
            Transpose(),  # Corrige la orientación EXIF
            ResizeToFill(*settings.PRODUCT_IMAGE_SIZES['thumbnail'])
        ],
        format=settings.IMAGE_FORMAT,
        options={'quality': settings.IMAGE_QUALITY}
    )
    
    standard = ImageSpecField(
        source='original',
        processors=[
            Transpose(),
            ResizeToFit(*settings.PRODUCT_IMAGE_SIZES['standard'])
        ],
        format=settings.IMAGE_FORMAT,
        options={'quality': settings.IMAGE_QUALITY}
    )
    
    large = ImageSpecField(
        source='original',
        processors=[
            Transpose(),
            ResizeToFit(*settings.PRODUCT_IMAGE_SIZES['large'])
        ],
        format=settings.IMAGE_FORMAT,
        options={'quality': settings.IMAGE_QUALITY}
    )
    
    # Metadatos adicionales
    alt_text = models.CharField(max_length=255, blank=True, verbose_name='Texto alternativo')
    order = models.IntegerField(default=0, verbose_name='Orden')
    is_featured = models.BooleanField(default=False, verbose_name='Imagen destacada')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='product_images_created',
        verbose_name='Creado por'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')
    
    class Meta:
        verbose_name = 'Imagen de Producto'
        verbose_name_plural = 'Imágenes de Productos'
        ordering = ['order', 'created_at']
    
    def __str__(self):
        if self.producto_ofertado:
            return f"Imagen de {self.producto_ofertado.nombre} - {self.id}"
        elif self.producto_disponible:
            return f"Imagen de {self.producto_disponible.nombre} - {self.id}"
        return f"Imagen de producto - {self.id}"
    
    def save(self, *args, **kwargs):
        # Si es una imagen nueva, optimizarla antes de guardar
        if self.pk is None and self.original:
            self.optimize_original_image()
        
        # Si esta es la imagen destacada, quitar ese estado de otras imágenes
        if self.is_featured:
            if self.producto_ofertado:
                ProductImage.objects.filter(
                    producto_ofertado=self.producto_ofertado,
                    is_featured=True
                ).update(is_featured=False)
            elif self.producto_disponible:
                ProductImage.objects.filter(
                    producto_disponible=self.producto_disponible,
                    is_featured=True
                ).update(is_featured=False)
        
        super().save(*args, **kwargs)
    
    def optimize_original_image(self):
        img = Image.open(self.original)
        
        # Corregir orientación EXIF
        img = ImageOps.exif_transpose(img)
        
        # Convertir a RGB si es RGBA (para formatos que no soportan transparencia)
        if img.mode == 'RGBA' and settings.IMAGE_FORMAT in ['JPEG', 'WEBP']:
            canvas = Image.new('RGB', img.size, (255, 255, 255))
            canvas.paste(img, mask=img.split()[3])
            img = canvas
            
        # Generar nombre de archivo único
        filename = f"{uuid.uuid4()}.{settings.IMAGE_FORMAT.lower()}"
        
        # Guardar la imagen optimizada
        buffer = BytesIO()
        img.save(buffer, format=settings.IMAGE_FORMAT, quality=settings.IMAGE_QUALITY, optimize=True)
        
        # Reemplazar la imagen original
        self.original.save(
            filename,
            ContentFile(buffer.getvalue()),
            save=False
        )

# Añadir métodos a los modelos existentes para acceder a las imágenes procesadas
# Estos métodos permiten mantener compatibilidad con el código existente

def get_featured_image_for_producto_ofertado(self):
    """Retorna la imagen destacada o la primera imagen del producto ofertado"""
    featured = self.imagenes_procesadas.filter(is_featured=True).first()
    if featured:
        return featured
    return self.imagenes_procesadas.first()

def get_featured_image_for_producto_disponible(self):
    """Retorna la imagen destacada o la primera imagen del producto disponible"""
    featured = self.imagenes_procesadas.filter(is_featured=True).first()
    if featured:
        return featured
    return self.imagenes_procesadas.first()

# Añadir los métodos a los modelos existentes
ProductoOfertado.featured_image = property(get_featured_image_for_producto_ofertado)
ProductoDisponible.featured_image = property(get_featured_image_for_producto_disponible)
