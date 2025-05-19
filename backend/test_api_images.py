#!/usr/bin/env python
"""
Script para probar la API de productos y ver las URLs de imágenes
"""
import os
import sys
import django
import requests
from django.test import RequestFactory
import json

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pandora.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

django.setup()

# Verificar configuración
from django.conf import settings
print("Configuración de media:")
print(f"MEDIA_URL: {settings.MEDIA_URL}")
print(f"MEDIA_ROOT: {settings.MEDIA_ROOT}")
print(f"DEBUG: {settings.DEBUG}")
print(f"ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
print("-"*50)

# Simular petición al API
from rest_framework.test import APIClient
from users.models import User  # Usar el modelo de usuario correcto
from productos.views import ProductoOfertadoViewSet
from productos.models import ProductoOfertado

# Crear cliente API
client = APIClient()

# Crear un usuario de prueba
try:
    user = User.objects.get(username='admin')
except:
    user = User.objects.create_superuser('admin', 'admin@test.com', 'admin123')

# Autenticar
client.force_authenticate(user=user)

# Hacer petición al API
print("\nHaciendo petición al API...")
response = client.get('/api/productos/productos-ofertados/')

print(f"Status: {response.status_code}")

if response.status_code == 200:
    data = response.json()
    
    if data.get('results'):
        print(f"Total productos: {data.get('count', 0)}")
        
        # Mostrar información de los primeros 3 productos
        for i, producto in enumerate(data['results'][:3]):
            print(f"\nProducto {i+1}: {producto.get('code')} - {producto.get('nombre')}")
            
            imagenes = producto.get('imagenes', [])
            print(f"  Imágenes: {len(imagenes)}")
            
            if imagenes:
                for j, imagen in enumerate(imagenes):
                    print(f"\n  Imagen {j+1}:")
                    print(f"    thumbnail_url: {imagen.get('thumbnail_url')}")
                    print(f"    webp_url: {imagen.get('webp_url')}")
                    print(f"    original_url: {imagen.get('original_url')}")
                    print(f"    is_primary: {imagen.get('is_primary')}")
    else:
        print("No hay resultados")
else:
    print(f"Error: {response.content}")

# Hacer petición directa a una imagen
print("\n" + "="*50)
print("Probando acceso directo a imagen...")

# Obtener la primera imagen disponible
producto = ProductoOfertado.objects.filter(imagenes__isnull=False).first()
if producto:
    imagen = producto.imagenes.first()
    if imagen and imagen.imagen_thumbnail:
        url = f"http://localhost:8000{settings.MEDIA_URL}{imagen.imagen_thumbnail}"
        print(f"URL completa: {url}")
        
        try:
            response = requests.get(url)
            print(f"Status: {response.status_code}")
            print(f"Content-Type: {response.headers.get('content-type')}")
            print(f"Content-Length: {response.headers.get('content-length')}")
        except Exception as e:
            print(f"Error al acceder a la imagen: {e}")