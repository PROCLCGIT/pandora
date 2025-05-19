import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/authContext';

// Detector de modo de emergencia
const isEmergencyMode = () => {
  try {
    // Consideramos modo de emergencia si hay un token de acceso en localStorage
    // pero no hay cookies de autenticación
    return !!localStorage.getItem('accessToken') && !document.cookie.includes('access_token');
  } catch (e) {
    return false;
  }
};

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
    isLoading: loading, 
    error, 
    checkAuthStatus: checkSession,
    refresh,
    hasRole
  } = useAuth();
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);

  // Verificar sesión y permisos
  useEffect(() => {
    let isMounted = true;

    const verifyAccess = async () => {
      let currentAuthStatus = isAuthenticated;

      if (!currentAuthStatus && autoRefresh) {
        try {
          console.log('ProtectedRoute: Intentando verificar/refrescar sesión...');
          currentAuthStatus = await checkSession();
          if (!currentAuthStatus && isMounted) {
            console.log('ProtectedRoute: checkSession falló, intentando refresh...');
            await refresh();
          }
          console.log('ProtectedRoute: Estado de autenticación (local tras check/refresh) después de verificar/refrescar:', currentAuthStatus);

        } catch (err) {
          console.error('ProtectedRoute: Error durante checkSession o refresh:', err);
          if (isMounted) {
            currentAuthStatus = false;
          }
        }
      }
      
      if (isMounted) {
        const finalAuthStatus = isAuthenticated; 
        let finalAccess = finalAuthStatus;
        if (finalAccess && requiredRole) {
          finalAccess = hasRole(requiredRole);
        }
        console.log('ProtectedRoute: Estado final -> Access Granted:', finalAccess, '(Auth:', finalAuthStatus, 'Role:', !!requiredRole, 'HasRole:', finalAccess === finalAuthStatus ? 'N/A' : finalAccess + ')');
        setAccessGranted(finalAccess);
        setIsVerifying(false);
      }
    };

    if (!loading) {
      verifyAccess();
    } else {
      setIsVerifying(true);
    }

    return () => {
      isMounted = false;
    };
  }, [loading, isAuthenticated, requiredRole, autoRefresh, checkSession, refresh, hasRole]);

  if (loading || isVerifying) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600">Verificando autenticación...</p>
      </div>
    );
  }

  const emergencyMode = isEmergencyMode();
  
  if (emergencyMode) {
    console.log('MODO DE EMERGENCIA ACTIVO: Acceso permitido a ruta protegida');
    return children;
  }
  
  if (!accessGranted) {
    let redirectState = { from: location.pathname };
    
    if (requiredRole && isAuthenticated) {
      redirectState.errorMessage = 'No tienes permisos para acceder a esta página';
      redirectState.errorType = 'unauthorized';
    } else if (error) {
      redirectState.errorMessage = error;
      redirectState.errorType = 'authentication_error';
    } else {
      redirectState.errorMessage = 'Debes iniciar sesión para acceder a esta página';
      redirectState.errorType = 'unauthenticated';
    }
    
    return <Navigate to={redirectTo} state={redirectState} replace />;
  }
  
  return children;
};

export default ProtectedRoute;