#!/usr/bin/env python
"""
Script para verificar que las miniaturas se guardan en formato JPG
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pandora.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

django.setup()

from productos.models import ProductoOfertado, ImagenReferenciaProductoOfertado
from pathlib import Path
from django.conf import settings
from PIL import Image

print("Verificando formatos de miniaturas existentes...")
print("="*50)

base_path = Path(settings.MEDIA_ROOT) / 'productos' / 'productosofertados' / 'imagenes'

# Contar formatos
formats_count = {
    'jpg': 0,
    'jpeg': 0,
    'png': 0,
    'webp': 0,
    'other': 0
}

# Verificar todas las carpetas de productos
for producto_dir in base_path.glob('OFT-*'):
    if producto_dir.is_dir():
        miniaturas_dir = producto_dir / 'miniaturas'
        if miniaturas_dir.exists():
            for miniatura in miniaturas_dir.glob('miniatura_*'):
                ext = miniatura.suffix.lower()
                if ext == '.jpg':
                    formats_count['jpg'] += 1
                elif ext == '.jpeg':
                    formats_count['jpeg'] += 1
                elif ext == '.png':
                    formats_count['png'] += 1
                elif ext == '.webp':
                    formats_count['webp'] += 1
                else:
                    formats_count['other'] += 1
                    
                # Verificar el formato real del archivo
                try:
                    img = Image.open(miniatura)
                    print(f"{miniatura.name} - Extensión: {ext} - Formato real: {img.format}")
                    img.close()
                except Exception as e:
                    print(f"Error al abrir {miniatura.name}: {e}")

print("\nResumen de formatos:")
print("-"*30)
for fmt, count in formats_count.items():
    print(f"{fmt}: {count} archivos")

# Verificar configuración del procesador
print("\nConfiguración del ImageProcessor:")
print("-"*30)

try:
    from productos.image_processor import ImageProcessor
    processor = ImageProcessor()
    
    print(f"Calidad de miniatura: {processor.quality_settings.get('thumbnail', 75)}%")
    print(f"Tamaño de miniatura: {processor.sizes.get('thumbnail', (150, 150))}")
    print(f"Carpeta de miniaturas: {processor.config.get('thumbnail_folder', 'miniaturas')}")
    
    # Verificar el método _create_thumbnail
    import inspect
    source_lines = inspect.getsource(processor._create_thumbnail)
    if '.jpg' in source_lines and 'JPEG' in source_lines:
        print("\n✓ El método _create_thumbnail está configurado para guardar en JPG")
    else:
        print("\n⚠️ El método _create_thumbnail podría no estar configurado correctamente")
        
except Exception as e:
    print(f"Error al verificar configuración: {e}")

# Verificar imágenes en la base de datos
print("\n\nImágenes en base de datos:")
print("-"*30)

imagenes_bd = ImagenReferenciaProductoOfertado.objects.filter(imagen_thumbnail__isnull=False)
print(f"Total imágenes con miniatura: {imagenes_bd.count()}")

# Mostrar algunas muestras
for imagen in imagenes_bd[:5]:
    print(f"\nProducto: {imagen.producto_ofertado.code}")
    print(f"Miniatura: {imagen.imagen_thumbnail}")
    
    # Verificar extensión
    ext = Path(imagen.imagen_thumbnail).suffix.lower()
    print(f"Extensión: {ext}")
    
    # Verificar si existe el archivo
    full_path = Path(settings.MEDIA_ROOT) / imagen.imagen_thumbnail
    if full_path.exists():
        print("Archivo existe: ✓")
        # Verificar formato real
        try:
            img = Image.open(full_path)
            print(f"Formato real: {img.format}")
            img.close()
        except:
            print("No se pudo verificar formato real")
    else:
        print("Archivo existe: ✗")