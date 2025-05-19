import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../../modulos/auth/authContext';
import { refreshToken } from '../../../utils/auth';
import { Toaster } from '../../../components/ui/toaster';
import { useToast } from '../../../hooks/use-toast';

/**
 * Componente para gestionar la sesión del usuario y refrescar el token automáticamente
 */
function SessionManager({ children }) {
  const { isAuthenticated, isLoading, checkAuthStatus } = useAuth();
  const [showSessionAlert, setShowSessionAlert] = useState(false);
  const sessionTimeoutRef = useRef(null);
  const refreshIntervalRef = useRef(null);
  const lastRefreshRef = useRef(Date.now() - 1000 * 60 * 5); // Inicializar con tiempo pasado para permitir primer refresco
  const { toast } = useToast();
  const minTimeBetweenRefreshes = 1 * 60 * 1000; // Mínimo 1 minuto entre refrescos para evitar problemas

  // Ref for the initial refresh timer and a flag for setup completion
  const initialRefreshTimerRef = useRef(null);
  const initialSetupCompletedRef = useRef(false);

  // Función para refrescar el token
  const handleRefreshToken = useCallback(async (force = false) => {
    // Evitar refrescos demasiado frecuentes a menos que sea forzado
    const now = Date.now();
    if (!force && now - lastRefreshRef.current < minTimeBetweenRefreshes) {
      console.log('Refresco de token ignorado (demasiado reciente)');
      return true; // Asumimos éxito para no disparar alertas innecesarias
    }

    try {
      console.log('Intentando refrescar token...');
      
      // Actualizar el tiempo de último refresco ANTES de intentarlo
      // para evitar múltiples intentos simultáneos si hay retrasos
      lastRefreshRef.current = now;
      
      const refreshSuccessful = await refreshToken();
      
      if (refreshSuccessful) {
        console.log('Token refrescado exitosamente');
        
        // Actualizar estado de autenticación solo si es necesario (para reducir ciclos)
        if (force) {
          console.log('Verificando estado de autenticación después del refresco forzado');
          setTimeout(() => checkAuthStatus(true), 500); // Pequeño retraso para evitar problemas
        }
        
        return true;
      }
      
      console.warn('Falló el refresco de token');
      if (force) {
        // Si fue forzado por el usuario y falló, mostrar toast
        toast({
          title: "Error de renovación",
          description: "No se pudo renovar la sesión automáticamente",
          variant: "destructive",
        });
      }
      
      return false;
    } catch (error) {
      console.error('Error al refrescar token:', error);
      
      // Reiniciar el contador para permitir nuevo intento pronto
      lastRefreshRef.current = now - (minTimeBetweenRefreshes / 2);
      
      return false;
    }
  }, [checkAuthStatus, lastRefreshRef, minTimeBetweenRefreshes, toast]);

  // Control de refresco de token automático
  useEffect(() => {
    // Function to clear all timers
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
      console.log('SessionManager: All active timers have been cleared.');
    };

    if (isAuthenticated) {
      if (!isLoading) {
        // Authenticated and not loading
        if (!initialSetupCompletedRef.current) {
          // This is the first time we're authenticated and not loading since last logout,
          // or initial component load.
          clearAllTimers(); // Ensure a clean slate before setting up new timers

          const refreshIntervalMs = 30 * 60 * 1000; // 30 minutes
          const randomDelay = Math.floor(Math.random() * 15000) + 5000; // 5-20 seconds
          
          console.log(`SessionManager: Initializing timers. Refresh interval: ${refreshIntervalMs/60000}min, Initial delay: ${randomDelay/1000}s`);

          initialRefreshTimerRef.current = setTimeout(() => {
            console.log('SessionManager: Executing initial token refresh.');
            handleRefreshToken(); // Initial, non-forced call

            // Setup the regular interval *after* the initial refresh
            if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current); // ensure clean state
            refreshIntervalRef.current = setInterval(() => {
              console.log('SessionManager: Executing scheduled token refresh.');
              handleRefreshToken();
            }, refreshIntervalMs);
            
            initialRefreshTimerRef.current = null; // This timer's job is done
          }, randomDelay);

          // Setup session timeout alert
          // Clear existing one first before setting a new one
          if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
          sessionTimeoutRef.current = setTimeout(() => {
            setShowSessionAlert(true);
            toast({
              title: "Sesión por expirar",
              description: "Tu sesión está por expirar. Haz clic en cualquier parte para mantenerla activa.",
              variant: "warning",
              duration: 10000,
            });
          }, 4 * 60 * 1000); // 4 minutes

          initialSetupCompletedRef.current = true; // Mark that initial setup for this authenticated session is done
        }
        // If initialSetupCompletedRef.current is true, timers are presumed to be running; do nothing.
      }
      // If (isAuthenticated && isLoading), do nothing here. Timers might be running from a previous
      // state where isLoading was false. They will be cleared by the cleanup if isAuthenticated becomes false.
    } else {
      // Not Authenticated
      clearAllTimers();
      initialSetupCompletedRef.current = false; // Reset flag when not authenticated
      console.log('SessionManager: Not authenticated. Timers cleared and setup flag reset.');
    }

    // Cleanup function for the useEffect
    return () => {
      // This cleanup runs when dependencies change or on component unmount.
      // If isAuthenticated becomes false, the main `else` block above handles clearing timers and resetting the flag.
      // This cleanup primarily handles component unmounting gracefully.
      // For safety, we can clear all timers here too, as it's idempotent.
      clearAllTimers();
      console.log('SessionManager: useEffect cleanup (clearAllTimers) executed.');
    };
  }, [isAuthenticated, isLoading, handleRefreshToken, toast]); // Dependencies

  // Manejar interacción del usuario para renovar sesión (usando debounce)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    let activityTimeout = null;
    const debounceMs = 5000; // 5 segundos de debounce

    const handleUserActivity = () => {
      // Solo configurar un nuevo timeout si no hay uno en curso
      if (!activityTimeout && showSessionAlert) {
        activityTimeout = setTimeout(() => {
          console.log('Actividad del usuario detectada, refrescando sesión');
          setShowSessionAlert(false);
          handleRefreshToken(true);
          activityTimeout = null;
        }, debounceMs);
      }
    };

    // Eventos para detectar actividad del usuario (menos frecuentes)
    window.addEventListener('click', handleUserActivity);
    // Solo usamos click, no mousemove ni keydown para reducir frecuencia

    return () => {
      window.removeEventListener('click', handleUserActivity);
      if (activityTimeout) {
        clearTimeout(activityTimeout);
      }
    };
  }, [isAuthenticated, showSessionAlert]);

  return (
    <>
      {/* Renderizar los componentes secundarios */}
      {children}
    </>
  );
}

export default SessionManager;