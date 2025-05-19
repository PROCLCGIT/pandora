# backend/productos/permissions.py

from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Permiso que solo permite acceso a usuarios administradores.
    Útil para operaciones sensibles como eliminar productos o cambiar precios de referencia.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permiso que permite solo a los creadores de un producto editarlo.
    Los usuarios anónimos solo pueden ver.
    """
    def has_object_permission(self, request, view, obj):
        # Permitir métodos de solo lectura (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Verificar si el objeto tiene un atributo 'created_by'
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        
        return False

class ReadOnly(permissions.BasePermission):
    """
    Permiso que solo permite operaciones de lectura.
    Útil para catálogos públicos de productos o precios históricos.
    """
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS

class IsAuthenticated(permissions.BasePermission):
    """
    Permiso que solo permite acceso a usuarios autenticados.
    Base para la mayoría de operaciones con productos.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

class CanManageProducts(permissions.BasePermission):
    """
    Permiso específico para gestionar productos.
    Permite acceso a usuarios con permisos específicos de gestión de productos.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        # Verifica si el usuario tiene un permiso específico
        return (request.user.is_staff or 
                request.user.has_perm('products.add_productodisponible') or
                request.user.has_perm('products.change_productodisponible'))

class CanManagePrices(permissions.BasePermission):
    """
    Permiso específico para gestionar precios.
    Función crítica que debe estar restringida a usuarios con permisos específicos.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        # Verifica si el usuario tiene un permiso específico
        return (request.user.is_staff or 
                request.user.has_perm('products.add_productsprice') or
                request.user.has_perm('products.change_productsprice'))