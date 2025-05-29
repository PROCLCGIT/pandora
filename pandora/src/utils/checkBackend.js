// /Users/clc/Ws/Appclc/pandora/src/utils/checkBackend.js

import axios from 'axios'

// Cache para evitar demasiadas verificaciones de conexión
let connectionCache = {
  lastChecked: null,
  connected: false,
  message: null,
  details: null,
  url: null
};

// CAMBIO CRÍTICO: Aumentar tiempo entre verificaciones a 20 minutos
const CONNECTION_CHECK_THROTTLE_MS = 20 * 60 * 1000; // 20 minutos

// Función de log mejorada
const logBackend = (message, ...args) => {
  console.log(`🔌 Backend: ${message}`, ...args);
};

/**
 * Verifica si el backend está disponible antes de intentar hacer cualquier solicitud
 * Útil para mostrar mensajes amigables al usuario cuando el backend no responde
 */
export async function isBackendAvailable() {
  // Determinar la URL del backend
  const hostname = window.location.hostname
  let backendUrl = ''
  
  // Verificar si tenemos una URL configurada manualmente en localStorage
  const manualBackendUrl = localStorage.getItem('manualBackendUrl');
  if (manualBackendUrl) {
    logBackend(`Usando URL de backend configurada manualmente: ${manualBackendUrl}`);
    
    try {
      // Verificar la URL manual primero
      const url = `${manualBackendUrl}/api/auth/debug/`;
      logBackend(`Verificando endpoint de debug en: ${url}`);
      
      const response = await axios.get(url, { 
        timeout: 5000, // Aumentar timeout para evitar falsos negativos
        withCredentials: true
      });
      
      if (response.status === 200 || response.status === 403) {
        backendUrl = manualBackendUrl;
        logBackend(`Backend confirmado en URL manual: ${backendUrl}`);
        return { 
          available: true, 
          url: backendUrl,
          source: 'manual'
        };
      }
    } catch (error) {
      if (error.response?.status === 403) {
        backendUrl = manualBackendUrl;
        logBackend(`Backend encontrado en URL manual: ${backendUrl} (requiere autenticación)`);
        return { 
          available: true, 
          url: backendUrl,
          source: 'manual' 
        };
      }
      
      logBackend(`Error con URL manual: ${error.message || 'Error desconocido'}`);
      // Si la URL manual falla, continuamos con la detección automática
    }
  }
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Desarrollo local: prueba primero puerto 8000, luego 3000, luego 8080
    const ports = [8000, 3000, 8080];
    
    logBackend(`Probando puertos locales: ${ports.join(', ')}`);
    
    for (const port of ports) {
      try {
        const url = `http://${hostname}:${port}/api/auth/debug/`;
        logBackend(`Verificando endpoint en: ${url}`);
        
        const response = await axios.get(url, { 
          timeout: 3000,
          withCredentials: true
        });
        
        if (response.status === 200) {
          backendUrl = `http://${hostname}:${port}`;
          logBackend(`Backend encontrado en ${backendUrl}`);
          return { available: true, url: backendUrl, source: 'auto', port };
        }
      } catch (error) {
        if (error.response?.status === 403) {
          // Si recibimos 403, significa que el servidor está activo pero el endpoint requiere autenticación
          backendUrl = `http://${hostname}:${port}`;
          logBackend(`Backend encontrado en ${backendUrl} (requiere autenticación)`);
          return { available: true, url: backendUrl, source: 'auto', port };
        }
        
        if (error.code === 'ECONNREFUSED') {
          logBackend(`Puerto ${port} cerrado, probando siguiente`);
        } else if (error.code === 'ECONNABORTED') {
          logBackend(`Timeout en puerto ${port}, probando siguiente`);
        } else {
          logBackend(`Error en puerto ${port}:`, error.message);
        }
        // Ignorar otros errores y continuar con el siguiente puerto
      }
    }
    
    // Si llegamos aquí, ningún puerto respondió correctamente
    logBackend('No se pudo conectar al backend en ninguno de los puertos locales:', ports);
    return { 
      available: false, 
      error: 'El servidor API no está disponible en modo local. Verifique que esté en ejecución en el puerto correcto.',
      ports
    };
  } else {
    // Producción: probar primero mismo dominio, luego subdominios comunes
    const possibleUrls = [
      window.location.origin, // Mismo dominio
      `${window.location.protocol}//api.${hostname}`, // Subdominio api
      `${window.location.protocol}//backend.${hostname}` // Subdominio backend
    ];
    
    logBackend(`Probando URLs en producción:`, possibleUrls);
    
    for (const baseUrl of possibleUrls) {
      try {
        const url = `${baseUrl}/api/auth/debug/`;
        logBackend(`Verificando endpoint en producción: ${url}`);
        
        const response = await axios.get(url, { 
          timeout: 5000,
          withCredentials: true
        });
        
        if (response.status === 200 || response.status === 403) {
          backendUrl = baseUrl;
          logBackend(`Backend encontrado en producción: ${backendUrl}`);
          return { available: true, url: backendUrl, source: 'auto' };
        }
      } catch (error) {
        if (error.response?.status === 403) {
          // Si recibimos 403, significa que el servidor está activo
          backendUrl = baseUrl;
          logBackend(`Backend encontrado en producción: ${baseUrl} (requiere autenticación)`);
          return { available: true, url: baseUrl, source: 'auto' };
        }
        
        logBackend(`Error al verificar ${baseUrl}:`, error.message || 'Error desconocido');
        // Continuar con la siguiente URL
      }
    }
    
    // Si llegamos aquí, ninguna URL respondió correctamente
    logBackend('No se pudo conectar al backend en ninguna de las URLs de producción');
    return { 
      available: false, 
      error: 'No se pudo conectar al servidor API. Verifique su conexión a internet o contacte soporte.' 
    };
  }
}

/**
 * Función para verificar la conexión al backend con manejo de caché
 * CAMBIO CRÍTICO: Solo verificar cuando es absolutamente necesario
 */
export async function checkConnectionStatus(force = false) {
  const now = Date.now();
  
  // Si tenemos un resultado en caché y no ha pasado el tiempo mínimo, usarlo
  if (!force && 
      connectionCache.lastChecked && 
      now - connectionCache.lastChecked < CONNECTION_CHECK_THROTTLE_MS) {
    logBackend('Connection check throttled (20min), using cached result:', connectionCache);
    return {
      connected: connectionCache.connected,
      message: connectionCache.message,
      details: connectionCache.details,
      url: connectionCache.url
    };
  }
  
  // Actualizar timestamp antes de la llamada para evitar solicitudes paralelas
  connectionCache.lastChecked = now;
  
  // Usar función isBackendAvailable para verificar disponibilidad
  try {
    const result = await isBackendAvailable();
    
    // Actualizar caché
    connectionCache = {
      lastChecked: now,
      connected: result.available,
      message: result.available 
        ? `Conexión establecida con el backend: ${result.url}` 
        : (result.error || 'No se pudo conectar con el servidor.'),
      details: result,
      url: result.url
    };
    
    // Si se encontró un backend, guardar la URL para uso futuro
    if (result.available && result.url) {
      // Solo guardar URLs detectadas automáticamente si no hay una manual
      if (result.source === 'manual' || !localStorage.getItem('manualBackendUrl')) {
        logBackend(`Guardando URL de backend válida: ${result.url}`);
        localStorage.setItem('lastValidBackendUrl', result.url);
      }
    }
    
    return { 
      connected: result.available, 
      message: connectionCache.message,
      details: result,
      url: result.url
    };
  } catch (error) {
    logBackend('Error en verificación de conexión:', error);
    
    // Actualizar caché con error
    connectionCache = {
      lastChecked: now,
      connected: false,
      message: `Error: ${error.message || 'Error desconocido'}`,
      details: { error },
      url: null
    };
    
    return {
      connected: false,
      message: connectionCache.message,
      details: { error },
      url: null
    };
  }
}

/**
 * Configurar una URL de backend manualmente
 * Útil para entornos donde la detección automática falla
 */
export function setManualBackendUrl(url) {
  if (!url) {
    localStorage.removeItem('manualBackendUrl');
    logBackend('URL manual de backend eliminada');
    return;
  }
  
  // Normalizar URL (eliminar /api/ y trailing slash)
  let normalizedUrl = url.trim();
  normalizedUrl = normalizedUrl.replace(/\/api\/?$/, '');
  normalizedUrl = normalizedUrl.replace(/\/$/, '');
  
  localStorage.setItem('manualBackendUrl', normalizedUrl);
  logBackend(`URL manual de backend configurada: ${normalizedUrl}`);
  
  // Invalidar caché
  connectionCache.lastChecked = null;
  
  return normalizedUrl;
}

/**
 * Obtener la URL actual del backend (desde caché o configuración manual)
 */
export function getCurrentBackendUrl() {
  // Prioridad 1: URL manual configurada
  const manualUrl = localStorage.getItem('manualBackendUrl');
  if (manualUrl) return manualUrl;
  
  // Prioridad 2: Última URL válida
  const lastValidUrl = localStorage.getItem('lastValidBackendUrl');
  if (lastValidUrl) return lastValidUrl;
  
  // Prioridad 3: URL de caché
  if (connectionCache.url) return connectionCache.url;
  
  // Prioridad 4: URL por defecto
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://${hostname}:8000`;
  } else {
    return window.location.origin;
  }
}

/**
 * Espera a que el backend esté disponible, reintentando cada cierto tiempo
 * @param {number} maxRetries - Número máximo de reintentos
 * @param {number} delayMs - Tiempo entre reintentos en milisegundos
 * @returns {Promise<Object>} - Resultado de la verificación
 */
export async function waitForBackend(maxRetries = 3, delayMs = 5000) {
  for (let i = 0; i < maxRetries; i++) {
    const result = await isBackendAvailable()
    
    if (result.available) {
      return result
    }
    
    logBackend(`Reintento ${i + 1}/${maxRetries} para conectar al backend en ${delayMs}ms...`)
    await new Promise(resolve => setTimeout(resolve, delayMs))
  }
  
  return { 
    available: false, 
    error: `No se pudo conectar al backend después de ${maxRetries} intentos.` 
  }
}

// CAMBIO CRÍTICO: Eliminar verificación automática al cargar
// Esta verificación puede causar recargas no deseadas
if (typeof window !== 'undefined') {
  logBackend('✅ Módulo checkBackend cargado - verificación manual habilitada');
  
  // Solo ejecutar verificación si es solicitada explícitamente
  // No más verificaciones automáticas al cargar la página
  logBackend('🔄 Verificación automática DESHABILITADA para evitar recargas');
}