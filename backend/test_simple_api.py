#!/usr/bin/env python
"""
Script simple para verificar las URLs de imágenes
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pandora.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

django.setup()

from django.conf import settings
from productos.models import ProductoOfertado
from productos.serializers import ProductoOfertadoSerializer
from django.test import RequestFactory

print("Verificando imágenes en productos...")
print("="*50)

# Crear request factory
factory = RequestFactory()

# Obtener productos con imágenes
productos = ProductoOfertado.objects.filter(imagenes__isnull=False).distinct()[:3]

for producto in productos:
    print(f"\nProducto: {producto.code} - {producto.nombre}")
    
    # Crear request simulada
    request = factory.get('/fake-url')
    request.META['HTTP_HOST'] = 'localhost:8000'
    
    # Serializar
    serializer = ProductoOfertadoSerializer(producto, context={'request': request})
    data = serializer.data
    
    imagenes = data.get('imagenes', [])
    print(f"Imágenes serializadas: {len(imagenes)}")
    
    for i, imagen in enumerate(imagenes):
        print(f"\n  Imagen {i+1}:")
        print(f"    thumbnail_url: {imagen.get('thumbnail_url')}")
        print(f"    is_primary: {imagen.get('is_primary')}")
        
        # Solo verificar la primera miniatura
        if i == 0 and imagen.get('thumbnail_url'):
            thumb_url = imagen.get('thumbnail_url')
            # Extraer path relativo
            if 'localhost:8000' in thumb_url:
                rel_path = thumb_url.split('localhost:8000')[1]
                if rel_path.startswith('/media/'):
                    file_path = rel_path.replace('/media/', '')
                    full_path = os.path.join(settings.MEDIA_ROOT, file_path)
                    exists = os.path.exists(full_path)
                    print(f"    Archivo existe: {exists} - {full_path}")
                    
# También verificar directamente desde la BD
print("\n" + "="*50)
print("Verificación directa desde BD:")

for producto in ProductoOfertado.objects.filter(imagenes__isnull=False)[:3]:
    imagen = producto.imagenes.filter(is_primary=True).first() or producto.imagenes.first()
    if imagen:
        print(f"\n{producto.code}:")
        print(f"  DB thumbnail: {imagen.imagen_thumbnail}")
        print(f"  DB webp: {imagen.imagen_webp}")
        print(f"  DB original: {imagen.imagen_original}")
        
        # Construir URL como lo haría el frontend
        if imagen.imagen_thumbnail:
            url = f"http://localhost:8000/media/{imagen.imagen_thumbnail}"
            print(f"  URL construida: {url}")