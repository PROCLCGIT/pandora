from django.contrib import admin
from .models import (
    Unidad, Categoria, ProductoInventario, Almacen, Ubicacion, Existencia,
    MovimientoInventario, Proveedor, OrdenCompra, LineaOrdenCompra,
    Cliente, OrdenVenta, LineaOrdenVenta, ReservaInventario
)

# Register your models here.
admin.site.register(Unidad)
admin.site.register(Categoria)
admin.site.register(ProductoInventario)
admin.site.register(Almacen)
admin.site.register(Ubicacion)
admin.site.register(Existencia)
admin.site.register(MovimientoInventario)
admin.site.register(Proveedor)
admin.site.register(OrdenCompra)
admin.site.register(LineaOrdenCompra)
admin.site.register(Cliente)
admin.site.register(OrdenVenta)
admin.site.register(LineaOrdenVenta)
admin.site.register(ReservaInventario)
