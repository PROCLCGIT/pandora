// /pandora/src/modulos/directorio/api/proveedorService.js

import api from '../../../config/axios';
import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

// Constantes
const RESOURCE_URL = '/directorio/proveedores/';
const QUERY_KEY = 'proveedores';

/**
 * Obtiene lista de proveedores con posibilidad de filtrado y paginación
 * @param {Object} params - Parámetros de filtrado y paginación
 * @returns {Promise} Promesa con datos de proveedores
 */
const fetchProveedores = async (params = {}) => {
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
    console.error('Error fetching proveedores:', error);
    // Propagar el error para que React Query pueda manejarlo correctamente
    throw error;
  }
};

/**
 * Obtiene un proveedor por su ID
 * @param {number|string} id - ID del proveedor
 * @returns {Promise} Promesa con datos del proveedor
 */
const fetchProveedorById = async (id) => {
  try {
    const response = await api.get(`${RESOURCE_URL}${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching proveedor id ${id}:`, error);
    throw error; // Propagar el error para que React Query pueda manejarlo
  }
};

/**
 * Crea un nuevo proveedor
 * @param {Object} data - Datos del proveedor a crear
 * @returns {Promise} Promesa con datos del proveedor creado
 */
const createProveedor = async (data) => {
  try {
    const response = await api.post(RESOURCE_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error creating proveedor:', error);
    throw error;
  }
};

/**
 * Actualiza un proveedor existente
 * @param {Object} params - Objeto con id y data
 * @param {number|string} params.id - ID del proveedor
 * @param {Object} params.data - Datos a actualizar
 * @returns {Promise} Promesa con datos del proveedor actualizado
 */
const updateProveedor = async ({ id, data }) => {
  try {
    const response = await api.put(`${RESOURCE_URL}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating proveedor id ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un proveedor
 * @param {number|string} id - ID del proveedor a eliminar
 * @returns {Promise} Promesa con el ID del proveedor eliminado
 */
const deleteProveedor = async (id) => {
  try {
    await api.delete(`${RESOURCE_URL}${id}/`);
    return id;
  } catch (error) {
    console.error(`Error deleting proveedor id ${id}:`, error);
    throw error;
  }
};

// React Query Hooks

/**
 * Hook para obtener proveedores con React Query
 * @param {Object} params - Parámetros de consulta
 * @param {Object} options - Opciones adicionales para el hook useQuery
 * @returns {Object} Objeto con datos, estado de carga y error
 */
export const useProveedores = (params = {}, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => fetchProveedores(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 1,
    ...options, // Permite pasar opciones adicionales
  });
};

/**
 * Hook para obtener un proveedor por ID
 * @param {number|string} id - ID del proveedor
 * @param {Object} options - Opciones adicionales para el hook useQuery
 * @returns {Object} Objeto con datos, estado de carga y error
 */
export const useProveedorById = (id, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => fetchProveedorById(id),
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
      ruc: '',
      correo: '',
      telefono: '',
      direccion1: '',
      direccion2: '',
      ciudad: null,
      activo: true,
      tipo_primario: false
    },
    ...options, // Permite pasar opciones adicionales
  });
};

/**
 * Hook para crear un proveedor
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useCreateProveedor = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createProveedor,
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
 * Hook para actualizar un proveedor
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useUpdateProveedor = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProveedor,
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
 * Hook para eliminar un proveedor
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useDeleteProveedor = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteProveedor,
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
 * Hook para obtener proveedores con paginación infinita
 * @param {Object} filters - Filtros a aplicar a la consulta
 * @param {Object} options - Opciones adicionales para el hook useInfiniteQuery
 * @returns {Object} Objeto con datos, estados y funciones para paginación infinita
 */
export const useInfiniteProveedores = (filters = {}, options = {}) => {
  // Aseguramos que page_size siempre tenga un valor
  const pageSize = filters.page_size || 10;
  
  return useInfiniteQuery({
    queryKey: [QUERY_KEY, 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => fetchProveedores({ ...filters, page: pageParam, page_size: pageSize }),
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

export const proveedorService = {
  fetchProveedores,
  fetchProveedorById,
  createProveedor,
  updateProveedor,
  deleteProveedor,
};

export default proveedorService;