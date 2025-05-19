from django.contrib import admin
from .models import (
    ProductoOfertado,
    ImagenReferenciaProductoOfertado,
    DocumentoProductoOfertado,
    ProductoDisponible,
    ImagenProductoDisponible,
    DocumentoProductoDisponible,
    ProductsPrice,
    HistorialDeCompras,
    HistorialDeVentas
)

@admin.register(ProductoOfertado)
class ProductoOfertadoAdmin(admin.ModelAdmin):
    list_display = ('code', 'nombre', 'id_categoria', 'is_active', 'created_at', 'updated_at')
    search_fields = ('code', 'nombre', 'cudim', 'descripcion')
    list_filter = ('is_active', 'id_categoria', 'created_at')
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by')

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        obj.updated_by = request.user

        # Workaround para el campo especialidad_texto que está en la base de datos
        # pero no en el modelo. Asignar un valor por defecto para evitar error de NULL
        from django.db import connection
        with connection.cursor() as cursor:
            # Revisar si la columna especialidad_texto existe en la tabla
            cursor.execute("""
                SELECT COUNT(*)
                FROM information_schema.columns
                WHERE table_name = 'productos_productoofertado'
                AND column_name = 'especialidad_texto'
            """)
            if cursor.fetchone()[0] > 0:
                # Si existe la columna, agregamos el valor en SQL directamente después de guardar
                # primero guardamos el objeto para obtener su ID
                super().save_model(request, obj, form, change)

                # Determinamos un valor para especialidad_texto
                especialidad_texto = ""
                if obj.especialidad:
                    especialidad_texto = obj.especialidad.nombre

                # Actualizamos directamente en la base de datos
                cursor.execute(
                    "UPDATE productos_productoofertado SET especialidad_texto = %s WHERE id = %s",
                    [especialidad_texto, obj.id]
                )
                return

        # Si no existe la columna o hubo un error, continuamos con el guardado normal
        super().save_model(request, obj, form, change)

@admin.register(ImagenReferenciaProductoOfertado)
class ImagenReferenciaProductoOfertadoAdmin(admin.ModelAdmin):
    list_display = ('producto_ofertado', 'orden', 'is_primary', 'created_at')
    search_fields = ('producto_ofertado__nombre', 'descripcion')
    list_filter = ('is_primary', 'created_at')
    readonly_fields = ('created_at', 'updated_at', 'created_by')

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change) # updated_by is not in the model

@admin.register(DocumentoProductoOfertado)
class DocumentoProductoOfertadoAdmin(admin.ModelAdmin):
    list_display = ('producto_ofertado', 'titulo', 'tipo_documento', 'is_public', 'created_at')
    search_fields = ('producto_ofertado__nombre', 'titulo', 'descripcion')
    list_filter = ('is_public', 'tipo_documento', 'created_at')
    readonly_fields = ('created_at', 'updated_at', 'created_by')

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change) # updated_by is not in the model

@admin.register(ProductoDisponible)
class ProductoDisponibleAdmin(admin.ModelAdmin):
    list_display = ('code', 'nombre', 'id_marca', 'modelo', 'is_active', 'created_at', 'updated_at')
    search_fields = ('code', 'nombre', 'modelo', 'referencia')
    list_filter = ('is_active', 'id_marca', 'procedencia', 'created_at')
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by')
    fieldsets = (
        (None, {
            'fields': ('id_categoria', 'id_producto_ofertado', 'code', 'nombre', 'id_marca', 'modelo', 'unidad_presentacion', 'procedencia', 'referencia', 'is_active')
        }),
        ('Time Zones (TZ)', {
            'classes': ('collapse',),
            'fields': ('tz_oferta', 'tz_demanda', 'tz_inflacion', 'tz_calidad', 'tz_eficiencia', 'tz_referencial')
        }),
        ('Precios', {
            'classes': ('collapse',),
            'fields': ('costo_referencial', 'precio_sie_referencial', 'precio_sie_tipob', 'precio_venta_privado')
        }),
        ('Auditoría', {
            'fields': ('created_by', 'updated_by', 'created_at', 'updated_at')
        }),
    )

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(ImagenProductoDisponible)
class ImagenProductoDisponibleAdmin(admin.ModelAdmin):
    list_display = ('producto_disponible', 'orden', 'is_primary', 'created_at')
    search_fields = ('producto_disponible__nombre', 'descripcion')
    list_filter = ('is_primary', 'created_at')
    readonly_fields = ('created_at', 'updated_at', 'created_by')

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change) # updated_by is not in the model

@admin.register(DocumentoProductoDisponible)
class DocumentoProductoDisponibleAdmin(admin.ModelAdmin):
    list_display = ('producto_disponible', 'titulo', 'tipo_documento', 'is_public', 'created_at')
    search_fields = ('producto_disponible__nombre', 'titulo', 'descripcion')
    list_filter = ('is_public', 'tipo_documento', 'created_at')
    readonly_fields = ('created_at', 'updated_at', 'created_by')

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change) # updated_by is not in the model

@admin.register(ProductsPrice)
class ProductsPriceAdmin(admin.ModelAdmin):
    list_display = ('producto_disponible', 'valor', 'created_at', 'updated_at')
    search_fields = ('producto_disponible__nombre',)
    list_filter = ('created_at', 'updated_at')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(HistorialDeCompras)
class HistorialDeComprasAdmin(admin.ModelAdmin):
    list_display = ('producto', 'proveedor', 'empresa', 'fecha', 'factura', 'valor_total', 'cantidad')
    search_fields = ('producto__nombre', 'proveedor__nombre', 'factura')
    list_filter = ('fecha', 'empresa', 'proveedor', 'created_at')
    readonly_fields = ('created_at', 'updated_at')

    def valor_total(self, obj):
        return obj.valor_total
    valor_total.short_description = 'Valor Total (IVA Inc.)'


@admin.register(HistorialDeVentas)
class HistorialDeVentasAdmin(admin.ModelAdmin):
    list_display = ('producto', 'cliente', 'empresa', 'fecha', 'factura', 'valor_total', 'cantidad')
    search_fields = ('producto__nombre', 'cliente__nombre_comercial', 'factura')
    list_filter = ('fecha', 'empresa', 'cliente', 'created_at')
    readonly_fields = ('created_at', 'updated_at')

    def valor_total(self, obj):
        return obj.valor_total
    valor_total.short_description = 'Valor Total (IVA Inc.)'
