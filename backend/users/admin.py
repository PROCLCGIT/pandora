"""
Configuración del panel de administración para usuarios.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Clase para administrar usuarios en el panel de administración de Django.
    """
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'department')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'department')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'email', 'phone')}),
        (_('Professional info'), {'fields': ('position', 'department')}),
        (_('Profile'), {'fields': ('profile_image',)}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )