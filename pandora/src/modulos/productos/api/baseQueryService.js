/**
 * Servicio base para consultas React Query
 * Centraliza la lógica común de fetch y manejo de errores
 */

import api from '../../../config/axios';

/**
 * Función de utilidad para logs solo en desarrollo
 */
export const debug = (...args) => {
  if (import.meta.env.DEV) {
    console.log('[Query Debug]:', ...args);
  }
};

/**
 * Configuración por defecto para React Query
 */
export const DEFAULT_QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutos
  gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
  refetchOnWindowFocus: false,
  refetchOnMount: true,
  refetchOnReconnect: true,
  retry: 3,
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
};

/**
 * Configuración para queries de listado (con keepPreviousData)
 */
export const LIST_QUERY_CONFIG = {
  ...DEFAULT_QUERY_CONFIG,
  keepPreviousData: true,
  staleTime: 2 * 60 * 1000, // 2 minutos para listas
};

/**
 * Configuración para queries de detalle
 */
export const DETAIL_QUERY_CONFIG = {
  ...DEFAULT_QUERY_CONFIG,
  staleTime: 10 * 60 * 1000, // 10 minutos para detalles
};

/**
 * Configuración para infinite queries
 */
export const INFINITE_QUERY_CONFIG = {
  ...DEFAULT_QUERY_CONFIG,
  keepPreviousData: true,
  staleTime: 1 * 60 * 1000, // 1 minuto para infinite scroll
  getNextPageParam: (lastPage, pages) => {
    // Si la API devuelve un campo 'next' con la URL de la siguiente página
    if (lastPage?.next) {
      const url = new URL(lastPage.next);
      return url.searchParams.get('page');
    }
    
    // Calcular página siguiente basado en total de resultados
    const totalItems = lastPage?.count || 0;
    const currentItems = pages.reduce((acc, page) => acc + (page?.results?.length || 0), 0);
    
    return currentItems < totalItems ? pages.length + 1 : undefined;
  },
};

/**
 * Normalizador de respuestas de API
 * Convierte diferentes formatos de respuesta a un formato consistente
 */
export const normalizeApiResponse = (response) => {
  const data = response.data;
  
  // Si es un array, convertirlo al formato paginado
  if (Array.isArray(data)) {
    return {
      count: data.length,
      results: data,
      next: null,
      previous: null
    };
  }
  
  // Si ya tiene el formato correcto (DRF pagination)
  if (data && typeof data === 'object' && 'results' in data) {
    return data;
  }
  
  // Para objetos únicos (detalles)
  if (data && typeof data === 'object') {
    return data;
  }
  
  // Fallback
  return {
    count: 1,
    results: [data].filter(Boolean),
    next: null,
    previous: null
  };
};

/**
 * Factory para crear funciones de fetch genéricas
 */
export const createFetchFunction = (baseUrl) => {
  /**
   * Fetch lista con parámetros
   */
  const fetchList = async (params = {}) => {
    try {
      debug(`Fetching list from ${baseUrl}`, params);
      const response = await api.get(baseUrl, { params });
      return normalizeApiResponse(response);
    } catch (error) {
      debug(`Error fetching list from ${baseUrl}:`, error);
      throw error;
    }
  };

  /**
   * Fetch por ID
   */
  const fetchById = async (id) => {
    try {
      debug(`Fetching item ${id} from ${baseUrl}`);
      const response = await api.get(`${baseUrl}${id}/`);
      return response.data;
    } catch (error) {
      debug(`Error fetching item ${id} from ${baseUrl}:`, error);
      throw error;
    }
  };

  /**
   * Create nuevo item
   */
  const create = async (data) => {
    try {
      debug(`Creating item at ${baseUrl}`, data);
      const response = await api.post(baseUrl, data);
      return response.data;
    } catch (error) {
      debug(`Error creating item at ${baseUrl}:`, error);
      throw error;
    }
  };

  /**
   * Update item existente
   */
  const update = async ({ id, data }) => {
    try {
      debug(`Updating item ${id} at ${baseUrl}`, data);
      const response = await api.put(`${baseUrl}${id}/`, data);
      return response.data;
    } catch (error) {
      debug(`Error updating item ${id} at ${baseUrl}:`, error);
      throw error;
    }
  };

  /**
   * Partial update (PATCH)
   */
  const partialUpdate = async ({ id, data }) => {
    try {
      debug(`Partially updating item ${id} at ${baseUrl}`, data);
      const response = await api.patch(`${baseUrl}${id}/`, data);
      return response.data;
    } catch (error) {
      debug(`Error partially updating item ${id} at ${baseUrl}:`, error);
      throw error;
    }
  };

  /**
   * Delete item
   */
  const remove = async (id) => {
    try {
      debug(`Deleting item ${id} from ${baseUrl}`);
      await api.delete(`${baseUrl}${id}/`);
      return { id, deleted: true };
    } catch (error) {
      debug(`Error deleting item ${id} from ${baseUrl}:`, error);
      throw error;
    }
  };

  return {
    fetchList,
    fetchById,
    create,
    update,
    partialUpdate,
    remove
  };
};

/**
 * Factory para crear query keys consistentes
 */
export const createQueryKeys = (resourceName) => ({
  all: ['productos', resourceName],
  lists: () => [['productos', resourceName], 'list'],
  list: (filters) => [['productos', resourceName], 'list', filters],
  details: () => [['productos', resourceName], 'detail'],
  detail: (id) => [['productos', resourceName], 'detail', id],
  infinite: (filters) => [['productos', resourceName], 'infinite', filters],
});

/**
 * Función para crear invalidación optimizada
 */
export const createInvalidationPattern = (queryClient, queryKeys) => ({
  /**
   * Invalida todas las consultas del recurso
   */
  invalidateAll: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.all });
  },

  /**
   * Invalida solo las listas
   */
  invalidateLists: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
  },

  /**
   * Invalida solo los detalles
   */
  invalidateDetails: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.details() });
  },

  /**
   * Invalida una lista específica
   */
  invalidateList: (filters) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.list(filters) });
  },

  /**
   * Invalida un detalle específico
   */
  invalidateDetail: (id) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.detail(id) });
  },

  /**
   * Remove query específico de la caché
   */
  removeQuery: (queryKey) => {
    queryClient.removeQueries({ queryKey });
  },

  /**
   * Update data en caché (optimistic UI)
   */
  setQueryData: (queryKey, updater) => {
    queryClient.setQueryData(queryKey, updater);
  },

  /**
   * Prefetch una query específica
   */
  prefetch: async (queryKey, queryFn, options = {}) => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
      ...DEFAULT_QUERY_CONFIG,
      ...options
    });
  }
});

/**
 * Utilidad para manejo de errores centralizado
 */
export const handleQueryError = (error, toast, defaultMessage = 'Error en la operación') => {
  const errorMessage = error?.response?.data?.message || 
                      error?.response?.data?.detail || 
                      error?.message || 
                      defaultMessage;
  
  toast({
    title: "Error",
    description: errorMessage,
    variant: "destructive",
  });
  
  debug('Query error handled:', error);
};

/**
 * Utilidad para notificaciones de éxito
 */
export const handleQuerySuccess = (toast, message, description = '') => {
  toast({
    title: message,
    description,
    variant: "default",
  });
  
  debug('Query success:', message);
};