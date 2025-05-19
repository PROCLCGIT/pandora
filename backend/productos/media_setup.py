"""
Configuración de directorios de medios para la aplicación productos.
Este módulo se encarga de crear los directorios necesarios para almacenar
imágenes y documentos relacionados con productos.
"""

import os
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

def setup_media_directories():
    """
    Crea los directorios necesarios para almacenar imágenes y documentos
    relacionados con productos si no existen.
    """
    try:
        # Obtener directorio base de medios
        media_path = getattr(settings, 'MEDIA_ROOT', 'media')
        
        # Directorios a crear
        directories = [
            os.path.join(media_path, 'productos'),
            os.path.join(media_path, 'productos', 'imagenes'),
            os.path.join(media_path, 'productos', 'documentos'),
        ]
        
        # Crear cada directorio si no existe
        for directory in directories:
            if not os.path.exists(directory):
                os.makedirs(directory, exist_ok=True)
                logger.info(f"Directorio creado: {directory}")
            else:
                logger.debug(f"Directorio ya existe: {directory}")
                
        logger.info("Configuración de directorios de medios completada")
        return True
        
    except Exception as e:
        logger.error(f"Error al configurar directorios de medios: {str(e)}")
        return False