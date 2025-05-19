import { useState, useEffect, memo, useCallback } from 'react'
// Importamos directamente del módulo específico para evitar dependencias circulares
import { checkConnectionStatus } from '../../utils/checkBackend'
import { useAuth } from '../../modulos/auth/authContext'

const RETRY_INTERVALS = [2000, 5000, 10000, 30000, 60000] // Intervalos de reintento en ms, hasta 1 minuto

// Usamos memo para evitar renderizados innecesarios
const BackendStatusIndicator = memo(function BackendStatusIndicator() {
  const { backendAvailable, isAuthenticated } = useAuth(); // Acceder directamente al contexto de auth
  
  const [status, setStatus] = useState({
    checking: true,
    connected: backendAvailable, // Usar valor inicial del contexto
    backendUrl: null,
    message: 'Verificando conexión...',
    retryAttempt: 0,
    isAuthenticated: isAuthenticated, // Usar valor inicial del contexto
    lastCheckTime: null,
    showOfflineNotice: false,
    showDebugInfo: false
  })

  // Obtenemos valores del contexto de auth fuera del callback para usar el hook correctamente
  const { isAuthenticated: currentAuthState } = useAuth();
  
  // Controlador para reintento manual
  const handleManualRetry = useCallback(async () => {
    setStatus(prev => ({
      ...prev,
      checking: true,
      message: 'Reintentando conexión...',
      retryAttempt: 0
    }));
    
    try {
      // Verificación inmediata al pulsar el botón
      const connectionResult = await checkConnectionStatus(true);
      
      if (connectionResult.connected) {
        // Usamos el valor del estado de autenticación del contexto que ya obtuvimos fuera del callback
        setStatus(prev => ({
          ...prev,
          checking: false,
          connected: true,
          backendUrl: connectionResult.details?.url || null,
          message: 'Conexión restablecida',
          retryAttempt: 0,
          isAuthenticated: currentAuthState, // Usamos la variable externa
          lastCheckTime: new Date(),
          showOfflineNotice: false
        }));
      } else {
        setStatus(prev => ({
          ...prev,
          checking: false,
          connected: false,
          message: `${connectionResult.message}`,
          retryAttempt: prev.retryAttempt + 1,
          lastCheckTime: new Date()
        }));
      }
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        checking: false,
        connected: false,
        message: `Error: ${error.message || 'Error desconocido'}`,
        retryAttempt: prev.retryAttempt + 1,
        lastCheckTime: new Date()
      }));
    }
  }, [currentAuthState]); // Dependencia correcta para el useCallback

  // Toggle información de depuración
  const toggleDebugInfo = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      showDebugInfo: !prev.showDebugInfo
    }));
  }, []);

  useEffect(() => {
    let mounted = true
    let retryTimeout
    let debounceTimer = null
    
    // Función para actualizar el estado con debounce para evitar cambios de estado rápidos
    const updateStatusWithDebounce = (newStatus) => {
      // Cancelar cualquier actualización pendiente
      if (debounceTimer) clearTimeout(debounceTimer)
      
      // Programar actualización con un pequeño retraso
      debounceTimer = setTimeout(() => {
        if (mounted) {
          setStatus(prev => {
            // Solo cambiar si hay un cambio significativo para evitar renderizados innecesarios
            if (prev.connected !== newStatus.connected || 
                prev.checking !== newStatus.checking ||
                prev.isAuthenticated !== newStatus.isAuthenticated ||
                prev.message !== newStatus.message) {
              return {...prev, ...newStatus, lastCheckTime: new Date()};
            }
            return prev;
          });
        }
      }, 300); // Retraso mayor para mejor estabilidad
    };

    const checkStatus = async () => {
      if (!mounted) return

      try {
        // Verificar conexión usando nuestra función específica
        const connectionResult = await checkConnectionStatus(true)
        
        if (!mounted) return

        if (connectionResult.connected) {
          // Usamos el estado de autenticación del contexto que obtuvimos fuera del método
          // Los hooks NO pueden ser usados dentro de funciones normales
          
          if (!mounted) return
          
          updateStatusWithDebounce({
            checking: false,
            connected: true,
            backendUrl: connectionResult.details?.url || null,
            message: connectionResult.message,
            retryAttempt: 0,
            isAuthenticated: currentAuthState, // Variable que ya tenemos del contexto
            showOfflineNotice: false
          });
          
          // Si estamos conectados, programar otra verificación en 60 segundos
          retryTimeout = setTimeout(checkStatus, 60000)
        } else {
          // No hay conexión, programar reintento
          const nextRetryIndex = Math.min(status.retryAttempt, RETRY_INTERVALS.length - 1)
          const retryDelay = RETRY_INTERVALS[nextRetryIndex]
          
          updateStatusWithDebounce({
            checking: false,
            connected: false,
            message: `${connectionResult.message} Reintentando en ${retryDelay/1000}s...`,
            retryAttempt: status.retryAttempt + 1,
            showOfflineNotice: true
          });
          
          retryTimeout = setTimeout(checkStatus, retryDelay)
        }
      } catch (error) {
        if (!mounted) return
        
        // Error al verificar, programar reintento
        const nextRetryIndex = Math.min(status.retryAttempt, RETRY_INTERVALS.length - 1)
        const retryDelay = RETRY_INTERVALS[nextRetryIndex]
        
        updateStatusWithDebounce({
          checking: false,
          connected: false,
          message: `Error: ${error.message || 'Error desconocido'}. Reintentando en ${retryDelay/1000}s...`,
          retryAttempt: status.retryAttempt + 1,
          showOfflineNotice: true
        });
        
        retryTimeout = setTimeout(checkStatus, retryDelay)
      }
    }

    // Iniciar la verificación
    checkStatus()

    // Retrasar la verificación inicial para no competir con otros procesos de inicio
    const initialDelay = setTimeout(checkStatus, 1500); // Retrasamos 1.5 segundos
    
    return () => {
      mounted = false
      if (retryTimeout) clearTimeout(retryTimeout)
      if (debounceTimer) clearTimeout(debounceTimer)
      clearTimeout(initialDelay)
    }
  }, [currentAuthState, status.retryAttempt]) // Añadimos las dependencias necesarias

  // Sincronizar con el estado del contexto, pero con menos frecuencia
  useEffect(() => {
    const sync = setTimeout(() => {
      setStatus(prev => ({
        ...prev,
        connected: backendAvailable,
        isAuthenticated: isAuthenticated
      }));
    }, 1000); // Pequeño retraso para evitar actualizaciones excesivas
    
    return () => clearTimeout(sync);
  }, [backendAvailable, isAuthenticated]);

  // No mostrar nada si está conectado y autenticado
  if (status.connected && status.isAuthenticated && !status.showDebugInfo) {
    return null
  }

  // Modo fallback para cuando no hay conexión después de varios intentos
  // O cuando está conectado pero hay problemas de autenticación persistentes
  const showFallbackMode = (!status.connected && status.retryAttempt > 3) || 
                          (status.connected && !status.isAuthenticated && status.retryAttempt > 2);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-2 text-center shadow-md">
        {status.checking ? (
          <div className="flex items-center justify-center space-x-2">
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Verificando conexión con el servidor...</span>
          </div>
        ) : status.connected ? (
          <div className="flex items-center justify-center space-x-2">
            <svg className="h-4 w-4 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{status.isAuthenticated ? 'Conectado y autenticado' : 'Conectado al servidor. Esperando autenticación...'}</span>
            
            {/* Botón para mostrar/ocultar información de depuración */}
            <button 
              onClick={toggleDebugInfo}
              className="ml-4 text-xs bg-indigo-700 hover:bg-indigo-800 px-2 py-1 rounded shadow"
            >
              {status.showDebugInfo ? 'Ocultar info' : 'Mostrar info'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center space-x-2">
              <svg className="h-4 w-4 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>{status.message}</span>
              
              {/* Botón de reintento manual */}
              <button 
                onClick={handleManualRetry}
                className="ml-4 text-xs bg-white text-indigo-600 hover:bg-gray-100 px-2 py-1 rounded shadow"
                disabled={status.checking}
              >
                {status.checking ? 'Verificando...' : 'Reintentar conexión'}
              </button>
              
              {/* Botón para mostrar/ocultar información de depuración */}
              <button 
                onClick={toggleDebugInfo}
                className="ml-2 text-xs bg-indigo-700 hover:bg-indigo-800 px-2 py-1 rounded shadow"
              >
                {status.showDebugInfo ? 'Ocultar info' : 'Más info'}
              </button>
            </div>
            
            {/* Información adicional para depuración */}
            {status.showDebugInfo && (
              <div className="mt-2 text-xs text-white bg-black bg-opacity-20 p-2 rounded">
                <div>Último intento: {status.lastCheckTime?.toLocaleTimeString() || 'N/A'}</div>
                <div>Intentos realizados: {status.retryAttempt}</div>
                <div>Frontend: Online | Backend: {status.connected ? 'Online' : 'Offline'}</div>
                <div>
                  Estado Auth: {status.isAuthenticated ? 'Autenticado' : 'No autenticado'} 
                  | URL Backend: {status.backendUrl || 'Desconocida'}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Notificación de modo fallback cuando no hay conexión tras varios intentos */}
      {showFallbackMode && status.showOfflineNotice && (
        <div className="fixed top-14 left-0 right-0 z-40 bg-yellow-50 border-b border-yellow-200 text-yellow-800 p-4 text-center">
          <h3 className="font-bold text-lg mb-2">
            {!status.connected ? "Modo sin conexión" : "Problemas de autenticación"}
          </h3>
          
          {!status.connected ? (
            <p className="mb-2">
              No se ha podido conectar con el servidor. La aplicación está funcionando en modo limitado 
              con los datos que están disponibles localmente.
            </p>
          ) : !status.isAuthenticated ? (
            <div>
              <p className="mb-2">
                El servidor está disponible pero hay un problema con la autenticación. Causas posibles:
              </p>
              <ul className="list-disc list-inside text-left max-w-lg mx-auto mb-2">
                <li>No hay un usuario creado en la base de datos del servidor</li>
                <li>Las credenciales para iniciar sesión no son correctas</li>
                <li>El servidor está devolviendo un error durante la autenticación</li>
              </ul>
              <p className="mb-2 text-sm font-medium">
                Intente ir a la página de <a href="/login" className="underline font-bold">Login</a> para iniciar sesión manualmente.
              </p>
            </div>
          ) : (
            <p className="mb-2">
              Hay problemas de conexión con el servidor. Intente actualizar la página.
            </p>
          )}
          
          <div className="flex justify-center space-x-4 mt-2">
            <button 
              onClick={handleManualRetry}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded shadow-sm"
            >
              Reintentar conexión
            </button>
            <button 
              onClick={() => setStatus(prev => ({...prev, showOfflineNotice: false}))}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded shadow-sm"
            >
              Continuar en modo limitado
            </button>
          </div>
        </div>
      )}
    </>
  )
})

export default BackendStatusIndicator