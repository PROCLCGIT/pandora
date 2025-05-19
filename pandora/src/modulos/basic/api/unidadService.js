// /pandora/src/modulos/basic/api/unidadService.js

import api from '../../../config/axios';
import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

// Constantes
const RESOURCE_URL = '/basic/unidades/';
const QUERY_KEY = 'unidades';

/**
 * Obtiene lista de unidades de medida con posibilidad de filtrado y paginación
 * @param {Object} params - Parámetros de filtrado y paginación
 * @returns {Promise} Promesa con datos de unidades
 */
const fetchUnidades = async (params = {}) => {
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
    console.error('Error fetching unidades:', error);
    // Propagar el error para que React Query pueda manejarlo correctamente
    throw error;
  }
};

/**
 * Obtiene una unidad por su ID
 * @param {number|string} id - ID de la unidad
 * @returns {Promise} Promesa con datos de la unidad
 */
const fetchUnidadById = async (id) => {
  try {
    const response = await api.get(`${RESOURCE_URL}${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching unidad id ${id}:`, error);
    throw error; // Propagar el error para que React Query pueda manejarlo
  }
};

/**
 * Crea una nueva unidad
 * @param {Object} data - Datos de la unidad a crear
 * @returns {Promise} Promesa con datos de la unidad creada
 */
const createUnidad = async (data) => {
  try {
    const response = await api.post(RESOURCE_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error creating unidad:', error);
    throw error;
  }
};

/**
 * Actualiza una unidad existente
 * @param {Object} params - Objeto con id y data
 * @param {number|string} params.id - ID de la unidad
 * @param {Object} params.data - Datos a actualizar
 * @returns {Promise} Promesa con datos de la unidad actualizada
 */
const updateUnidad = async ({ id, data }) => {
  try {
    const response = await api.put(`${RESOURCE_URL}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating unidad id ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina una unidad
 * @param {number|string} id - ID de la unidad a eliminar
 * @returns {Promise} Promesa con el ID de la unidad eliminada
 */
const deleteUnidad = async (id) => {
  try {
    await api.delete(`${RESOURCE_URL}${id}/`);
    return id;
  } catch (error) {
    console.error(`Error deleting unidad id ${id}:`, error);
    throw error;
  }
};

// React Query Hooks

/**
 * Hook para obtener unidades con React Query
 * @param {Object} params - Parámetros de consulta
 * @param {Object} options - Opciones adicionales para el hook useQuery
 * @returns {Object} Objeto con datos, estado de carga y error
 */
export const useUnidades = (params = {}, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => fetchUnidades(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 1,
    ...options, // Permite pasar opciones adicionales
  });
};

/**
 * Hook para obtener una unidad por ID
 * @param {number|string} id - ID de la unidad
 * @param {Object} options - Opciones adicionales para el hook useQuery
 * @returns {Object} Objeto con datos, estado de carga y error
 */
export const useUnidadById = (id, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => fetchUnidadById(id),
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
 * Hook para crear una unidad
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useCreateUnidad = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createUnidad,
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
 * Hook para actualizar una unidad
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useUpdateUnidad = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUnidad,
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
 * Hook para eliminar una unidad
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useDeleteUnidad = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteUnidad,
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
 * Hook para obtener unidades con paginación infinita
 * @param {Object} filters - Filtros a aplicar a la consulta
 * @param {Object} options - Opciones adicionales para el hook useInfiniteQuery
 * @returns {Object} Objeto con datos, estados y funciones para paginación infinita
 */
export const useInfiniteUnidades = (filters = {}, options = {}) => {
  // Aseguramos que page_size siempre tenga un valor
  const pageSize = filters.page_size || 10;
  
  return useInfiniteQuery({
    queryKey: [QUERY_KEY, 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => fetchUnidades({ ...filters, page: pageParam, page_size: pageSize }),
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

export const unidadService = {
  fetchUnidades,
  fetchUnidadById,
  createUnidad,
  updateUnidad,
  deleteUnidad,
};

export default unidadService;