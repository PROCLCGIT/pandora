#!/usr/bin/env python
"""
Script para asociar imágenes existentes en el sistema de archivos
con los productos ofertados correspondientes
"""
import os
import sys
import django
from pathlib import Path
import re

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pandora.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

django.setup()

from django.conf import settings
from productos.models import ProductoOfertado, ImagenReferenciaProductoOfertado

# Directorio base de imágenes
base_path = Path(settings.MEDIA_ROOT) / 'productos' / 'productosofertados' / 'imagenes'

print(f"Buscando imágenes en: {base_path}")
print("="*50 + "\n")

# Buscar carpetas de productos
for producto_dir in base_path.iterdir():
    if producto_dir.is_dir() and producto_dir.name.startswith('OFT-'):
        codigo = producto_dir.name
        print(f"Procesando producto: {codigo}")
        
        # Buscar el producto en la BD
        try:
            producto = ProductoOfertado.objects.get(code=codigo)
            print(f"  Producto encontrado: {producto.nombre}")
            
            # Buscar imágenes en las subcarpetas
            miniaturas_dir = producto_dir / 'miniaturas'
            originales_dir = producto_dir / 'originales' 
            webp_dir = producto_dir / 'webp'
            
            # Buscar grupos de imágenes que correspondan
            imagenes_creadas = 0
            
            if originales_dir.exists():
                # Buscar archivos con diferentes extensiones
                for ext in ['jpg', 'jpeg', 'png', 'webp']:
                    for original_file in originales_dir.glob(f'original_*.{ext}'):
                        # Extraer timestamp del nombre
                        timestamp_match = re.search(r'original_(\d{8}_\d{6})', original_file.stem)
                        if timestamp_match:
                            timestamp = timestamp_match.group(1)
                        
                        # Buscar archivos correspondientes
                        miniatura_path = None
                        webp_path = None
                        
                        if miniaturas_dir.exists():
                            for miniatura in miniaturas_dir.glob(f'miniatura_{timestamp}.*'):
                                miniatura_path = miniatura
                                break
                                
                        if webp_dir.exists():
                            for webp in webp_dir.glob(f'webp_{timestamp}.*'):
                                webp_path = webp
                                break
                        
                        # Crear registro de imagen si no existe
                        relative_original = original_file.relative_to(settings.MEDIA_ROOT)
                        relative_miniatura = miniatura_path.relative_to(settings.MEDIA_ROOT) if miniatura_path else None
                        relative_webp = webp_path.relative_to(settings.MEDIA_ROOT) if webp_path else None
                        
                        imagen, created = ImagenReferenciaProductoOfertado.objects.get_or_create(
                            producto_ofertado=producto,
                            imagen_original=str(relative_original),
                            defaults={
                                'imagen': str(relative_webp) if relative_webp else str(relative_original),
                                'imagen_thumbnail': str(relative_miniatura) if relative_miniatura else None,
                                'imagen_webp': str(relative_webp) if relative_webp else None,
                                'orden': imagenes_creadas,
                                'is_primary': imagenes_creadas == 0,  # Primera imagen como principal
                                'titulo': f'Imagen {imagenes_creadas + 1} - {producto.nombre}',
                                'alt_text': f'{producto.nombre} - Imagen del producto',
                            }
                        )
                        
                        if created:
                            print(f"    ✓ Imagen creada: {timestamp}")
                            imagenes_creadas += 1
                        else:
                            print(f"    - Imagen ya existe: {timestamp}")
            
            print(f"  Total imágenes creadas: {imagenes_creadas}\n")
            
        except ProductoOfertado.DoesNotExist:
            print(f"  ⚠️  Producto no encontrado en BD: {codigo}\n")
        except Exception as e:
            print(f"  ❌ Error: {e}\n")

print("\nProceso completado.")

# Mostrar resumen
total_productos = ProductoOfertado.objects.count()
productos_con_imagenes = ProductoOfertado.objects.filter(imagenes__isnull=False).distinct().count()
total_imagenes = ImagenReferenciaProductoOfertado.objects.count()

print(f"\nResumen:")
print(f"- Total productos: {total_productos}")
print(f"- Productos con imágenes: {productos_con_imagenes}")
print(f"- Total imágenes en BD: {total_imagenes}")