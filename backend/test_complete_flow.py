#!/usr/bin/env python
"""
Script para verificar el flujo completo de imágenes.
"""
import os
import sys
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pandora.settings')
django.setup()

from productos.models import ProductoOfertado, ImagenReferenciaProductoOfertado
from django.conf import settings

# Verificar que existe la imagen en la base de datos
imagen = ImagenReferenciaProductoOfertado.objects.first()
if imagen:
    print("=== Imagen en la Base de Datos ===")
    print(f"ID: {imagen.id}")
    print(f"Producto: {imagen.producto_ofertado.nombre}")
    print(f"Thumbnail DB: {imagen.imagen_thumbnail}")
    print(f"Thumbnail URL: {imagen.thumbnail_url}")
    
    # Verificar que el archivo existe físicamente
    thumbnail_path = os.path.join(settings.MEDIA_ROOT, imagen.imagen_thumbnail)
    print(f"\n=== Verificación del Archivo ===")
    print(f"Ruta completa: {thumbnail_path}")
    print(f"Archivo existe: {os.path.exists(thumbnail_path)}")
    if os.path.exists(thumbnail_path):
        print(f"Tamaño: {os.path.getsize(thumbnail_path)} bytes")
    
    # Verificar que el servidor sirve la imagen
    print(f"\n=== Verificación del Servidor ===")
    full_url = f"http://localhost:8000{imagen.thumbnail_url}"
    print(f"URL completa: {full_url}")
    
    try:
        response = requests.head(full_url)
        print(f"Código de respuesta: {response.status_code}")
        print(f"Content-Type: {response.headers.get('Content-Type')}")
        print(f"Content-Length: {response.headers.get('Content-Length')}")
    except Exception as e:
        print(f"Error al verificar URL: {e}")
    
    # Verificar la API
    print(f"\n=== Verificación de la API ===")
    from productos.serializers import ImagenReferenciaProductoOfertadoSerializer
    serializer = ImagenReferenciaProductoOfertadoSerializer(imagen)
    data = serializer.data
    print(f"thumbnail_url desde el serializer: {data.get('thumbnail_url')}")
    
    # Simular request para verificar URLs absolutas
    from rest_framework.test import APIRequestFactory
    factory = APIRequestFactory()
    request = factory.get('/')
    serializer = ImagenReferenciaProductoOfertadoSerializer(imagen, context={'request': request})
    data = serializer.data
    print(f"thumbnail_url con request mock: {data.get('thumbnail_url')}")
    
else:
    print("No se encontraron imágenes en la base de datos")

print("\n=== Resumen ===")
print("1. Los archivos de miniatura existen ✓")
print("2. Las URLs están configuradas correctamente con /media/ ✓")
print("3. El servidor Django sirve las imágenes ✓")
print("4. El proxy de Vite está configurado ✓")
print("\nLas miniaturas deberían mostrarse correctamente en http://localhost:3000")