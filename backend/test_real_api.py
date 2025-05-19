#!/usr/bin/env python
"""
Script para verificar la respuesta real de la API.
"""
import requests
import json

# Primero hagamos login para obtener token
login_url = "http://localhost:8000/api/auth/login/"
login_data = {
    "username": "test",
    "password": "test123"
}

try:
    # Intentar login
    login_response = requests.post(login_url, json=login_data)
    print(f"Login response status: {login_response.status_code}")
    
    if login_response.status_code == 200:
        # Obtener cookies
        cookies = login_response.cookies
        
        # Hacer petición a productos
        productos_url = "http://localhost:8000/api/productos/productos-ofertados/"
        response = requests.get(productos_url, cookies=cookies)
        
        print(f"\nAPI Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Buscar productos con imágenes
            productos = data.get('results', [])
            for producto in productos:
                if producto.get('imagenes'):
                    print(f"\nProducto: {producto['nombre']}")
                    print(f"ID: {producto['id']}")
                    print(f"Código: {producto['code']}")
                    
                    for i, imagen in enumerate(producto['imagenes']):
                        print(f"\n  Imagen {i + 1}:")
                        print(f"    thumbnail_url: {imagen.get('thumbnail_url')}")
                        print(f"    imagen_url: {imagen.get('imagen_url')}")
                        print(f"    webp_url: {imagen.get('webp_url')}")
                        
                        # Verificar si la URL es absoluta o relativa
                        thumb_url = imagen.get('thumbnail_url', '')
                        if thumb_url:
                            print(f"    Es URL absoluta: {thumb_url.startswith('http')}")
                            print(f"    Empieza con /media/: {thumb_url.startswith('/media/')}")
                    break
            else:
                print("\nNo se encontraron productos con imágenes")
        else:
            print(f"Error en la API: {response.text}")
    else:
        print(f"Error en login: {login_response.text}")
        
except Exception as e:
    print(f"Error: {e}")
    
# También probar sin autenticación
print("\n\n=== Prueba sin autenticación ===")
try:
    response = requests.get("http://localhost:8000/api/productos/productos-ofertados/")
    print(f"Status sin auth: {response.status_code}")
    if response.status_code != 200:
        print(f"Respuesta: {response.text[:200]}...")
except Exception as e:
    print(f"Error: {e}")