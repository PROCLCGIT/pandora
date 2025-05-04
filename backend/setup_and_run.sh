#!/bin/bash
# Script para configurar y ejecutar la aplicación

echo "Activando entorno virtual..."
source .venv/bin/activate

echo "Instalando/actualizando dependencias..."
pip install django-environ pillow

echo "Verificando si hay migraciones pendientes..."
python manage.py makemigrations
python manage.py makemigrations users

echo "Aplicando migraciones..."
python manage.py migrate

echo "¿Deseas crear un superusuario? (s/n)"
read crear_usuario

if [ "$crear_usuario" = "s" ] || [ "$crear_usuario" = "S" ]; then
    echo "Creando superusuario..."
    python manage.py createsuperuser
fi

echo "Ejecutando el servidor de desarrollo..."
python manage.py runserver

# Si el servidor se detiene, limpiar recursos
echo "Servidor detenido. Limpiando recursos..."