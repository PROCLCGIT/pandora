#!/usr/bin/env python
"""
Asociar al menos una imagen principal para cada producto
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

# Limpiar todas las asociaciones
print("Limpiando todas las asociaciones existentes...")
ImagenReferenciaProductoOfertado.objects.all().delete()

base_path = Path(settings.MEDIA_ROOT) / 'productos' / 'productosofertados' / 'imagenes'

print("\nAsociando imagen principal para cada producto...")
print("="*50 + "\n")

# Procesar todos los productos
for producto in ProductoOfertado.objects.all().order_by('code'):
    codigo = producto.code
    print(f"{codigo} - {producto.nombre}")
    
    producto_dir = base_path / codigo
    if not producto_dir.exists():
        print("  ⚠️ No hay directorio de imágenes")
        continue
    
    # Buscar la primera miniatura disponible
    miniaturas_dir = producto_dir / 'miniaturas'
    if not miniaturas_dir.exists():
        print("  ⚠️ No hay directorio de miniaturas")
        continue
    
    # Obtener la primera miniatura alfabéticamente
    miniaturas = sorted(miniaturas_dir.glob('miniatura_*.jpg'))
    if not miniaturas:
        miniaturas = sorted(miniaturas_dir.glob('miniatura_*.png'))
    if not miniaturas:
        miniaturas = sorted(miniaturas_dir.glob('miniatura_*.webp'))
    
    if not miniaturas:
        print("  ⚠️ No hay miniaturas")
        continue
    
    # Usar la primera miniatura
    miniatura = miniaturas[0]
    timestamp = miniatura.stem.replace('miniatura_', '')
    
    # Buscar archivos correspondientes
    original_path = None
    for ext in ['jpg', 'jpeg', 'png', 'webp']:
        candidate = producto_dir / 'originales' / f'original_{timestamp}.{ext}'
        if candidate.exists():
            original_path = candidate
            break
    
    if not original_path:
        print(f"  ⚠️ No se encontró original para {miniatura.name}")
        continue
    
    webp_path = producto_dir / 'webp' / f'webp_{timestamp}.webp'
    
    # Crear registro de imagen
    ImagenReferenciaProductoOfertado.objects.create(
        producto_ofertado=producto,
        imagen=str(webp_path.relative_to(settings.MEDIA_ROOT)) if webp_path.exists() else str(original_path.relative_to(settings.MEDIA_ROOT)),
        imagen_original=str(original_path.relative_to(settings.MEDIA_ROOT)),
        imagen_thumbnail=str(miniatura.relative_to(settings.MEDIA_ROOT)),
        imagen_webp=str(webp_path.relative_to(settings.MEDIA_ROOT)) if webp_path.exists() else None,
        orden=0,
        is_primary=True,
        titulo=f'Imagen - {producto.nombre}',
        alt_text=f'{producto.nombre} - Vista del producto'
    )
    
    print(f"  ✓ Imagen asociada: {miniatura.name}")

# Resumen final
print("\n\nResumen final:")
print("="*50)

total_productos = ProductoOfertado.objects.count()
productos_con_imagenes = ProductoOfertado.objects.filter(imagenes__isnull=False).distinct().count()
total_imagenes = ImagenReferenciaProductoOfertado.objects.count()

print(f"Total productos: {total_productos}")
print(f"Productos con imágenes: {productos_con_imagenes}")
print(f"Total imágenes: {total_imagenes}")

# Mostrar algunos ejemplos
print("\nMuestra de productos:")
for producto in ProductoOfertado.objects.filter(imagenes__isnull=False)[:5]:
    imagen = producto.imagenes.filter(is_primary=True).first()
    if imagen:
        print(f"{producto.code}: {imagen.imagen_thumbnail}")