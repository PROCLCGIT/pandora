# backend/directorio/permissions.py

from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Permiso que solo permite acceso a usuarios administradores.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permiso que permite solo a los propietarios de un objeto editarlo.
    Los usuarios anónimos solo pueden ver.
    """
    def has_object_permission(self, request, view, obj):
        # Permitir métodos de solo lectura (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Verificar si el objeto tiene un atributo 'owner' o 'created_by'
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        
        return False

class ReadOnly(permissions.BasePermission):
    """
    Permiso que solo permite operaciones de lectura.
    """
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS

class IsAuthenticated(permissions.BasePermission):
    """
    Permiso que solo permite acceso a usuarios autenticados.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)