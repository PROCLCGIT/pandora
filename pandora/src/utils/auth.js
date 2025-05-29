// /Users/clc/Ws/Appclc/pandora/src/utils/auth.js

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
    timeout: 20000, // Aumentar timeout para evitar falsos errores
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    withCredentials: true  // IMPORTANTE: Necesario para enviar/recibir cookies en CORS
  });

  // CAMBIO CRÍTICO: Interceptor simplificado sin reintentos automáticos
  api.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
      
      // Solo log de errores, no más reintentos automáticos que causen loops
      if (error.response?.status === 401 && !originalRequest.url?.includes('/auth/refresh/')) {
        logAuth('Error 401 detectado, pero no se intentará refresco automático para evitar loops');
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
logAuth('Módulo auth.js cargado con verificaciones optimizadas');

// Cache para evitar múltiples verificaciones en poco tiempo
let tokenVerificationCache = {
  isValid: false,
  lastChecked: null,
  userId: null,
  expiresIn: 0
};

// CAMBIO CRÍTICO: Control de refresco más estricto
const REFRESH_THROTTLE_MS = 2 * 60 * 1000; // 2 minutos entre intentos (aumentado)
let lastRefreshAttempt = 0;
let refreshInProgress = null;

// CAMBIO CRÍTICO: Verificaciones menos frecuentes
const VERIFY_THROTTLE_MS = 20 * 60 * 1000; // 20 minutos entre verificaciones
let lastVerifyTime = 0;

/**
 * CAMBIO CRÍTICO: Verifica si el usuario está autenticado con throttling estricto
 */
export const verifyAuth = async (force = false) => {
  const now = Date.now();
  
  // CAMBIO CRÍTICO: Throttling más estricto
  if (!force && now - lastVerifyTime < VERIFY_THROTTLE_MS) {
    logAuth('Token verification throttled (20min), using cached result');
    return tokenVerificationCache;
  }
  
  // Actualizar tiempo de última verificación ANTES de la llamada API
  lastVerifyTime = now;
  
  try {
    const api = getApiClient();
    logAuth('Enviando solicitud de verificación a:', `${api.defaults.baseURL}auth/verify/`);
    const response = await api.post('/auth/verify/', {}, {
      timeout: 8000 // Timeout más largo para evitar falsos negativos
    });
    
    logAuth('Verificación exitosa:', response.data);
    
    // Actualizar cache
    tokenVerificationCache = {
      isValid: true,
      lastChecked: now,
      userId: response.data.user_id,
      expiresIn: response.data.expires_in_minutes || 20
    };
    
    return tokenVerificationCache;
  } catch (error) {
    // Log detallado del error solo si no es 401
    if (error.response?.status !== 401) {
      if (error.response) {
        logAuth(`Error de verificación: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        logAuth('Error de verificación: Sin respuesta del servidor');
      } else {
        logAuth(`Error de verificación: ${error.message}`);
      }
    }
    
    // En caso de error, invalidar el cache
    tokenVerificationCache = {
      isValid: false,
      lastChecked: now,
      userId: null,
      expiresIn: 0,
      error: error.response?.data?.detail || error.message
    };
    
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
      isValid: response.data.success !== false,
      lastChecked: Date.now(),
      userId: response.data.user_id,
      expiresIn: response.data.expires_in_minutes || 20
    };
    
    // IMPORTANTE: Asegurarnos de retornar un objeto con success
    if (!Object.prototype.hasOwnProperty.call(response.data, 'success')) {
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
 * CAMBIO CRÍTICO: Refresca el token con throttling más estricto
 */
export const refreshToken = async () => {
  const now = Date.now();
  if (refreshInProgress) {
    return refreshInProgress;
  }
  if (now - lastRefreshAttempt < REFRESH_THROTTLE_MS) {
    logAuth('Refresco de token ignorado por throttling estricto (2min)');
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
      tokenVerificationCache.expiresIn = response.data.expires_in_minutes || 20;

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

      // CAMBIO CRÍTICO: Ser más conservador con errores de red
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

// CAMBIO CRÍTICO: Eliminamos la inicialización automática
logAuth('Inicialización automática de auth DESHABILITADA para prevenir loops de recarga');

// Re-exportar la instancia de API por conveniencia
export default getApiClient();