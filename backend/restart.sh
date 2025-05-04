#!/bin/bash
# Script para reiniciar el servidor de desarrollo con los nuevos cambios

echo "Activando entorno virtual..."
source .venv/bin/activate

echo "Verificando dependencias..."
pip install django-environ pillow

echo "Deteniendo procesos anteriores del servidor de Django (si existen)..."
pkill -f "python manage.py runserver" || true

echo "Aplicando migraciones pendientes..."
python manage.py migrate

echo "Iniciando servidor de desarrollo..."
python manage.py runserver 0.0.0.0:8000
