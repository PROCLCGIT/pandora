// /Users/clc/Ws/Appclc/pandora/src/hooks/custom/useSessionManager.js

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthConfig, TIME_UTILS, AUTH_EVENTS, authLogger } from '@/config/auth';
import api from '@/config/axios';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook personalizado para gestión avanzada de sesiones
 */
export const useSessionManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const config = getAuthConfig();
  
  // Estados del hook
  const [sessionState, setSessionState] = useState({
    isActive: false,
    timeLeft: 0,
    lastActivity: Date.now(),
    warningShown: false,
    isRefreshing: false
  });
  
  // Referencias para timers
  const refreshTimer = useRef(null);
  const warningTimer = useRef(null);
  const logoutTimer = useRef(null);
  const activityTimer = useRef(null);
  
  /**
   * Limpiar todos los timers
   */
  const clearAllTimers = useCallback(() => {
    if (refreshTimer.current) {
      clearInterval(refreshTimer.current);
      refreshTimer.current = null;
    }
    if (warningTimer.current) {
      clearTimeout(warningTimer.current);
      warningTimer.current = null;
    }
    if (logoutTimer.current) {
      clearTimeout(logoutTimer.current);
      logoutTimer.current = null;
    }
    if (activityTimer.current) {
      clearTimeout(activityTimer.current);
      activityTimer.current = null;
    }
  }, []);
  
  /**
   * Actualizar la actividad del usuario
   */
  const updateActivity = useCallback(() => {
    const now = Date.now();
    setSessionState(prev => ({
      ...prev,
      lastActivity: now,
      warningShown: false
    }));
    
    // Guardar en localStorage
    localStorage.setItem(config.STORAGE_KEYS.LAST_ACTIVITY, now.toString());
    
    authLogger.log(AUTH_EVENTS.ACTIVITY_DETECTED, { timestamp: now });
    
    // Resetear timer de logout por inactividad
    resetInactivityTimer();
  }, [config.STORAGE_KEYS.LAST_ACTIVITY]);
  
  /**
   * Refrescar token automáticamente
   */
  const refreshTokens = useCallback(async () => {
    if (sessionState.isRefreshing) return;
    
    setSessionState(prev => ({ ...prev, isRefreshing: true }));
    
    try {
      authLogger.log(AUTH_EVENTS.TOKEN_REFRESH, { type: 'automatic' });
      
      const success = await api.refreshTokens();
      
      if (success) {
        authLogger.log(AUTH_EVENTS.TOKEN_REFRESH, { 
          type: 'automatic', 
          status: 'success' 
        });
        
        if (config.UI_CONFIG.SHOW_ACTIVITY_INDICATOR) {
          toast({
            title: config.SESSION_NOTIFICATIONS.REFRESHED.title,
            description: config.SESSION_NOTIFICATIONS.REFRESHED.message,
            variant: 'default',
            duration: config.SESSION_NOTIFICATIONS.REFRESHED.duration
          });
        }
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      authLogger.error(AUTH_EVENTS.TOKEN_REFRESH, error);
      handleSessionExpired();
    } finally {
      setSessionState(prev => ({ ...prev, isRefreshing: false }));
    }
  }, [sessionState.isRefreshing, toast, config]);
  
  /**
   * Mostrar advertencia de sesión por expirar
   */
  const showSessionWarning = useCallback(() => {
    if (!config.SHOW_SESSION_WARNINGS || sessionState.warningShown) return;
    
    setSessionState(prev => ({ ...prev, warningShown: true }));
    authLogger.warn(AUTH_EVENTS.SESSION_WARNING);
    
    const minutes = Math.ceil(config.SESSION_WARNING_TIME / 60000);
    const message = config.SESSION_NOTIFICATIONS.WARNING.message.replace('{minutes}', minutes);
    
    toast({
      title: config.SESSION_NOTIFICATIONS.WARNING.title,
      description: message,
      variant: 'destructive',
      duration: config.SESSION_NOTIFICATIONS.WARNING.duration,
      action: {
        label: 'Continuar sesión',
        onClick: () => {
          updateActivity();
          refreshTokens();
        }
      }
    });
  }, [config, sessionState.warningShown, toast, updateActivity, refreshTokens]);
  
  /**
   * Manejar expiración de sesión
   */
  const handleSessionExpired = useCallback(() => {
    authLogger.warn(AUTH_EVENTS.SESSION_EXPIRED);
    
    toast({
      title: config.SESSION_NOTIFICATIONS.EXPIRED.title,
      description: config.SESSION_NOTIFICATIONS.EXPIRED.message,
      variant: 'destructive',
      duration: config.SESSION_NOTIFICATIONS.EXPIRED.duration
    });
    
    // Limpiar estado y redirigir
    clearAllTimers();
    api.clearTokens();
    
    setTimeout(() => {
      navigate(config.LOGIN_ROUTE);
    }, 2000);
  }, [config, toast, navigate, clearAllTimers]);
  
  /**
   * Resetear timer de inactividad
   */
  const resetInactivityTimer = useCallback(() => {
    if (activityTimer.current) {
      clearTimeout(activityTimer.current);
    }
    
    // Timer para advertencia
    if (warningTimer.current) {
      clearTimeout(warningTimer.current);
    }
    
    warningTimer.current = setTimeout(() => {
      showSessionWarning();
    }, config.AUTO_LOGOUT_TIME - config.SESSION_WARNING_TIME);
    
    // Timer para logout automático
    activityTimer.current = setTimeout(() => {
      authLogger.warn(AUTH_EVENTS.INACTIVITY_TIMEOUT);
      handleSessionExpired();
    }, config.AUTO_LOGOUT_TIME);
    
  }, [config, showSessionWarning, handleSessionExpired]);
  
  /**
   * Iniciar gestión de sesión
   */
  const startSession = useCallback(async () => {
    authLogger.log(AUTH_EVENTS.LOGIN_SUCCESS);
    
    // Verificar estado de autenticación
    const isAuthenticated = await api.checkAuthStatus();
    
    if (!isAuthenticated) {
      handleSessionExpired();
      return;
    }
    
    setSessionState(prev => ({
      ...prev,
      isActive: true,
      lastActivity: Date.now()
    }));
    
    // Configurar timer de refresco de tokens
    refreshTimer.current = setInterval(() => {
      refreshTokens();
    }, config.TOKEN_REFRESH_INTERVAL);
    
    // Configurar listeners de actividad
    config.ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });
    
    // Iniciar timer de inactividad
    resetInactivityTimer();
    
    authLogger.log('session:started', {
      refreshInterval: config.TOKEN_REFRESH_INTERVAL,
      autoLogoutTime: config.AUTO_LOGOUT_TIME
    });
  }, [config, updateActivity, refreshTokens, resetInactivityTimer, handleSessionExpired]);
  
  /**
   * Terminar gestión de sesión
   */
  const endSession = useCallback(() => {
    authLogger.log(AUTH_EVENTS.LOGOUT);
    
    // Limpiar timers
    clearAllTimers();
    
    // Remover listeners de actividad
    config.ACTIVITY_EVENTS.forEach(event => {
      document.removeEventListener(event, updateActivity);
    });
    
    // Limpiar estado
    setSessionState({
      isActive: false,
      timeLeft: 0,
      lastActivity: 0,
      warningShown: false,
      isRefreshing: false
    });
    
    // Limpiar localStorage
    Object.values(config.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
  }, [config, updateActivity, clearAllTimers]);
  
  /**
   * Logout manual
   */
  const logout = useCallback(async () => {
    if (config.UI_CONFIG.LOGOUT_CONFIRMATION) {
      const confirmed = window.confirm('¿Estás seguro de que deseas cerrar sesión?');
      if (!confirmed) return;
    }
    
    try {
      await api.logout();
    } catch (error) {
      authLogger.error('logout:error', error);
    }
    
    endSession();
    navigate(config.LOGIN_ROUTE);
  }, [config, endSession, navigate]);
  
  /**
   * Extender sesión manualmente
   */
  const extendSession = useCallback(() => {
    updateActivity();
    refreshTokens();
  }, [updateActivity, refreshTokens]);
  
  // Calcular tiempo restante hasta logout
  useEffect(() => {
    if (!sessionState.isActive) return;
    
    const updateTimeLeft = () => {
      const timeSinceActivity = Date.now() - sessionState.lastActivity;
      const timeLeft = Math.max(0, config.AUTO_LOGOUT_TIME - timeSinceActivity);
      
      setSessionState(prev => ({ ...prev, timeLeft }));
    };
    
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [sessionState.isActive, sessionState.lastActivity, config.AUTO_LOGOUT_TIME]);
  
  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      clearAllTimers();
      config.ACTIVITY_EVENTS.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [config.ACTIVITY_EVENTS, updateActivity, clearAllTimers]);
  
  return {
    // Estado
    sessionState,
    
    // Métodos
    startSession,
    endSession,
    logout,
    extendSession,
    updateActivity,
    refreshTokens,
    
    // Utilidades
    timeLeft: sessionState.timeLeft,
    timeLeftReadable: TIME_UTILS.msToReadable(sessionState.timeLeft),
    isActive: sessionState.isActive,
    isRefreshing: sessionState.isRefreshing,
    
    // Configuración
    config
  };
};

export default useSessionManager;