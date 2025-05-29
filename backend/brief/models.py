from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid

class BriefOrigin(models.TextChoices):
    TELEFONO = 'telefono', 'Telefónico'
    EMAIL = 'email', 'Correo Electrónico'
    PRESENCIAL = 'presencial', 'Visita Presencial'
    WHATSAPP = 'whatsapp', 'WhatsApp'
    WEB = 'web', 'Sitio Web'
    REFERIDO = 'referido', 'Referido'
    REDES_SOCIALES = 'redes', 'Redes Sociales'

class BriefPriority(models.TextChoices):
    BAJA = 'baja', 'Baja'
    MEDIA = 'media', 'Media'
    ALTA = 'alta', 'Alta'
    URGENTE = 'urgente', 'Urgente'
    CRITICA = 'critica', 'Crítica'

class BriefFormaPago(models.TextChoices):
    CONTADO = 'contado', 'Contado'
    CREDITO_15 = 'credito_15', 'Crédito 15 días'
    CREDITO_30 = 'credito_30', 'Crédito 30 días'
    CREDITO_45 = 'credito_45', 'Crédito 45 días'
    CREDITO_60 = 'credito_60', 'Crédito 60 días'
    CREDITO_90 = 'credito_90', 'Crédito 90 días'
    TRANSFERENCIA = 'transferencia', 'Transferencia'
    CHEQUE = 'cheque', 'Cheque'

class BriefDestino(models.TextChoices):
    COTIZACION_CLIENTE = 'cot_cliente', 'Cotización a Cliente'
    SOLICITUD_PROVEEDOR = 'sol_proveedor', 'Solicitud a Proveedor'
    ORDEN_COMPRA = 'orden_compra', 'Orden de Compra'
    PROFORMA = 'proforma', 'Proforma'
    ANALISIS_PRECIOS = 'analisis', 'Análisis de Precios'

class BriefStatus(models.TextChoices):
    DRAFT = 'draft', 'Borrador'
    PENDING = 'pending', 'Pendiente'
    APPROVED = 'approved', 'Aprobado'
    PROCESSING = 'processing', 'En Proceso'
    COMPLETED = 'completed', 'Completado'
    CANCELLED = 'cancelled', 'Cancelado'

class Brief(models.Model):
    # Identificación
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=20, unique=True, help_text="Código único del brief")
    client = models.ForeignKey('directorio.Cliente', on_delete=models.CASCADE, verbose_name="Cliente")
    
    # Contenido Principal
    title = models.CharField(max_length=200, verbose_name="Título del Brief")
    origin = models.CharField(
        max_length=20, 
        choices=BriefOrigin.choices, 
        verbose_name="Origen del Pedido"
    )
    description = models.TextField(verbose_name="Descripción del Pedido")
    priority = models.CharField(
        max_length=20, 
        choices=BriefPriority.choices,
        default=BriefPriority.MEDIA,
        verbose_name="Prioridad"
    )
    
    # Información Comercial
    presupuesto = models.DecimalField(
        max_digits=12, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        null=True,
        blank=True,
        verbose_name="Presupuesto"
    )
    tiempo_entrega = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text="Tiempo de entrega en días",
        verbose_name="Tiempo de Entrega (días)"
    )
    forma_pago = models.CharField(
        max_length=20,
        choices=BriefFormaPago.choices,
        verbose_name="Forma de Pago"
    )
    destino = models.CharField(
        max_length=50,
        choices=BriefDestino.choices,
        verbose_name="Destino del Brief"
    )
    
    # Estados y Control
    estado = models.CharField(
        max_length=20,
        choices=BriefStatus.choices,
        default=BriefStatus.DRAFT,
        verbose_name="Estado"
    )
    operador = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='briefs_asignados',
        verbose_name="Operador Asignado"
    )
    
    # Metadatos
    fecha_emision = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Emisión")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='briefs_creados',
        verbose_name="Creado por"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    due_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Fecha Límite"
    )
    
    # Campos adicionales recomendados
    observaciones_internas = models.TextField(
        blank=True,
        verbose_name="Observaciones Internas"
    )
    archivo_adjunto = models.FileField(
        upload_to='briefs/attachments/',
        null=True,
        blank=True,
        verbose_name="Archivo Adjunto"
    )
    
    class Meta:
        verbose_name = "Brief"
        verbose_name_plural = "Briefs"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['estado', 'priority']),
            models.Index(fields=['client', 'fecha_emision']),
        ]
    
    def __str__(self):
        return f"{self.code} - {self.title}"
    
    @property
    def priority_color(self):
        """Devuelve el color asociado a la prioridad"""
        colors = {
            'baja': '#10B981',      # Verde
            'media': '#F59E0B',     # Amarillo
            'alta': '#EF4444',      # Rojo
            'urgente': '#8B5CF6',   # Púrpura
            'critica': '#DC2626'    # Rojo oscuro
        }
        return colors.get(self.priority, '#6B7280')  # Gris por defecto
    
    @property
    def status_color(self):
        """Devuelve el color asociado al estado"""
        colors = {
            'draft': '#6B7280',       # Gris
            'pending': '#F59E0B',     # Amarillo
            'approved': '#10B981',    # Verde
            'processing': '#3B82F6',  # Azul
            'completed': '#059669',   # Verde oscuro
            'cancelled': '#DC2626'    # Rojo
        }
        return colors.get(self.estado, '#6B7280')
    
    def save(self, *args, **kwargs):
        if not self.code:
            # Generar código automático
            today = timezone.now()
            prefix = f"BRF{today.strftime('%Y%m')}"
            last_brief = Brief.objects.filter(
                code__startswith=prefix
            ).order_by('-code').first()
            
            if last_brief:
                last_number = int(last_brief.code[-4:])
                new_number = last_number + 1
            else:
                new_number = 1
                
            self.code = f"{prefix}{new_number:04d}"
        
        super().save(*args, **kwargs)


class BriefItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    brief = models.ForeignKey(
        Brief,
        related_name='items',
        on_delete=models.CASCADE,
        verbose_name="Brief"
    )
    
    # Información del Producto
    product = models.CharField(
        max_length=200,
        verbose_name="Nombre del Producto (según cliente)"
    )
    product_reference = models.ForeignKey(
        'productos.ProductoDisponible',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Producto de Inventario"
    )
    
    # Cantidades y Especificaciones
    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.01)],
        verbose_name="Cantidad"
    )
    unit = models.ForeignKey(
        'basic.Unidad',
        on_delete=models.CASCADE,
        verbose_name="Unidad de Medida"
    )
    
    # Detalles adicionales
    specifications = models.TextField(
        blank=True,
        verbose_name="Especificaciones"
    )
    notes = models.TextField(
        blank=True,
        verbose_name="Notas"
    )
    
    # Información comercial por ítem
    precio_estimado = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        verbose_name="Precio Estimado"
    )
    
    # Control
    orden = models.PositiveIntegerField(
        default=1,
        verbose_name="Orden"
    )
    
    class Meta:
        verbose_name = "Item de Brief"
        verbose_name_plural = "Items de Brief"
        ordering = ['orden', 'id']
    
    def __str__(self):
        return f"{self.brief.code} - {self.product}"
    
    @property
    def total_estimado(self):
        if self.precio_estimado:
            return self.quantity * self.precio_estimado
        return None


# Modelo para seguimiento de cambios (Auditoría)
class BriefHistory(models.Model):
    brief = models.ForeignKey(Brief, related_name='history', on_delete=models.CASCADE)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    change_date = models.DateTimeField(auto_now_add=True)
    field_changed = models.CharField(max_length=50)
    old_value = models.TextField(blank=True)
    new_value = models.TextField(blank=True)
    change_reason = models.TextField(blank=True)
    
    class Meta:
        verbose_name = "Historial de Brief"
        verbose_name_plural = "Historial de Briefs"
        ordering = ['-change_date']