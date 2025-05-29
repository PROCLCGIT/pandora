from rest_framework import permissions
from django.contrib.auth.models import Group

class BriefPermission(permissions.BasePermission):
    """
    Permisos personalizados para Brief
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        # Solo usuarios del grupo 'brief_operators' pueden crear briefs
        if request.method == 'POST':
            return (request.user.groups.filter(name='brief_operators').exists() or
                   request.user.is_superuser)
            
        return True
    
    def has_object_permission(self, request, view, obj):
        # Solo el creador o el operador asignado pueden modificar
        if request.method in ['PUT', 'PATCH', 'DELETE']:
            return (obj.created_by == request.user or 
                   obj.operador == request.user or
                   request.user.is_superuser)
        
        return True

class BriefItemPermission(permissions.BasePermission):
    """
    Permisos para items de Brief
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return True
    
    def has_object_permission(self, request, view, obj):
        # Usar los mismos permisos que el Brief padre
        return BriefPermission().has_object_permission(request, view, obj.brief)
