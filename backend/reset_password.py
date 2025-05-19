#!/usr/bin/env python
"""
Script para cambiar la contraseña del usuario clc.
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pandora.settings')
django.setup()

from users.models import User

# Obtener el usuario clc
try:
    user = User.objects.get(username='clc')
    print(f"Usuario encontrado: {user.username} ({user.email})")
    
    # Cambiar la contraseña
    user.set_password('clc')
    user.save()
    
    print("Contraseña cambiada exitosamente a 'clc'")
    
    # Verificar que funciona
    if user.check_password('clc'):
        print("✓ Contraseña verificada correctamente")
    else:
        print("✗ Error al verificar la contraseña")
        
except User.DoesNotExist:
    print("Usuario 'clc' no encontrado")
except Exception as e:
    print(f"Error: {e}")