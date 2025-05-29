from django.contrib import admin
from django.utils.html import format_html
from .models import Brief, BriefItem, BriefHistory

@admin.register(Brief)
class BriefAdmin(admin.ModelAdmin):
    list_display = [
        'code', 'title', 'client', 'priority_badge', 'status_badge', 
        'operador', 'fecha_emision', 'due_date'
    ]
    list_filter = [
        'estado', 'priority', 'origin', 'destino', 'forma_pago',
        'fecha_emision', 'operador'
    ]
    search_fields = ['code', 'title', 'client__nombre', 'description']
    readonly_fields = ['code', 'fecha_emision', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Identificación', {
            'fields': ('code', 'client', 'title')
        }),
        ('Origen y Destino', {
            'fields': ('origin', 'destino', 'operador')
        }),
        ('Contenido', {
            'fields': ('description', 'priority', 'estado')
        }),
        ('Información Comercial', {
            'fields': ('presupuesto', 'tiempo_entrega', 'forma_pago')
        }),
        ('Fechas', {
            'fields': ('fecha_emision', 'due_date', 'created_at', 'updated_at')
        }),
        ('Observaciones', {
            'fields': ('observaciones_internas', 'archivo_adjunto')
        })
    )
    
    def priority_badge(self, obj):
        color = obj.priority_color
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px;">{}</span>',
            color,
            obj.get_priority_display()
        )
    priority_badge.short_description = 'Prioridad'
    
    def status_badge(self, obj):
        color = obj.status_color
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px;">{}</span>',
            color,
            obj.get_estado_display()
        )
    status_badge.short_description = 'Estado'

@admin.register(BriefItem)
class BriefItemAdmin(admin.ModelAdmin):
    list_display = ['brief', 'product', 'quantity', 'unit', 'precio_estimado']
    list_filter = ['unit', 'brief__estado']
    search_fields = ['product', 'brief__code', 'specifications']