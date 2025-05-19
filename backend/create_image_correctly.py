#!/usr/bin/env python
"""
Script para crear una imagen correctamente.
"""
import os
import sys
import django
from django.core.files import File
from django.utils import timezone

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

if os.path.exists(media_path):
    originales_path = os.path.join(media_path, 'originales')
    miniaturas_path = os.path.join(media_path, 'miniaturas')
    webp_path = os.path.join(media_path, 'webp')
    
    # Buscar archivos
    if os.path.exists(originales_path):
        files = [f for f in os.listdir(originales_path) if f.startswith('original_')]
        if files:
            original_file = files[0]
            
            # Extraer timestamp
            timestamp = original_file.replace('original_', '').split('.')[0]
            thumbnail_file = f'miniatura_{timestamp}.jpg'
            webp_file = f'webp_{timestamp}.webp'
            
            # Verificar que los tres archivos existan
            original_full_path = os.path.join(originales_path, original_file)
            thumbnail_full_path = os.path.join(miniaturas_path, thumbnail_file)
            webp_full_path = os.path.join(webp_path, webp_file)
            
            if os.path.exists(original_full_path) and os.path.exists(thumbnail_full_path) and os.path.exists(webp_full_path):
                # Crear el registro usando el constructor normal
                imagen = ImagenReferenciaProductoOfertado()
                imagen.producto_ofertado = producto
                
                # Abrir el archivo y asignarlo
                with open(original_full_path, 'rb') as f:
                    imagen.imagen.save(original_file, File(f), save=False)
                
                # Asignar las rutas relativas al MEDIA_ROOT
                imagen.imagen_original = f'productos/productosofertados/imagenes/{producto.code}/originales/{original_file}'
                imagen.imagen_thumbnail = f'productos/productosofertados/imagenes/{producto.code}/miniaturas/{thumbnail_file}'
                imagen.imagen_webp = f'productos/productosofertados/imagenes/{producto.code}/webp/{webp_file}'
                
                # Asignar otros campos
                imagen.descripcion = 'Imagen de prueba'
                imagen.titulo = f'Imagen {producto.nombre}'
                imagen.is_primary = True
                imagen.orden = 0
                
                # Establecer timestamps manualmente para evitar el procesamiento
                imagen._skip_processing = True  # Flag temporal para evitar procesamiento
                
                # Crear el registro directamente en la base de datos
                from django.db import connection
                with connection.cursor() as cursor:
                    cursor.execute("""
                        INSERT INTO productos_imagenreferenciaproductoofertado 
                        (producto_ofertado_id, imagen, descripcion, orden, is_primary, titulo, 
                         alt_text, tags, file_size, width, height, format, created_at, updated_at, 
                         imagen_original, imagen_thumbnail, imagen_webp)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, [
                        producto.id,
                        f'productos/productosofertados/imagenes/{producto.code}/originales/{original_file}',
                        'Imagen de prueba',
                        0,
                        True,
                        f'Imagen {producto.nombre}',
                        '',  # alt_text
                        '',  # tags
                        None,  # file_size
                        None,  # width
                        None,  # height
                        '',  # format
                        timezone.now(),  # created_at
                        timezone.now(),  # updated_at
                        f'productos/productosofertados/imagenes/{producto.code}/originales/{original_file}',
                        f'productos/productosofertados/imagenes/{producto.code}/miniaturas/{thumbnail_file}',
                        f'productos/productosofertados/imagenes/{producto.code}/webp/{webp_file}'
                    ])
                
                print(f"\nImagen creada correctamente")
                
                # Verificar que se creó
                imagen_creada = ImagenReferenciaProductoOfertado.objects.filter(producto_ofertado=producto).first()
                if imagen_creada:
                    print(f"ID: {imagen_creada.id}")
                    print(f"Original: {imagen_creada.imagen_original}")
                    print(f"Thumbnail: {imagen_creada.imagen_thumbnail}")
                    print(f"WebP: {imagen_creada.imagen_webp}")
                    print(f"Thumbnail URL: {imagen_creada.thumbnail_url}")
            else:
                print(f"No se encontraron todos los archivos necesarios")
else:
    print(f"No se encontró el directorio: {media_path}")