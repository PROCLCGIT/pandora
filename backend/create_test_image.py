#!/usr/bin/env python
"""
Script para crear una imagen de prueba para un producto.
"""
import os
import sys
import django
from django.core.files.base import ContentFile

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pandora.settings')
django.setup()

from productos.models import ProductoOfertado, ImagenReferenciaProductoOfertado
from users.models import User
from django.conf import settings
import shutil

# Obtener el primer producto
producto = ProductoOfertado.objects.first()
if not producto:
    print("No hay productos en la base de datos")
    exit(1)

print(f"Producto encontrado: {producto.nombre} (ID: {producto.id}, Código: {producto.code})")

# Obtener archivos existentes en el directorio
media_path = os.path.join(settings.MEDIA_ROOT, 'productos/productosofertados/imagenes', producto.code)
if os.path.exists(media_path):
    # Buscar archivos de imagen existentes
    for folder in ['originales', 'miniaturas', 'webp']:
        folder_path = os.path.join(media_path, folder)
        if os.path.exists(folder_path):
            files = os.listdir(folder_path)
            if files:
                # Crear registro en la base de datos
                for file in files:
                    if file.startswith('original_'):
                        original_path = os.path.join(folder_path, file)
                        
                        # Buscar las otras versiones
                        timestamp = file.replace('original_', '').split('.')[0]
                        thumbnail_file = f'miniatura_{timestamp}.jpg'
                        webp_file = f'webp_{timestamp}.webp'
                        
                        # Crear el registro de imagen
                        imagen = ImagenReferenciaProductoOfertado.objects.create(
                            producto_ofertado=producto,
                            imagen=f'productos/productosofertados/imagenes/{producto.code}/{file}',
                            imagen_original=f'productos/productosofertados/imagenes/{producto.code}/originales/{file}',
                            imagen_thumbnail=f'productos/productosofertados/imagenes/{producto.code}/miniaturas/{thumbnail_file}',
                            imagen_webp=f'productos/productosofertados/imagenes/{producto.code}/webp/{webp_file}',
                            descripcion='Imagen de prueba',
                            titulo=f'Imagen {producto.nombre}',
                            is_primary=True
                        )
                        
                        print(f"\nImagen creada:")
                        print(f"ID: {imagen.id}")
                        print(f"Original: {imagen.imagen_original}")
                        print(f"Thumbnail: {imagen.imagen_thumbnail}")
                        print(f"WebP: {imagen.imagen_webp}")
                        print(f"Thumbnail URL: {imagen.thumbnail_url}")
                        
                        break
                break