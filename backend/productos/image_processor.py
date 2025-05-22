"""
Procesador de imágenes para productos.
Maneja la creación de múltiples versiones de una imagen:
- Original
- Miniatura
- WebP optimizado
"""

import os
import io
from PIL import Image
from django.conf import settings
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class ImageProcessor:
    """Clase para procesar imágenes de productos y generar diferentes versiones"""
    
    def __init__(self):
        self.config = getattr(settings, 'IMAGE_PROCESSING_CONFIG', {
            'preserve_original': True,
            'create_thumbnail': True,
            'create_webp': True,
            'webp_quality': 85,
            'thumbnail_quality': 75,
            'original_folder': 'originales',
            'thumbnail_folder': 'miniaturas',
            'webp_folder': 'webp',
        })
        
        self.sizes = getattr(settings, 'PRODUCT_IMAGE_SIZES', {
            'thumbnail': (150, 150),
            'webp': (800, 600),
            'original': None,
        })
        
        self.quality_settings = getattr(settings, 'IMAGE_QUALITY_SETTINGS', {
            'thumbnail': 75,
            'webp': 85,
            'original': 100,
        })
    
    def process_image(self, image_file, base_path):
        """
        Procesa una imagen y genera las versiones requeridas.
        
        Args:
            image_file: Archivo de imagen original
            base_path: Ruta base donde guardar las imágenes (ej: productos/productosofertados/imagenes/CODE)
            
        Returns:
            dict: Diccionario con las rutas de las imágenes generadas
        """
        results = {}
        # Usar microsegundos para evitar colisiones entre nombres
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
        
        try:
            # Abrir la imagen original
            img = Image.open(image_file)
            
            # Convertir a RGB si es necesario (para imágenes con transparencia)
            if img.mode in ('RGBA', 'LA', 'P'):
                # Crear fondo blanco
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            
            # Guardar imagen original
            if self.config.get('preserve_original', True):
                original_path = self._save_original(img, base_path, timestamp, image_file.name)
                results['original'] = original_path
            
            # Crear miniatura
            if self.config.get('create_thumbnail', True):
                thumbnail_path = self._create_thumbnail(img, base_path, timestamp)
                results['thumbnail'] = thumbnail_path
            
            # Crear versión WebP
            if self.config.get('create_webp', True):
                webp_path = self._create_webp(img, base_path, timestamp)
                results['webp'] = webp_path
            
            return results
            
        except Exception as e:
            logger.error(f"Error al procesar imagen: {str(e)}")
            raise
    
    def _save_original(self, img, base_path, timestamp, original_filename):
        """Guarda la imagen original"""
        # Obtener extensión original
        ext = os.path.splitext(original_filename)[1].lower()
        if not ext:
            ext = '.jpg'
        
        # Crear carpeta para originales
        original_folder = os.path.join(base_path, self.config['original_folder'])
        os.makedirs(original_folder, exist_ok=True)
        
        # Nombre del archivo
        filename = f"original_{timestamp}{ext}"
        filepath = os.path.join(original_folder, filename)
        
        # Guardar imagen
        quality = self.quality_settings.get('original', 100)
        img.save(filepath, quality=quality, optimize=True)
        
        return filepath
    
    def _create_thumbnail(self, img, base_path, timestamp):
        """Crea una miniatura de la imagen"""
        # Obtener tamaño de miniatura
        size = self.sizes.get('thumbnail', (150, 150))
        
        # Crear carpeta para miniaturas
        thumbnail_folder = os.path.join(base_path, self.config['thumbnail_folder'])
        os.makedirs(thumbnail_folder, exist_ok=True)
        
        # Crear miniatura
        thumbnail = img.copy()
        thumbnail.thumbnail(size, Image.Resampling.LANCZOS)
        
        # Nombre del archivo
        filename = f"miniatura_{timestamp}.jpg"
        filepath = os.path.join(thumbnail_folder, filename)
        
        # Guardar miniatura
        quality = self.quality_settings.get('thumbnail', 75)
        thumbnail.save(filepath, 'JPEG', quality=quality, optimize=True)
        
        return filepath
    
    def _create_webp(self, img, base_path, timestamp):
        """Crea una versión WebP optimizada"""
        # Obtener tamaño para WebP
        size = self.sizes.get('webp', (800, 600))
        
        # Crear carpeta para WebP
        webp_folder = os.path.join(base_path, self.config['webp_folder'])
        os.makedirs(webp_folder, exist_ok=True)
        
        # Redimensionar si es necesario
        webp_img = img.copy()
        if size and (img.width > size[0] or img.height > size[1]):
            webp_img.thumbnail(size, Image.Resampling.LANCZOS)
        
        # Nombre del archivo
        filename = f"webp_{timestamp}.webp"
        filepath = os.path.join(webp_folder, filename)
        
        # Guardar como WebP
        quality = self.quality_settings.get('webp', 85)
        webp_img.save(filepath, 'WEBP', quality=quality, optimize=True)
        
        return filepath
    
    @staticmethod
    def get_image_versions(base_path, timestamp=None):
        """
        Obtiene todas las versiones de imagen disponibles en una carpeta.
        Si se proporciona un timestamp, busca las imágenes específicas con ese timestamp.
        
        Args:
            base_path: Ruta base de la carpeta del producto
            timestamp: Opcional - Timestamp específico de la imagen a buscar
            
        Returns:
            dict: Diccionario con las rutas de cada versión
        """
        versions = {}
        
        # Buscar imagen original
        original_folder = os.path.join(base_path, 'originales')
        if os.path.exists(original_folder):
            if timestamp:
                # Buscar por timestamp específico
                originals = [f for f in os.listdir(original_folder) 
                            if f.startswith('original_') and timestamp in f]
                # Si encontramos archivos específicos con el timestamp, usar el primero
                if originals:
                    versions['original'] = os.path.join(original_folder, originals[0])
            else:
                # Comportamiento anterior - tomar el último cuando no hay timestamp
                originals = [f for f in os.listdir(original_folder) if f.startswith('original_')]
                if originals:
                    versions['original'] = os.path.join(original_folder, originals[-1])
        
        # Buscar miniatura
        thumbnail_folder = os.path.join(base_path, 'miniaturas')
        if os.path.exists(thumbnail_folder):
            if timestamp:
                thumbnails = [f for f in os.listdir(thumbnail_folder) 
                              if f.startswith('miniatura_') and timestamp in f]
                # Si encontramos archivos específicos con el timestamp, usar el primero
                if thumbnails:
                    versions['thumbnail'] = os.path.join(thumbnail_folder, thumbnails[0])
            else:
                thumbnails = [f for f in os.listdir(thumbnail_folder) if f.startswith('miniatura_')]
                if thumbnails:
                    versions['thumbnail'] = os.path.join(thumbnail_folder, thumbnails[-1])
        
        # Buscar WebP
        webp_folder = os.path.join(base_path, 'webp')
        if os.path.exists(webp_folder):
            if timestamp:
                webps = [f for f in os.listdir(webp_folder) 
                         if f.startswith('webp_') and timestamp in f]
                # Si encontramos archivos específicos con el timestamp, usar el primero
                if webps:
                    versions['webp'] = os.path.join(webp_folder, webps[0])
            else:
                webps = [f for f in os.listdir(webp_folder) if f.startswith('webp_')]
                if webps:
                    versions['webp'] = os.path.join(webp_folder, webps[-1])
        
        return versions