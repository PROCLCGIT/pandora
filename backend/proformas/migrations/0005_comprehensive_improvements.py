# Generated migration for proformas improvements

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.core.validators
from decimal import Decimal


class Migration(migrations.Migration):

    dependencies = [
        ('proformas', '0004_update_existing_tax_configs'),
        ('directorio', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Agregar campos de auditoría a Proforma
        migrations.AddField(
            model_name='proforma',
            name='created_by',
            field=models.ForeignKey(
                blank=True, null=True, on_delete=django.db.models.deletion.PROTECT,
                related_name='proformas_creadas', to=settings.AUTH_USER_MODEL,
                verbose_name='Creado por', help_text='Usuario que creó la proforma'
            ),
        ),
        migrations.AddField(
            model_name='proforma',
            name='modified_by',
            field=models.ForeignKey(
                blank=True, null=True, on_delete=django.db.models.deletion.PROTECT,
                related_name='proformas_modificadas', to=settings.AUTH_USER_MODEL,
                verbose_name='Modificado por', help_text='Usuario que modificó la proforma por última vez'
            ),
        ),
        migrations.AddField(
            model_name='proforma',
            name='vendedor',
            field=models.ForeignKey(
                blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL,
                related_name='proformas', to='directorio.vendedor',
                verbose_name='Vendedor asignado', help_text='Vendedor responsable de la proforma'
            ),
        ),

        # Agregar nuevos campos técnicos a ProformaItem
        migrations.AddField(
            model_name='proformaitem',
            name='cpc',
            field=models.CharField(blank=True, max_length=50, verbose_name='CPC',
                                   help_text='Código de Clasificación de Productos y Servicios'),
        ),
        migrations.AddField(
            model_name='proformaitem',
            name='cudim',
            field=models.CharField(blank=True, max_length=50, verbose_name='CUDIM',
                                   help_text='Código Único de Dispositivos Médicos'),
        ),
        migrations.AddField(
            model_name='proformaitem',
            name='nombre_generico',
            field=models.CharField(blank=True, max_length=200, verbose_name='Nombre genérico',
                                   help_text='Denominación genérica del producto'),
        ),
        migrations.AddField(
            model_name='proformaitem',
            name='especificaciones_tecnicas',
            field=models.TextField(blank=True, verbose_name='Especificaciones técnicas',
                                   help_text='Detalles técnicos del producto'),
        ),
        migrations.AddField(
            model_name='proformaitem',
            name='presentacion',
            field=models.CharField(blank=True, max_length=100, verbose_name='Presentación',
                                   help_text='Presentación comercial del producto'),
        ),
        migrations.AddField(
            model_name='proformaitem',
            name='lote',
            field=models.CharField(blank=True, max_length=100, verbose_name='Lote',
                                   help_text='Número de lote del producto'),
        ),
        migrations.AddField(
            model_name='proformaitem',
            name='fecha_vencimiento',
            field=models.DateField(blank=True, null=True, verbose_name='Fecha de vencimiento',
                                   help_text='Fecha de vencimiento del producto'),
        ),
        migrations.AddField(
            model_name='proformaitem',
            name='registro_sanitario',
            field=models.CharField(blank=True, max_length=100, verbose_name='Registro sanitario',
                                   help_text='Número de registro sanitario'),
        ),
        migrations.AddField(
            model_name='proformaitem',
            name='serial',
            field=models.CharField(blank=True, max_length=100, verbose_name='Serial',
                                   help_text='Número de serie del producto'),
        ),
        migrations.AddField(
            model_name='proformaitem',
            name='modelo',
            field=models.CharField(blank=True, max_length=100, verbose_name='Modelo',
                                   help_text='Modelo del producto'),
        ),
        migrations.AddField(
            model_name='proformaitem',
            name='marca',
            field=models.CharField(blank=True, max_length=100, verbose_name='Marca',
                                   help_text='Marca comercial del producto'),
        ),
        migrations.AddField(
            model_name='proformaitem',
            name='notas',
            field=models.TextField(blank=True, verbose_name='Notas',
                                   help_text='Notas internas del ítem'),
        ),
        migrations.AddField(
            model_name='proformaitem',
            name='observaciones',
            field=models.TextField(blank=True, verbose_name='Observaciones',
                                   help_text='Observaciones adicionales para el cliente'),
        ),

        # Agregar campos adicionales al historial
        migrations.AddField(
            model_name='proformahistorial',
            name='campo_modificado',
            field=models.CharField(blank=True, max_length=100, verbose_name='Campo modificado',
                                   help_text='Campo específico que fue modificado'),
        ),
        migrations.AddField(
            model_name='proformahistorial',
            name='valor_anterior',
            field=models.TextField(blank=True, verbose_name='Valor anterior',
                                   help_text='Valor anterior del campo'),
        ),
        migrations.AddField(
            model_name='proformahistorial',
            name='valor_nuevo',
            field=models.TextField(blank=True, verbose_name='Valor nuevo',
                                   help_text='Nuevo valor del campo'),
        ),
        migrations.AddField(
            model_name='proformahistorial',
            name='ip_address',
            field=models.GenericIPAddressField(blank=True, null=True, verbose_name='Dirección IP',
                                               help_text='Dirección IP desde donde se realizó el cambio'),
        ),

        # Agregar nuevos campos a ConfiguracionProforma
        migrations.AddField(
            model_name='configuracionproforma',
            name='mostrar_campos_tecnicos',
            field=models.BooleanField(default=True, verbose_name='Mostrar campos técnicos',
                                      help_text='Mostrar CPC, CUDIM, registro sanitario, etc.'),
        ),
        migrations.AddField(
            model_name='configuracionproforma',
            name='prefijo_numeracion',
            field=models.CharField(default='PRO', max_length=10, verbose_name='Prefijo de numeración',
                                   help_text='Prefijo para el número de proforma'),
        ),
        migrations.AddField(
            model_name='configuracionproforma',
            name='longitud_numero',
            field=models.IntegerField(
                default=4, validators=[django.core.validators.MinValueValidator(3),
                                       django.core.validators.MaxValueValidator(10)],
                verbose_name='Longitud del número',
                help_text='Cantidad de dígitos en la numeración secuencial'
            ),
        ),
        migrations.AddField(
            model_name='configuracionproforma',
            name='notificar_vencimiento',
            field=models.BooleanField(default=True, verbose_name='Notificar vencimiento',
                                      help_text='Enviar notificaciones cuando las proformas estén por vencer'),
        ),
        migrations.AddField(
            model_name='configuracionproforma',
            name='dias_aviso_vencimiento',
            field=models.IntegerField(
                default=3, validators=[django.core.validators.MinValueValidator(1),
                                       django.core.validators.MaxValueValidator(30)],
                verbose_name='Días de aviso de vencimiento',
                help_text='Días antes del vencimiento para enviar notificación'
            ),
        ),

        # Actualizar validadores en campos existentes
        migrations.AlterField(
            model_name='proforma',
            name='subtotal',
            field=models.DecimalField(
                decimal_places=2, default=Decimal('0.00'), max_digits=15,
                validators=[django.core.validators.MinValueValidator(Decimal('0.00'))],
                verbose_name='Subtotal', help_text='Subtotal antes de impuestos'
            ),
        ),
        migrations.AlterField(
            model_name='proforma',
            name='impuesto',
            field=models.DecimalField(
                decimal_places=2, default=Decimal('0.00'), max_digits=15,
                validators=[django.core.validators.MinValueValidator(Decimal('0.00'))],
                verbose_name='Impuesto', help_text='Monto total de impuestos'
            ),
        ),
        migrations.AlterField(
            model_name='proforma',
            name='total',
            field=models.DecimalField(
                decimal_places=2, default=Decimal('0.00'), max_digits=15,
                validators=[django.core.validators.MinValueValidator(Decimal('0.00'))],
                verbose_name='Total', help_text='Monto total de la proforma'
            ),
        ),
        migrations.AlterField(
            model_name='proforma',
            name='porcentaje_impuesto',
            field=models.DecimalField(
                decimal_places=2, default=Decimal('15.00'), max_digits=5,
                validators=[django.core.validators.MinValueValidator(Decimal('0.00')),
                            django.core.validators.MaxValueValidator(Decimal('100.00'))],
                verbose_name='Porcentaje de impuesto', help_text='Porcentaje de impuesto aplicable'
            ),
        ),

        # Actualizar campos en ProformaItem con validadores
        migrations.AlterField(
            model_name='proformaitem',
            name='cantidad',
            field=models.DecimalField(
                decimal_places=2, max_digits=15,
                validators=[django.core.validators.MinValueValidator(Decimal('0.01'))],
                verbose_name='Cantidad', help_text='Cantidad del ítem'
            ),
        ),
        migrations.AlterField(
            model_name='proformaitem',
            name='precio_unitario',
            field=models.DecimalField(
                decimal_places=2, max_digits=15,
                validators=[django.core.validators.MinValueValidator(Decimal('0.00'))],
                verbose_name='Precio unitario', help_text='Precio por unidad'
            ),
        ),
        migrations.AlterField(
            model_name='proformaitem',
            name='porcentaje_descuento',
            field=models.DecimalField(
                decimal_places=2, default=0, max_digits=5,
                validators=[django.core.validators.MinValueValidator(Decimal('0.00')),
                            django.core.validators.MaxValueValidator(Decimal('100.00'))],
                verbose_name='Porcentaje de descuento', help_text='Descuento aplicable en porcentaje'
            ),
        ),
        migrations.AlterField(
            model_name='proformaitem',
            name='total',
            field=models.DecimalField(
                decimal_places=2, default=Decimal('0.00'), max_digits=15,
                validators=[django.core.validators.MinValueValidator(Decimal('0.00'))],
                verbose_name='Total', help_text='Total del ítem'
            ),
        ),

        # Agregar choice para historial
        migrations.AlterField(
            model_name='proformahistorial',
            name='accion',
            field=models.CharField(
                choices=[
                    ('creacion', 'Creación'), ('modificacion', 'Modificación'),
                    ('envio', 'Envío'), ('aprobacion', 'Aprobación'),
                    ('rechazo', 'Rechazo'), ('vencimiento', 'Vencimiento'),
                    ('conversion', 'Conversión a Orden'), ('duplicacion', 'Duplicación')
                ],
                max_length=20, verbose_name='Acción'
            ),
        ),

        # Actualizar related_names
        migrations.AlterField(
            model_name='proforma',
            name='cliente',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT, related_name='proformas',
                to='directorio.cliente', verbose_name='Cliente',
                help_text='Cliente al que se dirige la proforma'
            ),
        ),
        migrations.AlterField(
            model_name='proforma',
            name='empresa',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT, related_name='proformas',
                to='basic.empresaclc', verbose_name='Empresa',
                help_text='Empresa que emite la proforma'
            ),
        ),
        migrations.AlterField(
            model_name='proforma',
            name='tipo_contratacion',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT, related_name='proformas',
                to='basic.tipocontratacion', verbose_name='Tipo de contratación',
                help_text='Tipo de contratación aplicable'
            ),
        ),

        # Crear índices para mejor rendimiento
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS proformas_proforma_numero_idx ON proformas_proforma (numero);",
            reverse_sql="DROP INDEX IF EXISTS proformas_proforma_numero_idx;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS proformas_proforma_cliente_fecha_idx ON proformas_proforma (cliente_id, fecha_emision);",
            reverse_sql="DROP INDEX IF EXISTS proformas_proforma_cliente_fecha_idx;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS proformas_proforma_estado_vencimiento_idx ON proformas_proforma (estado, fecha_vencimiento);",
            reverse_sql="DROP INDEX IF EXISTS proformas_proforma_estado_vencimiento_idx;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS proformas_proforma_empresa_fecha_idx ON proformas_proforma (empresa_id, fecha_emision);",
            reverse_sql="DROP INDEX IF EXISTS proformas_proforma_empresa_fecha_idx;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS proformas_proformaitem_proforma_orden_idx ON proformas_proformaitem (proforma_id, orden);",
            reverse_sql="DROP INDEX IF EXISTS proformas_proformaitem_proforma_orden_idx;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS proformas_proformaitem_codigo_idx ON proformas_proformaitem (codigo);",
            reverse_sql="DROP INDEX IF EXISTS proformas_proformaitem_codigo_idx;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS proformas_proformahistorial_proforma_created_idx ON proformas_proformahistorial (proforma_id, created_at DESC);",
            reverse_sql="DROP INDEX IF EXISTS proformas_proformahistorial_proforma_created_idx;"
        ),
    ]
