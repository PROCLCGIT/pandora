from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.db.models import Sum, F
from productos.models import ProductoDisponible
from directorio.models import Proveedor, Cliente
from basic.models import Unidad

class Almacen(models.Model):
    """Modelo para gestionar múltiples almacenes/bodegas"""
    codigo = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=100)
    direccion = models.TextField(blank=True)
    responsable = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='almacenes')
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'inv_almacenes'
        ordering = ['nombre']
        
    def __str__(self):
        return f"{self.codigo} - {self.nombre}"

class Stock(models.Model):
    """Modelo para el stock actual de productos"""
    producto = models.ForeignKey(ProductoDisponible, on_delete=models.CASCADE, related_name='stocks')
    almacen = models.ForeignKey(Almacen, on_delete=models.CASCADE, related_name='stocks')
    cantidad = models.DecimalField(
        max_digits=14, 
        decimal_places=4, 
        default=0,
        validators=[MinValueValidator(0)]
    )
    cantidad_reservada = models.DecimalField(
        max_digits=14, 
        decimal_places=4, 
        default=0,
        validators=[MinValueValidator(0)]
    )
    stock_minimo = models.DecimalField(
        max_digits=14, 
        decimal_places=4, 
        default=0,
        validators=[MinValueValidator(0)]
    )
    stock_maximo = models.DecimalField(
        max_digits=14, 
        decimal_places=4, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(0)]
    )
    ubicacion = models.CharField(max_length=50, blank=True)
    lote = models.CharField(max_length=50, blank=True)
    fecha_vencimiento = models.DateField(null=True, blank=True)
    costo_promedio = models.DecimalField(max_digits=14, decimal_places=4, default=0)
    ultimo_movimiento = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'inv_stocks'
        unique_together = ['producto', 'almacen', 'lote']
        ordering = ['producto__nombre']
        
    def __str__(self):
        return f"{self.producto.nombre} - {self.almacen.nombre}: {self.cantidad}"
    
    @property
    def cantidad_disponible(self):
        """Cantidad disponible (no reservada)"""
        return self.cantidad - self.cantidad_reservada
    
    @property
    def estado_stock(self):
        """Retorna el estado del stock: critico, bajo, normal, alto"""
        if self.cantidad <= 0:
            return 'agotado'
        elif self.cantidad <= self.stock_minimo:
            return 'critico'
        elif self.cantidad <= self.stock_minimo * 1.5:
            return 'bajo'
        elif self.stock_maximo and self.cantidad >= self.stock_maximo:
            return 'alto'
        return 'normal'

class TipoMovimiento(models.Model):
    """Tipos de movimientos de inventario"""
    TIPO_CHOICES = [
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
        ('ajuste', 'Ajuste'),
        ('transferencia', 'Transferencia'),
    ]
    
    codigo = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=100)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    afecta_costo = models.BooleanField(default=True)
    requiere_documento = models.BooleanField(default=False)
    activo = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'inv_tipos_movimiento'
        ordering = ['nombre']
        
    def __str__(self):
        return f"{self.codigo} - {self.nombre}"

class Movimiento(models.Model):
    """Registro de movimientos de inventario"""
    tipo_movimiento = models.ForeignKey(TipoMovimiento, on_delete=models.PROTECT)
    fecha = models.DateTimeField()
    numero_documento = models.CharField(max_length=50, blank=True)
    almacen_origen = models.ForeignKey(
        Almacen, 
        on_delete=models.PROTECT, 
        related_name='movimientos_salida',
        null=True,
        blank=True
    )
    almacen_destino = models.ForeignKey(
        Almacen, 
        on_delete=models.PROTECT, 
        related_name='movimientos_entrada',
        null=True,
        blank=True
    )
    proveedor = models.ForeignKey(
        Proveedor, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    cliente = models.ForeignKey(
        Cliente, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    observaciones = models.TextField(blank=True)
    estado = models.CharField(
        max_length=20,
        choices=[
            ('borrador', 'Borrador'),
            ('confirmado', 'Confirmado'),
            ('anulado', 'Anulado'),
        ],
        default='borrador'
    )
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'inv_movimientos'
        ordering = ['-fecha', '-id']
        
    def __str__(self):
        return f"{self.tipo_movimiento.nombre} - {self.fecha.strftime('%Y-%m-%d')} - {self.numero_documento}"
    
    def confirmar(self):
        """Confirma el movimiento y actualiza el stock"""
        if self.estado != 'borrador':
            raise ValueError("Solo se pueden confirmar movimientos en borrador")
        
        for detalle in self.detalles.all():
            detalle.aplicar_movimiento()
        
        self.estado = 'confirmado'
        self.save()

class DetalleMovimiento(models.Model):
    """Detalle de cada movimiento"""
    movimiento = models.ForeignKey(Movimiento, on_delete=models.CASCADE, related_name='detalles')
    producto = models.ForeignKey(ProductoDisponible, on_delete=models.PROTECT)
    cantidad = models.DecimalField(
        max_digits=14, 
        decimal_places=4,
        validators=[MinValueValidator(0.0001)]
    )
    unidad_medida = models.ForeignKey(Unidad, on_delete=models.PROTECT)
    costo_unitario = models.DecimalField(max_digits=14, decimal_places=4, default=0)
    lote = models.CharField(max_length=50, blank=True)
    fecha_vencimiento = models.DateField(null=True, blank=True)
    observaciones = models.TextField(blank=True)
    
    class Meta:
        db_table = 'inv_detalles_movimiento'
        
    def __str__(self):
        return f"{self.producto.nombre} - {self.cantidad}"
    
    def aplicar_movimiento(self):
        """Aplica el movimiento al stock"""
        tipo = self.movimiento.tipo_movimiento.tipo
        
        if tipo == 'entrada':
            self._procesar_entrada()
        elif tipo == 'salida':
            self._procesar_salida()
        elif tipo == 'transferencia':
            self._procesar_transferencia()
        elif tipo == 'ajuste':
            self._procesar_ajuste()
    
    def _procesar_entrada(self):
        """Procesa una entrada de stock"""
        stock, created = Stock.objects.get_or_create(
            producto=self.producto,
            almacen=self.movimiento.almacen_destino,
            lote=self.lote,
            defaults={
                'fecha_vencimiento': self.fecha_vencimiento,
                'costo_promedio': self.costo_unitario
            }
        )
        
        # Actualizar cantidad y costo promedio
        cantidad_anterior = stock.cantidad
        costo_anterior = stock.costo_promedio
        
        stock.cantidad += self.cantidad
        
        if self.movimiento.tipo_movimiento.afecta_costo:
            # Cálculo del costo promedio ponderado
            total_anterior = cantidad_anterior * costo_anterior
            total_nuevo = self.cantidad * self.costo_unitario
            stock.costo_promedio = (total_anterior + total_nuevo) / stock.cantidad
        
        stock.ultimo_movimiento = self.movimiento.fecha
        stock.save()
    
    def _procesar_salida(self):
        """Procesa una salida de stock"""
        try:
            stock = Stock.objects.get(
                producto=self.producto,
                almacen=self.movimiento.almacen_origen,
                lote=self.lote
            )
            
            if stock.cantidad_disponible < self.cantidad:
                raise ValueError(f"Stock insuficiente para {self.producto.nombre}")
            
            stock.cantidad -= self.cantidad
            stock.ultimo_movimiento = self.movimiento.fecha
            stock.save()
            
        except Stock.DoesNotExist:
            raise ValueError(f"No existe stock para {self.producto.nombre} en el almacén origen")
    
    def _procesar_transferencia(self):
        """Procesa una transferencia entre almacenes"""
        # Primero procesamos como salida del origen
        self._procesar_salida()
        
        # Luego como entrada al destino
        self._procesar_entrada()
    
    def _procesar_ajuste(self):
        """Procesa un ajuste de inventario"""
        stock, created = Stock.objects.get_or_create(
            producto=self.producto,
            almacen=self.movimiento.almacen_destino or self.movimiento.almacen_origen,
            lote=self.lote,
            defaults={
                'fecha_vencimiento': self.fecha_vencimiento,
                'costo_promedio': self.costo_unitario
            }
        )
        
        # En un ajuste, la cantidad es el nuevo valor absoluto
        stock.cantidad = self.cantidad
        stock.ultimo_movimiento = self.movimiento.fecha
        stock.save()

class AlertaStock(models.Model):
    """Alertas automáticas de stock"""
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name='alertas')
    tipo_alerta = models.CharField(
        max_length=20,
        choices=[
            ('minimo', 'Stock Mínimo'),
            ('maximo', 'Stock Máximo'),
            ('vencimiento', 'Próximo a Vencer'),
            ('agotado', 'Stock Agotado'),
        ]
    )
    mensaje = models.TextField()
    leida = models.BooleanField(default=False)
    usuario_asignado = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'inv_alertas_stock'
        ordering = ['-created_at']
