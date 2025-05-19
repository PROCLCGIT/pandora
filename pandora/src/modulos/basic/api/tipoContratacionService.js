// /pandora/src/modulos/basic/api/tipoContratacionService.js

import api from '../../../config/axios';
import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

// Constantes
const RESOURCE_URL = '/basic/tipos-contratacion/';
const QUERY_KEY = 'tipocontrataciones';

/**
 * Obtiene lista de tipos de contratación con posibilidad de filtrado y paginación
 * @param {Object} params - Parámetros de filtrado y paginación
 * @returns {Promise} Promesa con datos de tipos de contratación
 */
const fetchTiposContratacion = async (params = {}) => {
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
    console.error('Error fetching tipos de contratación:', error);
    // Propagar el error para que React Query pueda manejarlo correctamente
    throw error;
  }
};

/**
 * Obtiene un tipo de contratación por su ID
 * @param {number|string} id - ID del tipo de contratación
 * @returns {Promise} Promesa con datos del tipo de contratación
 */
const fetchTipoContratacionById = async (id) => {
  try {
    const response = await api.get(`${RESOURCE_URL}${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tipo contratación id ${id}:`, error);
    throw error; // Propagar el error para que React Query pueda manejarlo
  }
};

/**
 * Crea un nuevo tipo de contratación
 * @param {Object} data - Datos del tipo de contratación a crear
 * @returns {Promise} Promesa con datos del tipo de contratación creado
 */
const createTipoContratacion = async (data) => {
  try {
    const response = await api.post(RESOURCE_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error creating tipo contratación:', error);
    throw error;
  }
};

/**
 * Actualiza un tipo de contratación existente
 * @param {Object} params - Objeto con id y data
 * @param {number|string} params.id - ID del tipo de contratación
 * @param {Object} params.data - Datos a actualizar
 * @returns {Promise} Promesa con datos del tipo de contratación actualizado
 */
const updateTipoContratacion = async ({ id, data }) => {
  try {
    const response = await api.put(`${RESOURCE_URL}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating tipo contratación id ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un tipo de contratación
 * @param {number|string} id - ID del tipo de contratación a eliminar
 * @returns {Promise} Promesa con el ID del tipo de contratación eliminado
 */
const deleteTipoContratacion = async (id) => {
  try {
    await api.delete(`${RESOURCE_URL}${id}/`);
    return id;
  } catch (error) {
    console.error(`Error deleting tipo contratación id ${id}:`, error);
    throw error;
  }
};

// React Query Hooks

/**
 * Hook para obtener tipos de contratación con React Query
 * @param {Object} params - Parámetros de consulta
 * @param {Object} options - Opciones adicionales para el hook useQuery
 * @returns {Object} Objeto con datos, estado de carga y error
 */
export const useTiposContratacion = (params = {}, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => fetchTiposContratacion(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 1,
    ...options, // Permite pasar opciones adicionales
  });
};

/**
 * Hook para obtener un tipo de contratación por ID
 * @param {number|string} id - ID del tipo de contratación
 * @param {Object} options - Opciones adicionales para el hook useQuery
 * @returns {Object} Objeto con datos, estado de carga y error
 */
export const useTipoContratacionById = (id, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => fetchTipoContratacionById(id),
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
 * Hook para crear un tipo de contratación
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useCreateTipoContratacion = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTipoContratacion,
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
 * Hook para actualizar un tipo de contratación
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useUpdateTipoContratacion = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateTipoContratacion,
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
 * Hook para eliminar un tipo de contratación
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useDeleteTipoContratacion = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteTipoContratacion,
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
 * Hook para obtener tipos de contratación con paginación infinita
 * @param {Object} filters - Filtros a aplicar a la consulta
 * @param {Object} options - Opciones adicionales para el hook useInfiniteQuery
 * @returns {Object} Objeto con datos, estados y funciones para paginación infinita
 */
export const useInfiniteTiposContratacion = (filters = {}, options = {}) => {
  // Aseguramos que page_size siempre tenga un valor
  const pageSize = filters.page_size || 10;
  
  return useInfiniteQuery({
    queryKey: [QUERY_KEY, 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => fetchTiposContratacion({ ...filters, page: pageParam, page_size: pageSize }),
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

export const tipoContratacionService = {
  fetchTiposContratacion,
  fetchTipoContratacionById,
  createTipoContratacion,
  updateTipoContratacion,
  deleteTipoContratacion,
};

export default tipoContratacionService;