#!/usr/bin/env python
"""
Script para verificar los datos de imágenes en la base de datos.
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pandora.settings')
django.setup()

from productos.models import ProductoOfertado, ImagenReferenciaProductoOfertado
from django.conf import settings

# Buscar productos con imágenes
productos_con_imagenes = ProductoOfertado.objects.filter(imagenes__isnull=False).distinct()

print(f"Total de productos con imágenes: {productos_con_imagenes.count()}")
print("\n" + "="*60 + "\n")

# Mostrar información detallada del primer producto con imágenes
for producto in productos_con_imagenes[:1]:
    print(f"Producto: {producto.nombre}")
    print(f"ID: {producto.id}")
    print(f"Código: {producto.code}")
    
    imagenes = producto.imagenes.all()
    print(f"\nTotal de imágenes: {imagenes.count()}")
    
    for i, imagen in enumerate(imagenes):
        print(f"\n--- Imagen {i + 1} ---")
        print(f"ID: {imagen.id}")
        print(f"Archivo principal: {imagen.imagen}")
        print(f"Imagen original: {imagen.imagen_original}")
        print(f"Imagen thumbnail: {imagen.imagen_thumbnail}") 
        print(f"Imagen webp: {imagen.imagen_webp}")
        print(f"Es primaria: {imagen.is_primary}")
        
        # URLs generadas por las propiedades
        print(f"\nURLs generadas:")
        print(f"Original URL: {imagen.original_url}")
        print(f"Thumbnail URL: {imagen.thumbnail_url}")
        print(f"WebP URL: {imagen.webp_url}")
        print(f"URL absoluta: {imagen.get_absolute_url}")
        
        # Verificar si los archivos existen
        if imagen.imagen_thumbnail:
            thumbnail_path = os.path.join(settings.MEDIA_ROOT, imagen.imagen_thumbnail)
            print(f"\nArchivo thumbnail existe: {os.path.exists(thumbnail_path)}")
            if os.path.exists(thumbnail_path):
                print(f"Tamaño: {os.path.getsize(thumbnail_path)} bytes")