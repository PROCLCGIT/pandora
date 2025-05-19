#!/usr/bin/env python
"""
Script para limpiar y reasociar imágenes correctamente
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pandora.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

django.setup()

from productos.models import ImagenReferenciaProductoOfertado, ProductoOfertado
from pathlib import Path
from django.conf import settings
import re

# Limpiar todas las asociaciones existentes
print("Limpiando todas las asociaciones existentes...")
ImagenReferenciaProductoOfertado.objects.all().delete()

base_path = Path(settings.MEDIA_ROOT) / 'productos' / 'productosofertados' / 'imagenes'

print("\nBuscando y asociando imágenes...")
print("="*50 + "\n")

# Procesar cada directorio de producto
for producto_dir in sorted(base_path.iterdir()):
    if not (producto_dir.is_dir() and producto_dir.name.startswith('OFT-')):
        continue
        
    codigo = producto_dir.name
    
    try:
        producto = ProductoOfertado.objects.get(code=codigo)
    except ProductoOfertado.DoesNotExist:
        print(f"⚠️ Producto {codigo} no encontrado en BD")
        continue
    
    print(f"Procesando {codigo} - {producto.nombre}")
    
    # Buscar imágenes
    originales_dir = producto_dir / 'originales'
    miniaturas_dir = producto_dir / 'miniaturas'
    webp_dir = producto_dir / 'webp'
    
    if not originales_dir.exists():
        print("  No hay carpeta de originales")
        continue
    
    # Agrupar archivos por timestamp
    imagenes_por_timestamp = {}
    
    # Buscar originales
    for archivo in originales_dir.glob('original_*'):
        match = re.search(r'original_(\d{8}_\d{6})', archivo.stem)
        if match:
            timestamp = match.group(1)
            if timestamp not in imagenes_por_timestamp:
                imagenes_por_timestamp[timestamp] = {}
            imagenes_por_timestamp[timestamp]['original'] = archivo
    
    # Buscar miniaturas
    if miniaturas_dir.exists():
        for archivo in miniaturas_dir.glob('miniatura_*'):
            match = re.search(r'miniatura_(\d{8}_\d{6})', archivo.stem)
            if match:
                timestamp = match.group(1)
                if timestamp not in imagenes_por_timestamp:
                    imagenes_por_timestamp[timestamp] = {}
                imagenes_por_timestamp[timestamp]['miniatura'] = archivo
    
    # Buscar webp
    if webp_dir.exists():
        for archivo in webp_dir.glob('webp_*'):
            match = re.search(r'webp_(\d{8}_\d{6})', archivo.stem)
            if match:
                timestamp = match.group(1)
                if timestamp not in imagenes_por_timestamp:
                    imagenes_por_timestamp[timestamp] = {}
                imagenes_por_timestamp[timestamp]['webp'] = archivo
    
    # Crear asociaciones para cada conjunto de imágenes
    orden = 0
    for timestamp in sorted(imagenes_por_timestamp.keys()):
        archivos = imagenes_por_timestamp[timestamp]
        
        if 'original' not in archivos:
            print(f"  ⚠️ Sin original para {timestamp}")
            continue
            
        original_path = archivos['original']
        miniatura_path = archivos.get('miniatura')
        webp_path = archivos.get('webp')
        
        # Crear paths relativos
        rel_original = str(original_path.relative_to(settings.MEDIA_ROOT))
        rel_miniatura = str(miniatura_path.relative_to(settings.MEDIA_ROOT)) if miniatura_path else None
        rel_webp = str(webp_path.relative_to(settings.MEDIA_ROOT)) if webp_path else None
        
        # Usar WebP como imagen principal si existe, sino usar original
        imagen_principal = rel_webp if rel_webp else rel_original
        
        ImagenReferenciaProductoOfertado.objects.create(
            producto_ofertado=producto,
            imagen=imagen_principal,
            imagen_original=rel_original,
            imagen_thumbnail=rel_miniatura,
            imagen_webp=rel_webp,
            orden=orden,
            is_primary=(orden == 0),
            titulo=f'Imagen {orden + 1} - {producto.nombre}',
            alt_text=f'{producto.nombre} - Imagen del producto'
        )
        
        print(f"  ✓ {timestamp}: miniatura={'✓' if miniatura_path else '✗'}, webp={'✓' if webp_path else '✗'}")
        orden += 1
    
    print(f"  Total: {orden} imágenes asociadas\n")

# Resumen final
print("\nResumen:")
total_productos = ProductoOfertado.objects.count()
productos_con_imagenes = ProductoOfertado.objects.filter(imagenes__isnull=False).distinct().count()
total_imagenes = ImagenReferenciaProductoOfertado.objects.count()

print(f"- Total productos: {total_productos}")
print(f"- Productos con imágenes: {productos_con_imagenes}")
print(f"- Total imágenes: {total_imagenes}")

# Verificar algunas asociaciones
print("\nMuestra de asociaciones:")
for producto in ProductoOfertado.objects.filter(imagenes__isnull=False)[:3]:
    print(f"\n{producto.code} - {producto.nombre}:")
    for img in producto.imagenes.all()[:2]:
        print(f"  Miniatura: {img.imagen_thumbnail}")
        if img.imagen_thumbnail:
            full_path = Path(settings.MEDIA_ROOT) / img.imagen_thumbnail
            print(f"  Existe: {'✓' if full_path.exists() else '✗'}")