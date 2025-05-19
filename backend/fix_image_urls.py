#!/usr/bin/env python
"""
Script para actualizar las URLs de imágenes existentes en la base de datos
para que coincidan con la nueva estructura de carpetas.
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pandora.settings')
django.setup()

from productos.models import ImagenReferenciaProductoOfertado, ImagenProductoDisponible
from django.conf import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def update_image_paths():
    """Actualiza las rutas de imágenes en la base de datos."""
    
    # Procesar imágenes de productos ofertados
    logger.info("Actualizando imágenes de productos ofertados...")
    for imagen in ImagenReferenciaProductoOfertado.objects.all():
        if imagen.imagen:
            # Obtener el nombre del archivo y el código del producto
            filename = os.path.basename(imagen.imagen.name)
            codigo = imagen.producto_ofertado.code
            
            # Si ya tiene rutas establecidas, verificar que existan
            if imagen.imagen_original and imagen.imagen_thumbnail and imagen.imagen_webp:
                logger.info(f"Imagen {imagen.id} ya tiene rutas establecidas")
                continue
            
            # Buscar archivos en las carpetas correspondientes
            base_path = os.path.join(settings.MEDIA_ROOT, 'productos/productosofertados/imagenes', codigo)
            
            # Buscar en las carpetas de originales, miniaturas y webp
            original_path = os.path.join(base_path, 'originales')
            miniatura_path = os.path.join(base_path, 'miniaturas')
            webp_path = os.path.join(base_path, 'webp')
            
            updated = False
            
            # Buscar archivos que coincidan
            if os.path.exists(original_path):
                for file in os.listdir(original_path):
                    if file.startswith('original_'):
                        imagen.imagen_original = f'productos/productosofertados/imagenes/{codigo}/originales/{file}'
                        updated = True
                        break
            
            if os.path.exists(miniatura_path):
                for file in os.listdir(miniatura_path):
                    if file.startswith('miniatura_'):
                        imagen.imagen_thumbnail = f'productos/productosofertados/imagenes/{codigo}/miniaturas/{file}'
                        updated = True
                        break
            
            if os.path.exists(webp_path):
                for file in os.listdir(webp_path):
                    if file.startswith('webp_'):
                        imagen.imagen_webp = f'productos/productosofertados/imagenes/{codigo}/webp/{file}'
                        updated = True
                        break
            
            if updated:
                imagen.save(update_fields=['imagen_original', 'imagen_thumbnail', 'imagen_webp'])
                logger.info(f"Actualizada imagen {imagen.id} del producto {codigo}")
            else:
                logger.warning(f"No se encontraron archivos procesados para imagen {imagen.id}")
    
    # Procesar imágenes de productos disponibles
    logger.info("Actualizando imágenes de productos disponibles...")
    for imagen in ImagenProductoDisponible.objects.all():
        if imagen.imagen:
            # Similar proceso para productos disponibles
            filename = os.path.basename(imagen.imagen.name)
            codigo = imagen.producto_disponible.code
            
            if imagen.imagen_original and imagen.imagen_thumbnail and imagen.imagen_webp:
                logger.info(f"Imagen {imagen.id} ya tiene rutas establecidas")
                continue
            
            base_path = os.path.join(settings.MEDIA_ROOT, 'productos/productosdisponibles/imagenes', codigo)
            
            original_path = os.path.join(base_path, 'originales')
            miniatura_path = os.path.join(base_path, 'miniaturas')
            webp_path = os.path.join(base_path, 'webp')
            
            updated = False
            
            if os.path.exists(original_path):
                for file in os.listdir(original_path):
                    if file.startswith('original_'):
                        imagen.imagen_original = f'productos/productosdisponibles/imagenes/{codigo}/originales/{file}'
                        updated = True
                        break
            
            if os.path.exists(miniatura_path):
                for file in os.listdir(miniatura_path):
                    if file.startswith('miniatura_'):
                        imagen.imagen_thumbnail = f'productos/productosdisponibles/imagenes/{codigo}/miniaturas/{file}'
                        updated = True
                        break
            
            if os.path.exists(webp_path):
                for file in os.listdir(webp_path):
                    if file.startswith('webp_'):
                        imagen.imagen_webp = f'productos/productosdisponibles/imagenes/{codigo}/webp/{file}'
                        updated = True
                        break
            
            if updated:
                imagen.save(update_fields=['imagen_original', 'imagen_thumbnail', 'imagen_webp'])
                logger.info(f"Actualizada imagen {imagen.id} del producto {codigo}")
            else:
                logger.warning(f"No se encontraron archivos procesados para imagen {imagen.id}")

if __name__ == "__main__":
    update_image_paths()
    print("Actualización de rutas de imágenes completada.")