# Generated by Django 5.2 on 2025-05-15 02:13

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Collection',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='Nombre')),
                ('description', models.TextField(blank=True, verbose_name='Descripción')),
                ('icon', models.CharField(default='collection', max_length=50, verbose_name='Icono')),
                ('cover_image', models.ImageField(blank=True, null=True, upload_to='collections/covers/', verbose_name='Imagen de portada')),
                ('color_code', models.CharField(default='#8B5CF6', max_length=20, verbose_name='Código de color')),
                ('is_public', models.BooleanField(default=False, verbose_name='Público')),
                ('share_token', models.UUIDField(default=uuid.uuid4, editable=False, verbose_name='Token de compartición')),
                ('expiry_date', models.DateTimeField(blank=True, null=True, verbose_name='Fecha de expiración')),
                ('include_annotations', models.BooleanField(default=True, verbose_name='Incluir anotaciones')),
                ('include_comments', models.BooleanField(default=False, verbose_name='Incluir comentarios')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')),
            ],
            options={
                'verbose_name': 'Colección',
                'verbose_name_plural': 'Colecciones',
                'ordering': ['-updated_at'],
            },
        ),
        migrations.CreateModel(
            name='CollectionActivity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('activity_type', models.CharField(choices=[('view', 'Visualización'), ('export', 'Exportación'), ('share', 'Compartir'), ('print', 'Impresión'), ('edit', 'Edición'), ('add', 'Agregar documento'), ('remove', 'Quitar documento')], max_length=20, verbose_name='Tipo de actividad')),
                ('details', models.TextField(blank=True, verbose_name='Detalles')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')),
            ],
            options={
                'verbose_name': 'Actividad de colección',
                'verbose_name_plural': 'Actividades de colecciones',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='CollectionDocument',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.PositiveIntegerField(default=0, verbose_name='Orden')),
                ('notes', models.TextField(blank=True, verbose_name='Notas')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')),
            ],
            options={
                'verbose_name': 'Documento en colección',
                'verbose_name_plural': 'Documentos en colecciones',
                'ordering': ['order', 'created_at'],
            },
        ),
        migrations.CreateModel(
            name='CollectionPermission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('permission_type', models.CharField(choices=[('view', 'Visualización'), ('edit', 'Edición'), ('admin', 'Administración')], default='view', max_length=20, verbose_name='Tipo de permiso')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')),
            ],
            options={
                'verbose_name': 'Permiso de colección',
                'verbose_name_plural': 'Permisos de colecciones',
            },
        ),
        migrations.CreateModel(
            name='Document',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255, verbose_name='Título')),
                ('description', models.TextField(blank=True, verbose_name='Descripción')),
                ('file_name', models.CharField(max_length=255, verbose_name='Nombre del archivo')),
                ('file_type', models.CharField(max_length=20, verbose_name='Tipo de archivo')),
                ('file_size', models.IntegerField(default=0, verbose_name='Tamaño (bytes)')),
                ('file_path', models.CharField(max_length=500, verbose_name='Ruta del archivo')),
                ('is_favorite', models.BooleanField(default=False, verbose_name='Favorito')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')),
                ('deleted_at', models.DateTimeField(blank=True, null=True, verbose_name='Fecha de eliminación')),
                ('is_deleted', models.BooleanField(default=False, verbose_name='Eliminado')),
                ('file', models.FileField(null=True, upload_to='documents/%Y/%m/%d/', verbose_name='Archivo')),
            ],
            options={
                'verbose_name': 'Documento',
                'verbose_name_plural': 'Documentos',
                'ordering': ['-updated_at'],
            },
        ),
        migrations.CreateModel(
            name='DocumentActivity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('activity_type', models.CharField(choices=[('view', 'Visualización'), ('download', 'Descarga'), ('edit', 'Edición'), ('share', 'Compartir'), ('delete', 'Eliminación'), ('restore', 'Restauración'), ('version', 'Nueva versión'), ('comment', 'Comentario')], max_length=20, verbose_name='Tipo de actividad')),
                ('details', models.TextField(blank=True, verbose_name='Detalles')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')),
            ],
            options={
                'verbose_name': 'Actividad de documento',
                'verbose_name_plural': 'Actividades de documentos',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='DocumentComment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField(verbose_name='Contenido')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')),
            ],
            options={
                'verbose_name': 'Comentario',
                'verbose_name_plural': 'Comentarios',
                'ordering': ['created_at'],
            },
        ),
        migrations.CreateModel(
            name='DocumentPermission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('permission_type', models.CharField(choices=[('view', 'Visualización'), ('edit', 'Edición'), ('admin', 'Administración')], default='view', max_length=20, verbose_name='Tipo de permiso')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')),
            ],
            options={
                'verbose_name': 'Permiso de documento',
                'verbose_name_plural': 'Permisos de documentos',
            },
        ),
        migrations.CreateModel(
            name='DocumentTag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')),
            ],
            options={
                'verbose_name': 'Etiqueta de documento',
                'verbose_name_plural': 'Etiquetas de documentos',
            },
        ),
        migrations.CreateModel(
            name='DocumentVersion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('version_number', models.CharField(max_length=20, verbose_name='Número de versión')),
                ('file_path', models.CharField(max_length=500, verbose_name='Ruta del archivo')),
                ('file_size', models.IntegerField(default=0, verbose_name='Tamaño (bytes)')),
                ('change_notes', models.TextField(blank=True, verbose_name='Notas de cambio')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')),
                ('file', models.FileField(null=True, upload_to='document_versions/%Y/%m/%d/', verbose_name='Archivo')),
            ],
            options={
                'verbose_name': 'Versión de documento',
                'verbose_name_plural': 'Versiones de documentos',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Group',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='Nombre')),
                ('slug', models.SlugField(max_length=120, unique=True, verbose_name='Slug')),
                ('description', models.TextField(blank=True, verbose_name='Descripción')),
                ('icon', models.CharField(default='folder', max_length=50, verbose_name='Icono')),
                ('color_code', models.CharField(default='#64748B', max_length=20, verbose_name='Código de color')),
                ('is_public', models.BooleanField(default=False, verbose_name='Público')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')),
            ],
            options={
                'verbose_name': 'Grupo',
                'verbose_name_plural': 'Grupos',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='GroupMember',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(choices=[('admin', 'Administrador'), ('editor', 'Editor'), ('viewer', 'Visualizador')], default='viewer', max_length=20, verbose_name='Rol')),
                ('joined_at', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de unión')),
            ],
            options={
                'verbose_name': 'Miembro de grupo',
                'verbose_name_plural': 'Miembros de grupos',
            },
        ),
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, unique=True, verbose_name='Nombre')),
                ('color_code', models.CharField(default='#4F46E5', max_length=20, verbose_name='Código de color')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')),
            ],
            options={
                'verbose_name': 'Etiqueta',
                'verbose_name_plural': 'Etiquetas',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='Nombre')),
                ('description', models.TextField(blank=True, verbose_name='Descripción')),
                ('color_code', models.CharField(default='#3B82F6', max_length=20, verbose_name='Código de color')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='subcategories', to='docmanager.category', verbose_name='Categoría padre')),
            ],
            options={
                'verbose_name': 'Categoría',
                'verbose_name_plural': 'Categorías',
                'ordering': ['name'],
            },
        ),
    ]
