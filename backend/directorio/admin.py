from django.contrib import admin
from django.db import models
from django.forms import CheckboxSelectMultiple
from django.utils.html import format_html
from .models import (
    Cliente,
    Proveedor,
    Vendedor,
    Contacto,
    RelacionBlue,
    Tag,
    ClienteTag,
    ProveedorTag,
    ContactoTag,
)

# Inline para mostrar tags en el formulario
class ClienteTagInline(admin.TabularInline):
    model = ClienteTag
    extra = 1
    verbose_name = "Etiqueta"
    verbose_name_plural = "Etiquetas"
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "tag":
            kwargs["queryset"] = Tag.objects.order_by('name')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

class ProveedorTagInline(admin.TabularInline):
    model = ProveedorTag
    extra = 1
    verbose_name = "Etiqueta"
    verbose_name_plural = "Etiquetas"
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "tag":
            kwargs["queryset"] = Tag.objects.order_by('name')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

class ContactoTagInline(admin.TabularInline):
    model = ContactoTag
    extra = 1
    verbose_name = "Etiqueta"
    verbose_name_plural = "Etiquetas"
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "tag":
            kwargs["queryset"] = Tag.objects.order_by('name')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'alias', 'ruc', 'email', 'telefono', 'activo', 'get_tags', 'ciudad', 'zona', 'tipo_cliente')
    search_fields = ('nombre', 'alias', 'ruc', 'razon_social')
    list_filter = ('activo', 'ciudad', 'zona', 'tipo_cliente', 'tags')
    ordering = ('nombre',)
    inlines = [ClienteTagInline]
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Información General', {
            'fields': ('nombre', 'alias', 'razon_social', 'ruc', 'activo')
        }),
        ('Contacto', {
            'fields': ('email', 'telefono', 'direccion')
        }),
        ('Ubicación', {
            'fields': ('zona', 'ciudad', 'tipo_cliente')
        }),
        ('Notas', {
            'fields': ('nota',),
            'classes': ('collapse',)
        }),
        ('Información del Sistema', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_tags(self, obj):
        """Muestra las tags en la lista de clientes"""
        return ", ".join([tag.name for tag in obj.tags.all()])
    get_tags.short_description = 'Etiquetas'

@admin.register(Proveedor)
class ProveedorAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'razon_social', 'ruc', 'correo', 'telefono', 'activo', 'get_tags', 'ciudad')
    search_fields = ('nombre', 'razon_social', 'ruc')
    list_filter = ('activo', 'ciudad', 'tipo_primario', 'tags')
    ordering = ('nombre',)
    inlines = [ProveedorTagInline]
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Información General', {
            'fields': ('nombre', 'razon_social', 'ruc', 'tipo_primario', 'activo')
        }),
        ('Contacto', {
            'fields': ('correo', 'telefono')
        }),
        ('Direcciones', {
            'fields': ('direccion1', 'direccion2', 'ciudad')
        }),
        ('Información del Sistema', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_tags(self, obj):
        """Muestra las tags en la lista de proveedores"""
        return ", ".join([tag.name for tag in obj.tags.all()])
    get_tags.short_description = 'Etiquetas'

@admin.register(Vendedor)
class VendedorAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'proveedor', 'correo', 'telefono', 'activo')
    search_fields = ('nombre', 'proveedor__nombre', 'correo')
    list_filter = ('activo', 'proveedor')
    ordering = ('nombre',)

@admin.register(Contacto)
class ContactoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'alias', 'telefono', 'email', 'ingerencia', 'get_tags')
    search_fields = ('nombre', 'alias', 'email', 'ingerencia')
    list_filter = ('tags',)
    ordering = ('nombre',)
    inlines = [ContactoTagInline]
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Información Personal', {
            'fields': ('nombre', 'alias')
        }),
        ('Contacto', {
            'fields': ('telefono', 'telefono2', 'email', 'direccion')
        }),
        ('Información Profesional', {
            'fields': ('ingerencia',)
        }),
        ('Observaciones', {
            'fields': ('obserbacion',),
            'classes': ('collapse',)
        }),
        ('Información del Sistema', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_tags(self, obj):
        """Muestra las tags en la lista de contactos"""
        return ", ".join([tag.name for tag in obj.tags.all()])
    get_tags.short_description = 'Etiquetas'

@admin.register(RelacionBlue)
class RelacionBlueAdmin(admin.ModelAdmin):
    list_display = ('cliente', 'contacto', 'nivel', 'created_at')
    search_fields = ('cliente__nombre', 'contacto__nombre')
    list_filter = ('nivel', 'cliente', 'contacto')
    ordering = ('-created_at',)


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'color_code', 'get_color_preview', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name',)
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('name',)
    
    fieldsets = (
        (None, {
            'fields': ('name', 'color_code')
        }),
        ('Información del Sistema', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_color_preview(self, obj):
        """Muestra una vista previa del color"""
        return format_html(
            '<div style="width: 20px; height: 20px; background-color: {}; border: 1px solid #ccc; display: inline-block; border-radius: 3px;"></div>',
            obj.color_code
        )
    get_color_preview.short_description = 'Color'

@admin.register(ClienteTag)
class ClienteTagAdmin(admin.ModelAdmin):
    list_display = ('cliente', 'tag', 'created_at')
    list_filter = ('tag', 'cliente')
    readonly_fields = ('created_at',)

@admin.register(ProveedorTag)
class ProveedorTagAdmin(admin.ModelAdmin):
    list_display = ('proveedor', 'tag', 'created_at')
    list_filter = ('tag', 'proveedor')
    readonly_fields = ('created_at',)

@admin.register(ContactoTag)
class ContactoTagAdmin(admin.ModelAdmin):
    list_display = ('contacto', 'tag', 'created_at')
    list_filter = ('tag', 'contacto')
    readonly_fields = ('created_at',)

# If you prefer a simpler registration without custom admin classes, you can use:
# admin.site.register(Cliente)
# admin.site.register(Proveedor)
# admin.site.register(Vendedor)
# admin.site.register(Contacto)
# admin.site.register(RelacionBlue)

