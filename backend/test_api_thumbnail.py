#!/usr/bin/env python
"""
Script para verificar que la API devuelve las URLs de thumbnail correctamente.
"""
import os
import sys
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pandora.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from productos.views import ProductoOfertadoViewSet
from users.models import User

# Obtener usuario
user = User.objects.first()

# Crear request factory
factory = APIRequestFactory()

# Hacer solicitud
request = factory.get('/api/productos/productos-ofertados/', format='json')
force_authenticate(request, user=user)

# Obtener vista
view = ProductoOfertadoViewSet.as_view({'get': 'list'})
response = view(request)

# Mostrar respuesta
if response.status_code == 200:
    data = response.data
    productos = data.get('results', data)
    
    for producto in productos:
        if producto.get('imagenes'):
            print(f"\nProducto: {producto['nombre']} (ID: {producto['id']})")
            print(f"Código: {producto['code']}")
            
            for i, imagen in enumerate(producto['imagenes']):
                print(f"\nImagen {i + 1}:")
                print(f"  ID: {imagen.get('id')}")
                print(f"  Thumbnail URL: {imagen.get('thumbnail_url')}")
                print(f"  Imagen URL: {imagen.get('imagen_url')}")
                print(f"  WebP URL: {imagen.get('webp_url')}")
                print(f"  Original URL: {imagen.get('original_url')}")
                
                # Mostrar JSON completo de la imagen
                print(f"\nJSON completo de la imagen:")
                print(json.dumps(imagen, indent=2))
else:
    print(f"Error: {response.status_code}")
    print(response.data)