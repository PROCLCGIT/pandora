#!/usr/bin/env python
"""
Script para verificar todas las imágenes en la base de datos.
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pandora.settings')
django.setup()

from productos.models import ImagenReferenciaProductoOfertado, ProductoOfertado
from django.conf import settings

# Verificar todas las imágenes
todas_imagenes = ImagenReferenciaProductoOfertado.objects.all()
print(f"Total de imágenes en ImagenReferenciaProductoOfertado: {todas_imagenes.count()}")

if todas_imagenes.exists():
    print("\nPrimeras 5 imágenes:")
    for i, imagen in enumerate(todas_imagenes[:5]):
        print(f"\n--- Imagen {i + 1} ---")
        print(f"ID: {imagen.id}")
        print(f"Producto ID: {imagen.producto_ofertado_id}")
        print(f"Producto Code: {imagen.producto_ofertado.code}")
        print(f"Producto Nombre: {imagen.producto_ofertado.nombre}")
        print(f"Archivo principal: {imagen.imagen}")
        print(f"Imagen original: {imagen.imagen_original}")
        print(f"Imagen thumbnail: {imagen.imagen_thumbnail}")
        print(f"Imagen webp: {imagen.imagen_webp}")
        print(f"Thumbnail URL: {imagen.thumbnail_url}")

# Verificar productos
todos_productos = ProductoOfertado.objects.all()
print(f"\n\nTotal de productos ofertados: {todos_productos.count()}")

if todos_productos.exists():
    print("\nPrimeros 5 productos:")
    for i, producto in enumerate(todos_productos[:5]):
        print(f"\n--- Producto {i + 1} ---")
        print(f"ID: {producto.id}")
        print(f"Nombre: {producto.nombre}")
        print(f"Código: {producto.code}")
        imagenes_count = producto.imagenes.count()
        print(f"Número de imágenes: {imagenes_count}")