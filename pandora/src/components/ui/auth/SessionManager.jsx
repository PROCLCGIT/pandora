import React, { useEffect, useState, useRef } from 'react';
import { AuthNotification, useAuthNotification } from './AuthNotification';
import { useAuth } from '../../../modulos/auth/authContext';
import { useNavigate } from 'react-router-dom';

/**
 * Componente que maneja la sesión global, mostrando feedback y gestionando tokens
 * Se debe usar en un nivel alto del árbol de componentes
 */
const SessionManager = ({ children }) => {
  const { 
    isAuthenticated, 
    refresh, 
    checkSession, 
    error: authError,
    loading: authLoading 
  } = useAuth();
  
  const { 
    showSessionExpired, 
    showAuthError, 
    showAuthSuccess,
    showTokenRefresh
  } = useAuthNotification();
  
  const navigate = useNavigate();
  const [sessionChecked, setSessionChecked] = useState(false);
  
  // Referencias para timers
  const tokenRefreshTimer = useRef(null);
  const sessionCheckTimer = useRef(null);
  
  // Verificar sesión al montar el componente
  useEffect(() => {
    const verifySession = async () => {
      try {
        const isValid = await checkSession();
        if (isValid) {
          // Programar refresco de token antes de que expire
          scheduleTokenRefresh();
        } else if (window.location.pathname !== '/login') {
          // Si no hay sesión válida y no estamos en login, mostrar notificación
          showSessionExpired(() => navigate('/login'));
        }
      } catch (error) {
        console.error('Error verificando sesión:', error);
      } finally {
        setSessionChecked(true);
      }
    };
    
    verifySession();
    
    // Limpiar timers al desmontar
    return () => {
      if (tokenRefreshTimer.current) clearTimeout(tokenRefreshTimer.current);
      if (sessionCheckTimer.current) clearInterval(sessionCheckTimer.current);
    };
  }, [checkSession, navigate, showSessionExpired]);
  
  // Observar cambios en la autenticación
  useEffect(() => {
    // Si estamos autenticados, programar verificaciones periódicas y refresh
    if (isAuthenticated) {
      scheduleTokenRefresh();
      
      // Verificar sesión cada 5 minutos
      sessionCheckTimer.current = setInterval(async () => {
        const isValid = await checkSession();
        if (!isValid) {
          // Si la sesión ya no es válida, mostrar notificación
          showSessionExpired(() => navigate('/login'));
          clearInterval(sessionCheckTimer.current);
        }
      }, 5 * 60 * 1000); // 5 minutos
    }
    
    return () => {
      if (sessionCheckTimer.current) clearInterval(sessionCheckTimer.current);
    };
  }, [isAuthenticated, checkSession, navigate, showSessionExpired]);
  
  // Programar refresco de token antes de que expire
  const scheduleTokenRefresh = () => {
    // Limpiar timer existente si hay uno
    if (tokenRefreshTimer.current) clearTimeout(tokenRefreshTimer.current);
    
    // Programar refresco 1 minuto antes de que expire (token dura 5 minutos)
    tokenRefreshTimer.current = setTimeout(async () => {
      try {
        // Mostrar notificación de que la sesión está por expirar
        showTokenRefresh(false, 'Tu sesión está por expirar');
        
        // Intentar refrescar token
        const refreshed = await refresh();
        
        if (refreshed) {
          showTokenRefresh(true, 'Sesión extendida correctamente');
          // Programar el siguiente refresco
          scheduleTokenRefresh();
        } else {
          showSessionExpired(() => navigate('/login'));
        }
      } catch (error) {
        console.error('Error refrescando token:', error);
        showSessionExpired(() => navigate('/login'));
      }
    }, 4 * 60 * 1000); // 4 minutos (1 min antes de expirar en un token de 5 min)
  };
  
  // Manejar errores de autenticación
  useEffect(() => {
    if (authError && sessionChecked) {
      showAuthError(authError, () => navigate('/login'));
    }
  }, [authError, sessionChecked, showAuthError, navigate]);
  
  // Mientras se verifica la sesión inicial, mostrar un spinner o pantalla de carga
  if (authLoading && !sessionChecked) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      {children}
      <AuthNotification />
    </>
  );
};

export default SessionManager;