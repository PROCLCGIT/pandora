import { useCallback } from 'react';
import { useAuth } from '../../modulos/auth/authContext';

/**
 * Hook personalizado para verificar permisos y roles de usuario
 * 
 * @returns {Object} Funciones para verificar permisos
 */
export const usePermissions = () => {
  const { user, isAuthenticated, hasRole } = useAuth();
  
  /**
   * Verifica si el usuario puede realizar una acción específica
   * @param {string} action - Acción a verificar
   * @param {Object} resource - Recurso sobre el que se realizará la acción
   * @returns {boolean} True si el usuario puede realizar la acción
   */
  const canPerformAction = useCallback((action, resource = null) => {
    if (!isAuthenticated || !user) return false;
    
    // Administradores pueden hacer todo
    if (hasRole('admin')) return true;
    
    // Verificar permisos específicos según la acción y el recurso
    switch (action) {
      case 'create':
        // Ejemplo: Solo editores y administradores pueden crear contenido
        return hasRole(['editor', 'admin']);
        
      case 'edit':
        // Ejemplo: Solo propietarios y administradores pueden editar
        return hasRole('admin') || (resource && resource.createdBy === user.id);
        
      case 'delete':
        // Ejemplo: Solo administradores pueden eliminar
        return hasRole('admin');
        
      case 'view':
        // Ejemplo: Todos los usuarios autenticados pueden ver
        return isAuthenticated;
        
      default:
        return false;
    }
  }, [isAuthenticated, user, hasRole]);
  
  /**
   * Verifica si el usuario tiene acceso a un módulo específico
   * @param {string} moduleName - Nombre del módulo
   * @returns {boolean} True si el usuario tiene acceso
   */
  const hasModuleAccess = useCallback((moduleName) => {
    if (!isAuthenticated || !user) return false;
    
    // Administradores tienen acceso a todos los módulos
    if (hasRole('admin')) return true;
    
    // Mapa de módulos y roles que pueden acceder
    const modulePermissions = {
      'dashboard': ['admin', 'user', 'editor', 'guest'], // Todos pueden ver el dashboard
      'basic': ['admin', 'user', 'editor'],
      'products': ['admin', 'user'],
      'proformas': ['admin', 'user', 'editor'],
      'brief': ['admin', 'editor'],
      'legal': ['admin', 'legal', 'manager'],
      'docs': ['admin', 'user', 'editor'],
      'settings': ['admin'] // Solo administradores tienen acceso a configuraciones
    };
    
    // Verificar si el módulo existe y si el usuario tiene un rol permitido
    if (modulePermissions[moduleName]) {
      return modulePermissions[moduleName].some(role => hasRole(role));
    }
    
    // Por defecto, no permitir acceso a módulos desconocidos
    return false;
  }, [isAuthenticated, user, hasRole]);
  
  /**
   * Verifica si el usuario es propietario de un recurso
   * @param {Object} resource - Recurso a verificar
   * @returns {boolean} True si el usuario es propietario
   */
  const isOwner = useCallback((resource) => {
    if (!isAuthenticated || !user || !resource) return false;
    
    // Verificar si el usuario es el creador del recurso
    return resource.createdBy === user.id || resource.userId === user.id;
  }, [isAuthenticated, user]);
  
  return {
    canPerformAction,
    hasModuleAccess,
    isOwner,
    hasRole
  };
};

export default usePermissions;