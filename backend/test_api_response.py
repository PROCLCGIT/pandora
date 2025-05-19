#!/usr/bin/env python
"""
Script para verificar la respuesta de la API de productos ofertados.
"""
import os
import sys
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pandora.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from productos.views import ProductoOfertadoViewSet
from users.models import User

# Crear un usuario de prueba o obtener uno existente
user = User.objects.first()

# Crear request factory
factory = APIRequestFactory()

# Hacer una solicitud a la vista
request = factory.get('/api/productos/productos-ofertados/', format='json')
force_authenticate(request, user=user)

# Obtener la vista y ejecutar la solicitud
view = ProductoOfertadoViewSet.as_view({'get': 'list'})
response = view(request)

# Verificar la respuesta
if response.status_code == 200:
    data = response.data
    
    # Si es una respuesta paginada
    if 'results' in data:
        productos = data['results']
    else:
        productos = data
    
    # Verificar el primer producto con imágenes
    for producto in productos:
        if producto.get('imagenes'):
            print(f"\nProducto: {producto['nombre']} (ID: {producto['id']})")
            print(f"Código: {producto['code']}")
            
            for i, imagen in enumerate(producto['imagenes']):
                print(f"\nImagen {i + 1}:")
                print(f"  ID: {imagen.get('id')}")
                print(f"  Thumbnail URL: {imagen.get('thumbnail_url')}")
                print(f"  WebP URL: {imagen.get('webp_url')}")
                print(f"  Original URL: {imagen.get('original_url')}")
                print(f"  Imagen URL: {imagen.get('imagen_url')}")
                print(f"  Es primaria: {imagen.get('is_primary')}")
            
            # Salir después del primer producto con imágenes
            break
else:
    print(f"Error en la respuesta: {response.status_code}")
    print(response.data)