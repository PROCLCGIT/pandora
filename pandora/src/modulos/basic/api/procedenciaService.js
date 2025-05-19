// /pandora/src/modulos/basic/api/procedenciaService.js

import api from '../../../config/axios';
import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

// Constantes
const RESOURCE_URL = '/basic/procedencias/';
const QUERY_KEY = 'procedencias';

/**
 * Obtiene lista de procedencias con posibilidad de filtrado y paginación
 * @param {Object} params - Parámetros de filtrado y paginación
 * @returns {Promise} Promesa con datos de procedencias
 */
const fetchProcedencias = async (params = {}) => {
  try {
    const response = await api.get(RESOURCE_URL, { params });
    
    // Comprobar si la respuesta es un array (API directa) o un objeto paginado
    if (Array.isArray(response.data)) {
      // Si es un array, convertirlo al formato esperado
      return {
        count: response.data.length,
        results: response.data
      };
    } else if (response.data && response.data.results) {
      // Si ya tiene el formato correcto, devolverlo tal cual
      return response.data;
    } else {
      // Para cualquier otro formato, crear un objeto con la estructura correcta
      return {
        count: 1,
        results: Array.isArray(response.data) ? response.data : [response.data].filter(Boolean)
      };
    }
  } catch (error) {
    console.error('Error fetching procedencias:', error);
    // Propagar el error para que React Query pueda manejarlo correctamente
    throw error;
  }
};

/**
 * Obtiene una procedencia por su ID
 * @param {number|string} id - ID de la procedencia
 * @returns {Promise} Promesa con datos de la procedencia
 */
const fetchProcedenciaById = async (id) => {
  try {
    const response = await api.get(`${RESOURCE_URL}${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching procedencia id ${id}:`, error);
    throw error; // Propagar el error para que React Query pueda manejarlo
  }
};

/**
 * Crea una nueva procedencia
 * @param {Object} data - Datos de la procedencia a crear
 * @returns {Promise} Promesa con datos de la procedencia creada
 */
const createProcedencia = async (data) => {
  try {
    const response = await api.post(RESOURCE_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error creating procedencia:', error);
    throw error;
  }
};

/**
 * Actualiza una procedencia existente
 * @param {Object} params - Objeto con id y data
 * @param {number|string} params.id - ID de la procedencia
 * @param {Object} params.data - Datos a actualizar
 * @returns {Promise} Promesa con datos de la procedencia actualizada
 */
const updateProcedencia = async ({ id, data }) => {
  try {
    const response = await api.put(`${RESOURCE_URL}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating procedencia id ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina una procedencia
 * @param {number|string} id - ID de la procedencia a eliminar
 * @returns {Promise} Promesa con el ID de la procedencia eliminada
 */
const deleteProcedencia = async (id) => {
  try {
    await api.delete(`${RESOURCE_URL}${id}/`);
    return id;
  } catch (error) {
    console.error(`Error deleting procedencia id ${id}:`, error);
    throw error;
  }
};

// React Query Hooks

/**
 * Hook para obtener procedencias con React Query
 * @param {Object} params - Parámetros de consulta
 * @param {Object} options - Opciones adicionales para el hook useQuery
 * @returns {Object} Objeto con datos, estado de carga y error
 */
export const useProcedencias = (params = {}, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => fetchProcedencias(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 1,
    ...options, // Permite pasar opciones adicionales
  });
};

/**
 * Hook para obtener una procedencia por ID
 * @param {number|string} id - ID de la procedencia
 * @param {Object} options - Opciones adicionales para el hook useQuery
 * @returns {Object} Objeto con datos, estado de carga y error
 */
export const useProcedenciaById = (id, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => fetchProcedenciaById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    // Asegurar que siempre se devuelva un objeto si no hay datos para evitar errores
    placeholderData: { 
      id: null, 
      nombre: '', 
      code: ''
    },
    ...options, // Permite pasar opciones adicionales
  });
};

/**
 * Hook para crear una procedencia
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useCreateProcedencia = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createProcedencia,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      // Llamar al callback de éxito si existe
      if (options.onSuccess) options.onSuccess(data);
    },
    onError: (error) => {
      // Llamar al callback de error si existe
      if (options.onError) options.onError(error);
    },
    ...options, // Permite pasar opciones adicionales
  });
};

/**
 * Hook para actualizar una procedencia
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useUpdateProcedencia = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProcedencia,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      // Llamar al callback de éxito si existe
      if (options.onSuccess) options.onSuccess(data);
    },
    onError: (error) => {
      // Llamar al callback de error si existe
      if (options.onError) options.onError(error);
    },
    ...options, // Permite pasar opciones adicionales
  });
};

/**
 * Hook para eliminar una procedencia
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useDeleteProcedencia = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteProcedencia,
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      // Llamar al callback de éxito si existe
      if (options.onSuccess) options.onSuccess(id);
    },
    onError: (error) => {
      // Llamar al callback de error si existe
      if (options.onError) options.onError(error);
    },
    ...options, // Permite pasar opciones adicionales
  });
};

/**
 * Hook para obtener procedencias con paginación infinita
 * @param {Object} filters - Filtros a aplicar a la consulta
 * @param {Object} options - Opciones adicionales para el hook useInfiniteQuery
 * @returns {Object} Objeto con datos, estados y funciones para paginación infinita
 */
export const useInfiniteProcedencias = (filters = {}, options = {}) => {
  // Aseguramos que page_size siempre tenga un valor
  const pageSize = filters.page_size || 10;
  
  return useInfiniteQuery({
    queryKey: [QUERY_KEY, 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => fetchProcedencias({ ...filters, page: pageParam, page_size: pageSize }),
    getNextPageParam: (lastPage, allPages) => {
      // Calculamos el total de páginas basado en el count y page_size
      const totalPages = Math.ceil(lastPage.count / pageSize);
      // Devolvemos la siguiente página o undefined si ya hemos cargado todas
      return allPages.length < totalPages ? allPages.length + 1 : undefined;
    },
    // Opciones por defecto
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    ...options, // Opciones personalizadas
  });
};

// Add getAll method for consistency with other services
const getAll = async (params = {}) => {
  console.log('procedenciaService.getAll() called with params:', params);

  try {
    // Call the actual API instead of using hardcoded data
    const response = await api.get(RESOURCE_URL, { params });

    // Process the response similar to fetchProcedencias
    let result;
    if (Array.isArray(response.data)) {
      result = {
        count: response.data.length,
        results: response.data
      };
    } else if (response.data && response.data.results) {
      result = response.data;
    } else {
      result = {
        count: 1,
        results: Array.isArray(response.data) ? response.data : [response.data].filter(Boolean)
      };
    }

    console.log('procedenciaService.getAll() got real data:', result);
    return result;
  } catch (error) {
    console.error('Error in procedenciaService.getAll():', error);
    // If the API call fails, return empty results rather than throw an error
    return { count: 0, results: [] };
  }
};

export const procedenciaService = {
  fetchProcedencias,
  fetchProcedenciaById,
  createProcedencia,
  updateProcedencia,
  deleteProcedencia,
  getAll, // Add getAll method
};

export default procedenciaService;