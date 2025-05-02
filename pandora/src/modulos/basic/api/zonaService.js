// /pandora/src/modulos/basic/api/zonaService.js

import api from '../../../config/axios';
import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

// Constantes
const RESOURCE_URL = '/basic/zonas/';
const ZONACIDAD_URL = '/basic/zona-ciudad/';
const QUERY_KEY = 'zonas';

/**
 * Obtiene lista de zonas con posibilidad de filtrado y paginación
 * @param {Object} params - Parámetros de filtrado y paginación
 * @returns {Promise} Promesa con datos de zonas
 */
const fetchZonas = async (params = {}) => {
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
    console.error('Error fetching zonas:', error);
    // Propagar el error para que React Query pueda manejarlo correctamente
    throw error;
  }
};

/**
 * Obtiene una zona por su ID
 * @param {number|string} id - ID de la zona
 * @returns {Promise} Promesa con datos de la zona
 */
const fetchZonaById = async (id) => {
  try {
    const response = await api.get(`${RESOURCE_URL}${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching zona id ${id}:`, error);
    throw error; // Propagar el error para que React Query pueda manejarlo
  }
};

/**
 * Obtiene una zona con sus ciudades relacionadas
 * @param {number|string} id - ID de la zona
 * @returns {Promise} Promesa con datos de la zona y sus ciudades
 */
const fetchZonaConCiudades = async (id) => {
  try {
    const response = await api.get(`${RESOURCE_URL}${id}/ciudades/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching zona with cities id ${id}:`, error);
    throw error;
  }
};

/**
 * Crea una nueva zona
 * @param {Object} data - Datos de la zona a crear
 * @returns {Promise} Promesa con datos de la zona creada
 */
const createZona = async (data) => {
  try {
    const response = await api.post(RESOURCE_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error creating zona:', error);
    throw error;
  }
};

/**
 * Actualiza una zona existente
 * @param {Object} params - Objeto con id y data
 * @param {number|string} params.id - ID de la zona
 * @param {Object} params.data - Datos a actualizar
 * @returns {Promise} Promesa con datos de la zona actualizada
 */
const updateZona = async ({ id, data }) => {
  try {
    const response = await api.put(`${RESOURCE_URL}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating zona id ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina una zona
 * @param {number|string} id - ID de la zona a eliminar
 * @returns {Promise} Promesa con el ID de la zona eliminada
 */
const deleteZona = async (id) => {
  try {
    await api.delete(`${RESOURCE_URL}${id}/`);
    return id;
  } catch (error) {
    console.error(`Error deleting zona id ${id}:`, error);
    throw error;
  }
};

/**
 * Asigna múltiples ciudades a una zona
 * @param {Object} params - Parámetros de asignación
 * @param {number|string} params.zona_id - ID de la zona
 * @param {Array<number|string>} params.ciudad_ids - IDs de las ciudades a asignar
 * @returns {Promise} Promesa con el resultado de la operación
 */
const asignarCiudadesAZona = async ({ zona_id, ciudad_ids }) => {
  try {
    const response = await api.post(`${ZONACIDAD_URL}asignar_multiples/`, {
      zona_id,
      ciudad_ids
    });
    return response.data;
  } catch (error) {
    console.error(`Error assigning cities to zone ${zona_id}:`, error);
    throw error;
  }
};

// React Query Hooks

/**
 * Hook para obtener zonas con React Query
 * @param {Object} params - Parámetros de consulta
 * @param {Object} options - Opciones adicionales para el hook useQuery
 * @returns {Object} Objeto con datos, estado de carga y error
 */
export const useZonas = (params = {}, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => fetchZonas(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 1,
    ...options, // Permite pasar opciones adicionales
  });
};

/**
 * Hook para obtener una zona por ID
 * @param {number|string} id - ID de la zona
 * @param {Object} options - Opciones adicionales para el hook useQuery
 * @returns {Object} Objeto con datos, estado de carga y error
 */
export const useZonaById = (id, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => fetchZonaById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    // Asegurar que siempre se devuelva un objeto si no hay datos para evitar errores
    placeholderData: { 
      id: null, 
      nombre: '', 
      code: '', 
      cobertura: ''
    },
    ...options, // Permite pasar opciones adicionales
  });
};

/**
 * Hook para obtener una zona con sus ciudades relacionadas
 * @param {number|string} id - ID de la zona
 * @param {Object} options - Opciones adicionales para el hook useQuery
 * @returns {Object} Objeto con datos, estado de carga y error
 */
export const useZonaConCiudades = (id, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, id, 'ciudades'],
    queryFn: () => fetchZonaConCiudades(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    ...options, // Permite pasar opciones adicionales
  });
};

/**
 * Hook para crear una zona
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useCreateZona = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createZona,
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
 * Hook para actualizar una zona
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useUpdateZona = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateZona,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.id, 'ciudades'] });
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
 * Hook para eliminar una zona
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useDeleteZona = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteZona,
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id, 'ciudades'] });
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
 * Hook para asignar múltiples ciudades a una zona
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useAsignarCiudadesAZona = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: asignarCiudadesAZona,
    onSuccess: (data) => {
      // Invalidamos la consulta de zona específica y sus ciudades
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.zona_id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.zona_id, 'ciudades'] });
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
 * Hook para obtener zonas con paginación infinita
 * @param {Object} filters - Filtros a aplicar a la consulta
 * @param {Object} options - Opciones adicionales para el hook useInfiniteQuery
 * @returns {Object} Objeto con datos, estados y funciones para paginación infinita
 */
export const useInfiniteZonas = (filters = {}, options = {}) => {
  // Aseguramos que page_size siempre tenga un valor
  const pageSize = filters.page_size || 10;
  
  return useInfiniteQuery({
    queryKey: [QUERY_KEY, 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => fetchZonas({ ...filters, page: pageParam, page_size: pageSize }),
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

export const zonaService = {
  fetchZonas,
  fetchZonaById,
  fetchZonaConCiudades,
  createZona,
  updateZona,
  deleteZona,
  asignarCiudadesAZona,
};

export default zonaService;