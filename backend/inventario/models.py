from django.db import models
from django.utils.translation import gettext_lazy as _


class TimeStampedModel(models.Model):
    """Modelo base abstracto con marcas de tiempo de creación y edición"""
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


# ========= DIMENSIONES / CATÁLOGO =========

class Unidad(TimeStampedModel):
    nombre = models.CharField(max_length=50)
    abreviatura = models.CharField(max_length=10, unique=True)

    class Meta:
        
        verbose_name = _("Unidad de medida")
        verbose_name_plural = _("Unidades de medida")
        ordering = ("nombre",)

    def __str__(self):
        return self.abreviatura


class Categoria(TimeStampedModel):
    padre = models.ForeignKey(
        'self',
        models.SET_NULL,
        null=True,
        blank=True,
        related_name='hijos'
    )
    nombre = models.CharField(max_length=100)

    class Meta:
       
        verbose_name = _("Categoría")
        verbose_name_plural = _("Categorías")
        ordering = ("nombre",)

    def __str__(self):
        return self.nombre


class ProductoInventario(TimeStampedModel):
    sku = models.CharField(max_length=40, unique=True)
    nombre = models.CharField(max_length=150)
    categoria = models.ForeignKey(Categoria, models.PROTECT, related_name='productos')
    unidad = models.ForeignKey(Unidad, models.PROTECT, related_name='productos')
    costo = models.DecimalField(max_digits=12, decimal_places=4, default=0)
    precio_venta = models.DecimalField(max_digits=12, decimal_places=4, default=0)
    punto_reorden = models.DecimalField(max_digits=12, decimal_places=4, default=0)
    activo = models.BooleanField(default=True)

    class Meta:
      
        verbose_name = _("Producto de inventario")
        verbose_name_plural = _("Productos de inventario")
        ordering = ("sku",)

    def __str__(self):
        return f"{self.sku} - {self.nombre}"


# ========= UBICACIONES =========

class Almacen(TimeStampedModel):
    codigo = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=100)
    direccion = models.CharField(max_length=255, blank=True)
    descripcion = models.TextField(blank=True)

    class Meta:
        
        verbose_name = _("Almacén")
        verbose_name_plural = _("Almacenes")
        ordering = ("codigo",)

    def __str__(self):
        return self.codigo


class Ubicacion(TimeStampedModel):
    almacen = models.ForeignKey(Almacen, models.CASCADE, related_name='ubicaciones')
    codigo = models.CharField(max_length=30)
    descripcion = models.CharField(max_length=255, blank=True)

    class Meta:
        
        verbose_name = _("Ubicación")
        verbose_name_plural = _("Ubicaciones")
        unique_together = ("almacen", "codigo")
        ordering = ("almacen", "codigo")

    def __str__(self):
        return f"{self.almacen.codigo}:{self.codigo}"


# ========= EXISTENCIAS =========

class Existencia(TimeStampedModel):
    producto = models.ForeignKey(ProductoInventario, models.PROTECT, related_name='existencias')
    almacen = models.ForeignKey(Almacen, models.PROTECT, related_name='existencias')
    ubicacion = models.ForeignKey(Ubicacion, models.PROTECT, null=True, blank=True, related_name='existencias')
    cantidad_disponible = models.DecimalField(max_digits=14, decimal_places=4, default=0)
    cantidad_reservada = models.DecimalField(max_digits=14, decimal_places=4, default=0)

    class Meta:
        
        verbose_name = _("Existencia")
        verbose_name_plural = _("Existencias")
        unique_together = ("producto", "almacen", "ubicacion")

    def __str__(self):
        ubi = self.ubicacion.codigo if self.ubicacion else "-"
        return f"{self.producto.sku} @ {self.almacen.codigo}/{ubi} -> {self.cantidad_disponible}"


# ========= MOVIMIENTOS / KARDEX =========

class TipoMovimiento(models.TextChoices):
    ENTRADA = 'IN', _('Entrada')
    SALIDA = 'OUT', _('Salida')
    TRASLADO = 'TRANSFER', _('Traslado')
    AJUSTE = 'ADJUST', _('Ajuste')


class TablaReferencia(models.TextChoices):
    OC = 'PO', _('Orden de Compra')
    PV = 'SO', _('Orden de Venta')
    AJ = 'ADJ', _('Ajuste')
    MANUAL = 'MAN', _('Manual')


class MovimientoInventario(TimeStampedModel):
    producto = models.ForeignKey(ProductoInventario, models.PROTECT, related_name='movimientos')
    almacen = models.ForeignKey(Almacen, models.PROTECT, related_name='movimientos')
    ubicacion = models.ForeignKey(Ubicacion, models.PROTECT, null=True, blank=True, related_name='movimientos')
    tipo_movimiento = models.CharField(max_length=8, choices=TipoMovimiento.choices)
    referencia = models.CharField(max_length=50, blank=True)
    tabla_referencia = models.CharField(max_length=4, choices=TablaReferencia.choices)
    cantidad = models.DecimalField(max_digits=14, decimal_places=4)
    costo_unitario = models.DecimalField(max_digits=12, decimal_places=4)
    observaciones = models.CharField(max_length=255, blank=True)

    class Meta:
        
        verbose_name = _("Movimiento de inventario")
        verbose_name_plural = _("Movimientos de inventario")
        indexes = [
            models.Index(fields=['producto', 'creado_en']),
        ]


# ========= COMPRAS =========

class Proveedor(TimeStampedModel):
    nombre = models.CharField(max_length=150)
    ruc = models.CharField(max_length=30, unique=True)
    telefono = models.CharField(max_length=30, blank=True)
    email = models.EmailField(max_length=120, blank=True)
    direccion = models.CharField(max_length=255, blank=True)

    class Meta:
       
        verbose_name = _("Proveedor")
        verbose_name_plural = _("Proveedores")
        ordering = ("nombre",)

    def __str__(self):
        return self.nombre


class EstadoOrdenCompra(models.TextChoices):
    BORRADOR = 'DRAFT', _('Borrador')
    APROBADA = 'APPROVED', _('Aprobada')
    RECIBIDA = 'RECEIVED', _('Recibida')
    CANCELADA = 'CANCELLED', _('Cancelada')


class OrdenCompra(TimeStampedModel):
    proveedor = models.ForeignKey(Proveedor, models.PROTECT, related_name='ordenes_compra')
    almacen = models.ForeignKey(Almacen, models.PROTECT, related_name='ordenes_compra')
    estado = models.CharField(max_length=10, choices=EstadoOrdenCompra.choices, default=EstadoOrdenCompra.BORRADOR)
    fecha_orden = models.DateField()
    fecha_estimada = models.DateField(null=True, blank=True)
    costo_total = models.DecimalField(max_digits=14, decimal_places=4, default=0)

    class Meta:
        
        verbose_name = _("Orden de Compra")
        verbose_name_plural = _("Ordenes de Compra")
        ordering = ('-fecha_orden',)

    def __str__(self):
        return f"OC-{self.id}"


class LineaOrdenCompra(TimeStampedModel):
    orden_compra = models.ForeignKey(OrdenCompra, models.CASCADE, related_name='lineas')
    producto = models.ForeignKey(ProductoInventario, models.PROTECT, related_name='lineas_compra')
    cantidad_pedida = models.DecimalField(max_digits=14, decimal_places=4)
    cantidad_recibida = models.DecimalField(max_digits=14, decimal_places=4, default=0)
    costo_unitario = models.DecimalField(max_digits=12, decimal_places=4)

    class Meta:
        
        verbose_name = _("Línea de Orden de Compra")
        verbose_name_plural = _("Líneas de Orden de Compra")
        unique_together = ("orden_compra", "producto")

    def __str__(self):
        return f"{self.producto.sku} x{self.cantidad_pedida}"


# ========= VENTAS =========

class Cliente(TimeStampedModel):
    nombre = models.CharField(max_length=150)
    ruc = models.CharField(max_length=30, unique=True)
    telefono = models.CharField(max_length=30, blank=True)
    email = models.EmailField(max_length=120, blank=True)
    direccion = models.CharField(max_length=255, blank=True)

    class Meta:
        
        verbose_name = _("Cliente")
        verbose_name_plural = _("Clientes")
        ordering = ("nombre",)

    def __str__(self):
        return self.nombre


class EstadoOrdenVenta(models.TextChoices):
    BORRADOR = 'DRAFT', _('Borrador')
    CONFIRMADA = 'CONFIRMED', _('Confirmada')
    ENVIADA = 'SHIPPED', _('Enviada')
    CANCELADA = 'CANCELLED', _('Cancelada')


class OrdenVenta(TimeStampedModel):
    cliente = models.ForeignKey(Cliente, models.PROTECT, related_name='ordenes_venta')
    almacen = models.ForeignKey(Almacen, models.PROTECT, related_name='ordenes_venta')
    estado = models.CharField(max_length=10, choices=EstadoOrdenVenta.choices, default=EstadoOrdenVenta.BORRADOR)
    fecha_orden = models.DateField()
    fecha_envio = models.DateField(null=True, blank=True)
    precio_total = models.DecimalField(max_digits=14, decimal_places=4, default=0)

    class Meta:
        
        verbose_name = _("Orden de Venta")
        verbose_name_plural = _("Ordenes de Venta")
        ordering = ('-fecha_orden',)

    def __str__(self):
        return f"OV-{self.id}"


class LineaOrdenVenta(TimeStampedModel):
    orden_venta = models.ForeignKey(OrdenVenta, models.CASCADE, related_name='lineas')
    producto = models.ForeignKey(ProductoInventario, models.PROTECT, related_name='lineas_venta')
    cantidad_pedida = models.DecimalField(max_digits=14, decimal_places=4)
    cantidad_enviada = models.DecimalField(max_digits=14, decimal_places=4, default=0)
    precio_unitario = models.DecimalField(max_digits=12, decimal_places=4)

    class Meta:
        
        verbose_name = _("Línea de Orden de Venta")
        verbose_name_plural = _("Líneas de Orden de Venta")
        unique_together = ("orden_venta", "producto")

    def __str__(self):
        return f"{self.producto.sku} x{self.cantidad_pedida}"


# ========= RESERVAS =========

class EstadoReserva(models.TextChoices):
    ACTIVA = 'ACTIVE', _('Activa')
    UTILIZADA = 'USED', _('Utilizada')
    CANCELADA = 'CANCELLED', _('Cancelada')


class ReservaInventario(TimeStampedModel):
    producto = models.ForeignKey(ProductoInventario, models.PROTECT, related_name='reservas')
    almacen = models.ForeignKey(Almacen, models.PROTECT, related_name='reservas')
    ubicacion = models.ForeignKey(Ubicacion, models.PROTECT, null=True, blank=True, related_name='reservas')
    cantidad = models.DecimalField(max_digits=14, decimal_places=4)
    estado = models.CharField(max_length=10, choices=EstadoReserva.choices, default=EstadoReserva.ACTIVA)
    referencia = models.CharField(max_length=50, blank=True)
    tabla_referencia = models.CharField(max_length=4, choices=TablaReferencia.choices)
    fecha_expiracion = models.DateField(null=True, blank=True)
    observaciones = models.CharField(max_length=255, blank=True)

    class Meta:
        
        verbose_name = _("Reserva de Inventario")
        verbose_name_plural = _("Reservas de Inventario")

    def __str__(self):
        return f"Reserva {self.id}: {self.producto.sku} x{self.cantidad}"