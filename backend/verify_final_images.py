#!/usr/bin/env python
"""
Verificación final de imágenes
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

# Productos específicos que vemos en pantalla
productos_check = [
    ('OFT-A923', 'dfdfd'),
    ('OFT-A253', 'rtrt'),
    ('OFT-A734', 'sdsds')
]

print("Verificación de productos mostrados:")
print("="*50)

for codigo, nombre_esperado in productos_check:
    try:
        producto = ProductoOfertado.objects.get(code=codigo)
        imagen = producto.imagenes.filter(is_primary=True).first()
        
        print(f"\n{codigo}: {producto.nombre}")
        print(f"  Nombre esperado: {nombre_esperado}")
        print(f"  Coincide: {'✓' if producto.nombre == nombre_esperado else '✗'}")
        
        if imagen:
            print(f"  Imagen: ✓")
            print(f"  Miniatura: {imagen.imagen_thumbnail}")
            
            # Verificar que el archivo existe
            miniatura_path = Path(settings.MEDIA_ROOT) / imagen.imagen_thumbnail
            print(f"  Archivo existe: {'✓' if miniatura_path.exists() else '✗'}")
            
            if miniatura_path.exists():
                print(f"  Tamaño: {miniatura_path.stat().st_size} bytes")
                
            print(f"  URL: http://localhost:8000/media/{imagen.imagen_thumbnail}")
        else:
            print(f"  Imagen: ✗")
            
    except ProductoOfertado.DoesNotExist:
        print(f"\n{codigo}: NO ENCONTRADO")