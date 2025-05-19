import React from 'react';
import { useAuth } from '../../auth/authContext';
import { usePermissions } from '../../../hooks/custom/usePermissions';

/**
 * Componente para mostrar/ocultar elementos basado en roles o permisos
 * 
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Contenido a mostrar si el usuario tiene permiso
 * @param {string|Array} props.requiredRole - Rol o roles requeridos para mostrar el contenido
 * @param {string} props.requiredAction - Acción requerida (create, edit, delete, view)
 * @param {string} props.requiredModule - Módulo requerido para el acceso
 * @param {Object} props.resource - Recurso sobre el que se verifica el permiso
 * @param {React.ReactNode} props.fallback - Componente a mostrar si no tiene permiso
 * @param {boolean} props.checkOwnership - Si debe verificar que el usuario es propietario
 * @returns {React.ReactNode}
 */
const RoleBasedAccess = ({
  children,
  requiredRole = null,
  requiredAction = null,
  requiredModule = null,
  resource = null,
  fallback = null,
  checkOwnership = false,
}) => {
  const { isAuthenticated } = useAuth();
  const { hasRole, canPerformAction, hasModuleAccess, isOwner } = usePermissions();

  // Si no está autenticado, no mostrar nada o mostrar fallback
  if (!isAuthenticated) {
    return fallback || null;
  }

  // Verificar permisos por rol específico
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback || null;
  }

  // Verificar permisos por acción
  if (requiredAction && !canPerformAction(requiredAction, resource)) {
    return fallback || null;
  }

  // Verificar acceso al módulo
  if (requiredModule && !hasModuleAccess(requiredModule)) {
    return fallback || null;
  }

  // Verificar propiedad del recurso si es necesario
  if (checkOwnership && resource && !isOwner(resource)) {
    return fallback || null;
  }

  // Si pasa todas las verificaciones, mostrar el contenido
  return children;
};

export default RoleBasedAccess;