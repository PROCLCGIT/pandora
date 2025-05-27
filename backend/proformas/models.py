
# backend/proformas/models.py

from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from basic.models import TimeStampedModel

User = get_user_model()

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
    
    # Campos básicos
    numero = models.CharField(max_length=20, unique=True, verbose_name=_('Número'))
    nombre = models.CharField(max_length=200, verbose_name=_('Nombre descriptivo'))
    fecha_emision = models.DateField(verbose_name=_('Fecha de emisión'))
    fecha_vencimiento = models.DateField(verbose_name=_('Fecha de vencimiento'))
    
    # Relaciones
    cliente = models.ForeignKey('directorio.Cliente', on_delete=models.PROTECT, 
                              verbose_name=_('Cliente'))
    empresa = models.ForeignKey('basic.EmpresaClc', on_delete=models.PROTECT, 
                              verbose_name=_('Empresa'))
    tipo_contratacion = models.ForeignKey('basic.TipoContratacion', on_delete=models.PROTECT, 
                                        verbose_name=_('Tipo de contratación'))
    
    # Datos de entrega y pago
    atencion_a = models.CharField(max_length=100, verbose_name=_('Atención a'))
    condiciones_pago = models.CharField(max_length=255, verbose_name=_('Condiciones de pago'))
    tiempo_entrega = models.CharField(max_length=255, verbose_name=_('Tiempo de entrega'))
    
    # Datos financieros
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, verbose_name=_('Subtotal'))
    porcentaje_impuesto = models.DecimalField(max_digits=5, decimal_places=2, 
                                            verbose_name=_('Porcentaje de impuesto'))
    impuesto = models.DecimalField(max_digits=15, decimal_places=2, verbose_name=_('Impuesto'))
    total = models.DecimalField(max_digits=15, decimal_places=2, verbose_name=_('Total'))
    
    # Datos adicionales
    notas = models.TextField(blank=True, verbose_name=_('Notas'))
    estado = models.CharField(max_length=20, choices=EstadoProforma.choices, 
                            default=EstadoProforma.BORRADOR, verbose_name=_('Estado'))
    tiene_orden = models.BooleanField(default=False, verbose_name=_('Tiene orden de venta'))
    
    class Meta:
        verbose_name = _('Proforma')
        verbose_name_plural = _('Proformas')
        ordering = ['-fecha_emision']
    
    def __str__(self):
        return f"{self.numero} - {self.nombre}"
    
    def save(self, *args, **kwargs):
        # Autogenerar número si es una proforma nueva
        if not self.numero:
            secuencia = SecuenciaProforma.get_or_create_for_year()
            self.numero = f"PRO-{secuencia.anio}-{secuencia.ultimo_numero:04d}"
        
        # Recalcular totales
        self.subtotal = sum(item.total for item in self.items.all()) if self.pk else 0
        self.impuesto = self.subtotal * (self.porcentaje_impuesto / 100)
        self.total = self.subtotal + self.impuesto
        
        super().save(*args, **kwargs)


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
    proforma = models.ForeignKey(Proforma, on_delete=models.CASCADE, related_name='items',
                               verbose_name=_('Proforma'))
    
    # Tipo de ítem y referencias a productos
    tipo_item = models.CharField(max_length=25, choices=TipoItem.choices, 
                               verbose_name=_('Tipo de ítem'))
    producto_ofertado = models.ForeignKey('productos.ProductoOfertado', null=True, blank=True, 
                                        on_delete=models.SET_NULL, verbose_name=_('Producto ofertado'))
    producto_disponible = models.ForeignKey('productos.ProductoDisponible', null=True, blank=True, 
                                          on_delete=models.SET_NULL, verbose_name=_('Producto disponible'))
    # inventario = models.ForeignKey('inventario.ProductoInventario', null=True, blank=True, 
    #                              on_delete=models.SET_NULL, verbose_name=_('Producto de inventario'))  # Temporalmente comentado
    
    # Detalles del ítem
    codigo = models.CharField(max_length=50, verbose_name=_('Código'))
    descripcion = models.TextField(verbose_name=_('Descripción'))
    unidad = models.ForeignKey('basic.Unidad', on_delete=models.PROTECT, verbose_name=_('Unidad'))
    cantidad = models.DecimalField(max_digits=15, decimal_places=2, verbose_name=_('Cantidad'))
    precio_unitario = models.DecimalField(max_digits=15, decimal_places=2, 
                                        verbose_name=_('Precio unitario'))
    porcentaje_descuento = models.DecimalField(max_digits=5, decimal_places=2, default=0, 
                                            verbose_name=_('Porcentaje de descuento'))
    total = models.DecimalField(max_digits=15, decimal_places=2, verbose_name=_('Total'))
    
    # Orden de visualización
    orden = models.IntegerField(default=0, verbose_name=_('Orden'))
    
    class Meta:
        verbose_name = _('Ítem de Proforma')
        verbose_name_plural = _('Ítems de Proforma')
        ordering = ['proforma', 'orden']
    
    def __str__(self):
        return f"{self.proforma.numero} - {self.codigo} - {self.descripcion[:30]}"
    
    def save(self, *args, **kwargs):
        # Calcular el total del ítem (precio * cantidad - descuento)
        precio_con_descuento = self.precio_unitario * (1 - (self.porcentaje_descuento / 100))
        self.total = self.cantidad * precio_con_descuento
        
        super().save(*args, **kwargs)
        
        # Actualizar totales de la proforma
        self.proforma.save()


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
    
    # Relaciones y datos básicos
    proforma = models.ForeignKey(Proforma, on_delete=models.CASCADE, related_name='historial',
                               verbose_name=_('Proforma'))
    accion = models.CharField(max_length=20, choices=TipoAccion.choices, 
                            verbose_name=_('Acción'))
    estado_anterior = models.CharField(max_length=20, verbose_name=_('Estado anterior'))
    estado_nuevo = models.CharField(max_length=20, verbose_name=_('Estado nuevo'))
    notas = models.TextField(blank=True, verbose_name=_('Notas'))
    
    # Auditoría
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, 
                                 verbose_name=_('Creado por'))
    
    class Meta:
        verbose_name = _('Historial de Proforma')
        verbose_name_plural = _('Historiales de Proforma')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.proforma.numero} - {self.get_accion_display()} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"


class SecuenciaProforma(TimeStampedModel):
    """
    Modelo para manejar la secuencia de numeración de proformas por año.
    """
    anio = models.IntegerField(unique=True, verbose_name=_('Año'))
    ultimo_numero = models.IntegerField(default=0, verbose_name=_('Último número'))
    ultima_actualizacion = models.DateTimeField(auto_now=True, 
                                              verbose_name=_('Última actualización'))
    
    class Meta:
        verbose_name = _('Secuencia de Proforma')
        verbose_name_plural = _('Secuencias de Proforma')
    
    def __str__(self):
        return f"Secuencia {self.anio}: {self.ultimo_numero}"
    
    @classmethod
    def get_or_create_for_year(cls, year=None):
        """
        Obtiene o crea la secuencia para el año especificado.
        Si no se especifica año, usa el año actual.
        """
        from django.utils import timezone
        
        if year is None:
            year = timezone.now().year
            
        secuencia, created = cls.objects.get_or_create(anio=year)
        
        if not created:
            # Incrementar el contador y guardar
            secuencia.ultimo_numero += 1
            secuencia.save()
        else:
            # Si es una secuencia nueva, inicializar en 1
            secuencia.ultimo_numero = 1
            secuencia.save()
            
        return secuencia


class ConfiguracionProforma(TimeStampedModel):
    """
    Modelo para la configuración de valores predeterminados y visualización de proformas.
    """
    # Valores predeterminados
    empresa_predeterminada = models.ForeignKey('basic.EmpresaClc', on_delete=models.PROTECT,
                                             verbose_name=_('Empresa predeterminada'))
    dias_validez = models.IntegerField(default=30, 
                                     verbose_name=_('Días de validez predeterminados'))
    porcentaje_impuesto_default = models.DecimalField(max_digits=5, decimal_places=2, default=12.0,
                                                    verbose_name=_('Porcentaje de impuesto predeterminado'))
    
    # Textos predeterminados
    texto_condiciones_pago = models.CharField(max_length=500, 
                                            verbose_name=_('Texto de condiciones de pago'))
    texto_tiempo_entrega = models.CharField(max_length=500, 
                                          verbose_name=_('Texto de tiempo de entrega'))
    notas_predeterminadas = models.TextField(blank=True, 
                                           verbose_name=_('Notas predeterminadas'))
    
    # Opciones de visualización
    mostrar_logo = models.BooleanField(default=True, verbose_name=_('Mostrar logo'))
    mostrar_descuento = models.BooleanField(default=True, verbose_name=_('Mostrar descuento'))
    mostrar_impuesto = models.BooleanField(default=True, verbose_name=_('Mostrar impuesto'))
    mostrar_codigos = models.BooleanField(default=True, verbose_name=_('Mostrar códigos'))
    
    # Formato de números
    formato_moneda = models.CharField(max_length=10, default='$', 
                                    verbose_name=_('Formato de moneda'))
    decimales = models.IntegerField(default=2, verbose_name=_('Decimales a mostrar'))
    
    class Meta:
        verbose_name = _('Configuración de Proforma')
        verbose_name_plural = _('Configuraciones de Proforma')
    
    def __str__(self):
        return f"Configuración de Proformas - {self.empresa_predeterminada}"
    
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