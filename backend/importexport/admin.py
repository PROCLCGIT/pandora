from django.contrib import admin
from .models import ImportTask

@admin.register(ImportTask)
class ImportTaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'tipo', 'estado', 'registros_procesados', 'registros_exitosos', 
                   'registros_fallidos', 'creado_por', 'creado_en')
    list_filter = ('tipo', 'estado', 'creado_en')
    search_fields = ('mensaje', 'creado_por__username')
    readonly_fields = ('estado', 'mensaje', 'registros_procesados', 'registros_exitosos', 
                      'registros_fallidos', 'creado_en', 'actualizado_en')
    date_hierarchy = 'creado_en'
