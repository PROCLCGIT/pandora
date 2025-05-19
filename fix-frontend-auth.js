import axios from 'axios';

// Configuración API con soporte para cookies
const api = axios.create({
  // Detectar automáticamente el host del backend o usar un valor por defecto
  baseURL: window.location.hostname === 'localhost' 
    ? 'http://localhost:8000/api/'  // Desarrollo local
    : `${window.location.protocol}//${window.location.hostname}/api/`, // Mismo dominio que frontend
  timeout: 8000, // Aumentar timeout para conexiones lentas
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true  // IMPORTANTE: Necesario para enviar/recibir cookies en CORS
});

// Cache para evitar múltiples verificaciones en poco tiempo
let tokenVerificationCache = {
  isValid: false,
  lastChecked: null,
  userId: null,
  expiresIn: 0
};

// Número de verificaciones por segundo permitidas
const VERIFY_THROTTLE_MS = 2000; // Verificar máximo cada 2 segundos
let lastVerifyTime = 0;

/**
 * Verifica si el usuario está autenticado (tiene token válido)
 * Con limitación de frecuencia para evitar demasiadas llamadas
 */
export const verifyAuth = async (force = false) => {
  const now = Date.now();
  
  // Evitar verificaciones demasiado frecuentes
  if (!force && now - lastVerifyTime < VERIFY_THROTTLE_MS) {
    console.log('Token verification throttled, using cached result');
    return tokenVerificationCache;
  }
  
  // Actualizar tiempo de última verificación ANTES de la llamada API
  // para evitar múltiples verificaciones simultáneas
  lastVerifyTime = now;
  
  // Una variable para llevar cuenta de intentos
  let retryCount = 0;
  const maxRetries = 2;
  
// Función interna para reintentar con backoff
  const attemptVerify = async () => {
    try {
      const response = await api.post('auth/verify/', {}, {
        // No reintentar automáticamente
        retry: false,
        // Usar un timeout menor para verificaciones
        timeout: 3000
      });
      
      // Actualizar cache
      tokenVerificationCache = {
        isValid: true,
        lastChecked: now,
        userId: response.data.user_id,
        expiresIn: response.data.expires_in_minutes
      };
      
      return tokenVerificationCache;
    } catch (error) {
      // Si es un error de conexión y no hemos agotado los reintentos
      if (error.code === 'ERR_NETWORK' && retryCount < maxRetries) {
        retryCount++;
        console.log(`Reintento ${retryCount}/${maxRetries} para verificar autenticación...`);
        // Esperar un tiempo antes de reintentar (backoff exponencial)
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retryCount)));
        return attemptVerify();
      }
      
      // En caso de error, invalidar el cache
      tokenVerificationCache = {
        isValid: false,
        lastChecked: now,
        userId: null,
        expiresIn: 0,
        error: error.message
      };
      
      // No mostrar el error en consola para errores 401 (no autenticado)
      if (error.response?.status !== 401) {
        console.warn('Auth verification failed:', error?.response?.data?.detail || error.message);
      }
      return tokenVerificationCache;
    }
  };
  
  // Iniciar el proceso de verificación con reintentos
  return attemptVerify();
};

/**
 * Inicia sesión y guarda tokens en cookies (manejado por el backend)
 */
export const login = async (username, password) => {
  try {
    const response = await api.post('auth/login/', {
      username,
      password
    });
    
    // Las cookies se manejan automáticamente
    // Guardar información de usuario en sessionStorage para estado local
    if (response.data.user_id) {
      sessionStorage.setItem('user_id', response.data.user_id);
    }
    
    // Actualizar cache de verificación
    tokenVerificationCache = {
      isValid: true,
      lastChecked: Date.now(),
      userId: response.data.user_id,
      expiresIn: 5 // Asumimos 5 minutos por defecto
    };
    
    return response.data;
  } catch (error) {
    console.error('Error de autenticación:', error?.response?.data || error);
    throw error;
  }
};

/**
 * Refresca el token automáticamente
 */
export const refreshToken = async () => {
  try {
    const response = await api.post('auth/refresh/');
    
    // Las cookies se manejan automáticamente
    tokenVerificationCache.lastChecked = Date.now();
    tokenVerificationCache.expiresIn = 5; // Asumimos 5 minutos
    
    return true;
  } catch (error) {
    console.error('Error al refrescar token:', error?.response?.data || error);
    return false;
  }
};

/**
 * Cierra la sesión del usuario y elimina tokens
 */
export const logout = async () => {
  try {
    await api.post('auth/logout/');
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
    console.error('Error al cerrar sesión:', error);
    // Incluso si hay error, eliminar datos locales
    sessionStorage.removeItem('user_id');
    return false;
  }
};

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Si el error es 401 (Unauthorized) y no hemos intentado refrescar el token antes
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Intentar refrescar el token
      const refreshSuccessful = await refreshToken();
      
      if (refreshSuccessful) {
        // Reintentar la petición original
        return api(originalRequest);
      } else {
        // Si no podemos refrescar, redirigir al login
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Verifica la conexión con el backend
 * Útil para diagnóstico y para mostrar errores al usuario
 */
export const checkBackendConnection = async () => {
  // Usar un endpoint ligero que no requiera autenticación
  try {
    // Intentar primero con un ping al endpoint de diagnóstico
    await api.get('auth/debug/', { timeout: 3000 });
    return { connected: true, message: 'Conexión establecida con el backend' };
  } catch (error) {
    console.error('Error de conexión con el backend:', error);
    
    // Información detallada para diagnóstico
    const details = {
      connected: false,
      url: api.defaults.baseURL,
      errorType: error.code || error.name,
      errorMessage: error.message,
      status: error.response?.status,
      responseData: error.response?.data,
    };
    
    // Mensaje para el usuario
    let userMessage = 'No se pudo conectar con el servidor.';
    
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      userMessage = 'El servidor no está disponible. Verifique su conexión a internet o contacte al administrador.';
    } else if (error.response?.status === 404) {
      userMessage = 'La ruta del API no es correcta. Verifique la configuración.';
    } else if (error.response?.status === 403 || error.response?.status === 401) {
      userMessage = 'Problemas de permisos o autenticación.';
    }
    
    return { 
      connected: false, 
      message: userMessage,
      details
    };
  }
};

// Inicializar con verificación de conexión
(async () => {
  const connectionStatus = await checkBackendConnection();
  if (!connectionStatus.connected) {
    console.warn('Problema de conexión con el backend:', connectionStatus.message);
    // No intentar verificar auth si no hay conexión
    return;
  }
  // Solo verificar auth si hay conexión
  verifyAuth();
})();

export default api; 