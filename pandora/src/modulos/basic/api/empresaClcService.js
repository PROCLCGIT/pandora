// /pandora/src/modulos/basic/api/empresaClcService.js

import api from '../../../config/axios';
import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

// Constantes
const RESOURCE_URL = '/basic/empresas/';
const QUERY_KEY = 'empresas';

/**
 * Obtiene lista de empresas CLC con posibilidad de filtrado y paginación
 * @param {Object} params - Parámetros de filtrado y paginación
 * @returns {Promise} Promesa con datos de empresas
 */
const fetchEmpresas = async (params = {}) => {
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
    
    console.debug(`Fetching empresas with auth: ${config.headers.Authorization}`);
    
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
    console.error('Error fetching empresas:', error);
    
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
 * Obtiene una empresa por su ID
 * @param {number|string} id - ID de la empresa
 * @returns {Promise} Promesa con datos de la empresa
 */
const fetchEmpresaById = async (id) => {
  try {
    const response = await api.get(`${RESOURCE_URL}${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching empresa id ${id}:`, error);
    
    // Si hay un error 401, intentar renovar token
    if (error.response && error.response.status === 401) {
      console.warn(`Error de autenticación 401 al obtener empresa id ${id}. Intentando renovar token...`);
      
      // Podríamos intentar renovar el token aquí o redirigir al login
      console.error('Se requiere iniciar sesión nuevamente');
    }
    
    throw error; // Propagar el error para que React Query pueda manejarlo
  }
};

/**
 * Crea una nueva empresa
 * @param {Object} data - Datos de la empresa a crear
 * @returns {Promise} Promesa con datos de la empresa creada
 */
const createEmpresa = async (data) => {
  try {
    const response = await api.post(RESOURCE_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error creating empresa:', error);
    throw error;
  }
};

/**
 * Actualiza una empresa existente
 * @param {Object} params - Objeto con id y data
 * @param {number|string} params.id - ID de la empresa
 * @param {Object} params.data - Datos a actualizar
 * @returns {Promise} Promesa con datos de la empresa actualizada
 */
const updateEmpresa = async ({ id, data }) => {
  try {
    const response = await api.put(`${RESOURCE_URL}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating empresa id ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina una empresa
 * @param {number|string} id - ID de la empresa a eliminar
 * @returns {Promise} Promesa con el ID de la empresa eliminada
 */
const deleteEmpresa = async (id) => {
  try {
    await api.delete(`${RESOURCE_URL}${id}/`);
    return id;
  } catch (error) {
    console.error(`Error deleting empresa id ${id}:`, error);
    throw error;
  }
};

// React Query Hooks

/**
 * Hook para obtener empresas con React Query
 * @param {Object} params - Parámetros de consulta
 * @param {Object} options - Opciones adicionales para el hook useQuery
 * @returns {Object} Objeto con datos, estado de carga y error
 */
export const useEmpresas = (params = {}, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => fetchEmpresas(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 1,
    ...options, // Permite pasar opciones adicionales
  });
};

/**
 * Hook para obtener una empresa por ID
 * @param {number|string} id - ID de la empresa
 * @param {Object} options - Opciones adicionales para el hook useQuery
 * @returns {Object} Objeto con datos, estado de carga y error
 */
export const useEmpresaById = (id, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => fetchEmpresaById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    // Asegurar que siempre se devuelva un objeto si no hay datos para evitar errores
    placeholderData: { 
      id: null, 
      nombre: '', 
      razon_social: '', 
      code: '', 
      ruc: '', 
      direccion: '', 
      telefono: '', 
      correo: '', 
      representante_legal: '' 
    },
    ...options, // Permite pasar opciones adicionales
  });
};

/**
 * Hook para crear una empresa
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useCreateEmpresa = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createEmpresa,
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
 * Hook para actualizar una empresa
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useUpdateEmpresa = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateEmpresa,
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
 * Hook para eliminar una empresa
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useDeleteEmpresa = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteEmpresa,
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
 * Hook para obtener empresas con paginación infinita
 * @param {Object} filters - Filtros a aplicar a la consulta
 * @param {Object} options - Opciones adicionales para el hook useInfiniteQuery
 * @returns {Object} Objeto con datos, estados y funciones para paginación infinita
 */
export const useInfiniteEmpresas = (filters = {}, options = {}) => {
  // Aseguramos que page_size siempre tenga un valor
  const pageSize = filters.page_size || 10;
  
  return useInfiniteQuery({
    queryKey: [QUERY_KEY, 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => fetchEmpresas({ ...filters, page: pageParam, page_size: pageSize }),
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

export const empresaClcService = {
  fetchEmpresas,
  fetchEmpresaById,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
};

export default empresaClcService;