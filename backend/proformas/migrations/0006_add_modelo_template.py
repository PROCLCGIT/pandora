# Generated migration for adding modelo_template to Proforma

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('proformas', '0005_comprehensive_improvements'),
    ]

    operations = [
        # Agregar campo modelo_template a Proforma
        migrations.AddField(
            model_name='proforma',
            name='modelo_template',
            field=models.CharField(
                choices=[
                    ('basico', 'Básico - Código, Descripción, Unidad, Cantidad, Precio, Total'),
                    ('cudin', 'CUDIN - CUDIN, Descripción, Unidad, Cantidad, Precio, Total'),
                    ('cudin_modelo', 'CUDIN + Modelo - CUDIN, Descripción, Modelo, Unidad, Cantidad, Precio, Total'),
                    ('cudin_serie', 'CUDIN + Serie - CUDIN, Descripción, Serie, Unidad, Cantidad, Precio, Total'),
                    ('sanitario', 'Sanitario - CUDIN, Descripción, Lote, Registro Sanitario, Unidad, Cantidad, Precio, Total'),
                    ('completo', 'Completo - Código, CUDIN, Registro, Fecha Venc., Descripción, Modelo, Unidad, Cantidad, Precio, Total')
                ],
                default='basico',
                max_length=20,
                verbose_name='Modelo de plantilla',
                help_text='Selecciona el modelo de campos que se mostrarán en la tabla de productos'
            ),
        ),

        # Agregar nueva acción al historial para cambios de modelo
        migrations.AlterField(
            model_name='proformahistorial',
            name='accion',
            field=models.CharField(
                choices=[
                    ('creacion', 'Creación'), 
                    ('modificacion', 'Modificación'),
                    ('envio', 'Envío'), 
                    ('aprobacion', 'Aprobación'),
                    ('rechazo', 'Rechazo'), 
                    ('vencimiento', 'Vencimiento'),
                    ('conversion', 'Conversión a Orden'), 
                    ('duplicacion', 'Duplicación'),
                    ('cambio_modelo', 'Cambio de Modelo de Template')
                ],
                max_length=20, 
                verbose_name='Acción'
            ),
        ),

        # Hacer que el campo codigo del ProformaItem sea opcional (blank=True)
        # ya que algunos modelos no usan código sino CUDIN
        migrations.AlterField(
            model_name='proformaitem',
            name='codigo',
            field=models.CharField(
                blank=True,
                max_length=50, 
                verbose_name='Código',
                help_text='Código del producto o ítem'
            ),
        ),

        # Crear índice para el nuevo campo modelo_template para optimizar consultas
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS proformas_proforma_modelo_template_idx ON proformas_proforma (modelo_template);",
            reverse_sql="DROP INDEX IF EXISTS proformas_proforma_modelo_template_idx;"
        ),

        # Crear índice compuesto para cudim en ProformaItem (para los nuevos modelos)
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS proformas_proformaitem_cudim_idx ON proformas_proformaitem (cudim);",
            reverse_sql="DROP INDEX IF EXISTS proformas_proformaitem_cudim_idx;"
        ),

        # Índice compuesto para tipo_item para optimizar consultas por tipo
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS proformas_proformaitem_tipo_item_idx ON proformas_proformaitem (tipo_item);",
            reverse_sql="DROP INDEX IF EXISTS proformas_proformaitem_tipo_item_idx;"
        ),
    ]
