from django.contrib import admin
from .models import Cliente, Proveedor, Vendedor, Contacto, RelacionBlue

@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'alias', 'ruc', 'email', 'telefono', 'activo', 'ciudad', 'zona', 'tipo_cliente')
    search_fields = ('nombre', 'alias', 'ruc', 'razon_social')
    list_filter = ('activo', 'ciudad', 'zona', 'tipo_cliente')
    ordering = ('nombre',)

@admin.register(Proveedor)
class ProveedorAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'razon_social', 'ruc', 'correo', 'telefono', 'activo', 'ciudad')
    search_fields = ('nombre', 'razon_social', 'ruc')
    list_filter = ('activo', 'ciudad', 'tipo_primario')
    ordering = ('nombre',)

@admin.register(Vendedor)
class VendedorAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'proveedor', 'correo', 'telefono', 'activo')
    search_fields = ('nombre', 'proveedor__nombre', 'correo')
    list_filter = ('activo', 'proveedor')
    ordering = ('nombre',)

@admin.register(Contacto)
class ContactoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'alias', 'telefono', 'email', 'ingerencia')
    search_fields = ('nombre', 'alias', 'email', 'ingerencia')
    ordering = ('nombre',)

@admin.register(RelacionBlue)
class RelacionBlueAdmin(admin.ModelAdmin):
    list_display = ('cliente', 'contacto', 'nivel', 'created_at')
    search_fields = ('cliente__nombre', 'contacto__nombre')
    list_filter = ('nivel', 'cliente', 'contacto')
    ordering = ('-created_at',)

# If you prefer a simpler registration without custom admin classes, you can use:
# admin.site.register(Cliente)
# admin.site.register(Proveedor)
# admin.site.register(Vendedor)
# admin.site.register(Contacto)
# admin.site.register(RelacionBlue)
