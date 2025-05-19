# backend/productos/models.py

from django.db import models
from django.conf import settings
from django.utils import timezone

class ProductoOfertado(models.Model):
    """
    Modelo para productos ofertados por la empresa.
    Representa el catálogo de productos que la empresa ofrece a sus clientes.
    """
    id_categoria = models.ForeignKey(
        'basic.Categoria',
        on_delete=models.CASCADE,
        related_name='productos_ofertados',
        verbose_name='Categoría'
    )
    code = models.CharField(max_length=100, unique=True, verbose_name='Código')
    cudim = models.CharField(max_length=100, unique=True, verbose_name='CUDIM')
    nombre = models.CharField(max_length=255, verbose_name='Nombre')
    descripcion = models.TextField(blank=True, verbose_name='Descripción')
    # Campo especialidad para integración con Especialidad
    especialidad = models.ForeignKey(
        'basic.Especialidad',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='productos_ofertados',
        verbose_name='Especialidad'
    )
    # Campo de compatibilidad para mantener el texto original de especialidad
    # Esto es necesario debido a la migración from CharField to ForeignKey
    especialidad_texto = models.CharField(
        max_length=255,
        blank=True,
        default='',  # Valor por defecto para evitar errores al crear nuevos registros
        verbose_name='Texto de Especialidad'
    )

    def save(self, *args, **kwargs):
        # Sincronizar especialidad_texto con especialidad.nombre si está disponible
        if self.especialidad and not self.especialidad_texto:
            self.especialidad_texto = self.especialidad.nombre
        super().save(*args, **kwargs)
    referencias = models.TextField(blank=True, verbose_name='Referencias')
    is_active = models.BooleanField(default=True, verbose_name='Activo')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='productos_ofertados_creados',
        verbose_name='Creado por'
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='productos_ofertados_actualizados',
        verbose_name='Actualizado por'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')

    class Meta:
        verbose_name = 'Producto Ofertado'
        verbose_name_plural = 'Productos Ofertados'
        ordering = ['nombre']

    def __str__(self):
        return f"{self.code} - {self.nombre}"

class ImagenReferenciaProductoOfertado(models.Model):
    """
    Modelo para imágenes de referencia asociadas a productos ofertados.
    Permite asociar múltiples imágenes a un producto con orden y una imagen principal.
    """
    producto_ofertado = models.ForeignKey(
        ProductoOfertado, 
        on_delete=models.CASCADE, 
        related_name='imagenes',
        verbose_name='Producto Ofertado'
    )
    imagen = models.FileField(upload_to='productos/imagenes/%Y/%m/%d/', verbose_name='Imagen')
    descripcion = models.CharField(max_length=255, blank=True, verbose_name='Descripción')
    orden = models.IntegerField(default=0, verbose_name='Orden')
    is_primary = models.BooleanField(default=False, verbose_name='Imagen principal')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='imagenes_producto_ofertado_creadas',
        verbose_name='Creado por'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')

    class Meta:
        verbose_name = 'Imagen de Referencia'
        verbose_name_plural = 'Imágenes de Referencia'
        ordering = ['orden']

    def __str__(self):
        return f"Imagen {self.orden} de {self.producto_ofertado}"

class DocumentoProductoOfertado(models.Model):
    """
    Modelo para documentos asociados a productos ofertados.
    Permite asociar múltiples documentos a un producto con visibilidad pública o privada.
    """
    producto_ofertado = models.ForeignKey(
        ProductoOfertado, 
        on_delete=models.CASCADE, 
        related_name='documentos',
        verbose_name='Producto Ofertado'
    )
    documento = models.FileField(upload_to='productos/documentos/%Y/%m/%d/', verbose_name='Documento')
    tipo_documento = models.CharField(max_length=100, verbose_name='Tipo de documento')
    titulo = models.CharField(max_length=255, verbose_name='Título')
    descripcion = models.TextField(blank=True, verbose_name='Descripción')
    is_public = models.BooleanField(default=False, verbose_name='Público')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='documentos_producto_ofertado_creados',
        verbose_name='Creado por'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')

    class Meta:
        verbose_name = 'Documento de Producto Ofertado'
        verbose_name_plural = 'Documentos de Productos Ofertados'
        ordering = ['titulo']

    def __str__(self):
        return f"{self.titulo} ({self.tipo_documento})"

class ProductoDisponible(models.Model):
    """
    Modelo para productos disponibles para la venta.
    Representa los productos específicos que la empresa tiene disponibles en inventario,
    con detalles como marca, modelo, precios y características.
    """
    id_categoria = models.ForeignKey(
        'basic.Categoria', 
        on_delete=models.CASCADE, 
        related_name='productos_disponibles',
        verbose_name='Categoría'
    )
    id_producto_ofertado = models.ForeignKey(
        ProductoOfertado, 
        on_delete=models.CASCADE, 
        related_name='productos_disponibles',
        verbose_name='Producto Ofertado'
    )
    code = models.CharField(max_length=100, unique=True, verbose_name='Código')
    nombre = models.CharField(max_length=255, verbose_name='Nombre')
    id_marca = models.ForeignKey(
        'basic.Marca', 
        on_delete=models.CASCADE, 
        related_name='productos',
        verbose_name='Marca'
    )
    modelo = models.CharField(max_length=255, verbose_name='Modelo')
    unidad_presentacion = models.ForeignKey(
        'basic.Unidad', 
        on_delete=models.CASCADE, 
        related_name='productos',
        verbose_name='Unidad de Presentación'
    )
    procedencia = models.ForeignKey(
        'basic.Procedencia', 
        on_delete=models.CASCADE, 
        related_name='productos',
        verbose_name='Procedencia'
    )
    referencia = models.CharField(max_length=255, blank=True, verbose_name='Referencia')
    tz_oferta = models.IntegerField(default=0, verbose_name='TZ Oferta')
    tz_demanda = models.IntegerField(default=0, verbose_name='TZ Demanda')
    tz_inflacion = models.IntegerField(default=0, verbose_name='TZ Inflación')
    tz_calidad = models.IntegerField(default=0, verbose_name='TZ Calidad')
    tz_eficiencia = models.IntegerField(default=0, verbose_name='TZ Eficiencia')
    tz_referencial = models.IntegerField(default=0, verbose_name='TZ Referencial')
    costo_referencial = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0,
        verbose_name='Costo Referencial'
    )
    precio_sie_referencial = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0,
        verbose_name='Precio SIE Referencial'
    )
    precio_sie_tipob = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0,
        verbose_name='Precio SIE Tipo B'
    )
    precio_venta_privado = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0,
        verbose_name='Precio Venta Privado'
    )
    is_active = models.BooleanField(default=True, verbose_name='Activo')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='productos_disponibles_creados',
        verbose_name='Creado por'
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='productos_disponibles_actualizados',
        verbose_name='Actualizado por'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')

    class Meta:
        verbose_name = 'Producto Disponible'
        verbose_name_plural = 'Productos Disponibles'
        ordering = ['nombre']

    def __str__(self):
        return f"{self.code} - {self.nombre} ({self.id_marca.nombre})"

class ImagenProductoDisponible(models.Model):
    """
    Modelo para imágenes asociadas a productos disponibles.
    Permite asociar múltiples imágenes a un producto con orden y una imagen principal.
    """
    producto_disponible = models.ForeignKey(
        ProductoDisponible, 
        on_delete=models.CASCADE, 
        related_name='imagenes',
        verbose_name='Producto Disponible'
    )
    imagen = models.FileField(upload_to='productos/imagenes/%Y/%m/%d/', verbose_name='Imagen')
    descripcion = models.CharField(max_length=255, blank=True, verbose_name='Descripción')
    orden = models.IntegerField(default=0, verbose_name='Orden')
    is_primary = models.BooleanField(default=False, verbose_name='Imagen principal')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='imagenes_producto_disponible_creadas',
        verbose_name='Creado por'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')

    class Meta:
        verbose_name = 'Imagen de Producto Disponible'
        verbose_name_plural = 'Imágenes de Productos Disponibles'
        ordering = ['orden']

    def __str__(self):
        return f"Imagen {self.orden} de {self.producto_disponible}"

class DocumentoProductoDisponible(models.Model):
    """
    Modelo para documentos asociados a productos disponibles.
    Permite asociar múltiples documentos a un producto con visibilidad pública o privada.
    """
    producto_disponible = models.ForeignKey(
        ProductoDisponible, 
        on_delete=models.CASCADE, 
        related_name='documentos',
        verbose_name='Producto Disponible'
    )
    documento = models.FileField(upload_to='productos/documentos/%Y/%m/%d/', verbose_name='Documento')
    tipo_documento = models.CharField(max_length=100, verbose_name='Tipo de documento')
    titulo = models.CharField(max_length=255, verbose_name='Título')
    descripcion = models.TextField(blank=True, verbose_name='Descripción')
    is_public = models.BooleanField(default=False, verbose_name='Público')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='documentos_producto_disponible_creados',
        verbose_name='Creado por'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')

    class Meta:
        verbose_name = 'Documento de Producto Disponible'
        verbose_name_plural = 'Documentos de Productos Disponibles'
        ordering = ['titulo']

    def __str__(self):
        return f"{self.titulo} ({self.tipo_documento})"

class ProductsPrice(models.Model):
    """
    Modelo para el historial de precios de productos disponibles.
    Permite registrar los cambios de precios a lo largo del tiempo.
    """
    producto_disponible = models.ForeignKey(
        ProductoDisponible, 
        on_delete=models.CASCADE, 
        related_name='precios',
        verbose_name='Producto Disponible'
    )
    valor = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='Valor')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')

    class Meta:
        verbose_name = 'Precio de Producto'
        verbose_name_plural = 'Precios de Productos'
        ordering = ['-created_at']

    def __str__(self):
        return f"Precio de {self.producto_disponible} - {self.valor}"

class HistorialDeCompras(models.Model):
    """
    Modelo para el registro de compras de productos.
    Permite llevar un control de las compras realizadas a proveedores.
    """
    producto = models.ForeignKey(
        ProductoDisponible, 
        on_delete=models.CASCADE, 
        related_name='compras',
        verbose_name='Producto'
    )
    proveedor = models.ForeignKey(
        'directorio.Proveedor', 
        on_delete=models.CASCADE, 
        related_name='ventas',
        verbose_name='Proveedor'
    )
    empresa = models.ForeignKey(
        'basic.EmpresaClc',
        on_delete=models.CASCADE, 
        related_name='compras',
        verbose_name='Empresa'
    )
    fecha = models.DateField(verbose_name='Fecha')
    factura = models.CharField(max_length=100, unique=True, verbose_name='Número de Factura')
    valor = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='Valor')
    iva = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='IVA')
    cantidad = models.IntegerField(verbose_name='Cantidad')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de registro')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')

    class Meta:
        verbose_name = 'Historial de Compra'
        verbose_name_plural = 'Historial de Compras'
        ordering = ['-fecha']

    def __str__(self):
        return f"Compra a {self.proveedor} - Factura: {self.factura}"

    @property
    def valor_total(self):
        """Calcula el valor total de la compra incluyendo IVA"""
        return self.valor + self.iva

class HistorialDeVentas(models.Model):
    """
    Modelo para el registro de ventas de productos.
    Permite llevar un control de las ventas realizadas a clientes.
    """
    producto = models.ForeignKey(
        ProductoDisponible, 
        on_delete=models.CASCADE, 
        related_name='ventas',
        verbose_name='Producto'
    )
    cliente = models.ForeignKey(
        'directorio.Cliente', 
        on_delete=models.CASCADE, 
        related_name='compras',
        verbose_name='Cliente'
    )
    empresa = models.ForeignKey(
        'basic.EmpresaClc',
        on_delete=models.CASCADE, 
        related_name='ventas',
        verbose_name='Empresa'
    )
    fecha = models.DateField(verbose_name='Fecha')
    factura = models.CharField(max_length=100, unique=True, verbose_name='Número de Factura')
    valor = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='Valor')
    iva = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='IVA')
    cantidad = models.IntegerField(verbose_name='Cantidad')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de registro')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')

    class Meta:
        verbose_name = 'Historial de Venta'
        verbose_name_plural = 'Historial de Ventas'
        ordering = ['-fecha']

    def __str__(self):
        return f"Venta a {self.cliente} - Factura: {self.factura}"

    @property
    def valor_total(self):
        """Calcula el valor total de la venta incluyendo IVA"""
        return self.valor + self.iva