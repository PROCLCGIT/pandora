// /Users/clc/Ws/Appclc/pandora/src/config/axios.js

import axios from 'axios';

// Constantes para configuración global
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const TOKEN_REFRESH_URL = '/auth/refresh/';  // Nuevo endpoint para refrescar token con cookies
const TOKEN_VERIFY_URL = '/auth/verify/';    // Endpoint para verificar token
const TOKEN_LOGOUT_URL = '/auth/logout/';    // Endpoint para cerrar sesión
const LOGOUT_PATH = '/login';

// Variables para control de refresco de tokens
let isRefreshing = false;
let failedQueue = [];

// Función para procesar la cola de peticiones pendientes
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Crear instancia de axios con configuración base
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 segundos de timeout
  withCredentials: true, // Habilita el envío de cookies en peticiones cross-origin
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Funciones para gestión de tokens
// NOTA: Las cookies HttpOnly solo son accesibles por el servidor, no por JavaScript
// Estas funciones ahora solo gestionan el estado en memoria, los tokens reales
// se manejan mediante cookies HttpOnly establecidas por el backend

// Estado en memoria para tracking (no contiene los tokens reales)
let tokenState = {
  hasAccessToken: false,
  hasRefreshToken: false
};

const getTokens = () => {
  return {
    // No devolvemos los tokens reales, solo indicamos si existen
    accessToken: tokenState.hasAccessToken ? 'present-in-httponly-cookie' : null,
    refreshToken: tokenState.hasRefreshToken ? 'present-in-httponly-cookie' : null
  };
};

const saveTokens = (access, refresh = null) => {
  // Actualizamos el estado en memoria
  tokenState.hasAccessToken = !!access;
  if (refresh) {
    tokenState.hasRefreshToken = true;
  }
  
  // NOTA: Los tokens reales son manejados por cookies HttpOnly establecidas por el backend
  // Esta función solo mantiene el estado de la aplicación actualizado
};

const clearTokens = () => {
  // Actualizamos el estado en memoria
  tokenState.hasAccessToken = false;
  tokenState.hasRefreshToken = false;
  
  // Hacer una petición al endpoint de logout para invalidar las cookies en el servidor
  // Esta operación es asíncrona pero no esperamos su respuesta
  axios.post(`${BASE_URL}${TOKEN_LOGOUT_URL}`, {}, { withCredentials: true })
    .catch(error => console.warn('Error al hacer logout en el servidor:', error));
};

// Función de expiración de token eliminada (no usada en la lógica actual)

// Interceptor para peticiones
// NOTA: Ya no necesitamos añadir tokens manualmente, las cookies HttpOnly
// serán enviadas automáticamente por el navegador
axiosInstance.interceptors.request.use(
  async (config) => {
    // Aseguramos que config.headers existe
    config.headers = config.headers || {};
    
    // DEBUG: Log para todas las peticiones
    console.debug(`🔄 Request to ${config.url}`)

    // Si enviamos FormData, eliminamos Content-Type 'application/json'
    // para que el navegador establezca multipart/form-data con boundary
    if (config.data instanceof FormData) {
      if (config.headers && config.headers['Content-Type']) {
        delete config.headers['Content-Type']
      }
    }
    
    // Las cookies HttpOnly se envían automáticamente mediante withCredentials
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Función para refrescar token
const refreshToken = async () => {
  return axios.post(`${BASE_URL}${TOKEN_REFRESH_URL}`, {}, {
    withCredentials: true
  });
};

// Interceptor para manejar respuestas y errores
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response ? error.response.status : null;
    
    if (!error.response) {
      return Promise.reject(
        new Error('No se pudo conectar con el servidor. Verifica tu conexión a Internet.')
      );
    }
    
    // Si es un error 401 (Unauthorized) y no es del propio endpoint de refresh
    if (status === 401 && !originalRequest._retry &&
        !originalRequest.url.includes(TOKEN_REFRESH_URL) &&
        !originalRequest.url.includes(TOKEN_VERIFY_URL)) {
      
      // Si ya hay un proceso de refresco en curso, añadir esta solicitud a la cola
      if (isRefreshing) {
        try {
          // Esperar a que termine el refresco actual
          await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          
          // Reintentar la solicitud original
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Si el refresco falla, rechazar esta solicitud también
          return Promise.reject(refreshError);
        }
      }
      
      // Marcar que estamos en proceso de refresco
      isRefreshing = true;
      originalRequest._retry = true;
      
      try {
        // Intentar refrescar el token
        console.log('Intentando refrescar token tras error 401...');
        const refreshResponse = await refreshToken();
        
        if (refreshResponse.status === 200) {
          // Token refrescado exitosamente
          tokenState.hasAccessToken = true;
          
          // Procesar cola de solicitudes pendientes
          processQueue(null, 'Token refrescado');
          
          // Reintentar la solicitud original
          console.log('Token refrescado exitosamente, reintentando solicitud original');
          return axiosInstance(originalRequest);
        } else {
          throw new Error('Fallo al refrescar token');
        }
      } catch (refreshError) {
        console.error('Error al refrescar token:', refreshError);
        
        // Notificar a las solicitudes en cola
        processQueue(refreshError, null);
        
        // Limpiar tokens y redirigir a login
        clearTokens();
        window.location.href = LOGOUT_PATH;
        
        return Promise.reject(refreshError);
      } finally {
        // Marcar que ya no estamos refrescando
        isRefreshing = false;
      }
    }
    
    // Para otros errores, mantener el comportamiento original
    switch (status) {
      case 401: // Si llegamos aquí, es porque el refresco falló o no se pudo reintentar
        if (originalRequest.url.includes(TOKEN_REFRESH_URL)) {
          // Si es error del propio refresh, limpiar sesión
          clearTokens();
          window.location.href = LOGOUT_PATH;
        }
        return Promise.reject(
          new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
        );
        
      case 403: // Forbidden
        return Promise.reject(
          new Error('No tienes permisos para realizar esta acción.')
        );
        
      case 404: // Not Found
        return Promise.reject(
          new Error('El recurso solicitado no existe.')
        );
        
      case 422: // Validation Error
      case 400: // Bad Request
        return Promise.reject(error);
        
      case 500: // Server Error
      case 502: // Bad Gateway
      case 503: // Service Unavailable
        return Promise.reject(
          new Error('Ha ocurrido un error en el servidor. Por favor, inténtalo más tarde.')
        );
        
      default:
        return Promise.reject(error);
    }
  }
);

// API Object con métodos simplificados
const api = {
  // Métodos HTTP básicos
  get: (url, config = {}) => axiosInstance.get(url, config),
  post: (url, data = {}, config = {}) => axiosInstance.post(url, data, config),
  put: (url, data = {}, config = {}) => axiosInstance.put(url, data, config),
  patch: (url, data = {}, config = {}) => axiosInstance.patch(url, data, config),
  delete: (url, config = {}) => axiosInstance.delete(url, config),
  
  // Métodos especializados
  upload: (url, formData, onUploadProgress = null, config = {}) => {
    const defaultConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    
    if (onUploadProgress) {
      defaultConfig.onUploadProgress = onUploadProgress;
    }
    
    return axiosInstance.post(url, formData, { ...defaultConfig, ...config });
  },
  
  download: (url, filename, config = {}) => {
    return axiosInstance.get(url, { 
      ...config, 
      responseType: 'blob' 
    }).then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  },
  
  setHeaders: (headers = {}) => {
    Object.keys(headers).forEach(key => {
      axiosInstance.defaults.headers.common[key] = headers[key];
    });
  },
  
  // Verificar estado de autenticación
  checkAuthStatus: async () => {
    try {
      const response = await axios.post(`${BASE_URL}${TOKEN_VERIFY_URL}`, {}, {
        withCredentials: true
      });
      
      if (response.status === 200) {
        tokenState.hasAccessToken = true;
        tokenState.hasRefreshToken = true;
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Verificación de token fallida:', error);
      return false;
    }
  },
  
  // Refrescar tokens manualmente
  refreshTokens: async () => {
    try {
      const response = await refreshToken();
      if (response.status === 200) {
        tokenState.hasAccessToken = true;
        tokenState.hasRefreshToken = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al refrescar tokens manualmente:', error);
      return false;
    }
  },
  
  // Acceso directo y funciones de autenticación
  instance: axiosInstance,
  getTokens,
  saveTokens,
  clearTokens,
  logout: async () => {
    try {
      // Intentar hacer logout en el servidor primero
      await axios.post(`${BASE_URL}${TOKEN_LOGOUT_URL}`, {}, { 
        withCredentials: true 
      });
    } catch (error) {
      console.warn('Error en logout del servidor:', error);
    } finally {
      // Limpiar estado local y redirigir
      tokenState.hasAccessToken = false;
      tokenState.hasRefreshToken = false;
      window.location.href = LOGOUT_PATH;
    }
  }
};

export default api;