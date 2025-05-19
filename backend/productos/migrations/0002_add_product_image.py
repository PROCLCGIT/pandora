from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    dependencies = [
        ('productos', '0001_initial'),  # Asegúrate de que este sea el nombre correcto de tu última migración
        ('auth', '0012_alter_user_first_name_max_length'),  # Dependencia para el modelo de usuario
    ]

    operations = [
        migrations.CreateModel(
            name='ProductImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(blank=True, max_length=200, verbose_name='Título')),
                ('original', models.ImageField(upload_to='products/original/', verbose_name='Imagen Original')),
                ('alt_text', models.CharField(blank=True, max_length=255, verbose_name='Texto alternativo')),
                ('order', models.IntegerField(default=0, verbose_name='Orden')),
                ('is_featured', models.BooleanField(default=False, verbose_name='Imagen destacada')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='product_images_created', to='users.user', verbose_name='Creado por')),
                ('producto_disponible', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='imagenes_procesadas', to='productos.productodisponible', verbose_name='Producto Disponible')),
                ('producto_ofertado', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='imagenes_procesadas', to='productos.productoofertado', verbose_name='Producto Ofertado')),
            ],
            options={
                'verbose_name': 'Imagen de Producto',
                'verbose_name_plural': 'Imágenes de Productos',
                'ordering': ['order', 'created_at'],
            },
        ),
    ]
