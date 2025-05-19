#!/usr/bin/env python
"""
Script de prueba para verificar las URLs de imágenes en ProductoOfertado
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pandora.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

django.setup()

from productos.models import ProductoOfertado
from productos.serializers import ProductoOfertadoSerializer
from django.test import RequestFactory
from django.conf import settings

# Crear un request factory para simular el contexto
factory = RequestFactory()

# Obtener productos con imágenes
from django.db.models import Count
productos = ProductoOfertado.objects.annotate(
    num_imagenes=Count('imagenes')
).filter(num_imagenes__gt=0).prefetch_related('imagenes')[:5]

print(f"MEDIA_ROOT: {settings.MEDIA_ROOT}")
print(f"MEDIA_URL: {settings.MEDIA_URL}")

# También verificar si hay productos en total
from productos.models import ImagenReferenciaProductoOfertado
total_productos = ProductoOfertado.objects.count()
productos_con_imagenes = ProductoOfertado.objects.filter(imagenes__isnull=False).distinct().count()
total_imagenes = ImagenReferenciaProductoOfertado.objects.count()

print(f"Total productos: {total_productos}")
print(f"Productos con imágenes: {productos_con_imagenes}")
print(f"Total imágenes en BD: {total_imagenes}")

# Verificar si hay imágenes sin productos
imagenes_sin_producto = ImagenReferenciaProductoOfertado.objects.filter(producto_ofertado__isnull=True).count()
print(f"Imágenes sin producto: {imagenes_sin_producto}")

# Si hay imágenes, mostrar algunas
if total_imagenes > 0:
    print("\nPrimeras 5 imágenes:")
    for img in ImagenReferenciaProductoOfertado.objects.all()[:5]:
        print(f"  - ID: {img.id}, Producto: {img.producto_ofertado.code if img.producto_ofertado else 'None'}")
        print(f"    Original: {img.imagen_original}")
        print(f"    Thumbnail: {img.imagen_thumbnail}")
        print(f"    WebP: {img.imagen_webp}")

print(f"Productos seleccionados (con imágenes): {productos.count()}")
print("\n" + "="*50 + "\n")

for producto in productos:
    print(f"Producto: {producto.code} - {producto.nombre}")
    print(f"  Imágenes: {producto.imagenes.count()}")
    
    # Crear una request simulada
    request = factory.get('/api/productos-ofertados/')
    request.META['HTTP_HOST'] = 'localhost:8000'
    
    # Serializar con el contexto de request
    serializer = ProductoOfertadoSerializer(producto, context={'request': request})
    data = serializer.data
    
    if data.get('imagenes'):
        for idx, imagen_data in enumerate(data['imagenes']):
            print(f"  Imagen {idx + 1}:")
            print(f"    - thumbnail_url: {imagen_data.get('thumbnail_url')}")
            print(f"    - webp_url: {imagen_data.get('webp_url')}")
            print(f"    - original_url: {imagen_data.get('original_url')}")
            print(f"    - is_primary: {imagen_data.get('is_primary')}")
            
            # Verificar existencia de archivos
            imagen_obj = producto.imagenes.all()[idx]
            if imagen_obj.imagen_thumbnail:
                path = os.path.join(settings.MEDIA_ROOT, imagen_obj.imagen_thumbnail)
                exists = os.path.exists(path)
                print(f"    - Archivo miniatura existe: {exists} ({path})")
    else:
        print("  No hay imágenes")
    
    print("\n" + "-"*30 + "\n")