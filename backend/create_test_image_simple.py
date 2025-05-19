#!/usr/bin/env python
"""
Script para crear una imagen de prueba sin procesamiento.
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pandora.settings')
django.setup()

from productos.models import ProductoOfertado, ImagenReferenciaProductoOfertado
from django.conf import settings

# Obtener el primer producto
producto = ProductoOfertado.objects.first()
if not producto:
    print("No hay productos en la base de datos")
    exit(1)

print(f"Producto encontrado: {producto.nombre} (ID: {producto.id}, Código: {producto.code})")

# Buscar archivos existentes
media_path = os.path.join(settings.MEDIA_ROOT, 'productos/productosofertados/imagenes', producto.code)
original_file = None
thumbnail_file = None
webp_file = None

if os.path.exists(media_path):
    originales_path = os.path.join(media_path, 'originales')
    miniaturas_path = os.path.join(media_path, 'miniaturas')
    webp_path = os.path.join(media_path, 'webp')
    
    # Buscar archivos
    if os.path.exists(originales_path):
        files = [f for f in os.listdir(originales_path) if f.startswith('original_')]
        if files:
            original_file = files[0]
    
    if os.path.exists(miniaturas_path):
        files = [f for f in os.listdir(miniaturas_path) if f.startswith('miniatura_')]
        if files:
            thumbnail_file = files[0]
    
    if os.path.exists(webp_path):
        files = [f for f in os.listdir(webp_path) if f.startswith('webp_')]
        if files:
            webp_file = files[0]

if original_file and thumbnail_file and webp_file:
    # Crear objeto sin guardar para evitar el procesamiento
    imagen = ImagenReferenciaProductoOfertado(
        producto_ofertado=producto,
        imagen=f'productos/productosofertados/imagenes/{producto.code}/{original_file}',
        imagen_original=f'productos/productosofertados/imagenes/{producto.code}/originales/{original_file}',
        imagen_thumbnail=f'productos/productosofertados/imagenes/{producto.code}/miniaturas/{thumbnail_file}',
        imagen_webp=f'productos/productosofertados/imagenes/{producto.code}/webp/{webp_file}',
        descripcion='Imagen de prueba',
        titulo=f'Imagen {producto.nombre}',
        is_primary=True,
        orden=0
    )
    
    # Guardar directamente sin pasar por el método save personalizado
    imagen.save_base(raw=True)
    
    print(f"\nImagen creada:")
    print(f"ID: {imagen.id}")
    print(f"Original: {imagen.imagen_original}")
    print(f"Thumbnail: {imagen.imagen_thumbnail}")
    print(f"WebP: {imagen.imagen_webp}")
    print(f"Thumbnail URL: {imagen.thumbnail_url}")
else:
    print(f"No se encontraron todos los archivos necesarios:")
    print(f"Original: {original_file}")
    print(f"Thumbnail: {thumbnail_file}")
    print(f"WebP: {webp_file}")