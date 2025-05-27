import axios from 'axios';
import { getCurrentBackendUrl } from './checkBackend';

// Log mejorado
const logAuth = (message, ...args) => {
  console.log(`🔑 API Auth: ${message}`, ...args);
};

// Crear una función para actualizar la baseURL dinámicamente
const createApi = () => {
  // Obtener la URL más actual
  const baseURL = `${getCurrentBackendUrl()}/api/`;
  
  // Configuración API con soporte para cookies
  const api = axios.create({
    baseURL,
    timeout: 15000, // Aumentar timeout para conexiones lentas
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    withCredentials: true  // IMPORTANTE: Necesario para enviar/recibir cookies en CORS
  });

  // Interceptor para manejar errores de autenticación
  api.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
      
      // Verificar si ya estamos en un intento de refresh
      if (originalRequest.url === '/auth/refresh/') {
        // No intentar refrescar el token si el error ocurrió en el endpoint de refresh
        return Promise.reject(error);
      }
      
      // Si el error es 401 (Unauthorized) y no hemos intentado refrescar el token antes
      if (error.response?.status === 401 && !originalRequest._retry) {
        logAuth('Interceptando error 401, intentando refrescar token');
        originalRequest._retry = true;
        
        try {
          // Intentar refrescar el token
          const refreshSuccessful = await refreshToken();
          
          if (refreshSuccessful) {
            logAuth('Token refrescado, reintentando solicitud original');
            // Reintentar la petición original
            return api(originalRequest);
          } else {
            logAuth('No se pudo refrescar el token');
            
            // No redirigir automáticamente, solo retornar el error
            // Esto evita recargas inesperadas de la página
            return Promise.reject(error);
          }
        } catch (refreshError) {
          logAuth('Error durante el proceso de refresh:', refreshError);
          // No redireccionar automáticamente
          return Promise.reject(error);
        }
      }
      
      return Promise.reject(error);
    }
  );
  
  return api;
};

// Función para actualizar/refrescar la API si cambia la URL del backend
export const getApiClient = () => {
  // Si ya existe una instancia estática, verificar que la URL sea correcta
  const currentBackendUrl = getCurrentBackendUrl();
  if (_apiInstance) {
    const currentBaseUrl = _apiInstance.defaults.baseURL;
    const expectedBaseUrl = `${currentBackendUrl}/api/`;
    
    // Si la URL cambió, recrear la instancia
    if (currentBaseUrl !== expectedBaseUrl) {
      logAuth(`URL de backend cambió de ${currentBaseUrl} a ${expectedBaseUrl}, actualizando cliente API`);
      _apiInstance = createApi();
    }
  } else {
    // Crear instancia inicial
    _apiInstance = createApi();
  }
  
  return _apiInstance;
};

// Instancia estática (se actualiza dinámicamente si cambia la URL)
let _apiInstance = null;

// Log inmediato de configuración inicial
logAuth('Módulo auth.js cargado, API se configurará con la primera llamada');

// Cache para evitar múltiples verificaciones en poco tiempo
let tokenVerificationCache = {
  isValid: false,
  lastChecked: null,
  userId: null,
  expiresIn: 0
};

// Control de refresco para evitar múltiples intentos en poco tiempo
const REFRESH_THROTTLE_MS = 10000; // 10 segundos entre intentos
let lastRefreshAttempt = 0;
let refreshInProgress = null;

// Número de verificaciones por segundo permitidas
const VERIFY_THROTTLE_MS = 60000; // Verificar máximo cada 60 segundos para reducir carga significativamente
let lastVerifyTime = 0;

/**
 * Verifica si el usuario está autenticado (tiene token válido)
 * Con limitación de frecuencia para evitar demasiadas llamadas
 */
export const verifyAuth = async (force = false) => {
  const now = Date.now();
  
  // Evitar verificaciones demasiado frecuentes
  if (!force && now - lastVerifyTime < VERIFY_THROTTLE_MS) {
    logAuth('Token verification throttled, using cached result');
    return tokenVerificationCache;
  }
  
  // Actualizar tiempo de última verificación ANTES de la llamada API
  // para evitar múltiples verificaciones simultáneas
  lastVerifyTime = now;
  
  // Una variable para llevar cuenta de intentos
  let retryCount = 0;
  const maxRetries = 1; // Reducido para evitar demasiados intentos
  
  // Verificar que la conexión está establecida antes de verificar auth
  try {
    const api = getApiClient();
    logAuth('Enviando solicitud de verificación a:', `${api.defaults.baseURL}auth/verify/`);
    const response = await api.post('/auth/verify/', {}, {
      // No reintentar automáticamente
      retry: false,
      // Usar un timeout menor para verificaciones
      timeout: 5000
    });
    
    logAuth('Verificación exitosa:', response.data);
    
    // Actualizar cache
    tokenVerificationCache = {
      isValid: true,
      lastChecked: now,
      userId: response.data.user_id,
      expiresIn: response.data.expires_in_minutes || 15
    };
    
    return tokenVerificationCache;
  } catch (error) {
    // Log detallado del error
    if (error.response) {
      logAuth(`Error de verificación: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      logAuth('Error de verificación: Sin respuesta del servidor');
    } else {
      logAuth(`Error de verificación: ${error.message}`);
    }
    
    // Si es un error de conexión y no hemos agotado los reintentos
    if (error.code === 'ERR_NETWORK' && retryCount < maxRetries) {
      retryCount++;
      logAuth(`Reintento ${retryCount}/${maxRetries} para verificar autenticación...`);
      // Esperar un tiempo antes de reintentar (backoff exponencial)
      await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retryCount)));
      return verifyAuth(true);
    }
    
    // En caso de error, invalidar el cache
    tokenVerificationCache = {
      isValid: false,
      lastChecked: now,
      userId: null,
      expiresIn: 0,
      error: error.response?.data?.detail || error.message
    };
    
    // No mostrar el error en consola para errores 401 (no autenticado)
    if (error.response?.status !== 401) {
      console.warn('Auth verification failed:', error?.response?.data?.detail || error.message);
    }
    
    return tokenVerificationCache;
  }
};

/**
 * Inicia sesión y guarda tokens en cookies (manejado por el backend)
 */
export const login = async (username, password) => {
  try {
    const api = getApiClient();
    logAuth(`Intentando login para usuario: ${username} en ${api.defaults.baseURL}auth/login/`);
    
    // Importante: El backend espera 'username', no 'email'
    const response = await api.post('/auth/login/', {
      username,  // Enviamos el email como username para el backend
      password
    });
    
    logAuth('Login exitoso:', response.data);
    
    // Las cookies se manejan automáticamente
    // Guardar información de usuario en sessionStorage para estado local
    if (response.data.user_id) {
      sessionStorage.setItem('user_id', response.data.user_id);
    }
    
    // Actualizar cache de verificación
    tokenVerificationCache = {
      isValid: response.data.success !== false, // Si hay una propiedad success explícita usarla
      lastChecked: Date.now(),
      userId: response.data.user_id,
      expiresIn: response.data.expires_in_minutes || 15 // Usar tiempo de expiración del token o 15 minutos
    };
    
    // IMPORTANTE: Asegurarnos de retornar un objeto con success
    if (!Object.prototype.hasOwnProperty.call(response.data, 'success')) {
      // Si el backend no incluyó explícitamente success, lo agregamos nosotros basado en si hay user_id
      return { 
        ...response.data, 
        success: !!response.data.user_id 
      };
    }
    
    return response.data;
  } catch (error) {
    // Log detallado del error
    if (error.response) {
      logAuth(`Error de login: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      logAuth('Error de login: Sin respuesta del servidor');
    } else {
      logAuth(`Error de login: ${error.message}`);
    }
    
    // Retornar un objeto con formato consistente para errores
    return {
      success: false,
      detail: error.response?.data?.detail || 'Error al iniciar sesión',
      error: error.message
    };
  }
};

/**
 * Refresca el token automáticamente
 */
export const refreshToken = async () => {
  const now = Date.now();
  if (refreshInProgress) {
    return refreshInProgress;
  }
  if (now - lastRefreshAttempt < REFRESH_THROTTLE_MS) {
    logAuth('Refresco de token ignorado por throttling');
    return false;
  }
  lastRefreshAttempt = now;

  refreshInProgress = (async () => {
    try {
      const api = getApiClient();
      logAuth('Intentando refrescar token');
      const response = await api.post('/auth/refresh/');
    
      logAuth('Token refrescado correctamente');

      // Las cookies se manejan automáticamente
      tokenVerificationCache.lastChecked = Date.now();
      tokenVerificationCache.expiresIn = response.data.expires_in_minutes || 15;

      return true;
    } catch (error) {
    // Log detallado del error
      if (error.response) {
        logAuth(`Error al refrescar token: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        logAuth('Error al refrescar token: Sin respuesta del servidor');
      } else {
        logAuth(`Error al refrescar token: ${error.message}`);
      }

      // Intentamos preservar la sesión actual en lugar de fallar directamente
      // Solo si el error es 401 consideramos que el token no es válido
      // Para otros errores (como de red), asumimos que el token sigue siendo válido
      if (error.response?.status === 401) {
        // Token definitivamente no válido
        return false;
      } else {
        // Error de red u otro, intentamos mantener la sesión
        logAuth('Asumiendo que token sigue válido debido a error temporal');
        return true;
      }
    } finally {
      refreshInProgress = null;
    }
  })();

  return refreshInProgress;
};

/**
 * Cierra la sesión del usuario y elimina tokens
 */
export const logout = async () => {
  try {
    const api = getApiClient();
    logAuth('Cerrando sesión');
    await api.post('/auth/logout/');
    logAuth('Sesión cerrada correctamente');
    
    // Eliminar datos locales
    sessionStorage.removeItem('user_id');
    // Invalidar cache
    tokenVerificationCache = {
      isValid: false,
      lastChecked: Date.now(),
      userId: null,
      expiresIn: 0
    };
    return true;
  } catch (error) {
    logAuth('Error al cerrar sesión:', error);
    // Incluso si hay error, eliminar datos locales
    sessionStorage.removeItem('user_id');
    return false;
  }
};

/**
 * Verifica la conexión con el backend
 * Útil para diagnóstico y para mostrar errores al usuario
 * Usa la función de checkConnectionStatus importada de checkBackend para evitar dependencias circulares
 */
export const checkBackendConnection = async (force = false) => {
  try {
    // Importamos dinámicamente para evitar dependencias circulares
    const { checkConnectionStatus } = await import('./checkBackend');
    const result = await checkConnectionStatus(force);
    return result;
  } catch (error) {
    console.error('Error al verificar backend connection:', error);
    return { 
      connected: false, 
      message: `Error al verificar conexión: ${error.message || 'Error desconocido'}`,
      details: { error }
    };
  }
};

// Función reusable para esperar un tiempo
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

// Inicializar con verificación de conexión (exportada para uso en desarrollo)
let initializationInProgress = false;
export const initializeAuthCheck = async () => {
  // Evitar inicializaciones paralelas
  if (initializationInProgress) {
    logAuth('Initialization already in progress, skipping');
    return;
  }
  
  initializationInProgress = true;
  
  try {
    logAuth('Iniciando verificación de conexión...');
    // Esperamos significativamente más para permitir que la UI se estabilice primero
    await wait(2000);
    
    const connectionStatus = await checkBackendConnection();
    
    if (connectionStatus.connected) {
      logAuth('Conexión establecida, verificando autenticación...');
      // Esperamos un momento considerable entre peticiones
      await wait(1000);
      
      try {
        const authStatus = await verifyAuth(true);
        logAuth('Estado de autenticación:', authStatus.isValid ? 'Autenticado' : 'No autenticado');
        
        // Guardar el resultado en localStorage para mejorar la experiencia en recarga
        localStorage.setItem('lastAuthCheck', Date.now().toString());
        localStorage.setItem('lastAuthStatus', JSON.stringify({
          isValid: authStatus.isValid,
          userId: authStatus.userId
        }));
      } catch (e) {
        console.warn('Error al verificar autenticación:', e);
      }
    } else {
      console.warn('Problema de conexión con el backend:', connectionStatus.message);
    }
  } finally {
    initializationInProgress = false;
  }
};

// No ejecutar inicialización automática para evitar loops
logAuth('Inicialización automática de auth desactivada para prevenir parpadeos');

// Re-exportar la instancia de API por conveniencia
export default getApiClient();