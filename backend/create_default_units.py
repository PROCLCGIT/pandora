#!/usr/bin/env python
"""
Script para crear unidades por defecto en la base de datos
"""
import os
import sys
import django

# Configurar el entorno de Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pandora.settings')
django.setup()

from basic.models import Unidad

def create_default_units():
    """Crear unidades por defecto"""
    print("Creando unidades por defecto...")
    
    # Crear unidad por defecto con ID=1
    unidad, created = Unidad.objects.get_or_create(
        id=1,
        defaults={
            'nombre': 'UNIDAD',
            'code': 'UND'
        }
    )
    
    if created:
        print(f'✓ Creada unidad por defecto: {unidad.nombre} (ID={unidad.id})')
    else:
        print(f'• Unidad por defecto ya existe: {unidad.nombre} (ID={unidad.id})')
    
    # Crear otras unidades comunes
    common_units = [
        {'nombre': 'CAJA', 'code': 'CJA'},
        {'nombre': 'PAQUETE', 'code': 'PQT'},
        {'nombre': 'FRASCO', 'code': 'FRS'},
        {'nombre': 'KILOGRAMO', 'code': 'KG'},
        {'nombre': 'LITRO', 'code': 'LT'},
        {'nombre': 'METRO', 'code': 'MT'},
        {'nombre': 'PIEZA', 'code': 'PZA'},
    ]
    
    for unit_data in common_units:
        unidad, created = Unidad.objects.get_or_create(
            code=unit_data['code'],
            defaults=unit_data
        )
        if created:
            print(f'✓ Creada unidad: {unidad.nombre}')
        else:
            print(f'• Unidad ya existe: {unidad.nombre}')
    
    # Mostrar todas las unidades
    print("\nUnidades disponibles en el sistema:")
    for unidad in Unidad.objects.all().order_by('id'):
        print(f"  ID={unidad.id}: {unidad.nombre} ({unidad.code})")

if __name__ == '__main__':
    create_default_units()