from django.contrib import admin
from .models import (
    Group,
    GroupMember,
    Category,
    Tag,
    Document,
    DocumentVersion,
    DocumentTag,
    DocumentActivity,
    DocumentPermission,
    Collection,
    CollectionDocument,
    CollectionPermission,
    CollectionActivity,
    DocumentComment
)

# Configuración del Admin para categorías
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'document_count', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('name',)
    fieldsets = (
        ('Información Básica', {
            'fields': ('name', 'description', 'color_code', 'parent')
        }),
        ('Metadatos', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

# Configuración del Admin para etiquetas
@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'color_code', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name',)
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('name',)

# Configuración del Admin para grupos
@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_public', 'creator', 'created_at')
    list_filter = ('is_public', 'created_at')
    search_fields = ('name', 'description', 'creator__username')
    readonly_fields = ('created_at', 'updated_at', 'slug')
    ordering = ('name',)

@admin.register(GroupMember)
class GroupMemberAdmin(admin.ModelAdmin):
    list_display = ('group', 'user', 'role', 'joined_at')
    list_filter = ('role', 'joined_at', 'group')
    search_fields = ('user__username', 'group__name')
    readonly_fields = ('joined_at',)

# Configuración del Admin para documentos
@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'file_type', 'uploader', 'category', 'group', 'is_favorite', 'is_deleted', 'created_at')
    list_filter = ('file_type', 'is_favorite', 'is_deleted', 'created_at', 'category', 'group')
    search_fields = ('title', 'description', 'file_name', 'uploader__username')
    readonly_fields = ('created_at', 'updated_at', 'deleted_at', 'file_size')
    ordering = ('-updated_at',)
    actions = ['mark_as_favorite', 'mark_as_not_favorite', 'soft_delete', 'restore']
    
    def mark_as_favorite(self, request, queryset):
        queryset.update(is_favorite=True)
    mark_as_favorite.short_description = "Marcar seleccionados como favoritos"
    
    def mark_as_not_favorite(self, request, queryset):
        queryset.update(is_favorite=False)
    mark_as_not_favorite.short_description = "Desmarcar seleccionados como favoritos"
    
    def soft_delete(self, request, queryset):
        for doc in queryset:
            doc.soft_delete()
    soft_delete.short_description = "Eliminar documentos seleccionados (eliminación lógica)"
    
    def restore(self, request, queryset):
        for doc in queryset:
            doc.restore()
    restore.short_description = "Restaurar documentos seleccionados"

@admin.register(DocumentVersion)
class DocumentVersionAdmin(admin.ModelAdmin):
    list_display = ('document', 'version_number', 'created_by', 'created_at')
    list_filter = ('created_at', 'document')
    search_fields = ('document__title', 'version_number', 'change_notes')
    readonly_fields = ('created_at',)

@admin.register(DocumentTag)
class DocumentTagAdmin(admin.ModelAdmin):
    list_display = ('document', 'tag', 'created_at')
    list_filter = ('tag', 'created_at')
    search_fields = ('document__title', 'tag__name')
    readonly_fields = ('created_at',)

@admin.register(DocumentActivity)
class DocumentActivityAdmin(admin.ModelAdmin):
    list_display = ('document', 'user', 'activity_type', 'created_at')
    list_filter = ('activity_type', 'created_at', 'user')
    search_fields = ('document__title', 'user__username', 'details')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)

@admin.register(DocumentPermission)
class DocumentPermissionAdmin(admin.ModelAdmin):
    list_display = ('document', 'user', 'permission_type', 'created_at')
    list_filter = ('permission_type', 'created_at')
    search_fields = ('document__title', 'user__username')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(DocumentComment)
class DocumentCommentAdmin(admin.ModelAdmin):
    list_display = ('document', 'user', 'is_reply', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('document__title', 'user__username', 'content')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
    
    def is_reply(self, obj):
        return obj.is_reply
    is_reply.boolean = True
    is_reply.short_description = "Es respuesta"

# Configuración del Admin para colecciones
@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_public', 'creator', 'document_count', 'created_at')
    list_filter = ('is_public', 'created_at', 'creator')
    search_fields = ('name', 'description', 'creator__username')
    readonly_fields = ('created_at', 'updated_at', 'share_token')
    ordering = ('-updated_at',)
    actions = ['make_public', 'make_private', 'regenerate_share_token']
    
    def make_public(self, request, queryset):
        queryset.update(is_public=True)
    make_public.short_description = "Hacer seleccionados públicos"
    
    def make_private(self, request, queryset):
        queryset.update(is_public=False)
    make_private.short_description = "Hacer seleccionados privados"
    
    def regenerate_share_token(self, request, queryset):
        for collection in queryset:
            collection.generate_new_share_token()
    regenerate_share_token.short_description = "Regenerar token de compartición"

@admin.register(CollectionDocument)
class CollectionDocumentAdmin(admin.ModelAdmin):
    list_display = ('collection', 'document', 'order', 'created_at')
    list_filter = ('collection', 'created_at')
    search_fields = ('collection__name', 'document__title')
    readonly_fields = ('created_at',)
    ordering = ('collection', 'order')

@admin.register(CollectionPermission)
class CollectionPermissionAdmin(admin.ModelAdmin):
    list_display = ('collection', 'user', 'permission_type', 'created_at')
    list_filter = ('permission_type', 'created_at')
    search_fields = ('collection__name', 'user__username')
    readonly_fields = ('created_at',)

@admin.register(CollectionActivity)
class CollectionActivityAdmin(admin.ModelAdmin):
    list_display = ('collection', 'user', 'activity_type', 'created_at')
    list_filter = ('activity_type', 'created_at', 'user')
    search_fields = ('collection__name', 'user__username', 'details')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)