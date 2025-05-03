// /pandora/src/modulos/basic/api/tipoClienteService.js

import api from '../../../config/axios';
import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

// Constantes
const RESOURCE_URL = '/basic/tipos-cliente/';
const QUERY_KEY = 'tipoclientes';

/**
 * Obtiene lista de tipos de cliente con posibilidad de filtrado y paginación
 * @param {Object} params - Parámetros de filtrado y paginación
 * @returns {Promise} Promesa con datos de tipos de cliente
 */
const fetchTiposCliente = async (params = {}) => {
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
    console.error('Error fetching tipos de cliente:', error);
    // Propagar el error para que React Query pueda manejarlo correctamente
    throw error;
  }
};

/**
 * Obtiene un tipo de cliente por su ID
 * @param {number|string} id - ID del tipo de cliente
 * @returns {Promise} Promesa con datos del tipo de cliente
 */
const fetchTipoClienteById = async (id) => {
  try {
    const response = await api.get(`${RESOURCE_URL}${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tipo cliente id ${id}:`, error);
    throw error; // Propagar el error para que React Query pueda manejarlo
  }
};

/**
 * Crea un nuevo tipo de cliente
 * @param {Object} data - Datos del tipo de cliente a crear
 * @returns {Promise} Promesa con datos del tipo de cliente creado
 */
const createTipoCliente = async (data) => {
  try {
    const response = await api.post(RESOURCE_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error creating tipo cliente:', error);
    throw error;
  }
};

/**
 * Actualiza un tipo de cliente existente
 * @param {Object} params - Objeto con id y data
 * @param {number|string} params.id - ID del tipo de cliente
 * @param {Object} params.data - Datos a actualizar
 * @returns {Promise} Promesa con datos del tipo de cliente actualizado
 */
const updateTipoCliente = async ({ id, data }) => {
  try {
    const response = await api.put(`${RESOURCE_URL}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating tipo cliente id ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un tipo de cliente
 * @param {number|string} id - ID del tipo de cliente a eliminar
 * @returns {Promise} Promesa con el ID del tipo de cliente eliminado
 */
const deleteTipoCliente = async (id) => {
  try {
    await api.delete(`${RESOURCE_URL}${id}/`);
    return id;
  } catch (error) {
    console.error(`Error deleting tipo cliente id ${id}:`, error);
    throw error;
  }
};

// React Query Hooks

/**
 * Hook para obtener tipos de cliente con React Query
 * @param {Object} params - Parámetros de consulta
 * @param {Object} options - Opciones adicionales para el hook useQuery
 * @returns {Object} Objeto con datos, estado de carga y error
 */
export const useTiposCliente = (params = {}, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => fetchTiposCliente(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 1,
    ...options, // Permite pasar opciones adicionales
  });
};

/**
 * Hook para obtener un tipo de cliente por ID
 * @param {number|string} id - ID del tipo de cliente
 * @param {Object} options - Opciones adicionales para el hook useQuery
 * @returns {Object} Objeto con datos, estado de carga y error
 */
export const useTipoClienteById = (id, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => fetchTipoClienteById(id),
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
 * Hook para crear un tipo de cliente
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useCreateTipoCliente = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTipoCliente,
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
 * Hook para actualizar un tipo de cliente
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useUpdateTipoCliente = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateTipoCliente,
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
 * Hook para eliminar un tipo de cliente
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useDeleteTipoCliente = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteTipoCliente,
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
 * Hook para obtener tipos de cliente con paginación infinita
 * @param {Object} filters - Filtros a aplicar a la consulta
 * @param {Object} options - Opciones adicionales para el hook useInfiniteQuery
 * @returns {Object} Objeto con datos, estados y funciones para paginación infinita
 */
export const useInfiniteTiposCliente = (filters = {}, options = {}) => {
  // Aseguramos que page_size siempre tenga un valor
  const pageSize = filters.page_size || 10;
  
  return useInfiniteQuery({
    queryKey: [QUERY_KEY, 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => fetchTiposCliente({ ...filters, page: pageParam, page_size: pageSize }),
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

export const tipoClienteService = {
  fetchTiposCliente,
  fetchTipoClienteById,
  createTipoCliente,
  updateTipoCliente,
  deleteTipoCliente,
};

export default tipoClienteService;