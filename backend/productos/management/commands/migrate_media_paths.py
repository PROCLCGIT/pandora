"""
Script de migración para actualizar las rutas de archivos multimedia
a la nueva estructura organizativa.
"""

import os
import shutil
from django.core.management.base import BaseCommand
from django.conf import settings
from django.db import transaction
from productos.models import (
    ImagenReferenciaProductoOfertado, 
    ImagenProductoDisponible,
    DocumentoProductoOfertado,
    DocumentoProductoDisponible
)

class Command(BaseCommand):
    help = 'Migra las rutas de archivos multimedia a la nueva estructura'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Simula la migración sin hacer cambios reales',
        )
        parser.add_argument(
            '--backup',
            action='store_true',
            help='Crear backup de los archivos antes de migrar',
        )
    
    def handle(self, *args, **options):
        self.dry_run = options['dry_run']
        self.backup = options['backup']
        
        if self.dry_run:
            self.stdout.write(self.style.WARNING('MODO DRY RUN - No se harán cambios reales'))
        
        # Migrar imágenes de productos ofertados
        self.migrate_imagenes_ofertados()
        
        # Migrar imágenes de productos disponibles
        self.migrate_imagenes_disponibles()
        
        # Migrar documentos de productos ofertados
        self.migrate_documentos_ofertados()
        
        # Migrar documentos de productos disponibles
        self.migrate_documentos_disponibles()
        
        self.stdout.write(self.style.SUCCESS('Migración completada exitosamente'))
    
    def migrate_imagenes_ofertados(self):
        """Migra las imágenes de productos ofertados"""
        self.stdout.write('Migrando imágenes de productos ofertados...')
        
        imagenes = ImagenReferenciaProductoOfertado.objects.all()
        total = imagenes.count()
        
        for i, imagen in enumerate(imagenes, 1):
            self.stdout.write(f'Procesando imagen {i}/{total}')
            self._migrate_file(imagen, 'imagen', 'ofertado')
    
    def migrate_imagenes_disponibles(self):
        """Migra las imágenes de productos disponibles"""
        self.stdout.write('Migrando imágenes de productos disponibles...')
        
        imagenes = ImagenProductoDisponible.objects.all()
        total = imagenes.count()
        
        for i, imagen in enumerate(imagenes, 1):
            self.stdout.write(f'Procesando imagen {i}/{total}')
            self._migrate_file(imagen, 'imagen', 'disponible')
    
    def migrate_documentos_ofertados(self):
        """Migra los documentos de productos ofertados"""
        self.stdout.write('Migrando documentos de productos ofertados...')
        
        documentos = DocumentoProductoOfertado.objects.all()
        total = documentos.count()
        
        for i, documento in enumerate(documentos, 1):
            self.stdout.write(f'Procesando documento {i}/{total}')
            self._migrate_file(documento, 'documento', 'ofertado')
    
    def migrate_documentos_disponibles(self):
        """Migra los documentos de productos disponibles"""
        self.stdout.write('Migrando documentos de productos disponibles...')
        
        documentos = DocumentoProductoDisponible.objects.all()
        total = documentos.count()
        
        for i, documento in enumerate(documentos, 1):
            self.stdout.write(f'Procesando documento {i}/{total}')
            self._migrate_file(documento, 'documento', 'disponible')
    
    def _migrate_file(self, obj, field_name, product_type):
        """Migra un archivo individual"""
        field = getattr(obj, field_name)
        if not field or not field.name:
            return
        
        old_path = field.name
        media_root = settings.MEDIA_ROOT
        old_full_path = os.path.join(media_root, old_path)
        
        if not os.path.exists(old_full_path):
            self.stdout.write(self.style.WARNING(f'Archivo no encontrado: {old_path}'))
            return
        
        # Obtener información del producto
        if product_type == 'ofertado':
            producto = obj.producto_ofertado
            type_folder = 'productosofertados'
        else:
            producto = obj.producto_disponible
            type_folder = 'productosdisponibles'
        
        # Obtener información del producto
        product_code = getattr(producto, 'code', 'sin-codigo')
        
        # Usar solo el código como nombre de carpeta
        folder_name = product_code
        
        # Determinar tipo de archivo
        if field_name == 'imagen':
            file_type_folder = 'imagenes'
        else:
            file_type_folder = 'documentos'
        
        # Construir nueva ruta
        path_parts = ['productos', type_folder, file_type_folder, folder_name]
        
        # Mantener nombre de archivo original o generar uno nuevo
        filename = os.path.basename(old_path)
        new_path = os.path.join(*path_parts, filename)
        new_full_path = os.path.join(media_root, new_path)
        
        # Crear directorio si no existe
        new_dir = os.path.dirname(new_full_path)
        if not self.dry_run:
            os.makedirs(new_dir, exist_ok=True)
        
        # Mover archivo si no es dry run
        if not self.dry_run:
            if self.backup:
                # Crear backup
                backup_path = old_full_path + '.bak'
                shutil.copy2(old_full_path, backup_path)
            
            # Mover archivo
            try:
                shutil.move(old_full_path, new_full_path)
                # Actualizar referencia en base de datos
                field.name = new_path
                obj.save()
                self.stdout.write(self.style.SUCCESS(f'Movido: {old_path} -> {new_path}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error al mover {old_path}: {e}'))
        else:
            self.stdout.write(f'DRY RUN: {old_path} -> {new_path}')