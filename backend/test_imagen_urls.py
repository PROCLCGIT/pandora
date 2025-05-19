#!/usr/bin/env python
"""
Script para verificar las URLs de imágenes.
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pandora.settings')
django.setup()

from productos.models import ImagenReferenciaProductoOfertado

# Obtener una imagen de ejemplo
imagen = ImagenReferenciaProductoOfertado.objects.first()

if imagen:
    print(f"Imagen ID: {imagen.id}")
    print(f"Producto: {imagen.producto_ofertado.nombre}")
    print(f"Código: {imagen.producto_ofertado.code}")
    print(f"Imagen original: {imagen.imagen_original}")
    print(f"Imagen thumbnail: {imagen.imagen_thumbnail}")
    print(f"Imagen webp: {imagen.imagen_webp}")
    print(f"URL original: {imagen.original_url}")
    print(f"URL thumbnail: {imagen.thumbnail_url}")
    print(f"URL webp: {imagen.webp_url}")
    print(f"URL absoluta: {imagen.get_absolute_url}")
else:
    print("No se encontraron imágenes")