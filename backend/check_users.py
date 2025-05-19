#!/usr/bin/env python
"""
Script para verificar usuarios existentes.
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pandora.settings')
django.setup()

from users.models import User

# Listar usuarios
users = User.objects.all()
print(f"Total de usuarios: {users.count()}")

for user in users:
    print(f"\nUsuario: {user.username}")
    print(f"Email: {user.email}")
    print(f"Activo: {user.is_active}")
    print(f"Es staff: {user.is_staff}")
    print(f"Es superusuario: {user.is_superuser}")

# Crear un usuario de prueba si no existe
if not User.objects.filter(username='test').exists():
    print("\n\nCreando usuario de prueba...")
    User.objects.create_user(
        username='test',
        password='test123',
        email='test@example.com',
        is_active=True
    )
    print("Usuario 'test' creado con contraseña 'test123'")