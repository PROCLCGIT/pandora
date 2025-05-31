// /Users/clc/Ws/Appclc/pandora/src/config/auth.js

/**
 * Configuración de autenticación y gestión de sesiones
 */

export const AUTH_CONFIG = {
  // Intervalos de tiempo (en milisegundos)
  TOKEN_REFRESH_INTERVAL: 5 * 60 * 1000,     // 5 minutos - Intervalo para verificar y refrescar tokens
  SESSION_WARNING_TIME: 2 * 60 * 1000,       // 2 minutos - Mostrar advertencia antes de expiración
  AUTO_LOGOUT_TIME: 60 * 60 * 1000,          // 60 minutos - Logout automático por inactividad
  
  // Configuración de tokens
  TOKEN_EXPIRY_BUFFER: 2 * 60 * 1000,        // 2 minutos - Buffer antes de que expire el token
  MAX_REFRESH_RETRIES: 3,                    // Máximo número de reintentos de refresh
  
  // Rutas y endpoints
  LOGIN_ROUTE: '/login',
  DASHBOARD_ROUTE: '/dashboard',
  LOGOUT_ENDPOINT: '/auth/logout/',
  REFRESH_ENDPOINT: '/auth/refresh/',
  VERIFY_ENDPOINT: '/auth/verify/',
  
  // Configuración de localStorage/sessionStorage
  STORAGE_KEYS: {
    USER_PREFERENCES: 'user_preferences',
    LAST_ACTIVITY: 'last_activity',
    SESSION_WARNINGS: 'session_warnings_shown',
    AUTO_SAVE_DRAFT: 'auto_save_draft'
  },
  
  // Configuración de comportamiento
  SHOW_SESSION_WARNINGS: true,               // Mostrar advertencias de sesión
  AUTO_SAVE_FORMS: true,                     // Auto-guardar formularios en borradores
  REMEMBER_LAST_PAGE: true,                  // Recordar última página visitada
  
  // Eventos de actividad del usuario que resetean el timer de inactividad
  ACTIVITY_EVENTS: [
    'mousedown',
    'mousemove', 
    'keypress',
    'scroll',
    'touchstart',
    'click'
  ],
  
  // Páginas que no requieren autenticación
  PUBLIC_ROUTES: [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/',
    '/public'
  ],
  
  // Configuración de notificaciones de sesión
  SESSION_NOTIFICATIONS: {
    WARNING: {
      title: 'Sesión por expirar',
      message: 'Tu sesión expirará en {minutes} minutos. ¿Deseas continuar?',
      type: 'warning',
      duration: 0, // No auto-dismiss
      actions: ['Continuar', 'Cerrar sesión']
    },
    EXPIRED: {
      title: 'Sesión expirada',
      message: 'Tu sesión ha expirado. Serás redirigido al login.',
      type: 'error',
      duration: 5000
    },
    REFRESHED: {
      title: 'Sesión renovada',
      message: 'Tu sesión ha sido renovada automáticamente.',
      type: 'success',
      duration: 3000
    }
  },
  
  // Configuración de desarrollo/debug
  DEBUG_MODE: import.meta.env.DEV || false,
  LOG_AUTH_EVENTS: import.meta.env.DEV || false,
  
  // Configuración de la UI
  UI_CONFIG: {
    SHOW_SESSION_TIMER: false,                // Mostrar timer de sesión en UI
    SHOW_ACTIVITY_INDICATOR: true,           // Mostrar indicador de actividad
    SESSION_WARNING_MODAL: true,             // Usar modal para advertencias
    LOGOUT_CONFIRMATION: true                // Confirmar logout manual
  }
};

/**
 * Configuración específica por ambiente
 */
const ENVIRONMENT_CONFIGS = {
  development: {
    TOKEN_REFRESH_INTERVAL: 2 * 60 * 1000,   // 2 minutos en desarrollo
    SESSION_WARNING_TIME: 30 * 1000,         // 30 segundos en desarrollo
    AUTO_LOGOUT_TIME: 10 * 60 * 1000,        // 10 minutos en desarrollo
    LOG_AUTH_EVENTS: true,
    DEBUG_MODE: true
  },
  
  production: {
    TOKEN_REFRESH_INTERVAL: 5 * 60 * 1000,   // 5 minutos en producción
    SESSION_WARNING_TIME: 2 * 60 * 1000,     // 2 minutos en producción  
    AUTO_LOGOUT_TIME: 30 * 60 * 1000,        // 30 minutos en producción
    LOG_AUTH_EVENTS: false,
    DEBUG_MODE: false
  },
  
  testing: {
    TOKEN_REFRESH_INTERVAL: 10 * 1000,       // 10 segundos en testing
    SESSION_WARNING_TIME: 5 * 1000,          // 5 segundos en testing
    AUTO_LOGOUT_TIME: 30 * 1000,             // 30 segundos en testing
    LOG_AUTH_EVENTS: true,
    DEBUG_MODE: true
  }
};

/**
 * Obtener configuración según el ambiente actual
 */
export const getAuthConfig = () => {
  const environment = import.meta.env.MODE || 'development';
  const envConfig = ENVIRONMENT_CONFIGS[environment] || ENVIRONMENT_CONFIGS.development;
  
  return {
    ...AUTH_CONFIG,
    ...envConfig
  };
};

/**
 * Utilidades para manejo de tiempo
 */
export const TIME_UTILS = {
  /**
   * Convertir milisegundos a formato legible
   */
  msToReadable: (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  },
  
  /**
   * Obtener tiempo hasta expiración
   */
  getTimeUntilExpiry: (expiryTime) => {
    const now = Date.now();
    const timeLeft = expiryTime - now;
    return Math.max(0, timeLeft);
  },
  
  /**
   * Verificar si el tiempo está dentro del buffer de expiración
   */
  isNearExpiry: (expiryTime, buffer = AUTH_CONFIG.TOKEN_EXPIRY_BUFFER) => {
    const timeLeft = TIME_UTILS.getTimeUntilExpiry(expiryTime);
    return timeLeft <= buffer;
  },
  
  /**
   * Formatear timestamp para logs
   */
  formatTimestamp: (timestamp = Date.now()) => {
    return new Date(timestamp).toISOString();
  }
};

/**
 * Configuración de eventos de logging
 */
export const AUTH_EVENTS = {
  LOGIN_SUCCESS: 'auth:login:success',
  LOGIN_FAILURE: 'auth:login:failure',
  LOGOUT: 'auth:logout',
  TOKEN_REFRESH: 'auth:token:refresh',
  TOKEN_EXPIRED: 'auth:token:expired',
  SESSION_WARNING: 'auth:session:warning',
  SESSION_EXPIRED: 'auth:session:expired',
  ACTIVITY_DETECTED: 'auth:activity:detected',
  INACTIVITY_TIMEOUT: 'auth:inactivity:timeout'
};

/**
 * Logging helper para eventos de autenticación
 */
export const authLogger = {
  log: (event, data = {}) => {
    if (!getAuthConfig().LOG_AUTH_EVENTS) return;
    
    console.log(`[AUTH] ${TIME_UTILS.formatTimestamp()} - ${event}`, data);
  },
  
  warn: (event, data = {}) => {
    if (!getAuthConfig().LOG_AUTH_EVENTS) return;
    
    console.warn(`[AUTH] ${TIME_UTILS.formatTimestamp()} - ${event}`, data);
  },
  
  error: (event, error = {}) => {
    console.error(`[AUTH] ${TIME_UTILS.formatTimestamp()} - ${event}`, error);
  }
};

export default getAuthConfig();