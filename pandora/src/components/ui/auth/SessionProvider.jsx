// /Users/clc/Ws/Appclc/pandora/src/components/ui/auth/SessionProvider.jsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSessionManager } from '@/hooks/custom/useSessionManager';
import { getAuthConfig } from '@/config/auth';
import SessionIndicator from './SessionIndicator';

// Crear contexto de sesión
const SessionContext = createContext(null);

/**
 * Hook para acceder al contexto de sesión
 */
export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession debe usarse dentro de SessionProvider');
  }
  return context;
};

/**
 * Proveedor de sesión que envuelve la aplicación
 */
export const SessionProvider = ({ children }) => {
  const location = useLocation();
  const config = getAuthConfig();
  const sessionManager = useSessionManager();
  const [isInitialized, setIsInitialized] = useState(false);

  // Verificar si la ruta actual es pública
  const isPublicRoute = config.PUBLIC_ROUTES.includes(location.pathname);

  // Inicializar sesión si no es ruta pública
  useEffect(() => {
    const initializeSession = async () => {
      if (!isPublicRoute && !isInitialized) {
        try {
          await sessionManager.startSession();
          setIsInitialized(true);
        } catch (error) {
          console.error('Error inicializando sesión:', error);
          // En caso de error, redirigir al login
          window.location.href = config.LOGIN_ROUTE;
        }
      } else if (isPublicRoute && isInitialized) {
        // Si cambiamos a ruta pública, terminar sesión
        sessionManager.endSession();
        setIsInitialized(false);
      }
    };

    initializeSession();
  }, [location.pathname, isPublicRoute, isInitialized, sessionManager, config.LOGIN_ROUTE]);

  // Terminar sesión al desmontar
  useEffect(() => {
    return () => {
      if (sessionManager.isActive) {
        sessionManager.endSession();
      }
    };
  }, [sessionManager]);

  const contextValue = {
    ...sessionManager,
    isInitialized,
    isPublicRoute
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
      
      {/* Mostrar indicador de sesión solo en rutas privadas */}
      {!isPublicRoute && isInitialized && (
        <SessionIndicator 
          variant="compact"
          position="bottom-right"
          showTimeLeft={true}
          showActions={true}
        />
      )}
    </SessionContext.Provider>
  );
};

/**
 * HOC para componentes que requieren autenticación
 */
export const withSession = (WrappedComponent) => {
  return function SessionWrappedComponent(props) {
    const { isActive, isInitialized } = useSession();
    const config = getAuthConfig();

    // Mostrar loading mientras se inicializa
    if (!isInitialized) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando sesión...</p>
          </div>
        </div>
      );
    }

    // Mostrar error si no hay sesión activa
    if (!isActive) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Sesión requerida</h1>
            <p className="text-gray-600 mb-4">Necesitas iniciar sesión para acceder a esta página.</p>
            <button
              onClick={() => window.location.href = config.LOGIN_ROUTE}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Ir al login
            </button>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

export default SessionProvider;