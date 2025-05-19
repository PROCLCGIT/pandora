"""
Configuración de directorios de medios para la aplicación productos.
Este módulo se encarga de crear los directorios necesarios para almacenar
imágenes y documentos relacionados con productos.
"""

import os
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class MediaConfig:
    """Configuración centralizada para archivos multimedia de productos"""
    
    # Tamaños máximos de archivo (en MB)
    IMAGE_MAX_SIZE_MB = getattr(settings, 'PRODUCT_IMAGE_MAX_SIZE_MB', 5)
    DOCUMENT_MAX_SIZE_MB = getattr(settings, 'PRODUCT_DOCUMENT_MAX_SIZE_MB', 10)
    
    # Tipos MIME permitidos
    ALLOWED_IMAGE_TYPES = getattr(settings, 'PRODUCT_ALLOWED_IMAGE_TYPES', [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
    ])
    
    ALLOWED_DOCUMENT_TYPES = getattr(settings, 'PRODUCT_ALLOWED_DOCUMENT_TYPES', [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'application/rtf',
        'application/zip'
    ])
    
    # Estructura de directorios
    BASE_MEDIA_PATH = getattr(settings, 'PRODUCTOS_BASE_PATH', 'productos')
    IMAGE_SUBPATH = getattr(settings, 'PRODUCTOS_IMAGE_SUBPATH', 'imagenes')
    DOCUMENT_SUBPATH = getattr(settings, 'PRODUCTOS_DOCUMENT_SUBPATH', 'documentos')
    
    # Configuración de categorización
    USE_CATEGORY_PATH = getattr(settings, 'PRODUCTOS_USE_CATEGORY_PATH', True)
    USE_PRODUCT_CODE_PATH = getattr(settings, 'PRODUCTOS_USE_PRODUCT_CODE_PATH', True)
    USE_DATE_PATH = getattr(settings, 'PRODUCTOS_USE_DATE_PATH', True)
    
    # Configuración de nombres de archivo
    FILE_NAME_PATTERN = getattr(settings, 'PRODUCTOS_FILE_NAME_PATTERN', '{code}_{timestamp}_{unique_id}{ext}')
    
    # Configuración de procesamiento de imágenes
    IMAGE_QUALITY = getattr(settings, 'IMAGE_QUALITY', 85)
    IMAGE_FORMAT = getattr(settings, 'IMAGE_FORMAT', 'WEBP')
    PRESERVE_ORIGINAL = getattr(settings, 'PRODUCTOS_PRESERVE_ORIGINAL', False)
    
    # Tamaños de imagen
    IMAGE_SIZES = getattr(settings, 'PRODUCT_IMAGE_SIZES', {
        'thumbnail': (150, 150),
        'standard': (800, 600),
        'large': (1200, 900),
    })
    
    @classmethod
    def get_image_path(cls):
        """Retorna la ruta base para imágenes"""
        return os.path.join(cls.BASE_MEDIA_PATH, cls.IMAGE_SUBPATH)
    
    @classmethod
    def get_document_path(cls):
        """Retorna la ruta base para documentos"""
        return os.path.join(cls.BASE_MEDIA_PATH, cls.DOCUMENT_SUBPATH)
    
    @classmethod
    def get_path_for_type(cls, file_type):
        """Retorna la ruta base según el tipo de archivo"""
        if file_type == 'image':
            return cls.get_image_path()
        elif file_type == 'document':
            return cls.get_document_path()
        else:
            return cls.BASE_MEDIA_PATH


class MediaPolicy:
    """Políticas para el manejo de archivos multimedia"""
    
    @staticmethod
    def validate_file_size(file_obj, max_size_mb):
        """Valida el tamaño del archivo"""
        max_size_bytes = max_size_mb * 1024 * 1024
        if file_obj.size > max_size_bytes:
            return False, f"El archivo excede el tamaño máximo permitido de {max_size_mb}MB"
        return True, ""
    
    @staticmethod
    def validate_file_type(file_obj, allowed_types):
        """Valida el tipo MIME del archivo"""
        content_type = getattr(file_obj, 'content_type', '')
        
        # Intento de detección por extensión si no hay content_type
        if not content_type and hasattr(file_obj, 'name'):
            import mimetypes
            content_type, _ = mimetypes.guess_type(file_obj.name)
        
        if content_type not in allowed_types:
            return False, f"Tipo de archivo no permitido. Tipos permitidos: {', '.join(allowed_types)}"
        
        return True, ""
    
    @staticmethod
    def sanitize_filename(filename):
        """Sanitiza un nombre de archivo para uso seguro"""
        import re
        # Remover caracteres especiales y espacios
        filename = re.sub(r'[^\w\s.-]', '', filename)
        filename = filename.replace(' ', '_')
        return filename.lower()
    
    @staticmethod
    def sanitize_path_component(component):
        """Sanitiza un componente de ruta para uso seguro"""
        import re
        # Remover caracteres especiales y espacios
        component = re.sub(r'[^\w\s.-]', '', component)
        component = component.replace(' ', '-')
        return component.lower()


def setup_media_directories():
    """
    Crea los directorios necesarios para almacenar imágenes y documentos
    relacionados con productos si no existen.
    """
    try:
        # Obtener directorio base de medios
        media_path = getattr(settings, 'MEDIA_ROOT', 'media')
        
        # Estructura de directorios mejorada
        directories = [
            os.path.join(media_path, MediaConfig.BASE_MEDIA_PATH),
            os.path.join(media_path, MediaConfig.get_image_path()),
            os.path.join(media_path, MediaConfig.get_image_path(), 'ofertado'),
            os.path.join(media_path, MediaConfig.get_image_path(), 'disponible'),
            os.path.join(media_path, MediaConfig.get_document_path()),
            os.path.join(media_path, MediaConfig.get_document_path(), 'ofertado'),
            os.path.join(media_path, MediaConfig.get_document_path(), 'disponible'),
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