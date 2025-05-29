// /pandora/src/modulos/brief/api/briefApi.js

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const BRIEF_API_URL = `${API_BASE_URL}/api/brief/api/v1`;

// Instancia de axios configurada para briefs
const briefApi = axios.create({
  baseURL: BRIEF_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para incluir token de autenticación
briefApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
briefApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado, redirigir al login
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Functions
export const briefApiService = {
  // **CRUD Operations**
  
  // Obtener lista de briefs con filtros y paginación
  getBriefs: async (params = {}) => {
    const response = await briefApi.get('/briefs/', { params });
    return response.data;
  },

  // Obtener brief por ID
  getBrief: async (id) => {
    const response = await briefApi.get(`/briefs/${id}/`);
    return response.data;
  },

  // Crear nuevo brief
  createBrief: async (briefData) => {
    const response = await briefApi.post('/briefs/', briefData);
    return response.data;
  },

  // Actualizar brief
  updateBrief: async (id, briefData) => {
    const response = await briefApi.put(`/briefs/${id}/`, briefData);
    return response.data;
  },

  // Actualización parcial de brief
  patchBrief: async (id, briefData) => {
    const response = await briefApi.patch(`/briefs/${id}/`, briefData);
    return response.data;
  },

  // Eliminar brief
  deleteBrief: async (id) => {
    const response = await briefApi.delete(`/briefs/${id}/`);
    return response.data;
  },

  // **Actions Específicas**

  // Duplicar brief
  duplicateBrief: async (id) => {
    const response = await briefApi.post(`/briefs/${id}/duplicate/`);
    return response.data;
  },

  // Cambiar estado del brief
  changeStatus: async (id, status, reason = '') => {
    const response = await briefApi.post(`/briefs/${id}/change_status/`, {
      status,
      reason
    });
    return response.data;
  },

  // Obtener historial del brief
  getBriefHistory: async (id) => {
    const response = await briefApi.get(`/briefs/${id}/history/`);
    return response.data;
  },

  // Exportar brief a otro módulo
  exportBrief: async (id, targetModule) => {
    const response = await briefApi.post(`/briefs/${id}/export_to_module/`, {
      module: targetModule
    });
    return response.data;
  },

  // **Data & Choices**

  // Obtener opciones para formularios (choices)
  getBriefChoices: async () => {
    const response = await briefApi.get('/briefs/choices/');
    return response.data;
  },

  // Obtener estadísticas del dashboard
  getDashboardStats: async () => {
    const response = await briefApi.get('/briefs/dashboard_stats/');
    return response.data;
  },

  // Obtener mis briefs
  getMyBriefs: async (params = {}) => {
    const response = await briefApi.get('/briefs/', { 
      params: { ...params, my_briefs: true } 
    });
    return response.data;
  },

  // Obtener briefs activos solamente
  getActiveBriefs: async (params = {}) => {
    const response = await briefApi.get('/briefs/', { 
      params: { ...params, active_only: true } 
    });
    return response.data;
  },

  // **Brief Items Operations**

  // Obtener items de un brief
  getBriefItems: async (briefId, params = {}) => {
    const response = await briefApi.get('/brief-items/', { 
      params: { ...params, brief: briefId } 
    });
    return response.data;
  },

  // Crear item de brief
  createBriefItem: async (itemData) => {
    const response = await briefApi.post('/brief-items/', itemData);
    return response.data;
  },

  // Actualizar item de brief
  updateBriefItem: async (itemId, itemData) => {
    const response = await briefApi.put(`/brief-items/${itemId}/`, itemData);
    return response.data;
  },

  // Eliminar item de brief
  deleteBriefItem: async (itemId) => {
    const response = await briefApi.delete(`/brief-items/${itemId}/`);
    return response.data;
  },

  // **Búsquedas y Filtros Avanzados**

  // Búsqueda avanzada de briefs
  searchBriefs: async (searchTerm, filters = {}) => {
    const params = {
      search: searchTerm,
      ...filters
    };
    const response = await briefApi.get('/briefs/', { params });
    return response.data;
  },

  // Obtener briefs vencidos
  getOverdueBriefs: async () => {
    const response = await briefApi.get('/briefs/', { 
      params: { vencidos: true } 
    });
    return response.data;
  },

  // Obtener briefs sin presupuesto
  getBriefsWithoutBudget: async () => {
    const response = await briefApi.get('/briefs/', { 
      params: { sin_presupuesto: true } 
    });
    return response.data;
  },

  // Obtener briefs prioritarios
  getPriorityBriefs: async () => {
    const response = await briefApi.get('/briefs/', { 
      params: { prioritarios: true } 
    });
    return response.data;
  }
};

export default briefApiService;
