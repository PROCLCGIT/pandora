#!/bin/bash
# Script para aplicar las migraciones y configuraciones

echo "Activando entorno virtual..."
source .venv/bin/activate

echo "Instalando/actualizando dependencias..."
pip install django-environ pillow

echo "Creando migraciones para nuevo modelo de usuario..."
python manage.py makemigrations users

echo "Aplicando todas las migraciones..."
python manage.py migrate

echo "Creando superusuario (sigue las instrucciones)..."
python manage.py createsuperuser

echo "Ejecutando recolección de archivos estáticos..."
python manage.py collectstatic --noinput

echo "Migración completada exitosamente!"