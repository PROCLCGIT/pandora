// /Users/clc/Ws/Appclc/pandora/src/config/axios.js

import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Constantes para configuración global
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const TOKEN_REFRESH_URL = '/token/refresh/';
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
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Funciones para gestión de tokens
const getTokens = () => {
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken')
  };
};

const saveTokens = (access, refresh = null) => {
  localStorage.setItem('accessToken', access);
  if (refresh) {
    localStorage.setItem('refreshToken', refresh);
  }
};

const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime + 60; // 60 segundos de margen
  } catch (error) {
    return true;
  }
};

// Interceptor para añadir token a las solicitudes
axiosInstance.interceptors.request.use(
  async (config) => {
    // Aseguramos que config.headers existe
    config.headers = config.headers || {};
    
    // No añadir token para la ruta de refresco de token
    if (config.url === TOKEN_REFRESH_URL) {
      return config;
    }
    
    let { accessToken, refreshToken } = getTokens();
    
    // DEBUG: Log para todas las peticiones
    console.debug(`🔄 Request to ${config.url} - Token: ${accessToken ? 'Present' : 'Missing'}`);
    
    // Usar el token real que se obtuvo durante la autenticación
    if (!accessToken) {
      console.warn('⚠️ No hay token disponible para la solicitud. Intentando login automático...');
      // Aquí podríamos dirigir al usuario al login, pero no interrumpimos el flujo
    }
    
    // Aplicar token a la solicitud - formato exacto esperado por Django DRF
    if (accessToken) {
      config.headers['Authorization'] = 'Bearer ' + accessToken;
    }
    
    // Debug log para verificar
    console.debug(`🔒 Authorization header: ${config.headers['Authorization']}`);
    
    /* Comentado para modo desarrollo - descomentar en producción
    // Verificar si el token está expirado y necesita ser refrescado
    if (isTokenExpired(accessToken) && refreshToken) {
      if (isRefreshing) {
        try {
          const newToken = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          config.headers.Authorization = `Bearer ${newToken}`;
          return config;
        } catch (error) {
          return Promise.reject(error);
        }
      }
      
      isRefreshing = true;
      
      try {
        const response = await axios.post(`${BASE_URL}${TOKEN_REFRESH_URL}`, {
          refresh: refreshToken
        });
        
        const { access } = response.data;
        saveTokens(access);
        
        processQueue(null, access);
        
        config.headers.Authorization = `Bearer ${access}`;
      } catch (error) {
        processQueue(error, null);
        clearTokens();
        window.location.href = LOGOUT_PATH;
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    } else if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    */
    
    return config;
  },
  (error) => Promise.reject(error)
);

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
    
    switch (status) {
      case 401: // Unauthorized
        if (originalRequest.url === TOKEN_REFRESH_URL) {
          clearTokens();
          window.location.href = LOGOUT_PATH;
          return Promise.reject(error);
        }
        
        if (originalRequest._retry) {
          return Promise.reject(error);
        }
        
        if (isRefreshing) {
          try {
            const newToken = await new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            });
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }
        
        originalRequest._retry = true;
        return axiosInstance(originalRequest);
        
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
  
  // Acceso directo y funciones de autenticación
  instance: axiosInstance,
  getTokens,
  saveTokens,
  clearTokens,
  logout: () => {
    clearTokens();
    window.location.href = LOGOUT_PATH;
  }
};

export default api;