# backend/basic/admin.py

from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Categoria, Ciudad, EmpresaClc, Especialidad, Marca, 
    Procedencia, TipoCliente, TipoContratacion, Unidad, Zona, ZonaCiudad
)


class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'code', 'parent', 'level', 'path', 'is_active')
    list_filter = ('level', 'is_active', 'parent')
    search_fields = ('nombre', 'code', 'path')
    readonly_fields = ('level', 'path')
    list_per_page = 20
    
    def save_model(self, request, obj, form, change):
        """Guardar modelo y actualizar path y level automáticamente"""
        obj.save()  # El método save de Categoria ya actualiza level y path


class CiudadAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'provincia', 'code')
    list_filter = ('provincia',)
    search_fields = ('nombre', 'provincia', 'code')
    list_per_page = 20


@admin.register(ZonaCiudad)
class ZonaCiudadAdmin(admin.ModelAdmin):
    list_display = ('zona', 'ciudad')
    list_filter = ('zona', 'ciudad')
    search_fields = ('zona__nombre', 'ciudad__nombre')
    list_per_page = 20


class ZonaCiudadInline(admin.TabularInline):
    model = ZonaCiudad
    extra = 1
    verbose_name = "Ciudad asignada"
    verbose_name_plural = "Ciudades asignadas"


class ZonaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'code', 'get_ciudades_count')
    search_fields = ('nombre', 'code')
    inlines = [ZonaCiudadInline]
    list_per_page = 20
    
    def get_ciudades_count(self, obj):
        return obj.ciudad_relaciones.count()
    get_ciudades_count.short_description = 'Ciudades'


class EmpresaClcAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'razon_social', 'ruc', 'telefono', 'correo')
    search_fields = ('nombre', 'razon_social', 'ruc', 'direccion')
    list_per_page = 10
    fieldsets = (
        ('Información básica', {
            'fields': ('nombre', 'razon_social', 'code', 'ruc')
        }),
        ('Datos de contacto', {
            'fields': ('direccion', 'telefono', 'correo', 'representante_legal')
        }),
    )


class MarcaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'code', 'country_origin', 'website', 'is_active')
    list_filter = ('is_active', 'country_origin')
    search_fields = ('nombre', 'code', 'description')
    list_editable = ('is_active',)
    list_per_page = 20
    
    def website_link(self, obj):
        if obj.website:
            return format_html('<a href="{}" target="_blank">{}</a>', obj.website, obj.website)
        return "-"
    website_link.short_description = 'Sitio web'


# Registrar modelos restantes con configuración básica
@admin.register(Especialidad)
class EspecialidadAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'code')
    search_fields = ('nombre', 'code')


@admin.register(Procedencia)
class ProcedenciaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'code')
    search_fields = ('nombre', 'code')


@admin.register(TipoCliente)
class TipoClienteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'code')
    search_fields = ('nombre', 'code')


@admin.register(TipoContratacion)
class TipoContratacionAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'code')
    search_fields = ('nombre', 'code')


@admin.register(Unidad)
class UnidadAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'code')
    search_fields = ('nombre', 'code')


# Registrar modelos con sus clases Admin
admin.site.register(Categoria, CategoriaAdmin)
admin.site.register(Ciudad, CiudadAdmin)
admin.site.register(EmpresaClc, EmpresaClcAdmin)
admin.site.register(Marca, MarcaAdmin)
admin.site.register(Zona, ZonaAdmin)