#!/usr/bin/env python
"""
Script para crear una página de debug.
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pandora.settings')
django.setup()

from productos.models import ProductoOfertado, ImagenReferenciaProductoOfertado

# Obtener producto con imagen
producto = ProductoOfertado.objects.filter(imagenes__isnull=False).first()
if producto:
    imagen = producto.imagenes.first()
    
    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <title>Debug Miniatura - {producto.nombre}</title>
    <style>
        body {{ font-family: Arial, sans-serif; padding: 20px; }}
        .test {{ border: 2px solid #ccc; padding: 20px; margin: 20px 0; }}
        img {{ max-width: 300px; border: 2px solid #888; }}
        .success {{ border-color: green; }}
        .error {{ border-color: red; }}
    </style>
</head>
<body>
    <h1>Test de Miniatura para: {producto.nombre}</h1>
    
    <div class="test">
        <h2>Información del Producto</h2>
        <p><strong>ID:</strong> {producto.id}</p>
        <p><strong>Código:</strong> {producto.code}</p>
        <p><strong>Nombre:</strong> {producto.nombre}</p>
    </div>
    
    <div class="test">
        <h2>Información de la Imagen</h2>
        <p><strong>ID:</strong> {imagen.id}</p>
        <p><strong>Thumbnail DB:</strong> {imagen.imagen_thumbnail}</p>
        <p><strong>Thumbnail URL:</strong> {imagen.thumbnail_url}</p>
    </div>
    
    <div class="test">
        <h2>Test 1: URL Relativa</h2>
        <p><strong>URL:</strong> {imagen.thumbnail_url}</p>
        <img src="{imagen.thumbnail_url}" alt="Test 1" onload="this.classList.add('success')" onerror="this.classList.add('error')">
    </div>
    
    <div class="test">
        <h2>Test 2: URL Absoluta Puerto 8000</h2>
        <p><strong>URL:</strong> http://localhost:8000{imagen.thumbnail_url}</p>
        <img src="http://localhost:8000{imagen.thumbnail_url}" alt="Test 2" onload="this.classList.add('success')" onerror="this.classList.add('error')">
    </div>
    
    <div class="test">
        <h2>Test 3: URL Absoluta Puerto 3000 (con proxy)</h2>
        <p><strong>URL:</strong> http://localhost:3000{imagen.thumbnail_url}</p>
        <img src="http://localhost:3000{imagen.thumbnail_url}" alt="Test 3" onload="this.classList.add('success')" onerror="this.classList.add('error')">
    </div>
    
    <div class="test">
        <h2>Test 4: Fetch API</h2>
        <button onclick="testFetch()">Test Fetch</button>
        <pre id="fetch-result"></pre>
    </div>
    
    <script>
        async function testFetch() {{
            const url = 'http://localhost:8000{imagen.thumbnail_url}';
            const resultDiv = document.getElementById('fetch-result');
            
            try {{
                const response = await fetch(url);
                resultDiv.textContent = `Status: ${{response.status}}\\nType: ${{response.type}}\\nHeaders:\\n${{JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}}`;
            }} catch (error) {{
                resultDiv.textContent = `Error: ${{error.message}}`;
            }}
        }}
    </script>
</body>
</html>"""
    
    # Guardar archivo HTML
    with open('/Users/clc/Ws/Appclc/pandora/public/debug-miniatura.html', 'w') as f:
        f.write(html_content)
    
    print("Archivo de debug creado en: /Users/clc/Ws/Appclc/pandora/public/debug-miniatura.html")
    print(f"Abrir en el navegador: http://localhost:3000/debug-miniatura.html")
else:
    print("No se encontraron productos con imágenes")