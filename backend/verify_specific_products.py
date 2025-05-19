#!/usr/bin/env python
"""
Verificar productos específicos
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pandora.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

django.setup()

from productos.models import ProductoOfertado
from django.conf import settings
from pathlib import Path

# Productos que vemos en pantalla
productos_visibles = ['OFT-A923', 'OFT-A253', 'OFT-A734']

for codigo in productos_visibles:
    try:
        producto = ProductoOfertado.objects.get(code=codigo)
        print(f"\n{codigo} - {producto.nombre}")
        print("="*40)
        
        imagenes = producto.imagenes.all()
        print(f"Total imágenes en BD: {imagenes.count()}")
        
        for i, img in enumerate(imagenes):
            print(f"\nImagen {i+1}:")
            print(f"  Principal: {img.is_primary}")
            print(f"  Miniatura: {img.imagen_thumbnail}")
            
            if img.imagen_thumbnail:
                full_path = Path(settings.MEDIA_ROOT) / img.imagen_thumbnail
                print(f"  Existe: {'✓' if full_path.exists() else '✗'}")
                print(f"  URL completa: http://localhost:8000/media/{img.imagen_thumbnail}")
        
    except ProductoOfertado.DoesNotExist:
        print(f"\n{codigo} - NO ENCONTRADO")