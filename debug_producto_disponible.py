#!/usr/bin/env python3

import os
import sys
import django

# Setup Django
sys.path.append('/Users/clc/Ws/Appclc/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pandora.settings')
django.setup()

from productos.models import ProductoDisponible
from productos.serializers import ProductoDisponibleSerializer
from basic.models import Categoria

def test_producto_creation():
    print("=== Testing ProductoDisponible Creation ===")
    
    # Check if we have a category
    try:
        categoria = Categoria.objects.first()
        if not categoria:
            print("❌ No hay categorías en la base de datos")
            return
        print(f"✅ Usando categoría: {categoria.nombre} (ID: {categoria.id})")
    except Exception as e:
        print(f"❌ Error accediendo a categorías: {e}")
        return
    
    # Test data
    test_data = {
        'code': 'TEST-001',
        'nombre': 'Producto Test',
        'modelo': 'Modelo Test',
        'id_categoria': categoria.id,
    }
    
    print(f"📤 Datos de prueba: {test_data}")
    
    # Test serializer validation
    try:
        serializer = ProductoDisponibleSerializer(data=test_data)
        print(f"📝 Validando con serializer...")
        
        if serializer.is_valid():
            print("✅ Datos válidos según serializer")
            
            # Try to save
            try:
                producto = serializer.save()
                print(f"✅ Producto creado exitosamente: {producto.id}")
                print(f"   - Code: {producto.code}")
                print(f"   - Nombre: {producto.nombre}")
                print(f"   - Modelo: {producto.modelo}")
                print(f"   - Categoría: {producto.id_categoria}")
            except Exception as save_error:
                print(f"❌ Error al guardar: {save_error}")
                import traceback
                traceback.print_exc()
        else:
            print(f"❌ Errores de validación: {serializer.errors}")
            
    except Exception as e:
        print(f"❌ Error en serializer: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_producto_creation()