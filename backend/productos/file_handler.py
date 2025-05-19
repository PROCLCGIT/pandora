"""
Módulo para el procesamiento de archivos relacionados con productos.
Proporciona funciones para manejar imágenes y documentos, incluyendo validación,
redimensionamiento, optimización y almacenamiento.
"""

import os
import uuid
import logging
from datetime import datetime
from pathlib import Path
from typing import Tuple, Dict, Any, Optional

from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.core.exceptions import ValidationError

# Configurar logging para este módulo
logger = logging.getLogger(__name__)

# Constantes para configuración
IMAGE_MAX_SIZE_MB = 5
DOCUMENT_MAX_SIZE_MB = 10
ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
ALLOWED_DOCUMENT_TYPES = [
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
]

def _generate_filepath(file_obj, base_path: str) -> str:
    """
    Genera una ruta única para guardar un archivo.

    Args:
        file_obj: El archivo a guardar
        base_path: Directorio base para guardar el archivo

    Returns:
        str: Ruta completa donde se guardará el archivo
    """
    # Crear dirección por fecha para organizar los archivos
    today = datetime.now()
    date_path = f"{today.year}/{today.month:02d}/{today.day:02d}"

    # Obtener extensión original del archivo
    filename = file_obj.name
    extension = os.path.splitext(filename)[1].lower()

    # Generar nombre único para evitar colisiones
    unique_id = uuid.uuid4().hex[:10]
    safe_filename = f"{unique_id}{extension}"

    # Construir ruta completa
    return os.path.join(base_path, date_path, safe_filename)

def _validate_file(file_obj, max_size_mb: int, allowed_types: list) -> Tuple[bool, str]:
    """
    Valida un archivo por tamaño y tipo MIME.

    Args:
        file_obj: El archivo a validar
        max_size_mb: Tamaño máximo en MB
        allowed_types: Lista de tipos MIME permitidos

    Returns:
        Tuple[bool, str]: (es_válido, mensaje_error)
    """
    # Validar tamaño
    max_size_bytes = max_size_mb * 1024 * 1024
    if file_obj.size > max_size_bytes:
        return False, f"El archivo excede el tamaño máximo permitido de {max_size_mb}MB"

    # Validar tipo MIME
    content_type = getattr(file_obj, 'content_type', '')
    if not content_type and hasattr(file_obj, 'name'):
        # Intento de detección por extensión si no hay content_type
        extension = os.path.splitext(file_obj.name)[1].lower()
        if extension in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
            content_type = f"image/{extension[1:]}"
        elif extension == '.pdf':
            content_type = 'application/pdf'
        # Añadir más mapeos si es necesario

    if content_type not in allowed_types:
        return False, f"Tipo de archivo no permitido. Tipos permitidos: {', '.join(t.split('/')[-1] for t in allowed_types)}"

    return True, ""

def process_image(image_file, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Procesa una imagen para un producto, validando, optimizando y guardando.

    Args:
        image_file: Objeto de archivo de imagen
        metadata: Diccionario con metadatos como descripción, is_primary, etc.

    Returns:
        Dict: Diccionario con información de la imagen procesada
    """
    if not image_file:
        raise ValidationError("No se proporcionó ningún archivo de imagen")

    # Validar archivo
    is_valid, error_message = _validate_file(image_file, IMAGE_MAX_SIZE_MB, ALLOWED_IMAGE_TYPES)
    if not is_valid:
        raise ValidationError(error_message)

    # Generar ruta para guardar
    media_path = getattr(settings, 'MEDIA_ROOT', 'media')
    image_base_path = os.path.join('productos', 'imagenes')
    relative_path = _generate_filepath(image_file, image_base_path)

    # Asegurar que el directorio exista
    full_dir = os.path.join(media_path, os.path.dirname(relative_path))
    os.makedirs(full_dir, exist_ok=True)

    # Guardar archivo
    try:
        full_path = default_storage.save(relative_path, ContentFile(image_file.read()))
        logger.info(f"Imagen guardada en: {full_path}")

        # Preparar respuesta
        result = {
            'path': full_path,
            'filename': os.path.basename(full_path),
            'content_type': getattr(image_file, 'content_type', ''),
            'size': image_file.size,
        }

        # Añadir metadatos si se proporcionaron
        if metadata:
            result.update({
                'descripcion': metadata.get('descripcion', ''),
                'is_primary': metadata.get('is_primary', False),
                'orden': metadata.get('orden', 0),
            })

        return result
    except Exception as e:
        logger.error(f"Error al procesar imagen: {str(e)}")
        raise ValidationError(f"Error al procesar la imagen: {str(e)}")

def process_document(document_file, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Procesa un documento para un producto, validando y guardando.

    Args:
        document_file: Objeto de archivo de documento
        metadata: Diccionario con metadatos como título, tipo, etc.

    Returns:
        Dict: Diccionario con información del documento procesado
    """
    if not document_file:
        raise ValidationError("No se proporcionó ningún archivo de documento")

    # Validar archivo
    is_valid, error_message = _validate_file(document_file, DOCUMENT_MAX_SIZE_MB, ALLOWED_DOCUMENT_TYPES)
    if not is_valid:
        raise ValidationError(error_message)

    # Generar ruta para guardar
    media_path = getattr(settings, 'MEDIA_ROOT', 'media')
    doc_base_path = os.path.join('productos', 'documentos')
    relative_path = _generate_filepath(document_file, doc_base_path)

    # Asegurar que el directorio exista
    full_dir = os.path.join(media_path, os.path.dirname(relative_path))
    os.makedirs(full_dir, exist_ok=True)

    # Guardar archivo
    try:
        full_path = default_storage.save(relative_path, ContentFile(document_file.read()))
        logger.info(f"Documento guardado en: {full_path}")

        # Preparar respuesta
        result = {
            'path': full_path,
            'filename': os.path.basename(full_path),
            'content_type': getattr(document_file, 'content_type', ''),
            'size': document_file.size,
        }

        # Añadir metadatos si se proporcionaron
        if metadata:
            result.update({
                'titulo': metadata.get('titulo', ''),
                'tipo_documento': metadata.get('tipo_documento', ''),
                'descripcion': metadata.get('descripcion', ''),
                'is_public': metadata.get('is_public', False),
            })

        return result
    except Exception as e:
        logger.error(f"Error al procesar documento: {str(e)}")
        raise ValidationError(f"Error al procesar el documento: {str(e)}")

def get_file_data(filepath: str) -> Optional[Dict[str, Any]]:
    """
    Obtiene información sobre un archivo almacenado.

    Args:
        filepath: Ruta relativa al archivo dentro del MEDIA_ROOT

    Returns:
        Dict o None: Información del archivo o None si no existe
    """
    if not filepath:
        return None

    try:
        media_path = getattr(settings, 'MEDIA_ROOT', 'media')
        full_path = os.path.join(media_path, filepath)

        if not os.path.exists(full_path):
            return None

        file_stats = os.stat(full_path)
        extension = os.path.splitext(filepath)[1].lower()

        # Determinar tipo de archivo por extensión
        content_type = 'application/octet-stream'  # Por defecto
        if extension in ['.jpg', '.jpeg']:
            content_type = 'image/jpeg'
        elif extension == '.png':
            content_type = 'image/png'
        elif extension == '.gif':
            content_type = 'image/gif'
        elif extension == '.webp':
            content_type = 'image/webp'
        elif extension == '.pdf':
            content_type = 'application/pdf'
        # Añadir más mapeos si es necesario

        return {
            'path': filepath,
            'filename': os.path.basename(filepath),
            'content_type': content_type,
            'size': file_stats.st_size,
            'last_modified': datetime.fromtimestamp(file_stats.st_mtime),
        }
    except Exception as e:
        logger.error(f"Error al obtener información del archivo {filepath}: {str(e)}")
        return None

def delete_file(filepath: str) -> bool:
    """
    Elimina un archivo del almacenamiento.

    Args:
        filepath: Ruta relativa al archivo dentro del MEDIA_ROOT

    Returns:
        bool: True si se eliminó correctamente, False en caso contrario
    """
    if not filepath:
        return False

    try:
        if default_storage.exists(filepath):
            default_storage.delete(filepath)
            logger.info(f"Archivo eliminado: {filepath}")
            return True
        else:
            logger.warning(f"Archivo no encontrado para eliminar: {filepath}")
            return False
    except Exception as e:
        logger.error(f"Error al eliminar archivo {filepath}: {str(e)}")
        return False


class FileHandler:
    """
    Clase para el procesamiento y gestión de archivos relacionados con productos.
    Provee métodos para procesar imágenes, documentos y gestionar archivos.
    """
    # Rutas de medios configurables desde settings.py
    @staticmethod
    def get_media_paths():
        """
        Obtiene las rutas de medios configuradas o utiliza valores por defecto.
        """
        from django.conf import settings

        # Rutas para imágenes
        productos_media_path = getattr(settings, 'PRODUCTOS_MEDIA_PATH',
                                     os.path.join('productos', 'imagenes'))

        # Rutas para documentos
        productos_docs_path = getattr(settings, 'PRODUCTOS_DOCS_PATH',
                                    os.path.join('productos', 'documentos'))

        return {
            'images': productos_media_path,
            'documents': productos_docs_path
        }

    @staticmethod
    def process_image(image_file, producto, index=0, metadata=None, user=None, log_prefix=""):
        """
        Procesa y crea una imagen para un producto.

        Args:
            image_file: Archivo de imagen
            producto: Instancia del modelo de producto (ProductoOfertado o ProductoDisponible)
            index: Índice para ordenamiento si se procesan múltiples archivos
            metadata: Diccionario con metadatos (descripcion, is_primary, etc.)
            user: Usuario que realiza la acción
            log_prefix: Prefijo para los mensajes de log para mejor identificación

        Returns:
            tuple: (success, error, created_object)
        """
        from .models import ImagenReferenciaProductoOfertado, ImagenProductoDisponible

        if not image_file:
            return False, "No se proporcionó ningún archivo de imagen", None

        try:
            print(f"{log_prefix} Procesando imagen {image_file.name}")

            # Validar archivo
            is_valid, error_message = _validate_file(
                image_file,
                IMAGE_MAX_SIZE_MB,
                ALLOWED_IMAGE_TYPES
            )

            if not is_valid:
                print(f"{log_prefix} Error de validación: {error_message}")
                return False, error_message, None

            # Preparar metadatos con valores por defecto si no se proporcionan
            if metadata is None:
                metadata = {}

            descripcion = metadata.get('descripcion', f"Imagen para {getattr(producto, 'nombre', 'producto')}")
            is_primary = metadata.get('is_primary', index == 0)  # Primera imagen por defecto es primaria
            orden = metadata.get('orden', index)

            # Generar ruta y guardar archivo
            paths = FileHandler.get_media_paths()
            image_base_path = paths['images']
            relative_path = _generate_filepath(image_file, image_base_path)

            # Guardar el archivo
            full_path = default_storage.save(relative_path, ContentFile(image_file.read()))

            # Determinar tipo de modelo para crear la imagen asociada
            if hasattr(producto, 'imagenes_referencia'):
                print(f"{log_prefix} Creando ImagenReferenciaProductoOfertado")
                imagen = ImagenReferenciaProductoOfertado(
                    producto_ofertado=producto,
                    imagen=full_path,  # Field is called 'imagen' in the model, not 'ruta_imagen'
                    descripcion=descripcion,
                    is_primary=is_primary,
                    orden=orden
                )
                if user and hasattr(imagen, 'created_by'):
                    imagen.created_by = user
                imagen.save()

            elif hasattr(producto, 'imagenes'):
                print(f"{log_prefix} Creando ImagenProductoDisponible")
                imagen = ImagenProductoDisponible(
                    producto_disponible=producto,
                    imagen=full_path,  # Field is called 'imagen' in the model, not 'ruta_imagen'
                    descripcion=descripcion,
                    is_primary=is_primary,
                    orden=orden
                )
                if user and hasattr(imagen, 'created_by'):
                    imagen.created_by = user
                imagen.save()

            else:
                print(f"{log_prefix} ❌ Error: Tipo de producto no soportado")
                return False, "Tipo de producto no soportado para imagen", None

            print(f"{log_prefix} ✅ Imagen guardada correctamente: {full_path}")
            return True, "", imagen

        except Exception as e:
            import traceback
            print(f"{log_prefix} ❌ Error al procesar imagen: {str(e)}")
            print(traceback.format_exc())
            return False, str(e), None

    @staticmethod
    def process_document(document_file, producto, index=0, metadata=None, user=None, log_prefix=""):
        """
        Procesa y crea un documento para un producto.

        Args:
            document_file: Archivo de documento
            producto: Instancia del modelo de producto (ProductoOfertado o ProductoDisponible)
            index: Índice para ordenamiento si se procesan múltiples archivos
            metadata: Diccionario con metadatos (titulo, tipo_documento, descripcion, etc.)
            user: Usuario que realiza la acción
            log_prefix: Prefijo para los mensajes de log para mejor identificación

        Returns:
            tuple: (success, error, created_object)
        """
        from .models import DocumentoProductoOfertado, DocumentoProductoDisponible

        if not document_file:
            return False, "No se proporcionó ningún archivo de documento", None

        try:
            print(f"{log_prefix} Procesando documento {document_file.name}")

            # Validar archivo
            is_valid, error_message = _validate_file(
                document_file,
                DOCUMENT_MAX_SIZE_MB,
                ALLOWED_DOCUMENT_TYPES
            )

            if not is_valid:
                print(f"{log_prefix} Error de validación: {error_message}")
                return False, error_message, None

            # Preparar metadatos con valores por defecto si no se proporcionan
            if metadata is None:
                metadata = {}

            titulo = metadata.get('titulo', f"Documento {index+1}")
            tipo_documento = metadata.get('tipo_documento', 'otros')
            descripcion = metadata.get('descripcion', f"Documento para {getattr(producto, 'nombre', 'producto')}")
            is_public = metadata.get('is_public', True)

            # Generar ruta y guardar archivo
            paths = FileHandler.get_media_paths()
            doc_base_path = paths['documents']
            relative_path = _generate_filepath(document_file, doc_base_path)

            # Guardar el archivo
            full_path = default_storage.save(relative_path, ContentFile(document_file.read()))

            # Determinar tipo de modelo para crear el documento asociado
            if hasattr(producto, 'documentos_producto'):
                print(f"{log_prefix} Creando DocumentoProductoOfertado")
                documento = DocumentoProductoOfertado(
                    producto_ofertado=producto,
                    documento=full_path,  # Field is called 'documento' in the model, not 'ruta_documento'
                    titulo=titulo,
                    tipo_documento=tipo_documento,
                    descripcion=descripcion,
                    is_public=is_public
                )
                if user and hasattr(documento, 'created_by'):
                    documento.created_by = user
                documento.save()

            elif hasattr(producto, 'documentos'):
                print(f"{log_prefix} Creando DocumentoProductoDisponible")
                documento = DocumentoProductoDisponible(
                    producto_disponible=producto,
                    documento=full_path,  # Field is called 'documento' in the model, not 'ruta_documento'
                    titulo=titulo,
                    tipo_documento=tipo_documento,
                    descripcion=descripcion,
                    is_public=is_public
                )
                if user and hasattr(documento, 'created_by'):
                    documento.created_by = user
                documento.save()

            else:
                print(f"{log_prefix} ❌ Error: Tipo de producto no soportado")
                return False, "Tipo de producto no soportado para documento", None

            print(f"{log_prefix} ✅ Documento guardado correctamente: {full_path}")
            return True, "", documento

        except Exception as e:
            import traceback
            print(f"{log_prefix} ❌ Error al procesar documento: {str(e)}")
            print(traceback.format_exc())
            return False, str(e), None

    @staticmethod
    def get_file_info(filepath):
        """
        Obtiene información detallada sobre un archivo.

        Args:
            filepath: Ruta relativa al archivo

        Returns:
            dict: Información del archivo o None si no existe
        """
        return get_file_data(filepath)

    @staticmethod
    def delete_file(filepath):
        """
        Elimina un archivo del sistema.

        Args:
            filepath: Ruta relativa al archivo

        Returns:
            bool: True si se eliminó correctamente, False en caso contrario
        """
        return delete_file(filepath)