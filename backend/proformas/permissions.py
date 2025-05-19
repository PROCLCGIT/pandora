# backend/proformas/permissions.py

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
        
        # Verificar si el objeto tiene un atributo relacionado con el usuario
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        
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

class CanManageProforma(permissions.BasePermission):
    """
    Permiso específico para la gestión de proformas.
    Permite a usuarios con permisos específicos gestionar proformas.
    """
    def has_permission(self, request, view):
        # Verificar si el usuario está autenticado
        if not bool(request.user and request.user.is_authenticated):
            return False
        
        # Acceso completo para administradores
        if request.user.is_staff:
            return True
        
        # Para métodos de solo lectura, verificar permiso de lectura
        if request.method in permissions.SAFE_METHODS:
            return request.user.has_perm('proformas.view_proforma')
        
        # Para métodos de escritura, verificar permisos específicos
        if request.method == 'POST':
            return request.user.has_perm('proformas.add_proforma')
        elif request.method in ['PUT', 'PATCH']:
            return request.user.has_perm('proformas.change_proforma')
        elif request.method == 'DELETE':
            return request.user.has_perm('proformas.delete_proforma')
        
        return False