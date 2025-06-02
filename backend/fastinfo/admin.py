from django.contrib import admin
from .models import NombreEntidad, DatosInstitucionales

@admin.register(NombreEntidad)
class NombreEntidadAdmin(admin.ModelAdmin):
    list_display = ['codigo', 'nombre', 'activo', 'created_at']
    list_filter = ['activo', 'created_at']
    search_fields = ['codigo', 'nombre']
    ordering = ['nombre']

@admin.register(DatosInstitucionales)
class DatosInstitucionalesAdmin(admin.ModelAdmin):
    list_display = [
        'nombre_entidad_texto', 
        'ruc', 
        'usuario', 
        'representante', 
        'activo',
        'fecha_ultima_actualizacion'
    ]
    
    list_filter = [
        'nombre_entidad', 
        'activo', 
        'fecha_ultima_actualizacion',
        'created_at'
    ]
    
    search_fields = [
        'nombre_entidad__nombre', 
        'ruc', 
        'usuario', 
        'correo', 
        'representante'
    ]
    
    def nombre_entidad_texto(self, obj):
        return obj.nombre_entidad_texto
    nombre_entidad_texto.short_description = 'Entidad'