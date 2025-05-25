from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    dependencies = [
        ('directorio', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, unique=True)),
                ('color_code', models.CharField(default='#4F46E5', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Etiqueta',
                'verbose_name_plural': 'Etiquetas',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='ClienteTag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('cliente', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='directorio.cliente')),
                ('tag', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='directorio.tag')),
            ],
            options={
                'verbose_name': 'Etiqueta de cliente',
                'verbose_name_plural': 'Etiquetas de clientes',
                'unique_together': {('cliente', 'tag')},
            },
        ),
        migrations.CreateModel(
            name='ProveedorTag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('proveedor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='directorio.proveedor')),
                ('tag', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='directorio.tag')),
            ],
            options={
                'verbose_name': 'Etiqueta de proveedor',
                'verbose_name_plural': 'Etiquetas de proveedores',
                'unique_together': {('proveedor', 'tag')},
            },
        ),
        migrations.CreateModel(
            name='ContactoTag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('contacto', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='directorio.contacto')),
                ('tag', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='directorio.tag')),
            ],
            options={
                'verbose_name': 'Etiqueta de contacto',
                'verbose_name_plural': 'Etiquetas de contactos',
                'unique_together': {('contacto', 'tag')},
            },
        ),
        migrations.AddField(
            model_name='cliente',
            name='tags',
            field=models.ManyToManyField(blank=True, related_name='clientes', through='directorio.ClienteTag', to='directorio.tag'),
        ),
        migrations.AddField(
            model_name='proveedor',
            name='tags',
            field=models.ManyToManyField(blank=True, related_name='proveedores', through='directorio.ProveedorTag', to='directorio.tag'),
        ),
        migrations.AddField(
            model_name='contacto',
            name='tags',
            field=models.ManyToManyField(blank=True, related_name='contactos', through='directorio.ContactoTag', to='directorio.tag'),
        ),
    ]

