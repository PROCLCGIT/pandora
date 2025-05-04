import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../modulos/auth/authContext';

/**
 * Componente para mostrar notificaciones de autenticación en cualquier parte de la aplicación.
 * Este componente se renderiza en un portal para mostrar notificaciones superpuestas.
 */
export const AuthNotification = () => {
  const [notification, setNotification] = useState(null);
  const [visible, setVisible] = useState(false);
  const { isAuthenticated, error, loading, refresh } = useAuth();
  const navigate = useNavigate();

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    // Mostrar error de autenticación
    if (error) {
      showNotification({
        type: 'error',
        message: error,
        autoClose: true,
        action: {
          label: 'Iniciar sesión',
          onClick: () => navigate('/login')
        }
      });
    }
  }, [error, navigate]);

  // Función para mostrar una notificación
  const showNotification = (config) => {
    setNotification(config);
    setVisible(true);

    if (config.autoClose) {
      setTimeout(() => {
        setVisible(false);
        setTimeout(() => setNotification(null), 300); // Esperar a que termine la animación
      }, 5000);
    }
  };

  // Cerrar notificación
  const handleClose = () => {
    setVisible(false);
    setTimeout(() => setNotification(null), 300);
  };

  // Ejecutar acción asociada a la notificación
  const handleAction = () => {
    if (notification?.action?.onClick) {
      notification.action.onClick();
    }
    handleClose();
  };

  // Si no hay notificación, no renderizar nada
  if (!notification) return null;

  // Clases según el tipo de notificación
  const getTypeClasses = () => {
    switch (notification.type) {
      case 'error':
        return 'bg-red-50 border-red-400 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-400 text-yellow-800';
      case 'success':
        return 'bg-green-50 border-green-400 text-green-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-400 text-blue-800';
    }
  };

  // Renderizar en un portal para superponer a toda la aplicación
  return createPortal(
    <div 
      className={`fixed top-4 right-4 z-50 max-w-sm transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className={`border-l-4 p-4 shadow-md rounded-md ${getTypeClasses()}`}>
        <div className="flex items-start">
          {/* Icono según tipo */}
          <div className="flex-shrink-0">
            {notification.type === 'error' && (
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {notification.type === 'warning' && (
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {notification.type === 'success' && (
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            {notification.type === 'info' && (
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          
          {/* Mensaje */}
          <div className="ml-3 flex-1">
            <p className="text-sm">{notification.message}</p>
            
            {/* Botón de acción si existe */}
            {notification.action && (
              <div className="mt-2">
                <button
                  onClick={handleAction}
                  className={`text-sm font-medium underline focus:outline-none ${
                    notification.type === 'error' ? 'text-red-600 hover:text-red-500' :
                    notification.type === 'warning' ? 'text-yellow-600 hover:text-yellow-500' :
                    notification.type === 'success' ? 'text-green-600 hover:text-green-500' :
                    'text-blue-600 hover:text-blue-500'
                  }`}
                >
                  {notification.action.label}
                </button>
              </div>
            )}
          </div>
          
          {/* Botón cerrar */}
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="inline-flex text-gray-400 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150"
              onClick={handleClose}
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

/**
 * Hook para mostrar notificaciones de autenticación desde cualquier componente
 */
export const useAuthNotification = () => {
  const [notificationRoot] = useState(() => {
    const div = document.createElement('div');
    div.id = 'auth-notification-root';
    document.body.appendChild(div);
    return div;
  });

  // Estado para la notificación actual
  const [notification, setNotification] = useState(null);

  // Mostrar una notificación de sesión expirada
  const showSessionExpired = (onLogin) => {
    setNotification({
      type: 'warning',
      message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      autoClose: false,
      action: {
        label: 'Iniciar sesión',
        onClick: onLogin || (() => window.location.href = '/login')
      }
    });
  };

  // Mostrar notificación de error de autenticación
  const showAuthError = (message, onAction) => {
    setNotification({
      type: 'error',
      message: message || 'Error de autenticación',
      autoClose: true,
      action: onAction ? {
        label: 'Reintentar',
        onClick: onAction
      } : null
    });
  };

  // Mostrar notificación de éxito de autenticación
  const showAuthSuccess = (message) => {
    setNotification({
      type: 'success',
      message: message || 'Autenticación exitosa',
      autoClose: true
    });
  };

  // Mostrar notificación para refresco de token
  const showTokenRefresh = (isSuccess, message) => {
    setNotification({
      type: isSuccess ? 'success' : 'warning',
      message: message || (isSuccess ? 'Sesión actualizada correctamente' : 'Tu sesión está a punto de expirar'),
      autoClose: true,
      action: !isSuccess ? {
        label: 'Extender sesión',
        onClick: () => {
          // Aquí puedes implementar la lógica para refrescar el token
          console.log('Extendiendo sesión...');
        }
      } : null
    });
  };

  // Cerrar notificación actual
  const closeNotification = () => {
    setNotification(null);
  };

  // Devolver funciones de utilidad
  return {
    showSessionExpired,
    showAuthError,
    showAuthSuccess,
    showTokenRefresh,
    closeNotification,
    notification
  };
};

export default AuthNotification;