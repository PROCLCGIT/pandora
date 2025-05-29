// /Users/clc/Ws/Appclc/pandora/src/components/ui/auth/SessionManager.jsx

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../../modulos/auth/authContext';
import { refreshToken } from '../../../utils/auth';
import { Toaster } from '../../../components/ui/toaster';
import { useToast } from '../../../hooks/use-toast';

/**
 * Componente para gestionar la sesión del usuario con timeout de 20 minutos
 * CAMBIO CRÍTICO: Solo refrescar después de 20 minutos de inactividad real
 */
function SessionManager({ children }) {
  const { isAuthenticated, isLoading, checkAuthStatus } = useAuth();
  const [showSessionAlert, setShowSessionAlert] = useState(false);
  const sessionTimeoutRef = useRef(null);
  const refreshIntervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const { toast } = useToast();
  
  // CAMBIO CRÍTICO: Configurar timeout de 20 minutos
  const SESSION_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutos
  const WARNING_TIME_MS = 18 * 60 * 1000; // Avisar a los 18 minutos
  
  // Ref for the initial refresh timer and a flag for setup completion
  const initialRefreshTimerRef = useRef(null);
  const initialSetupCompletedRef = useRef(false);

  // CAMBIO CRÍTICO: Función para refrescar el token solo cuando sea necesario
  const handleRefreshToken = useCallback(async (force = false) => {
    try {
      console.log('SessionManager: Intentando refrescar token...');
      
      const refreshSuccessful = await refreshToken();
      
      if (refreshSuccessful) {
        console.log('SessionManager: Token refrescado exitosamente');
        
        // Actualizar tiempo de última actividad
        lastActivityRef.current = Date.now();
        
        // Solo verificar estado de autenticación si es forzado
        if (force) {
          console.log('SessionManager: Verificando estado de autenticación después del refresco forzado');
          setTimeout(() => checkAuthStatus(true), 1000);
        }
        
        return true;
      }
      
      console.warn('SessionManager: Falló el refresco de token');
      if (force) {
        toast({
          title: "Error de renovación",
          description: "No se pudo renovar la sesión automáticamente",
          variant: "destructive",
        });
      }
      
      return false;
    } catch (error) {
      console.error('SessionManager: Error al refrescar token:', error);
      return false;
    }
  }, [checkAuthStatus, toast]);

  // CAMBIO CRÍTICO: Detectar actividad del usuario para resetear el timer
  const resetActivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    // Reiniciar el timer de timeout de sesión
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }
    
    // Configurar nuevo timeout de 20 minutos
    sessionTimeoutRef.current = setTimeout(() => {
      if (isAuthenticated) {
        console.log('SessionManager: 20 minutos de inactividad, refrescando sesión');
        handleRefreshToken(true);
      }
    }, SESSION_TIMEOUT_MS);
    
    // Ocultar alerta si estaba visible
    if (showSessionAlert) {
      setShowSessionAlert(false);
    }
  }, [isAuthenticated, handleRefreshToken, showSessionAlert]);

  // CAMBIO CRÍTICO: Control de timeout de sesión basado en actividad real
  useEffect(() => {
    const clearAllTimers = () => {
      if (initialRefreshTimerRef.current) {
        clearTimeout(initialRefreshTimerRef.current);
        initialRefreshTimerRef.current = null;
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = null;
      }
      console.log('SessionManager: All timers cleared.');
    };

    if (isAuthenticated && !isLoading) {
      if (!initialSetupCompletedRef.current) {
        clearAllTimers();

        console.log('SessionManager: Configurando timeout de sesión de 20 minutos');
        
        // Configurar timeout inicial de 20 minutos
        resetActivityTimer();
        
        // Configurar aviso de expiración a los 18 minutos
        const warningTimer = setTimeout(() => {
          if (isAuthenticated) {
            const timeSinceLastActivity = Date.now() - lastActivityRef.current;
            if (timeSinceLastActivity >= WARNING_TIME_MS) {
              setShowSessionAlert(true);
              toast({
                title: "Sesión por expirar",
                description: "Tu sesión expirará en 2 minutos por inactividad. Haz clic en cualquier parte para mantenerla activa.",
                variant: "warning",
                duration: 10000,
              });
            }
          }
        }, WARNING_TIME_MS);

        initialSetupCompletedRef.current = true;
      }
    } else {
      clearAllTimers();
      initialSetupCompletedRef.current = false;
      console.log('SessionManager: Not authenticated. Timers cleared.');
    }

    return () => {
      clearAllTimers();
    };
  }, [isAuthenticated, isLoading, resetActivityTimer, toast]);

  // CAMBIO CRÍTICO: Detectar actividad del usuario con debounce mejorado
  useEffect(() => {
    if (!isAuthenticated) return;
    
    let activityTimeout = null;
    const debounceMs = 1000; // 1 segundo de debounce para evitar demasiadas actualizaciones

    const handleUserActivity = () => {
      if (activityTimeout) {
        clearTimeout(activityTimeout);
      }
      
      activityTimeout = setTimeout(() => {
        resetActivityTimer();
        activityTimeout = null;
      }, debounceMs);
    };

    // CAMBIO CRÍTICO: Eventos más específicos para detectar actividad real
    const events = ['click', 'keydown', 'scroll', 'mousemove', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
      
      if (activityTimeout) {
        clearTimeout(activityTimeout);
      }
    };
  }, [isAuthenticated, resetActivityTimer]);

  // Función para extender sesión manualmente
  const extendSession = useCallback(() => {
    if (isAuthenticated) {
      console.log('SessionManager: Extendiendo sesión manualmente');
      resetActivityTimer();
      setShowSessionAlert(false);
      toast({
        title: "Sesión extendida",
        description: "Tu sesión ha sido extendida por 20 minutos más.",
        variant: "default",
      });
    }
  }, [isAuthenticated, resetActivityTimer, toast]);

  return (
    <>
      {/* Mostrar alerta de sesión si es necesario */}
      {showSessionAlert && (
        <div className="fixed top-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-lg z-50">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium">Sesión por expirar</p>
              <p className="text-xs">Tu sesión expirará en 2 minutos por inactividad.</p>
            </div>
            <button
              onClick={extendSession}
              className="ml-4 bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600 transition-colors"
            >
              Extender
            </button>
          </div>
        </div>
      )}
      
      {/* Renderizar los componentes secundarios */}
      {children}
    </>
  );
}

export default SessionManager;