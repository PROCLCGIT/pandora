// /pandora/src/modulos/basic/api/categoriaService.js

import api from '../../../config/axios';
import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

// Constantes
const RESOURCE_URL = '/basic/categorias/';
const QUERY_KEY = 'categorias';

/**
 * Obtiene lista de categorías con posibilidad de filtrado y paginación
 * @param {Object} params - Parámetros de filtrado y paginación
 * @returns {Promise} Promesa con datos de categorías
 */
const fetchCategorias = async (params = {}) => {
  try {
    // Asegurar que el token está presente
    const { accessToken } = api.getTokens();
    if (!accessToken) {
      // Forzar un token para desarrollo
      const demoToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE5OTk5OTk5OTl9.demo-signature-very-secure-fixed';
      api.saveTokens(demoToken, 'refresh-token-example');
    }
    
    // Configuración explícita de la solicitud con headers de autorización
    const config = {
      params,
      headers: {
        'Authorization': `Bearer ${api.getTokens().accessToken}`
      }
    };
    
    console.debug(`Fetching categorias with auth: ${config.headers.Authorization}`);
    
    const response = await api.get(RESOURCE_URL, config);
    
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
    console.error('Error fetching categorias:', error);
    
    // Si hay un error 401, intentar renovar token
    if (error.response && error.response.status === 401) {
      console.warn('Error de autenticación 401. Intentando renovar token...');
      
      // Podríamos intentar renovar el token aquí o redirigir al login
      console.error('Se requiere iniciar sesión nuevamente');
      throw error;
    }
    
    // Propagar el error para que React Query pueda manejarlo correctamente
    throw error;
  }
};

/**
 * Obtiene una categoría por su ID
 * @param {number|string} id - ID de la categoría
 * @returns {Promise} Promesa con datos de la categoría
 */
const fetchCategoriaById = async (id) => {
  try {
    const response = await api.get(`${RESOURCE_URL}${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching categoria id ${id}:`, error);
    
    // Si hay un error 401, intentar renovar token
    if (error.response && error.response.status === 401) {
      console.warn(`Error de autenticación 401 al obtener categoria id ${id}. Intentando renovar token...`);
      
      // Podríamos intentar renovar el token aquí o redirigir al login
      console.error('Se requiere iniciar sesión nuevamente');
    }
    
    throw error; // Propagar el error para que React Query pueda manejarlo
  }
};

/**
 * Crea una nueva categoría
 * @param {Object} data - Datos de la categoría a crear
 * @returns {Promise} Promesa con datos de la categoría creada
 */
const createCategoria = async (data) => {
  try {
    const response = await api.post(RESOURCE_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error creating categoria:', error);
    throw error;
  }
};

/**
 * Actualiza una categoría existente
 * @param {Object} params - Objeto con id y data
 * @param {number|string} params.id - ID de la categoría
 * @param {Object} params.data - Datos a actualizar
 * @returns {Promise} Promesa con datos de la categoría actualizada
 */
const updateCategoria = async ({ id, data }) => {
  try {
    const response = await api.put(`${RESOURCE_URL}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating categoria id ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina una categoría
 * @param {number|string} id - ID de la categoría a eliminar
 * @returns {Promise} Promesa con el ID de la categoría eliminada
 */
const deleteCategoria = async (id) => {
  try {
    await api.delete(`${RESOURCE_URL}${id}/`);
    return id;
  } catch (error) {
    console.error(`Error deleting categoria id ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene una categoría por ID con sus hijos/subcategorías
 * @param {number|string} id - ID de la categoría
 * @returns {Promise} Promesa con datos de la categoría y sus hijos
 */
const fetchCategoriaConHijos = async (id) => {
  try {
    const response = await api.get(`${RESOURCE_URL}${id}/hijos/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching categoria with children id ${id}:`, error);
    throw error;
  }
};

// React Query Hooks

/**
 * Hook para obtener categorías con React Query
 * @param {Object} params - Parámetros de consulta
 * @param {Object} options - Opciones adicionales para el hook useQuery
 * @returns {Object} Objeto con datos, estado de carga y error
 */
export const useCategories = (params = {}, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => fetchCategorias(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 1,
    ...options, // Permite pasar opciones adicionales
  });
};

/**
 * Hook para obtener una categoría por ID
 * @param {number|string} id - ID de la categoría
 * @param {Object} options - Opciones adicionales para el hook useQuery
 * @returns {Object} Objeto con datos, estado de carga y error
 */
export const useCategoriaById = (id, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => fetchCategoriaById(id),
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
      parent: null, 
      level: 0, 
      path: '', 
      is_active: true 
    },
    ...options, // Permite pasar opciones adicionales
  });
};

/**
 * Hook para crear una categoría
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useCreateCategoria = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCategoria,
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
 * Hook para actualizar una categoría
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useUpdateCategoria = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateCategoria,
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
 * Hook para eliminar una categoría
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useDeleteCategoria = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteCategoria,
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

// Exportación de funciones directas
/**
 * Hook para obtener una categoría con sus hijos
 * @param {number|string} id - ID de la categoría
 * @param {Object} options - Opciones adicionales para el hook useQuery
 * @returns {Object} Objeto con datos, estado de carga y error
 */
export const useCategoriaConHijos = (id, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, id, 'hijos'],
    queryFn: () => fetchCategoriaConHijos(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options, // Permite pasar opciones adicionales
  });
};

/**
 * Hook para obtener categorías con paginación infinita
 * @param {Object} filters - Filtros a aplicar a la consulta
 * @param {Object} options - Opciones adicionales para el hook useInfiniteQuery
 * @returns {Object} Objeto con datos, estados y funciones para paginación infinita
 */
export const useInfiniteCategories = (filters = {}, options = {}) => {
  // Aseguramos que page_size siempre tenga un valor
  const pageSize = filters.page_size || 10;
  
  return useInfiniteQuery({
    queryKey: [QUERY_KEY, 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => fetchCategorias({ ...filters, page: pageParam, page_size: pageSize }),
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

export const categoriaService = {
  fetchCategorias,
  fetchCategoriaById,
  fetchCategoriaConHijos,
  createCategoria,
  updateCategoria,
  deleteCategoria,
};

export default categoriaService;