#!/usr/bin/env python
"""
Script para procesar imágenes existentes que no tienen versiones thumbnail y webp.
"""
import os
import sys
import django
from django.core.files.base import ContentFile

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pandora.settings')
django.setup()

from productos.models import ImagenReferenciaProductoOfertado, ImagenProductoDisponible
from productos.image_processor import ImageProcessor
from django.conf import settings
import logging
from PIL import Image
import io

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def process_unprocessed_images():
    """Procesa imágenes que no tienen versiones thumbnail y webp."""
    processor = ImageProcessor()
    
    # Procesar imágenes de productos ofertados
    logger.info("Procesando imágenes de productos ofertados...")
    for imagen in ImagenReferenciaProductoOfertado.objects.all():
        if imagen.imagen and (not imagen.imagen_thumbnail or not imagen.imagen_webp):
            try:
                logger.info(f"Procesando imagen {imagen.id} del producto {imagen.producto_ofertado.code}")
                
                # Obtener la ruta base
                codigo = imagen.producto_ofertado.code
                base_path = f'productos/productosofertados/imagenes/{codigo}'
                full_base_path = os.path.join(settings.MEDIA_ROOT, base_path)
                
                # Crear directorios si no existen
                os.makedirs(os.path.join(full_base_path, 'originales'), exist_ok=True)
                os.makedirs(os.path.join(full_base_path, 'miniaturas'), exist_ok=True)
                os.makedirs(os.path.join(full_base_path, 'webp'), exist_ok=True)
                
                # Abrir el archivo actual
                imagen.imagen.open()
                
                # Procesar la imagen
                versions = processor.process_image(imagen.imagen, full_base_path)
                
                # Actualizar las rutas en la base de datos
                if 'original' in versions:
                    imagen.imagen_original = os.path.relpath(versions['original'], settings.MEDIA_ROOT)
                if 'thumbnail' in versions:
                    imagen.imagen_thumbnail = os.path.relpath(versions['thumbnail'], settings.MEDIA_ROOT)
                if 'webp' in versions:
                    imagen.imagen_webp = os.path.relpath(versions['webp'], settings.MEDIA_ROOT)
                
                # Obtener metadatos
                if versions.get('original'):
                    img = Image.open(versions['original'])
                    imagen.width = img.width
                    imagen.height = img.height
                    imagen.format = img.format
                    imagen.file_size = os.path.getsize(versions['original'])
                
                imagen.save(update_fields=['imagen_original', 'imagen_thumbnail', 'imagen_webp', 
                                          'width', 'height', 'format', 'file_size'])
                logger.info(f"Imagen {imagen.id} procesada exitosamente")
                
            except Exception as e:
                logger.error(f"Error procesando imagen {imagen.id}: {e}")
    
    # Procesar imágenes de productos disponibles
    logger.info("Procesando imágenes de productos disponibles...")
    for imagen in ImagenProductoDisponible.objects.all():
        if imagen.imagen and (not imagen.imagen_thumbnail or not imagen.imagen_webp):
            try:
                logger.info(f"Procesando imagen {imagen.id} del producto {imagen.producto_disponible.code}")
                
                # Obtener la ruta base
                codigo = imagen.producto_disponible.code
                base_path = f'productos/productosdisponibles/imagenes/{codigo}'
                full_base_path = os.path.join(settings.MEDIA_ROOT, base_path)
                
                # Crear directorios si no existen
                os.makedirs(os.path.join(full_base_path, 'originales'), exist_ok=True)
                os.makedirs(os.path.join(full_base_path, 'miniaturas'), exist_ok=True)
                os.makedirs(os.path.join(full_base_path, 'webp'), exist_ok=True)
                
                # Abrir el archivo actual
                imagen.imagen.open()
                
                # Procesar la imagen
                versions = processor.process_image(imagen.imagen, full_base_path)
                
                # Actualizar las rutas en la base de datos
                if 'original' in versions:
                    imagen.imagen_original = os.path.relpath(versions['original'], settings.MEDIA_ROOT)
                if 'thumbnail' in versions:
                    imagen.imagen_thumbnail = os.path.relpath(versions['thumbnail'], settings.MEDIA_ROOT)
                if 'webp' in versions:
                    imagen.imagen_webp = os.path.relpath(versions['webp'], settings.MEDIA_ROOT)
                
                # Obtener metadatos
                if versions.get('original'):
                    img = Image.open(versions['original'])
                    imagen.width = img.width
                    imagen.height = img.height
                    imagen.format = img.format
                    imagen.file_size = os.path.getsize(versions['original'])
                
                imagen.save(update_fields=['imagen_original', 'imagen_thumbnail', 'imagen_webp', 
                                          'width', 'height', 'format', 'file_size'])
                logger.info(f"Imagen {imagen.id} procesada exitosamente")
                
            except Exception as e:
                logger.error(f"Error procesando imagen {imagen.id}: {e}")

if __name__ == "__main__":
    process_unprocessed_images()
    print("Procesamiento de imágenes existentes completado.")