import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../modulos/auth/authContext';

/**
 * Componente que envuelve las rutas de login/registro
 * para asegurar que un usuario ya autenticado no pueda acceder a ellas
 */
const LoginWrapper = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Si está cargando, no renderizamos nada aún
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="sr-only">Cargando...</span>
          </div>
          <p className="mt-2 text-gray-700">Verificando sesión...</p>
        </div>
      </div>
    );
  }
  
  // Si ya está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    // Guardar la ubicación desde donde venimos para posible redirección posterior
    return <Navigate to="/dashboard" replace />;
  }
  
  // Si no está autenticado, mostrar el componente de login
  return <Outlet />;
};

export default LoginWrapper;