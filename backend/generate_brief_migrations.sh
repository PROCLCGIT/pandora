#!/bin/bash

# Script para generar migraciones del módulo Brief
# Ubicación: /backend/

echo "🚀 Generando migraciones para el módulo Brief..."

# Activar entorno virtual si existe
if [ -d ".venv" ]; then
    echo "Activando entorno virtual..."
    source .venv/bin/activate
fi

# Generar migraciones
echo "Generando migraciones..."
python manage.py makemigrations brief

# Mostrar las migraciones generadas
echo "Migraciones generadas:"
ls -la brief/migrations/

echo "✅ Migraciones generadas correctamente."
echo ""
echo "Para aplicar las migraciones ejecuta:"
echo "python manage.py migrate brief"
