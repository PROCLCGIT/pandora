#!/usr/bin/env python
"""
Corrección final de imágenes
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

# Limpiar todo
print("Limpiando todas las asociaciones...")
ImagenReferenciaProductoOfertado.objects.all().delete()

base_path = Path(settings.MEDIA_ROOT) / 'productos' / 'productosofertados' / 'imagenes'

# Solo procesar los productos que vimos en la pantalla para comprobar
productos_test = ['OFT-A923', 'OFT-A253', 'OFT-A734']

for codigo in productos_test:
    try:
        producto = ProductoOfertado.objects.get(code=codigo)
        print(f"\n{codigo} - {producto.nombre}")
        
        producto_dir = base_path / codigo
        if not producto_dir.exists():
            print("  No hay directorio")
            continue
            
        # Directamente buscar la primera miniatura disponible
        miniaturas_dir = producto_dir / 'miniaturas'
        if miniaturas_dir.exists():
            miniaturas = list(miniaturas_dir.glob('miniatura_*.jpg'))
            if miniaturas:
                # Tomar la primera miniatura
                miniatura = miniaturas[0]
                
                # Extraer timestamp
                timestamp = miniatura.stem.replace('miniatura_', '')
                
                # Buscar archivos correspondientes
                original_path = producto_dir / 'originales' / f'original_{timestamp}.jpg'
                if not original_path.exists():
                    original_path = producto_dir / 'originales' / f'original_{timestamp}.jpeg'
                if not original_path.exists():
                    original_path = producto_dir / 'originales' / f'original_{timestamp}.webp'
                
                webp_path = producto_dir / 'webp' / f'webp_{timestamp}.webp'
                
                if original_path.exists():
                    # Crear registro
                    ImagenReferenciaProductoOfertado.objects.create(
                        producto_ofertado=producto,
                        imagen=str(webp_path.relative_to(settings.MEDIA_ROOT)) if webp_path.exists() else str(original_path.relative_to(settings.MEDIA_ROOT)),
                        imagen_original=str(original_path.relative_to(settings.MEDIA_ROOT)),
                        imagen_thumbnail=str(miniatura.relative_to(settings.MEDIA_ROOT)),
                        imagen_webp=str(webp_path.relative_to(settings.MEDIA_ROOT)) if webp_path.exists() else None,
                        orden=0,
                        is_primary=True,
                        titulo=f'Imagen principal - {producto.nombre}',
                        alt_text=f'{producto.nombre} - Vista del producto'
                    )
                    
                    print(f"  ✓ Imagen asociada:")
                    print(f"    - Miniatura: {miniatura.name}")
                    print(f"    - Original: {original_path.name}")
                    print(f"    - WebP: {'✓' if webp_path.exists() else '✗'}")
                else:
                    print(f"  ⚠️ No se encontró original para {miniatura.name}")
                    
    except ProductoOfertado.DoesNotExist:
        print(f"\n{codigo} - NO ENCONTRADO")

# Verificar resultados
print("\n\nVerificación final:")
print("="*50)

for codigo in productos_test:
    try:
        producto = ProductoOfertado.objects.get(code=codigo)
        imagen = producto.imagenes.filter(is_primary=True).first()
        if imagen:
            print(f"{codigo}: ✓ {imagen.imagen_thumbnail}")
        else:
            print(f"{codigo}: ✗ Sin imagen")
    except:
        pass