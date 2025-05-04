import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/authContext';

/**
 * Componente para proteger rutas que requieren autenticación
 * Si el usuario no está autenticado, redirige a la página de login
 * 
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar si está autenticado
 * @param {string} props.redirectTo - Ruta a la que redirigir si no está autenticado
 * @param {string|Array} props.requiredRole - Rol o roles requeridos para acceder a la ruta
 * @param {boolean} props.autoRefresh - Si debe intentar refrescar automáticamente el token
 * @returns {React.ReactNode} El componente hijo o un Navigate
 */
const ProtectedRoute = ({ 
  children,
  redirectTo = '/login',
  requiredRole = null,
  autoRefresh = true
}) => {
  const location = useLocation();
  const { 
    isAuthenticated, 
    loading, 
    user,
    error, 
    checkSession,
    refresh,
    hasRole
  } = useAuth();
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);

  // Verificar sesión y permisos
  useEffect(() => {
    const verifyAccess = async () => {
      setIsVerifying(true);
      
      if (!isAuthenticated && autoRefresh) {
        // Intentar refrescar sesión si está habilitado
        try {
          const sessionValid = await checkSession();
          
          // Si falla la verificación, intentar refrescar el token
          if (!sessionValid) {
            console.log('Intentando refrescar token automáticamente...');
            await refresh();
          }
        } catch (error) {
          console.error('Error al verificar o refrescar sesión:', error);
        }
      }
      
      // Verificar rol si está especificado
      if (requiredRole && isAuthenticated) {
        setAccessGranted(hasRole(requiredRole));
      } else {
        setAccessGranted(isAuthenticated);
      }
      
      setIsVerifying(false);
    };
    
    verifyAccess();
  }, [isAuthenticated, requiredRole, autoRefresh, checkSession, refresh, hasRole]);

  // Si está cargando o verificando, mostramos un spinner
  if (loading || isVerifying) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600">Verificando autenticación...</p>
      </div>
    );
  }

  // Si no tiene acceso, redirige al login
  if (!accessGranted) {
    // Determinar mensaje de error para incluir en el estado de redirección
    let redirectState = { from: location.pathname };
    
    if (requiredRole && isAuthenticated) {
      // Si está autenticado pero no tiene el rol requerido
      redirectState.errorMessage = 'No tienes permisos para acceder a esta página';
      redirectState.errorType = 'unauthorized';
    } else if (error) {
      // Si hubo un error de autenticación
      redirectState.errorMessage = error;
      redirectState.errorType = 'authentication_error';
    } else {
      // Si simplemente no está autenticado
      redirectState.errorMessage = 'Debes iniciar sesión para acceder a esta página';
      redirectState.errorType = 'unauthenticated';
    }
    
    return <Navigate to={redirectTo} state={redirectState} replace />;
  }
  
  // Si está autenticado y tiene el rol requerido, renderiza los hijos
  return children;
};

export default ProtectedRoute;