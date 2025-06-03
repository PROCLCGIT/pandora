# backend/proformas/models.py

from django.db import models, transaction
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.db.models import Q, Sum, Max
from decimal import Decimal, ROUND_HALF_UP
from basic.models import TimeStampedModel
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


class ProformaManager(models.Manager):
    """Manager personalizado para Proformas con consultas optimizadas."""
    
    def activas(self):
        """Retorna proformas que no están vencidas ni convertidas."""
        return self.exclude(estado__in=['vencida', 'convertida'])
    
    def vencidas(self):
        """Retorna proformas vencidas."""
        hoy = timezone.now().date()
        return self.filter(fecha_vencimiento__lt=hoy, estado='enviada')
    
    def por_cliente(self, cliente_id):
        """Retorna proformas de un cliente específico."""
        return self.filter(cliente_id=cliente_id)
    
    def del_periodo(self, fecha_inicio, fecha_fin):
        """Retorna proformas de un período específico."""
        return self.filter(fecha_emision__range=[fecha_inicio, fecha_fin])
    
    def con_totales_agregados(self):
        """Retorna proformas con totales agregados."""
        return self.select_related('cliente', 'empresa').prefetch_related('items')


class Proforma(TimeStampedModel):
    """
    Modelo para la gestión de proformas o cotizaciones.
    """
    # Opciones para el campo de estado
    class EstadoProforma(models.TextChoices):
        BORRADOR = 'borrador', _('Borrador')
        ENVIADA = 'enviada', _('Enviada')
        APROBADA = 'aprobada', _('Aprobada')
        RECHAZADA = 'rechazada', _('Rechazada')
        VENCIDA = 'vencida', _('Vencida')
        CONVERTIDA = 'convertida', _('Convertida a Orden')

    # Opciones para los modelos de template de proforma
    class ModeloTemplate(models.TextChoices):
        BASICO = 'basico', _('Básico - Código, Descripción, Unidad, Cantidad, Precio, Total')
        CUDIN = 'cudin', _('CUDIN - CUDIN, Descripción, Unidad, Cantidad, Precio, Total')
        CUDIN_MODELO = 'cudin_modelo', _('CUDIN + Modelo - CUDIN, Descripción, Modelo, Unidad, Cantidad, Precio, Total')
        CUDIN_SERIE = 'cudin_serie', _('CUDIN + Serie - CUDIN, Descripción, Serie, Unidad, Cantidad, Precio, Total')
        SANITARIO = 'sanitario', _('Sanitario - CUDIN, Descripción, Lote, Registro Sanitario, Unidad, Cantidad, Precio, Total')
        COMPLETO = 'completo', _('Completo - Código, CUDIN, Registro, Fecha Venc., Descripción, Modelo, Unidad, Cantidad, Precio, Total')

    # Campos básicos
    numero = models.CharField(
        max_length=20, 
        unique=True, 
        verbose_name=_('Número'),
        help_text=_('Número único de la proforma')
    )
    nombre = models.CharField(
        max_length=200, 
        verbose_name=_('Nombre descriptivo'),
        help_text=_('Descripción breve de la proforma')
    )
    fecha_emision = models.DateField(
        default=timezone.now,
        verbose_name=_('Fecha de emisión'),
        help_text=_('Fecha de creación de la proforma')
    )
    fecha_vencimiento = models.DateField(
        verbose_name=_('Fecha de vencimiento'),
        help_text=_('Fecha límite de validez de la proforma')
    )

    # Nuevo campo: Modelo de template para la proforma
    modelo_template = models.CharField(
        max_length=20,
        choices=ModeloTemplate.choices,
        default=ModeloTemplate.BASICO,
        verbose_name=_('Modelo de plantilla'),
        help_text=_('Selecciona el modelo de campos que se mostrarán en la tabla de productos')
    )

    # Relaciones
    cliente = models.ForeignKey(
        'directorio.Cliente', 
        on_delete=models.PROTECT,
        related_name='proformas',
        verbose_name=_('Cliente'),
        help_text=_('Cliente al que se dirige la proforma')
    )
    empresa = models.ForeignKey(
        'basic.EmpresaClc', 
        on_delete=models.PROTECT,
        related_name='proformas',
        verbose_name=_('Empresa'),
        help_text=_('Empresa que emite la proforma')
    )
    tipo_contratacion = models.ForeignKey(
        'basic.TipoContratacion', 
        on_delete=models.PROTECT,
        related_name='proformas',
        verbose_name=_('Tipo de contratación'),
        help_text=_('Tipo de contratación aplicable')
    )
    vendedor = models.ForeignKey(
        'directorio.Vendedor',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='proformas',
        verbose_name=_('Vendedor asignado'),
        help_text=_('Vendedor responsable de la proforma')
    )

    # Datos de entrega y pago
    atencion_a = models.CharField(
        max_length=100, 
        verbose_name=_('Atención a'),
        help_text=_('Persona de contacto del cliente')
    )
    condiciones_pago = models.CharField(
        max_length=255, 
        verbose_name=_('Condiciones de pago'),
        help_text=_('Condiciones y términos de pago')
    )
    tiempo_entrega = models.CharField(
        max_length=255, 
        verbose_name=_('Tiempo de entrega'),
        help_text=_('Tiempo estimado de entrega')
    )

    # Datos financieros
    subtotal = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name=_('Subtotal'),
        help_text=_('Subtotal antes de impuestos')
    )
    porcentaje_impuesto = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        default=Decimal('15.00'),
        validators=[MinValueValidator(Decimal('0.00')), MaxValueValidator(Decimal('100.00'))],
        verbose_name=_('Porcentaje de impuesto'),
        help_text=_('Porcentaje de impuesto aplicable')
    )
    impuesto = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name=_('Impuesto'),
        help_text=_('Monto total de impuestos')
    )
    total = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name=_('Total'),
        help_text=_('Monto total de la proforma')
    )

    # Datos adicionales
    notas = models.TextField(
        blank=True, 
        verbose_name=_('Notas'),
        help_text=_('Notas y observaciones adicionales')
    )
    estado = models.CharField(
        max_length=20, 
        choices=EstadoProforma.choices,
        default=EstadoProforma.BORRADOR, 
        verbose_name=_('Estado'),
        help_text=_('Estado actual de la proforma')
    )
    tiene_orden = models.BooleanField(
        default=False, 
        verbose_name=_('Tiene orden de venta'),
        help_text=_('Indica si se ha generado una orden de venta')
    )

    # Campos de auditoría mejorados
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='proformas_creadas',
        null=True,
        blank=True,
        verbose_name=_('Creado por'),
        help_text=_('Usuario que creó la proforma')
    )
    modified_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='proformas_modificadas',
        null=True,
        blank=True,
        verbose_name=_('Modificado por'),
        help_text=_('Usuario que modificó la proforma por última vez')
    )

    # Manager personalizado
    objects = ProformaManager()

    class Meta:
        verbose_name = _('Proforma')
        verbose_name_plural = _('Proformas')
        ordering = ['-fecha_emision', '-created_at']
        indexes = [
            models.Index(fields=['numero']),
            models.Index(fields=['cliente', 'fecha_emision']),
            models.Index(fields=['estado', 'fecha_vencimiento']),
            models.Index(fields=['empresa', 'fecha_emision']),
            models.Index(fields=['modelo_template']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.numero} - {self.nombre}"

    def clean(self):
        """Validaciones personalizadas."""
        super().clean()
        
        # Validar que fecha de vencimiento sea posterior a fecha de emisión
        if self.fecha_vencimiento and self.fecha_emision:
            if self.fecha_vencimiento <= self.fecha_emision:
                raise ValidationError({
                    'fecha_vencimiento': _('La fecha de vencimiento debe ser posterior a la fecha de emisión.')
                })
        
        # Validar que no se pueda cambiar estado a convertida si ya tiene orden
        if self.estado == self.EstadoProforma.CONVERTIDA and not self.tiene_orden:
            # Solo advertencia, no error
            pass

    def save(self, *args, **kwargs):
        """Sobrescribe save para lógica de negocio."""
        user = kwargs.pop('user', None)
        
        # Autogenerar número si es una proforma nueva
        if not self.numero:
            secuencia = SecuenciaProforma.get_or_create_for_year()
            self.numero = f"PRO-{secuencia.anio}-{secuencia.ultimo_numero:04d}"

        # Establecer fecha de vencimiento por defecto
        if not self.fecha_vencimiento and hasattr(self, 'fecha_emision'):
            config = ConfiguracionProforma.get_active_config()
            if config:
                from datetime import timedelta
                self.fecha_vencimiento = self.fecha_emision + timedelta(days=config.dias_validez)

        # Auditoría de usuarios
        if user:
            if not self.pk:
                self.created_by = user
            self.modified_by = user

        super().save(*args, **kwargs)

        # Recalcular totales después de guardar (para tener pk disponible)
        self.recalcular_totales()

    def recalcular_totales(self):
        """Recalcula los totales de la proforma basado en sus ítems."""
        if not self.pk:
            return

        # Usar agregación de base de datos para mejor rendimiento
        totales = self.items.aggregate(
            subtotal_calculado=Sum('total')
        )
        
        nuevo_subtotal = totales['subtotal_calculado'] or Decimal('0.00')
        nuevo_impuesto = nuevo_subtotal * (self.porcentaje_impuesto / 100)
        nuevo_total = nuevo_subtotal + nuevo_impuesto

        # Solo actualizar si hay cambios para evitar loops
        if (self.subtotal != nuevo_subtotal or 
            self.impuesto != nuevo_impuesto or 
            self.total != nuevo_total):
            
            self.subtotal = nuevo_subtotal
            self.impuesto = nuevo_impuesto
            self.total = nuevo_total
            
            # Usar update para evitar llamar save() recursivamente
            Proforma.objects.filter(pk=self.pk).update(
                subtotal=nuevo_subtotal,
                impuesto=nuevo_impuesto,
                total=nuevo_total
            )

    def get_campos_visibles(self):
        """
        Retorna la configuración de campos visibles según el modelo de template seleccionado.
        """
        campos_config = {
            self.ModeloTemplate.BASICO: {
                'campos': ['codigo', 'descripcion', 'unidad', 'cantidad', 'precio_unitario', 'total'],
                'headers': ['Código', 'Descripción', 'Unidad', 'Cantidad', 'Precio Unit.', 'Total'],
                'requeridos': ['codigo', 'descripcion'],
                'anchos': ['120px', 'auto', '100px', '100px', '120px', '120px']
            },
            self.ModeloTemplate.CUDIN: {
                'campos': ['cudim', 'descripcion', 'unidad', 'cantidad', 'precio_unitario', 'total'],
                'headers': ['CUDIN', 'Descripción', 'Unidad', 'Cantidad', 'Precio Unit.', 'Total'],
                'requeridos': ['cudim', 'descripcion'],
                'anchos': ['140px', 'auto', '100px', '100px', '120px', '120px']
            },
            self.ModeloTemplate.CUDIN_MODELO: {
                'campos': ['cudim', 'descripcion', 'modelo', 'unidad', 'cantidad', 'precio_unitario', 'total'],
                'headers': ['CUDIN', 'Descripción', 'Modelo', 'Unidad', 'Cantidad', 'Precio Unit.', 'Total'],
                'requeridos': ['cudim', 'descripcion', 'modelo'],
                'anchos': ['140px', 'auto', '120px', '100px', '100px', '120px', '120px']
            },
            self.ModeloTemplate.CUDIN_SERIE: {
                'campos': ['cudim', 'descripcion', 'serial', 'unidad', 'cantidad', 'precio_unitario', 'total'],
                'headers': ['CUDIN', 'Descripción', 'Serie', 'Unidad', 'Cantidad', 'Precio Unit.', 'Total'],
                'requeridos': ['cudim', 'descripcion', 'serial'],
                'anchos': ['140px', 'auto', '120px', '100px', '100px', '120px', '120px']
            },
            self.ModeloTemplate.SANITARIO: {
                'campos': ['cudim', 'descripcion', 'lote', 'registro_sanitario', 'unidad', 'cantidad', 'precio_unitario', 'total'],
                'headers': ['CUDIN', 'Descripción', 'Lote', 'Registro Sanitario', 'Unidad', 'Cantidad', 'Precio Unit.', 'Total'],
                'requeridos': ['cudim', 'descripcion', 'lote', 'registro_sanitario'],
                'anchos': ['140px', 'auto', '120px', '150px', '100px', '100px', '120px', '120px']
            },
            self.ModeloTemplate.COMPLETO: {
                'campos': ['codigo', 'cudim', 'registro_sanitario', 'fecha_vencimiento', 'descripcion', 'modelo', 'unidad', 'cantidad', 'precio_unitario', 'total'],
                'headers': ['Código', 'CUDIN', 'Registro', 'Fecha Venc.', 'Descripción', 'Modelo', 'Unidad', 'Cantidad', 'Precio Unit.', 'Total'],
                'requeridos': ['codigo', 'cudim', 'descripcion'],
                'anchos': ['120px', '140px', '130px', '120px', 'auto', '120px', '100px', '100px', '120px', '120px']
            }
        }
        
        return campos_config.get(self.modelo_template, campos_config[self.ModeloTemplate.BASICO])

    def get_titulo_modelo(self):
        """Retorna el título descriptivo del modelo seleccionado."""
        return self.get_modelo_template_display()

    def validar_items_segun_modelo(self):
        """
        Valida que todos los ítems tengan los campos requeridos según el modelo seleccionado.
        """
        config = self.get_campos_visibles()
        campos_requeridos = config['requeridos']
        
        items_con_errores = []
        
        for item in self.items.all():
            errores_item = []
            for campo in campos_requeridos:
                valor = getattr(item, campo, None)
                if not valor or (isinstance(valor, str) and not valor.strip()):
                    errores_item.append(campo)
            
            if errores_item:
                items_con_errores.append({
                    'item': item,
                    'campos_faltantes': errores_item
                })
        
        return items_con_errores

    def esta_vencida(self):
        """Verifica si la proforma está vencida."""
        if self.estado != self.EstadoProforma.ENVIADA:
            return False
        return timezone.now().date() > self.fecha_vencimiento

    def puede_ser_editada(self):
        """Verifica si la proforma puede ser editada."""
        return self.estado in [self.EstadoProforma.BORRADOR]

    def puede_ser_enviada(self):
        """Verifica si la proforma puede ser enviada."""
        # Validar que tenga ítems y total > 0
        if not (self.estado == self.EstadoProforma.BORRADOR and 
                self.items.exists() and
                self.total > 0):
            return False
        
        # Validar que los ítems cumplan con los campos requeridos del modelo
        items_con_errores = self.validar_items_segun_modelo()
        return len(items_con_errores) == 0

    def marcar_como_vencida(self):
        """Marca la proforma como vencida si corresponde."""
        if self.esta_vencida() and self.estado == self.EstadoProforma.ENVIADA:
            self.estado = self.EstadoProforma.VENCIDA
            self.save()
            return True
        return False

    def duplicar(self, user=None):
        """Crea una copia de la proforma con estado borrador."""
        with transaction.atomic():
            # Clonar proforma
            nueva_proforma = Proforma.objects.get(pk=self.pk)
            nueva_proforma.pk = None
            nueva_proforma.numero = None  # Se autogenerará
            nueva_proforma.estado = self.EstadoProforma.BORRADOR
            nueva_proforma.tiene_orden = False
            nueva_proforma.nombre = f"Copia de {self.nombre}"
            nueva_proforma.save(user=user)

            # Clonar ítems
            for item in self.items.all():
                item.pk = None
                item.proforma = nueva_proforma
                item.save()

            return nueva_proforma

    @property
    def cantidad_items(self):
        """Retorna la cantidad total de ítems."""
        return self.items.count()

    @property
    def dias_hasta_vencimiento(self):
        """Retorna días hasta vencimiento (negativo si ya venció)."""
        if not self.fecha_vencimiento:
            return None
        delta = self.fecha_vencimiento - timezone.now().date()
        return delta.days


class ProformaItemManager(models.Manager):
    """Manager personalizado para ProformaItems."""
    
    def por_tipo(self, tipo):
        """Filtra ítems por tipo."""
        return self.filter(tipo_item=tipo)
    
    def con_productos_relacionados(self):
        """Incluye productos relacionados en la consulta."""
        return self.select_related(
            'producto_ofertado', 
            'producto_disponible', 
            'unidad'
        )


class ProformaItem(TimeStampedModel):
    """
    Modelo para los ítems o líneas de una proforma.
    """
    # Opciones para el tipo de ítem
    class TipoItem(models.TextChoices):
        PRODUCTO_OFERTADO = 'producto_ofertado', _('Producto Ofertado')
        PRODUCTO_DISPONIBLE = 'producto_disponible', _('Producto Disponible')
        # INVENTARIO = 'inventario', _('Producto de Inventario')  # Temporalmente comentado
        PERSONALIZADO = 'personalizado', _('Ítem Personalizado')

    # Relación principal
    proforma = models.ForeignKey(
        Proforma, 
        on_delete=models.CASCADE, 
        related_name='items',
        verbose_name=_('Proforma')
    )

    # Tipo de ítem y referencias a productos
    tipo_item = models.CharField(
        max_length=25, 
        choices=TipoItem.choices,
        verbose_name=_('Tipo de ítem')
    )
    producto_ofertado = models.ForeignKey(
        'productos.ProductoOfertado', 
        null=True, 
        blank=True,
        on_delete=models.SET_NULL, 
        verbose_name=_('Producto ofertado')
    )
    producto_disponible = models.ForeignKey(
        'productos.ProductoDisponible', 
        null=True, 
        blank=True,
        on_delete=models.SET_NULL, 
        verbose_name=_('Producto disponible')
    )
    # inventario = models.ForeignKey('inventario.ProductoInventario', null=True, blank=True,
    #                              on_delete=models.SET_NULL, verbose_name=_('Producto de inventario'))  # Temporalmente comentado

    # Detalles del ítem
    codigo = models.CharField(
        max_length=50, 
        blank=True,
        verbose_name=_('Código'),
        help_text=_('Código del producto o ítem')
    )
    descripcion = models.TextField(
        verbose_name=_('Descripción'),
        help_text=_('Descripción detallada del ítem')
    )
    unidad = models.ForeignKey(
        'basic.Unidad', 
        on_delete=models.PROTECT, 
        verbose_name=_('Unidad'),
        help_text=_('Unidad de medida')
    )

    # CAMPOS ADICIONALES - Información técnica y regulatoria
    cpc = models.CharField(
        max_length=50, 
        blank=True, 
        verbose_name=_('CPC'),
        help_text=_('Código de Clasificación de Productos y Servicios')
    )
    cudim = models.CharField(
        max_length=50, 
        blank=True, 
        verbose_name=_('CUDIM'),
        help_text=_('Código Único de Dispositivos Médicos')
    )
    nombre_generico = models.CharField(
        max_length=200, 
        blank=True, 
        verbose_name=_('Nombre genérico'),
        help_text=_('Denominación genérica del producto')
    )
    especificaciones_tecnicas = models.TextField(
        blank=True, 
        verbose_name=_('Especificaciones técnicas'),
        help_text=_('Detalles técnicos del producto')
    )
    presentacion = models.CharField(
        max_length=100, 
        blank=True, 
        verbose_name=_('Presentación'),
        help_text=_('Presentación comercial del producto')
    )
    
    # Información de trazabilidad
    lote = models.CharField(
        max_length=100, 
        blank=True, 
        verbose_name=_('Lote'),
        help_text=_('Número de lote del producto')
    )
    fecha_vencimiento = models.DateField(
        null=True, 
        blank=True, 
        verbose_name=_('Fecha de vencimiento'),
        help_text=_('Fecha de vencimiento del producto')
    )
    registro_sanitario = models.CharField(
        max_length=100, 
        blank=True, 
        verbose_name=_('Registro sanitario'),
        help_text=_('Número de registro sanitario')
    )
    
    # Información de identificación
    serial = models.CharField(
        max_length=100, 
        blank=True, 
        verbose_name=_('Serial'),
        help_text=_('Número de serie del producto')
    )
    modelo = models.CharField(
        max_length=100, 
        blank=True, 
        verbose_name=_('Modelo'),
        help_text=_('Modelo del producto')
    )
    marca = models.CharField(
        max_length=100, 
        blank=True, 
        verbose_name=_('Marca'),
        help_text=_('Marca comercial del producto')
    )
    
    # Observaciones
    notas = models.TextField(
        blank=True, 
        verbose_name=_('Notas'),
        help_text=_('Notas internas del ítem')
    )
    observaciones = models.TextField(
        blank=True, 
        verbose_name=_('Observaciones'),
        help_text=_('Observaciones adicionales para el cliente')
    )

    # Datos financieros
    cantidad = models.DecimalField(
        max_digits=15, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name=_('Cantidad'),
        help_text=_('Cantidad del ítem')
    )
    precio_unitario = models.DecimalField(
        max_digits=15, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name=_('Precio unitario'),
        help_text=_('Precio por unidad')
    )
    porcentaje_descuento = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0,
        validators=[MinValueValidator(Decimal('0.00')), MaxValueValidator(Decimal('100.00'))],
        verbose_name=_('Porcentaje de descuento'),
        help_text=_('Descuento aplicable en porcentaje')
    )
    total = models.DecimalField(
        max_digits=15, 
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name=_('Total'),
        help_text=_('Total del ítem')
    )

    # Orden de visualización
    orden = models.IntegerField(
        default=0, 
        verbose_name=_('Orden'),
        help_text=_('Orden de visualización en la proforma')
    )

    # Manager personalizado
    objects = ProformaItemManager()

    class Meta:
        verbose_name = _('Ítem de Proforma')
        verbose_name_plural = _('Ítems de Proforma')
        ordering = ['proforma', 'orden', 'id']
        indexes = [
            models.Index(fields=['proforma', 'orden']),
            models.Index(fields=['codigo']),
            models.Index(fields=['cudim']),
            models.Index(fields=['tipo_item']),
        ]

    def __str__(self):
        return f"{self.proforma.numero} - {self.codigo or self.cudim} - {self.descripcion[:30]}"

    def clean(self):
        """Validaciones personalizadas."""
        super().clean()
        
        # Validar que se especifique al menos un producto según el tipo
        if self.tipo_item == self.TipoItem.PRODUCTO_OFERTADO and not self.producto_ofertado:
            raise ValidationError({
                'producto_ofertado': _('Debe especificar un producto ofertado.')
            })
        elif self.tipo_item == self.TipoItem.PRODUCTO_DISPONIBLE and not self.producto_disponible:
            raise ValidationError({
                'producto_disponible': _('Debe especificar un producto disponible.')
            })

        # Validar fecha de vencimiento
        if self.fecha_vencimiento and self.fecha_vencimiento <= timezone.now().date():
            raise ValidationError({
                'fecha_vencimiento': _('La fecha de vencimiento debe ser futura.')
            })

    def save(self, *args, **kwargs):
        """Sobrescribe save para lógica de cálculos."""
        # Calcular el total del ítem (precio * cantidad - descuento)
        if self.precio_unitario is not None and self.cantidad is not None:
            precio_con_descuento = self.precio_unitario * (1 - (self.porcentaje_descuento / 100))
            self.total = (self.cantidad * precio_con_descuento).quantize(
                Decimal('0.01'), rounding=ROUND_HALF_UP
            )

        super().save(*args, **kwargs)

    def get_campo_identificador(self):
        """
        Retorna el campo identificador principal según el modelo de template de la proforma.
        """
        if not self.proforma:
            return self.codigo or self.cudim or 'Sin identificador'
        
        modelo = self.proforma.modelo_template
        
        if modelo in [
            Proforma.ModeloTemplate.CUDIN,
            Proforma.ModeloTemplate.CUDIN_MODELO,
            Proforma.ModeloTemplate.CUDIN_SERIE,
            Proforma.ModeloTemplate.SANITARIO
        ]:
            return self.cudim or self.codigo or 'Sin CUDIN'
        elif modelo == Proforma.ModeloTemplate.COMPLETO:
            return self.codigo or self.cudim or 'Sin código'
        else:  # BASICO
            return self.codigo or 'Sin código'

    @property
    def valor_descuento(self):
        """Retorna el valor absoluto del descuento aplicado."""
        if self.porcentaje_descuento > 0:
            return (self.precio_unitario * self.cantidad * self.porcentaje_descuento / 100).quantize(
                Decimal('0.01'), rounding=ROUND_HALF_UP
            )
        return Decimal('0.00')

    @property
    def precio_con_descuento(self):
        """Retorna el precio unitario después del descuento."""
        return (self.precio_unitario * (1 - self.porcentaje_descuento / 100)).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )

    def duplicar_para_proforma(self, nueva_proforma):
        """Duplica el ítem para otra proforma."""
        nuevo_item = ProformaItem.objects.get(pk=self.pk)
        nuevo_item.pk = None
        nuevo_item.proforma = nueva_proforma
        nuevo_item.save()
        return nuevo_item


class ProformaHistorial(TimeStampedModel):
    """
    Modelo para el historial de cambios en una proforma.
    """
    # Opciones para el tipo de acción
    class TipoAccion(models.TextChoices):
        CREACION = 'creacion', _('Creación')
        MODIFICACION = 'modificacion', _('Modificación')
        ENVIO = 'envio', _('Envío')
        APROBACION = 'aprobacion', _('Aprobación')
        RECHAZO = 'rechazo', _('Rechazo')
        VENCIMIENTO = 'vencimiento', _('Vencimiento')
        CONVERSION = 'conversion', _('Conversión a Orden')
        DUPLICACION = 'duplicacion', _('Duplicación')
        CAMBIO_MODELO = 'cambio_modelo', _('Cambio de Modelo de Template')

    # Relaciones y datos básicos
    proforma = models.ForeignKey(
        Proforma, 
        on_delete=models.CASCADE, 
        related_name='historial',
        verbose_name=_('Proforma')
    )
    accion = models.CharField(
        max_length=20, 
        choices=TipoAccion.choices,
        verbose_name=_('Acción')
    )
    estado_anterior = models.CharField(
        max_length=20, 
        blank=True,
        verbose_name=_('Estado anterior')
    )
    estado_nuevo = models.CharField(
        max_length=20, 
        blank=True,
        verbose_name=_('Estado nuevo')
    )
    notas = models.TextField(
        blank=True, 
        verbose_name=_('Notas')
    )

    # Información adicional del cambio
    campo_modificado = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_('Campo modificado'),
        help_text=_('Campo específico que fue modificado')
    )
    valor_anterior = models.TextField(
        blank=True,
        verbose_name=_('Valor anterior'),
        help_text=_('Valor anterior del campo')
    )
    valor_nuevo = models.TextField(
        blank=True,
        verbose_name=_('Valor nuevo'),
        help_text=_('Nuevo valor del campo')
    )

    # Auditoría
    created_by = models.ForeignKey(
        User, 
        on_delete=models.PROTECT,
        verbose_name=_('Creado por')
    )
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name=_('Dirección IP'),
        help_text=_('Dirección IP desde donde se realizó el cambio')
    )

    class Meta:
        verbose_name = _('Historial de Proforma')
        verbose_name_plural = _('Historiales de Proforma')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['proforma', '-created_at']),
            models.Index(fields=['accion', '-created_at']),
            models.Index(fields=['created_by', '-created_at']),
        ]

    def __str__(self):
        return f"{self.proforma.numero} - {self.get_accion_display()} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"


class SecuenciaProforma(TimeStampedModel):
    """
    Modelo para manejar la secuencia de numeración de proformas por año.
    """
    anio = models.IntegerField(
        unique=True, 
        verbose_name=_('Año')
    )
    ultimo_numero = models.IntegerField(
        default=0, 
        verbose_name=_('Último número')
    )
    ultima_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Última actualización')
    )

    class Meta:
        verbose_name = _('Secuencia de Proforma')
        verbose_name_plural = _('Secuencias de Proforma')
        indexes = [
            models.Index(fields=['anio']),
        ]

    def __str__(self):
        return f"Secuencia {self.anio}: {self.ultimo_numero}"

    @classmethod
    def get_or_create_for_year(cls, year=None):
        """
        Obtiene o crea la secuencia para el año especificado.
        Si no se especifica año, usa el año actual.
        """
        if year is None:
            year = timezone.now().year

        with transaction.atomic():
            # Usar select_for_update para evitar condiciones de carrera
            try:
                secuencia = cls.objects.select_for_update().get(anio=year)
                secuencia.ultimo_numero += 1
                secuencia.save()
            except cls.DoesNotExist:
                secuencia = cls.objects.create(anio=year, ultimo_numero=1)

        return secuencia

    @classmethod
    def reset_secuencia(cls, year):
        """Reinicia la secuencia para un año específico."""
        with transaction.atomic():
            secuencia, created = cls.objects.get_or_create(anio=year)
            secuencia.ultimo_numero = 0
            secuencia.save()
        return secuencia


class ConfiguracionProforma(TimeStampedModel):
    """
    Modelo para la configuración de valores predeterminados y visualización de proformas.
    """
    # Valores predeterminados
    empresa_predeterminada = models.ForeignKey(
        'basic.EmpresaClc', 
        on_delete=models.PROTECT,
        verbose_name=_('Empresa predeterminada')
    )
    dias_validez = models.IntegerField(
        default=30,
        validators=[MinValueValidator(1), MaxValueValidator(365)],
        verbose_name=_('Días de validez predeterminados'),
        help_text=_('Días de validez por defecto para nuevas proformas')
    )
    porcentaje_impuesto_default = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=15.0,
        validators=[MinValueValidator(Decimal('0.00')), MaxValueValidator(Decimal('100.00'))],
        verbose_name=_('Porcentaje de impuesto predeterminado')
    )

    # Textos predeterminados
    texto_condiciones_pago = models.CharField(
        max_length=500,
        verbose_name=_('Texto de condiciones de pago')
    )
    texto_tiempo_entrega = models.CharField(
        max_length=500,
        verbose_name=_('Texto de tiempo de entrega')
    )
    notas_predeterminadas = models.TextField(
        blank=True,
        verbose_name=_('Notas predeterminadas')
    )

    # Opciones de visualización
    mostrar_logo = models.BooleanField(
        default=True, 
        verbose_name=_('Mostrar logo')
    )
    mostrar_descuento = models.BooleanField(
        default=True, 
        verbose_name=_('Mostrar descuento')
    )
    mostrar_impuesto = models.BooleanField(
        default=True, 
        verbose_name=_('Mostrar impuesto')
    )
    mostrar_codigos = models.BooleanField(
        default=True, 
        verbose_name=_('Mostrar códigos')
    )
    mostrar_campos_tecnicos = models.BooleanField(
        default=True,
        verbose_name=_('Mostrar campos técnicos'),
        help_text=_('Mostrar CPC, CUDIM, registro sanitario, etc.')
    )

    # Formato de números
    formato_moneda = models.CharField(
        max_length=10, 
        default='$',
        verbose_name=_('Formato de moneda')
    )
    decimales = models.IntegerField(
        default=2,
        validators=[MinValueValidator(0), MaxValueValidator(4)],
        verbose_name=_('Decimales a mostrar')
    )

    # Configuración de numeración
    prefijo_numeracion = models.CharField(
        max_length=10,
        default='PRO',
        verbose_name=_('Prefijo de numeración'),
        help_text=_('Prefijo para el número de proforma')
    )
    longitud_numero = models.IntegerField(
        default=4,
        validators=[MinValueValidator(3), MaxValueValidator(10)],
        verbose_name=_('Longitud del número'),
        help_text=_('Cantidad de dígitos en la numeración secuencial')
    )

    # Configuración de notificaciones
    notificar_vencimiento = models.BooleanField(
        default=True,
        verbose_name=_('Notificar vencimiento'),
        help_text=_('Enviar notificaciones cuando las proformas estén por vencer')
    )
    dias_aviso_vencimiento = models.IntegerField(
        default=3,
        validators=[MinValueValidator(1), MaxValueValidator(30)],
        verbose_name=_('Días de aviso de vencimiento'),
        help_text=_('Días antes del vencimiento para enviar notificación')
    )

    class Meta:
        verbose_name = _('Configuración de Proforma')
        verbose_name_plural = _('Configuraciones de Proforma')

    def __str__(self):
        return f"Configuración de Proformas - {self.empresa_predeterminada}"

    def clean(self):
        """Validaciones personalizadas."""
        super().clean()
        
        # Asegurar que solo haya una configuración activa
        if not self.pk and ConfiguracionProforma.objects.exists():
            raise ValidationError(
                _('Solo puede existir una configuración de proformas activa.')
            )

    @classmethod
    def get_active_config(cls):
        """
        Obtiene la configuración activa. Si no existe ninguna, crea una por defecto.
        """
        config = cls.objects.first()
        if not config:
            # Obtener la primera empresa disponible
            from basic.models import EmpresaClc
            empresa = EmpresaClc.objects.first()

            if empresa:
                config = cls.objects.create(
                    empresa_predeterminada=empresa,
                    texto_condiciones_pago="Pago a 30 días de la fecha de emisión",
                    texto_tiempo_entrega="Entrega inmediata después de aprobación"
                )

        return config

    def generar_numero_proforma(self, year=None):
        """Genera un nuevo número de proforma según la configuración."""
        secuencia = SecuenciaProforma.get_or_create_for_year(year)
        numero_formateado = str(secuencia.ultimo_numero).zfill(self.longitud_numero)
        return f"{self.prefijo_numeracion}-{secuencia.anio}-{numero_formateado}"


# Las signals para automatización están en signals.py
