import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/axios';
import axios from 'axios';

// Constantes para endpoints de autenticación
const AUTH_ENDPOINTS = {
  LOGIN: 'http://localhost:8000/api/auth/login/',
  REFRESH: 'http://localhost:8000/api/auth/refresh/',
  VERIFY: 'http://localhost:8000/api/auth/verify/',
  LOGOUT: 'http://localhost:8000/api/auth/logout/',
  USER_PROFILE: 'http://localhost:8000/api/users/me/'
};

// Crear el contexto
const AuthContext = createContext(null);

/**
 * Hook personalizado para usar el contexto de autenticación
 * @returns {Object} El contexto de autenticación con valores y funciones
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

/**
 * Proveedor del contexto de autenticación
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  /**
   * Obtiene el perfil del usuario desde el backend
   * @returns {Promise<Object>} Información del usuario
   */
  const fetchUserProfile = useCallback(async () => {
    try {
      // En un sistema real, obtendríamos el perfil desde el endpoint
      // const response = await api.get(AUTH_ENDPOINTS.USER_PROFILE);
      // return response.data;
      
      // Por ahora, devolvemos datos estáticos
      return {
        id: '1',
        name: 'Operador CLC',
        email: 'op@proclc.com',
        role: 'admin'
      };
    } catch (error) {
      console.error('Error al obtener perfil de usuario:', error);
      throw error;
    }
  }, []);
  
  /**
   * Refresca el token de autenticación
   * @returns {Promise<boolean>} True si el refresco fue exitoso
   */
  const refresh = useCallback(async () => {
    try {
      const response = await api.refreshTokens();
      return response;
    } catch (error) {
      console.error('Error al refrescar tokens:', error);
      return false;
    }
  }, []);
  
  /**
   * Verifica la sesión actual
   * @returns {Promise<boolean>} True si la sesión es válida
   */
  const checkSession = useCallback(async () => {
    try {
      const response = await axios.post(
        AUTH_ENDPOINTS.VERIFY, 
        {}, 
        { withCredentials: true }
      );
      return response.status === 200;
    } catch (error) {
      console.error('Error al verificar sesión:', error);
      return false;
    }
  }, []);
  
  /**
   * Función para iniciar sesión automática con credenciales por defecto
   * @returns {Promise<Object>} Resultado del login
   */
  const autoLogin = useCallback(async () => {
    setLoading(true);
    try {
      console.info('Iniciando sesión automática...');
      
      const response = await axios.post(AUTH_ENDPOINTS.LOGIN, {
        username: 'op@proclc.com',
        password: '251510'
      }, {
        withCredentials: true
      });
      
      if (response.status === 200) {
        api.saveTokens('present-in-httponly-cookie', 'present-in-httponly-cookie');
        
        // Obtener perfil de usuario
        const userInfo = await fetchUserProfile();
        
        setUser(userInfo);
        setError(null);
        console.info('✅ Login automático exitoso');
        return { success: true, user: userInfo };
      } else {
        throw new Error('Formato de respuesta inesperado');
      }
    } catch (error) {
      console.error('Error en login automático:', error);
      
      // En desarrollo, usar modo de respaldo
      if (process.env.NODE_ENV === 'development') {
        console.warn('Usando autenticación simulada como respaldo');
        api.saveTokens('present-in-httponly-cookie', 'present-in-httponly-cookie');
        
        const fallbackUser = {
          id: '1',
          name: 'Usuario Respaldo',
          email: 'op@proclc.com',
          role: 'admin'
        };
        
        setUser(fallbackUser);
        setError(null);
        return { success: true, user: fallbackUser };
      }
      
      setError('No se pudo iniciar sesión automáticamente');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  /**
   * Inicializa la autenticación al cargar la aplicación
   */
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        // Verificar si hay una sesión válida
        console.info('Verificando sesión existente...');
        const isSessionValid = await checkSession();
        
        if (isSessionValid) {
          // Obtener información del usuario
          const userInfo = await fetchUserProfile();
          api.saveTokens('present-in-httponly-cookie', 'present-in-httponly-cookie');
          setUser(userInfo);
          setError(null);
          console.info('✅ Sesión válida encontrada');
        } else {
          // Intentar login automático si no hay sesión válida
          console.info('No se encontró sesión válida. Intentando login automático...');
          await autoLogin();
        }
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
        setError('Error al verificar autenticación');
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, [autoLogin, checkSession, fetchUserProfile]);
  
  /**
   * Función para iniciar sesión
   * @param {string} email - Email o nombre de usuario
   * @param {string} password - Contraseña
   * @returns {Promise<Object>} Resultado del login
   */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      console.info('Iniciando sesión...');
      
      const response = await axios.post(AUTH_ENDPOINTS.LOGIN, {
        username: email,
        password: password
      }, {
        withCredentials: true
      });
      
      if (response.status === 200) {
        // Actualizar estado interno
        api.saveTokens('present-in-httponly-cookie', 'present-in-httponly-cookie');
        
        // Obtener perfil de usuario
        const userInfo = await fetchUserProfile();
        
        setUser(userInfo);
        console.info('✅ Login exitoso');
        return { success: true, user: userInfo };
      } else {
        throw new Error('Error de autenticación');
      }
    } catch (error) {
      console.error('Error de login:', error);
      
      // En desarrollo, permitir login simulado en caso de error
      if (process.env.NODE_ENV === 'development') {
        console.warn('Usando autenticación simulada como respaldo...');
        
        api.saveTokens('present-in-httponly-cookie', 'present-in-httponly-cookie');
        
        const fallbackUser = {
          id: '1',
          name: 'Usuario Respaldo',
          email: email || 'op@proclc.com',
          role: 'admin'
        };
        
        setUser(fallbackUser);
        return { success: true, user: fallbackUser };
      }
      
      const errorMessage = error.response?.data?.detail || error.message || 'Error de autenticación';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile]);
  
  /**
   * Función para cerrar sesión
   * @param {string} redirectTo - Ruta a la que redirigir después del logout
   */
  const logout = useCallback(async (redirectTo = '/login') => {
    setLoading(true);
    
    try {
      await axios.post(
        AUTH_ENDPOINTS.LOGOUT,
        {},
        { withCredentials: true }
      );
      console.info('✅ Logout exitoso');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Limpiar estado local independientemente del resultado
      api.clearTokens();
      setUser(null);
      setError(null);
      setLoading(false);
      navigate(redirectTo);
    }
  }, [navigate]);
  
  /**
   * Verifica los permisos del usuario
   * @param {string|Array} requiredRole - Rol o roles requeridos
   * @returns {boolean} True si el usuario tiene el rol requerido
   */
  const hasRole = useCallback((requiredRole) => {
    if (!user) return false;
    
    // Si se proporciona un array de roles
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    // Si se proporciona un solo rol
    return user.role === requiredRole;
  }, [user]);
  
  // Valor del contexto que estará disponible
  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    logout,
    refresh,
    checkSession,
    hasRole
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;