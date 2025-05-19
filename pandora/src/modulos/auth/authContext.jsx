import React, { createContext, useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import { verifyAuth, login as apiLogin, logout as apiLogout, refreshToken } from '../../utils/auth'
import { isBackendAvailable } from '../../utils/checkBackend'
import { profileService } from './api/profileService'

// Crear contexto
export const AuthContext = createContext()

// Cache de autenticación en localStorage
const AUTH_CACHE_KEY = 'authCache'
const AUTH_CACHE_TTL = 15 * 60 * 1000 // 15 minutos para evitar verificaciones frecuentes

// Log de depuración mejorado
const logAuth = (message, ...args) => {
  console.log(`🔐 Auth: ${message}`, ...args);
}

// Módulo de caché de autenticación - separado para mejor organización
const AuthCache = {
  // Guardar datos en caché
  save: (data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      }
      localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(cacheData))
      logAuth('Guardado en caché:', data);
    } catch (e) {
      console.warn('Error guardando caché de autenticación:', e)
    }
  },
  
  // Obtener datos de caché
  get: () => {
    try {
      const cacheData = JSON.parse(localStorage.getItem(AUTH_CACHE_KEY) || 'null')
      if (!cacheData) return null
      
      // Verificar expiración
      const isExpired = Date.now() - cacheData.timestamp > AUTH_CACHE_TTL
      if (isExpired) {
        logAuth('Caché expirado');
        return null;
      }
      
      logAuth('Usando caché válido:', cacheData.data);
      return cacheData.data
    } catch (e) {
      console.warn('Error leyendo caché de autenticación:', e)
      return null
    }
  },
  
  // Limpiar caché
  clear: () => {
    try {
      localStorage.removeItem(AUTH_CACHE_KEY)
      logAuth('Caché de autenticación eliminado');
    } catch (e) {
      console.warn('Error eliminando caché de autenticación:', e)
    }
  },
  
  // Verificar si hay una sesión en caché
  hasValidSession: () => {
    const cachedAuth = AuthCache.get()
    return cachedAuth && cachedAuth.isValid === true
  }
}

// Módulo para verificación de backend - separado para mejor organización
const BackendService = {
  MIN_CHECK_INTERVAL: 2 * 60 * 1000, // 2 minutos entre verificaciones
  lastCheckTime: 0,
  
  // Comprobar disponibilidad del backend con rate limiting
  checkAvailability: async (force = false) => {
    try {
      // Limitar verificaciones frecuentes si no se fuerza
      const now = Date.now()
      const timeSinceLastCheck = now - BackendService.lastCheckTime
      
      if (!force && timeSinceLastCheck < BackendService.MIN_CHECK_INTERVAL) {
        logAuth(`Verificación de backend throttled (última hace ${Math.round(timeSinceLastCheck/1000)}s)`);
        return null // Null indica que no se verificó por throttling
      }
      
      BackendService.lastCheckTime = now
      
      const status = await isBackendAvailable()
      logAuth('Estado del backend:', status.available ? 'Disponible ✅' : 'No disponible ❌', status);
      
      return status.available
    } catch (err) {
      console.error('Error al verificar disponibilidad del backend:', err)
      return false
    }
  }
}

// Proveedor de autenticación con carga lazy de componentes pesados
export function AuthProvider({ children }) {
  // Estado principal de autenticación
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [backendAvailable, setBackendAvailable] = useState(true)
  
  // Referencias para control de operaciones
  const checkInProgressRef = useRef(false)
  const lastCheckTimeRef = useRef(0)
  const checkTimeoutRef = useRef(null)
  const checkIntervalRef = useRef(null)
  
  // Función para verificar disponibilidad del backend
  const checkBackendStatus = useCallback(async (force = false) => {
    const available = await BackendService.checkAvailability(force)
    
    // Si es null, significa que no se verificó por throttling
    if (available === null) return backendAvailable
    
    // Actualizar estado
    setBackendAvailable(available)
    if (!available) {
      setError('No se pudo conectar al servidor. Por favor, intente más tarde.')
      return false
    }
    return true
  }, [backendAvailable])

  // Función para verificar estado de autenticación con mejor gestión de concurrencia
  const checkAuthStatus = useCallback(async (force = false) => {
    // Evitar verificaciones simultáneas
    if (checkInProgressRef.current && !force) {
      logAuth('Verificación de autenticación ya en progreso, omitiendo');
      return
    }
    
    // Verificar throttling
    const now = Date.now()
    const timeSinceLastCheck = now - lastCheckTimeRef.current
    
    if (!force && timeSinceLastCheck < BackendService.MIN_CHECK_INTERVAL) {
      logAuth(`Verificación de autenticación throttled (última hace ${Math.round(timeSinceLastCheck/1000)}s)`);
      return
    }
    
    // Marcar como en progreso
    checkInProgressRef.current = true
    setIsLoading(true)
    setError(null)
    
    try {
      // Verificar backend primero
      const backendOk = await checkBackendStatus(force)
      if (!backendOk) {
        logAuth('Backend no disponible, usando caché local');
        
        // Intentar usar caché
        const cachedAuth = AuthCache.get()
        if (cachedAuth) {
          logAuth('Usando caché de autenticación válido');
          setIsAuthenticated(cachedAuth.isValid)
          if (cachedAuth.userId) {
            setUser({ id: cachedAuth.userId })
          }
        } else {
          // Sin backend y sin caché, considerar no autenticado
          setIsAuthenticated(false)
          setUser(null)
        }
        
        return // Salir sin intentar verificar con el servidor
      }
      
      // Backend disponible, verificar autenticación
      logAuth('Verificando autenticación con el servidor...');
      try {
        const authStatus = await verifyAuth(force)
        logAuth('Resultado de verificación:', authStatus);
      
        // Actualizar estado
        setIsAuthenticated(authStatus.isValid)
        
        if (authStatus.isValid && authStatus.userId) {
          // Si hay userId, actualizar usuario
          setUser({
            id: authStatus.userId,
          })
          
          // Guardar en caché para futuro uso offline
          AuthCache.save({
            isValid: true,
            userId: authStatus.userId,
            expiresIn: authStatus.expiresIn
          })
        } else {
          setUser(null)
          AuthCache.clear() // Limpiar caché si no válido
          
          // Mensaje de error claro
          setError('La sesión no es válida. Intente iniciar sesión nuevamente.')
        }
      } catch (verifyError) {
        console.error('Error específico de verificación:', verifyError);
        throw verifyError; // Propagamos para el catch principal
      }
    } catch (err) {
      console.error('Error al verificar estado de autenticación:', err)
      
      // En caso de error, intentar usar caché si existe
      const cachedAuth = AuthCache.get()
      if (cachedAuth) {
        logAuth('Error de verificación, usando caché disponible');
        setIsAuthenticated(cachedAuth.isValid)
        if (cachedAuth.userId) {
          setUser({ id: cachedAuth.userId })
        }
      } else {
        setError('No se pudo verificar su estado de autenticación')
        setUser(null)
        setIsAuthenticated(false)
      }
    } finally {
      setIsLoading(false)
      checkInProgressRef.current = false
      lastCheckTimeRef.current = Date.now()
    }
  }, [checkBackendStatus])
  
  // Iniciar sesión optimizado
  const login = async (username, password) => {
    // Evitar inicios de sesión simultáneos
    if (checkInProgressRef.current) {
      logAuth('Operación de autenticación en progreso, abortando login');
      return false
    }
    
    checkInProgressRef.current = true
    setIsLoading(true)
    setError(null)
    
    try {
      // Verificar backend antes de intentar login
      const backendOk = await checkBackendStatus(true)
      if (!backendOk) {
        setError('No hay conexión con el servidor. Por favor, intente más tarde.')
        return { success: false, error: 'Sin conexión al servidor' }
      }
      
      logAuth('Intentando login con el servidor...');
      const response = await apiLogin(username, password)
      logAuth('Respuesta de login:', response);
      
      if (response.success) {
        setIsAuthenticated(true)
        
        // Si hay userId, intentar obtener datos de usuario
        if (response.user_id) {
          setUser({
            id: response.user_id,
          })
          
          // Guardar en caché inmediatamente
          AuthCache.save({
            isValid: true,
            userId: response.user_id,
            expiresIn: 15 // 15 minutos
          })
        }
        
        return { success: true }
      } else {
        setError(response.detail || 'Error al iniciar sesión')
        setIsAuthenticated(false)
        setUser(null)
        return { success: false, detail: response.detail }
      }
    } catch (err) {
      let errorMsg = err.response?.data?.detail || err.message || 'Error al iniciar sesión'
      
      // Mejorar mensaje de error para credenciales inválidas
      if (errorMsg.includes("No active account") || err.response?.status === 401) {
        errorMsg = "Credenciales inválidas. Es posible que necesite crear primero un usuario en la base de datos.";
      }
      
      console.error('Error al iniciar sesión:', errorMsg)
      setError(errorMsg)
      setIsAuthenticated(false)
      setUser(null)
      return { success: false, error: errorMsg }
    } finally {
      setIsLoading(false)
      checkInProgressRef.current = false
    }
  }
  
  // Cerrar sesión con limpieza de caché
  const logout = async () => {
    setIsLoading(true)
    
    try {
      // Limpiar caché primero
      AuthCache.clear()
      
      // Intentar logout en el backend
      const backendOk = await checkBackendStatus(false)
      if (backendOk) {
        await apiLogout()
      }
      
      // Limpiar estado local
      setUser(null)
      setIsAuthenticated(false)
      
      return true
    } catch (err) {
      console.error('Error al cerrar sesión:', err)
      // Incluso si hay error, cerramos la sesión localmente
      setUser(null)
      setIsAuthenticated(false)
      return false
    } finally {
      setIsLoading(false)
    }
  }
  
  // Cargar estado inicial desde caché al montar el componente - con carga rápida
  useEffect(() => {
    const initAuth = () => {
      // CAMBIO CRÍTICO: Deshabilitar la carga inmediatamente para mostrar login
      setIsLoading(false);
      
      // Verificar si hay una sesión en caché válida en segundo plano
      if (AuthCache.hasValidSession()) {
        logAuth('Inicializando con estado de autenticación en caché');
        const cachedAuth = AuthCache.get();
        setIsAuthenticated(true);
        if (cachedAuth.userId) {
          setUser({ id: cachedAuth.userId });
        }
      } else {
        logAuth('No hay caché de autenticación válido');
        // Aseguramos estado no autenticado explícitamente
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    // Ejecutar inicialización inmediatamente
    initAuth();
  }, []);

  // Verificar autenticación con backend con retraso adaptativo
  useEffect(() => {
    // Limpiar timeouts previos
    if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    
    // Si ya estaba autenticado por caché, esperar más para verificar
    // Si no, verificar más pronto
    const initialDelay = isAuthenticated ? 60000 : 15000; // Aumentamos delay inicial a 1 minuto si está autenticado
    
    logAuth(`Programando verificación inicial de autenticación en ${initialDelay/1000}s`);
    checkTimeoutRef.current = setTimeout(() => {
      // Solo verificar si estamos autenticados
      if (isAuthenticated) {
        checkAuthStatus();
        
        // Configurar verificación periódica (10 minutos)
        checkIntervalRef.current = setInterval(() => {
          if (isAuthenticated) {
            checkAuthStatus();
          }
        }, 10 * 60 * 1000); // Aumentamos a 10 minutos para reducir verificaciones
      }
    }, initialDelay);
    
    // Limpieza al desmontar
    return () => {
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [checkAuthStatus, isAuthenticated]);
  
  // Función para actualizar datos del usuario
  const updateUserProfile = useCallback(async () => {
    if (!isAuthenticated || !backendAvailable) return;
    
    try {
      setIsLoading(true);
      const profileData = await profileService.getProfile();
      
      // Procesar la ruta de la imagen si es necesario
      let profileImage = profileData.profile_image;
      
      // Si no es una URL absoluta y no empieza por /, añadir / al principio
      if (profileImage && !profileImage.startsWith('http') && !profileImage.startsWith('/')) {
        profileImage = '/' + profileImage;
      }
      
      // Actualizar usuario con datos formateados correctamente
      setUser(prev => ({
        ...prev,
        id: profileData.id,
        username: profileData.username,
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        email: profileData.email,
        phone: profileData.phone,
        position: profileData.position,
        department: profileData.department,
        profileImage: profileImage, // URL normalizada
        dateJoined: profileData.date_joined,
        lastLogin: profileData.last_login,
        roles: profileData.roles || profileData.groups || [] // Añadir soporte para roles/grupos
      }));
      
      return true;
    } catch (error) {
      console.error('Error al cargar perfil de usuario:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, backendAvailable]);
  
  // Cargar perfil cuando se autentica el usuario
  useEffect(() => {
    if (isAuthenticated && user?.id && !user?.firstName) {
      updateUserProfile();
    }
  }, [isAuthenticated, user?.id, user?.firstName, updateUserProfile]);

  // Exponer el contexto con datos y funciones necesarias
  const value = {
    isLoading,
    user,
    setUser,
    error,
    isAuthenticated,
    backendAvailable,
    login,
    logout,
    checkAuthStatus,
    checkSession: checkAuthStatus, // Alias para compatibilidad con ProtectedRoute
    refresh: refreshToken, // Función de refresco de token
    hasRole: (requiredRole) => {
      // Implementación simple de verificación de roles
      if (!user || !user.roles) return false;
      if (Array.isArray(requiredRole)) {
        return requiredRole.some(role => user.roles.includes(role));
      }
      return user.roles.includes(requiredRole);
    },
    updateUserProfile
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto - sin cambios
export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}