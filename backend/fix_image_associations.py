#!/usr/bin/env python
"""
Script para corregir las asociaciones de imágenes
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pandora.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

django.setup()

from productos.models import ImagenReferenciaProductoOfertado, ProductoOfertado

# Primero, vamos a eliminar todas las asociaciones existentes
print("Eliminando asociaciones incorrectas...")
ImagenReferenciaProductoOfertado.objects.all().delete()

# Ahora vamos a recrear las asociaciones correctamente
from pathlib import Path
from django.conf import settings
import re

base_path = Path(settings.MEDIA_ROOT) / 'productos' / 'productosofertados' / 'imagenes'

print("\nReasociando imágenes correctamente...")
print("="*50 + "\n")

for producto_dir in base_path.iterdir():
    if producto_dir.is_dir() and producto_dir.name.startswith('OFT-'):
        codigo = producto_dir.name
        
        try:
            producto = ProductoOfertado.objects.get(code=codigo)
            print(f"Procesando producto: {codigo} - {producto.nombre}")
            
            # Directorios
            miniaturas_dir = producto_dir / 'miniaturas'
            originales_dir = producto_dir / 'originales' 
            webp_dir = producto_dir / 'webp'
            
            imagenes_creadas = 0
            
            if originales_dir.exists():
                for original_file in sorted(originales_dir.glob('original_*')):
                    if original_file.is_file():
                        # Extraer timestamp
                        timestamp_match = re.search(r'original_(\d{8}_\d{6})', original_file.stem)
                        if timestamp_match:
                            timestamp = timestamp_match.group(1)
                            
                            # Buscar archivos correspondientes
                            miniatura_file = None
                            webp_file = None
                            
                            if miniaturas_dir.exists():
                                miniatura_candidates = list(miniaturas_dir.glob(f'miniatura_{timestamp}.*'))
                                if miniatura_candidates:
                                    miniatura_file = miniatura_candidates[0]
                            
                            if webp_dir.exists():
                                webp_candidates = list(webp_dir.glob(f'webp_{timestamp}.*'))
                                if webp_candidates:
                                    webp_file = webp_candidates[0]
                            
                            # Crear registro
                            if miniatura_file and webp_file:
                                rel_original = original_file.relative_to(settings.MEDIA_ROOT)
                                rel_miniatura = miniatura_file.relative_to(settings.MEDIA_ROOT)
                                rel_webp = webp_file.relative_to(settings.MEDIA_ROOT)
                                
                                ImagenReferenciaProductoOfertado.objects.create(
                                    producto_ofertado=producto,
                                    imagen=str(rel_webp),
                                    imagen_original=str(rel_original),
                                    imagen_thumbnail=str(rel_miniatura),
                                    imagen_webp=str(rel_webp),
                                    orden=imagenes_creadas,
                                    is_primary=(imagenes_creadas == 0),
                                    titulo=f'Imagen - {producto.nombre}',
                                    alt_text=f'{producto.nombre} - Vista del producto'
                                )
                                
                                print(f"  ✓ Imagen asociada: {timestamp}")
                                print(f"    - Original: {rel_original}")
                                print(f"    - Miniatura: {rel_miniatura}")
                                print(f"    - WebP: {rel_webp}")
                                imagenes_creadas += 1
                            else:
                                print(f"  ⚠️ Archivos incompletos para timestamp {timestamp}")
                                if original_file:
                                    print(f"    Original: ✓")
                                if miniatura_file:
                                    print(f"    Miniatura: ✓")
                                else:
                                    print(f"    Miniatura: ✗")
                                if webp_file:
                                    print(f"    WebP: ✓")
                                else:
                                    print(f"    WebP: ✗")
            
            print(f"  Total imágenes asociadas: {imagenes_creadas}\n")
            
        except ProductoOfertado.DoesNotExist:
            print(f"⚠️ Producto no encontrado: {codigo}\n")

# Resumen final
total_productos = ProductoOfertado.objects.count()
productos_con_imagenes = ProductoOfertado.objects.filter(imagenes__isnull=False).distinct().count()
total_imagenes = ImagenReferenciaProductoOfertado.objects.count()

print("\nResumen final:")
print(f"- Total productos: {total_productos}")
print(f"- Productos con imágenes: {productos_con_imagenes}")
print(f"- Total imágenes asociadas: {total_imagenes}")

# Verificar las asociaciones
print("\n\nVerificación de asociaciones:")
for producto in ProductoOfertado.objects.all().order_by('code'):
    imagenes = producto.imagenes.all()
    if imagenes:
        print(f"\n{producto.code} - {producto.nombre}:")
        for img in imagenes:
            print(f"  - Miniatura: {img.imagen_thumbnail}")
            print(f"    Principal: {img.is_primary}")