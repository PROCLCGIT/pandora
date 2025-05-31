#!/usr/bin/env python3

import os
import sys
import django
from django.test import RequestFactory
from django.contrib.auth import get_user_model

# Setup Django
sys.path.append('/Users/clc/Ws/Appclc/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pandora.settings')
django.setup()

from productos.views import ProductoDisponibleViewSet
from basic.models import Categoria

def test_viewset_create():
    print("=== Testing ProductoDisponibleViewSet Create ===")
    
    # Get a user
    User = get_user_model()
    try:
        user = User.objects.first()
        if not user:
            print("❌ No hay usuarios en la base de datos")
            return
        print(f"✅ Usuario: {user.username}")
    except Exception as e:
        print(f"❌ Error accediendo a usuarios: {e}")
        return
    
    # Get a category
    try:
        categoria = Categoria.objects.first()
        if not categoria:
            print("❌ No hay categorías en la base de datos")
            return
        print(f"✅ Categoría: {categoria.nombre} (ID: {categoria.id})")
    except Exception as e:
        print(f"❌ Error accediendo a categorías: {e}")
        return
    
    # Create request
    factory = RequestFactory()
    
    # Test data similar to what frontend sends
    post_data = {
        'code': 'TEST-002',
        'nombre': 'Producto Test ViewSet',
        'modelo': 'Modelo Test',
        'id_categoria': str(categoria.id),  # Frontend sends as string
        'precio_venta_privado': '100.00',
        'is_active': 'true',
    }
    
    print(f"📤 Datos POST: {post_data}")
    
    # Create POST request
    request = factory.post('/api/productos/productos-disponibles/', data=post_data)
    request.user = user  # Add authenticated user
    
    # Test the viewset
    try:
        viewset = ProductoDisponibleViewSet()
        viewset.request = request
        viewset.format_kwarg = None
        
        print("🔄 Llamando al método create del viewset...")
        response = viewset.create(request)
        
        print(f"✅ Respuesta del viewset:")
        print(f"   - Status: {response.status_code}")
        print(f"   - Data: {response.data}")
        
    except Exception as e:
        print(f"❌ Error en viewset create: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_viewset_create()