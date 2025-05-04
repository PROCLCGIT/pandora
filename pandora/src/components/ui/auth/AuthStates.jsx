import React from 'react';

/**
 * Componente para mostrar un estado de carga durante procesos de autenticación
 * @param {Object} props - Propiedades del componente
 * @param {string} props.message - Mensaje a mostrar
 * @returns {JSX.Element}
 */
export const AuthLoading = ({ message = 'Autenticando...' }) => (
  <div className="flex items-center justify-center space-x-2 text-indigo-700">
    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <span>{message}</span>
  </div>
);

/**
 * Componente para mostrar un mensaje de error de autenticación
 * @param {Object} props - Propiedades del componente
 * @param {string} props.message - Mensaje de error
 * @param {Function} props.onDismiss - Función para cerrar el mensaje
 * @returns {JSX.Element}
 */
export const AuthError = ({ message, onDismiss }) => (
  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 relative">
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path 
            fillRule="evenodd" 
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
            clipRule="evenodd" 
          />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm text-red-800">{message}</p>
      </div>
      {onDismiss && (
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={onDismiss}
              className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path 
                  fillRule="evenodd" 
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);

/**
 * Componente para mostrar un mensaje de éxito de autenticación
 * @param {Object} props - Propiedades del componente
 * @param {string} props.message - Mensaje de éxito
 * @param {Function} props.onDismiss - Función para cerrar el mensaje
 * @returns {JSX.Element}
 */
export const AuthSuccess = ({ message, onDismiss }) => (
  <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 relative">
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path 
            fillRule="evenodd" 
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
            clipRule="evenodd" 
          />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm text-green-800">{message}</p>
      </div>
      {onDismiss && (
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={onDismiss}
              className="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path 
                  fillRule="evenodd" 
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);

/**
 * Componente para mostrar una notificación de sesión expirada
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onLogin - Función para redirigir al login
 * @returns {JSX.Element}
 */
export const SessionExpired = ({ onLogin }) => (
  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path 
            fillRule="evenodd" 
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
            clipRule="evenodd" 
          />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm text-yellow-800">
          Tu sesión ha expirado. Por favor, inicia sesión nuevamente.
        </p>
        <p className="mt-2">
          <button
            onClick={onLogin}
            className="text-sm font-medium text-yellow-800 hover:text-yellow-700 underline"
          >
            Iniciar sesión
          </button>
        </p>
      </div>
    </div>
  </div>
);

/**
 * Componente para mostrar información sobre intentos de auto-login
 * @param {Object} props - Propiedades del componente
 * @param {string} props.status - Estado del intento ('inProgress', 'success', 'failure')
 * @param {string} props.message - Mensaje adicional a mostrar
 * @returns {JSX.Element}
 */
export const AutoLoginStatus = ({ status, message = '' }) => {
  let statusContent;
  
  switch (status) {
    case 'inProgress':
      statusContent = (
        <div className="flex items-center space-x-2 text-blue-700">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-xs">Iniciando sesión automáticamente...</span>
        </div>
      );
      break;
    case 'success':
      statusContent = (
        <div className="flex items-center space-x-2 text-green-700">
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
              clipRule="evenodd" 
            />
          </svg>
          <span className="text-xs">Inicio automático exitoso</span>
        </div>
      );
      break;
    case 'failure':
      statusContent = (
        <div className="flex items-center space-x-2 text-red-700">
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
              clipRule="evenodd" 
            />
          </svg>
          <span className="text-xs">{message || 'Inicio de sesión automático fallido'}</span>
        </div>
      );
      break;
    default:
      statusContent = null;
  }
  
  return statusContent;
};

/**
 * Botón de login con diferentes estados
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.loading - Si está cargando
 * @param {boolean} props.disabled - Si está deshabilitado
 * @param {string} props.loadingText - Texto a mostrar durante la carga
 * @param {string} props.children - Texto del botón en estado normal
 * @param {Function} props.onClick - Manejador de clic
 * @returns {JSX.Element}
 */
export const LoginButton = ({ 
  loading, 
  disabled, 
  loadingText = "Iniciando sesión...",
  children = "Iniciar sesión",
  onClick,
  ...props
}) => (
  <button
    type="submit"
    disabled={loading || disabled}
    onClick={onClick}
    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200"
    {...props}
  >
    {loading ? (
      <>
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {loadingText}
      </>
    ) : (
      children
    )}
  </button>
);

/**
 * Contenedor para mensajes de feedback de formulario
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.error - Error a mostrar
 * @param {Object} props.success - Mensaje de éxito
 * @param {Function} props.onDismiss - Función para cerrar los mensajes
 * @returns {JSX.Element}
 */
export const AuthFeedback = ({ error, success, onDismiss }) => (
  <div className="auth-feedback-container">
    {error && (
      <AuthError
        message={error}
        onDismiss={onDismiss}
      />
    )}
    {success && (
      <AuthSuccess
        message={success}
        onDismiss={onDismiss}
      />
    )}
  </div>
);