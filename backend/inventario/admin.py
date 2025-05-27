from django.contrib import admin
from .models import (
    Almacen, Stock, TipoMovimiento, 
    Movimiento, DetalleMovimiento, AlertaStock
)

@admin.register(Almacen)
class AlmacenAdmin(admin.ModelAdmin):
    list_display = ['codigo', 'nombre', 'responsable', 'activo']
    list_filter = ['activo']
    search_fields = ['codigo', 'nombre']

@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ['producto', 'almacen', 'cantidad', 'cantidad_disponible', 'estado_stock']
    list_filter = ['almacen', 'fecha_vencimiento']
    search_fields = ['producto__nombre', 'producto__codigo']
    readonly_fields = ['cantidad_disponible', 'estado_stock']

class DetalleMovimientoInline(admin.TabularInline):
    model = DetalleMovimiento
    extra = 1

@admin.register(Movimiento)
class MovimientoAdmin(admin.ModelAdmin):
    list_display = ['tipo_movimiento', 'fecha', 'numero_documento', 'estado']
    list_filter = ['tipo_movimiento', 'estado', 'fecha']
    search_fields = ['numero_documento']
    inlines = [DetalleMovimientoInline]
    readonly_fields = ['created_at', 'updated_at']

@admin.register(TipoMovimiento)
class TipoMovimientoAdmin(admin.ModelAdmin):
    list_display = ['codigo', 'nombre', 'tipo', 'activo']
    list_filter = ['tipo', 'activo']

@admin.register(AlertaStock)
class AlertaStockAdmin(admin.ModelAdmin):
    list_display = ['stock', 'tipo_alerta', 'leida', 'created_at']
    list_filter = ['tipo_alerta', 'leida']
    readonly_fields = ['created_at']
