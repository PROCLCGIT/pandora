// Ejemplo de configuración de Axios para incluir tokens de autenticación

import axios from 'axios';

// Crear una instancia de Axios con la URL base
const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Función para iniciar sesión
export const login = async (username, password) => {
  try {
    const response = await axios.post('http://localhost:8000/api/token/', {
      username,
      password
    });
    
    // Guardar tokens en localStorage
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    
    // Configurar interceptor para incluir el token en las peticiones
    setAuthHeader(response.data.access);
    
    return response.data;
  } catch (error) {
    console.error('Error de autenticación:', error);
    throw error;
  }
};

// Configurar interceptor para añadir el token a todas las peticiones
export const setAuthHeader = (token) => {
  api.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

// Interceptor para refrescar el token cuando expire
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si el error es 401 (Unauthorized) y no hemos intentado refrescar el token antes
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          // Redirigir al login si no hay refresh token
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        // Intentar refrescar el token
        const response = await axios.post('http://localhost:8000/api/token/refresh/', {
          refresh: refreshToken
        });
        
        const { access } = response.data;
        
        // Guardar el nuevo token y actualizar el header
        localStorage.setItem('access_token', access);
        setAuthHeader(access);
        
        // Reintentar la petición original con el nuevo token
        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Si no se puede refrescar el token, redirigir al login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Ejemplo de uso para el servicio de categorías
export const categoriaService = {
  getAll: async (page = 1, pageSize = 10, search = '') => {
    try {
      const response = await api.get(`basic/categorias/?search=${search}&page=${page}&page_size=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`basic/categorias/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener categoría ${id}:`, error);
      throw error;
    }
  },
  
  getRaices: async () => {
    try {
      const response = await api.get('basic/categorias/raices/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener categorías raíz:', error);
      throw error;
    }
  },
  
  getHijos: async (id) => {
    try {
      const response = await api.get(`basic/categorias/${id}/hijos/`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener hijos de categoría ${id}:`, error);
      throw error;
    }
  },
  
  create: async (categoria) => {
    try {
      const response = await api.post('basic/categorias/', categoria);
      return response.data;
    } catch (error) {
      console.error('Error al crear categoría:', error);
      throw error;
    }
  },
  
  update: async (id, categoria) => {
    try {
      const response = await api.put(`basic/categorias/${id}/`, categoria);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar categoría ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      await api.delete(`basic/categorias/${id}/`);
      return true;
    } catch (error) {
      console.error(`Error al eliminar categoría ${id}:`, error);
      throw error;
    }
  }
};

// Inicializar el token de autenticación desde localStorage al cargar la aplicación
const token = localStorage.getItem('access_token');
if (token) {
  setAuthHeader(token);
}

export default api;