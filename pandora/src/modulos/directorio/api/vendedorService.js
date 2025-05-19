// /pandora/src/modulos/directorio/api/vendedorService.js

import api from '../../../config/axios';
import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

// Constantes
const RESOURCE_URL = '/directorio/vendedores/';
const QUERY_KEY = 'vendedores';

/**
 * Obtiene lista de vendedores con posibilidad de filtrado y paginación
 * @param {Object} params - Parámetros de filtrado y paginación
 * @returns {Promise} Promesa con datos de vendedores
 */
const fetchVendedores = async (params = {}) => {
  try {
    const response = await api.get(RESOURCE_URL, { params });
    
    // Comprobar si la respuesta es un array o un objeto paginado
    if (Array.isArray(response.data)) {
      return {
        count: response.data.length,
        results: response.data
      };
    } else if (response.data && response.data.results) {
      return response.data;
    } else {
      return {
        count: 1,
        results: Array.isArray(response.data) ? response.data : [response.data].filter(Boolean)
      };
    }
  } catch (error) {
    console.error('Error fetching vendedores:', error);
    throw error;
  }
};

/**
 * Obtiene vendedores activos
 * @param {Object} params - Parámetros adicionales como paginación
 * @returns {Promise} Promesa con datos de vendedores activos
 */
const fetchVendedoresActivos = async (params = {}) => {
  try {
    const response = await api.get(`${RESOURCE_URL}activos/`, { params });
    return Array.isArray(response.data) 
      ? { count: response.data.length, results: response.data }
      : response.data;
  } catch (error) {
    console.error('Error fetching vendedores activos:', error);
    throw error;
  }
};

/**
 * Obtiene vendedores por proveedor
 * @param {number|string} proveedorId - ID del proveedor
 * @param {Object} params - Parámetros adicionales como paginación
 * @returns {Promise} Promesa con datos de vendedores del proveedor
 */
const fetchVendedoresPorProveedor = async (proveedorId, params = {}) => {
  try {
    const response = await api.get(`${RESOURCE_URL}por_proveedor/`, { 
      params: { ...params, proveedor_id: proveedorId } 
    });
    return Array.isArray(response.data) 
      ? { count: response.data.length, results: response.data }
      : response.data;
  } catch (error) {
    console.error(`Error fetching vendedores del proveedor ${proveedorId}:`, error);
    throw error;
  }
};

/**
 * Obtiene un vendedor por su ID
 * @param {number|string} id - ID del vendedor
 * @returns {Promise} Promesa con datos del vendedor
 */
const fetchVendedorById = async (id) => {
  try {
    const response = await api.get(`${RESOURCE_URL}${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching vendedor id ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo vendedor
 * @param {Object} data - Datos del vendedor a crear
 * @returns {Promise} Promesa con datos del vendedor creado
 */
const createVendedor = async (data) => {
  try {
    const response = await api.post(RESOURCE_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error creating vendedor:', error);
    throw error;
  }
};

/**
 * Actualiza un vendedor existente
 * @param {Object} params - Objeto con id y data
 * @param {number|string} params.id - ID del vendedor
 * @param {Object} params.data - Datos a actualizar
 * @returns {Promise} Promesa con datos del vendedor actualizado
 */
const updateVendedor = async ({ id, data }) => {
  try {
    const response = await api.put(`${RESOURCE_URL}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating vendedor id ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un vendedor
 * @param {number|string} id - ID del vendedor a eliminar
 * @returns {Promise} Promesa con el ID del vendedor eliminado
 */
const deleteVendedor = async (id) => {
  try {
    await api.delete(`${RESOURCE_URL}${id}/`);
    return id;
  } catch (error) {
    console.error(`Error deleting vendedor id ${id}:`, error);
    throw error;
  }
};

// React Query Hooks

/**
 * Hook para obtener vendedores con React Query
 * @param {Object} params - Parámetros de consulta
 * @param {Object} options - Opciones adicionales para el hook useQuery
 * @returns {Object} Objeto con datos, estado de carga y error
 */
export const useVendedores = (params = {}, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => fetchVendedores(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  });
};

/**
 * Hook para obtener vendedores activos
 * @param {Object} params - Parámetros de consulta
 * @param {Object} options - Opciones adicionales para el hook useQuery
 * @returns {Object} Objeto con datos, estado de carga y error
 */
export const useVendedoresActivos = (params = {}, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'activos', params],
    queryFn: () => fetchVendedoresActivos(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  });
};

/**
 * Hook para obtener vendedores por proveedor
 * @param {number|string} proveedorId - ID del proveedor
 * @param {Object} params - Parámetros de consulta
 * @param {Object} options - Opciones adicionales para el hook useQuery
 * @returns {Object} Objeto con datos, estado de carga y error
 */
export const useVendedoresPorProveedor = (proveedorId, params = {}, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'proveedor', proveedorId, params],
    queryFn: () => fetchVendedoresPorProveedor(proveedorId, params),
    enabled: !!proveedorId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  });
};

/**
 * Hook para obtener un vendedor por ID
 * @param {number|string} id - ID del vendedor
 * @param {Object} options - Opciones adicionales para el hook useQuery
 * @returns {Object} Objeto con datos, estado de carga y error
 */
export const useVendedorById = (id, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => fetchVendedorById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    // Asegurar que siempre se devuelva un objeto si no hay datos
    placeholderData: { 
      id: null, 
      nombre: '', 
      correo: '',
      telefono: '',
      proveedor: null,
      proveedor_nombre: '',
      observacion: '',
      activo: true
    },
    ...options,
  });
};

/**
 * Hook para crear un vendedor
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useCreateVendedor = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createVendedor,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      if (options.onSuccess) options.onSuccess(data);
    },
    onError: (error) => {
      if (options.onError) options.onError(error);
    },
    ...options,
  });
};

/**
 * Hook para actualizar un vendedor
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useUpdateVendedor = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateVendedor,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      if (options.onSuccess) options.onSuccess(data);
    },
    onError: (error) => {
      if (options.onError) options.onError(error);
    },
    ...options,
  });
};

/**
 * Hook para eliminar un vendedor
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useDeleteVendedor = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteVendedor,
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      if (options.onSuccess) options.onSuccess(id);
    },
    onError: (error) => {
      if (options.onError) options.onError(error);
    },
    ...options,
  });
};

/**
 * Hook para obtener vendedores con paginación infinita
 * @param {Object} filters - Filtros a aplicar a la consulta
 * @param {Object} options - Opciones adicionales para el hook useInfiniteQuery
 * @returns {Object} Objeto con datos, estados y funciones para paginación infinita
 */
export const useInfiniteVendedores = (filters = {}, options = {}) => {
  // Aseguramos que page_size siempre tenga un valor
  const pageSize = filters.page_size || 10;
  
  return useInfiniteQuery({
    queryKey: [QUERY_KEY, 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => fetchVendedores({ ...filters, page: pageParam, page_size: pageSize }),
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
    ...options,
  });
};

export const vendedorService = {
  fetchVendedores,
  fetchVendedoresActivos,
  fetchVendedoresPorProveedor,
  fetchVendedorById,
  createVendedor,
  updateVendedor,
  deleteVendedor,
};

export default vendedorService;