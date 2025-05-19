// /pandora/src/modulos/directorio/api/contactoService.js

import api from '../../../config/axios';
import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

// Constantes
const RESOURCE_URL = '/directorio/contactos/';
const QUERY_KEY = 'contactos';

/**
 * Obtiene lista de contactos con posibilidad de filtrado y paginación
 * @param {Object} params - Parámetros de filtrado y paginación
 * @returns {Promise} Promesa con datos de contactos
 */
const fetchContactos = async (params = {}) => {
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
    console.error('Error fetching contactos:', error);
    throw error;
  }
};

/**
 * Obtiene un contacto por su ID
 * @param {number|string} id - ID del contacto
 * @returns {Promise} Promesa con datos del contacto
 */
const fetchContactoById = async (id) => {
  try {
    const response = await api.get(`${RESOURCE_URL}${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching contacto id ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene los clientes asociados a un contacto
 * @param {number|string} id - ID del contacto
 * @returns {Promise} Promesa con datos de los clientes asociados
 */
const fetchClientesByContacto = async (id) => {
  try {
    const response = await api.get(`${RESOURCE_URL}${id}/clientes/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching clientes of contacto id ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo contacto
 * @param {Object} data - Datos del contacto a crear
 * @returns {Promise} Promesa con datos del contacto creado
 */
const createContacto = async (data) => {
  try {
    const response = await api.post(RESOURCE_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error creating contacto:', error);
    throw error;
  }
};

/**
 * Actualiza un contacto existente
 * @param {Object} params - Objeto con id y data
 * @param {number|string} params.id - ID del contacto
 * @param {Object} params.data - Datos a actualizar
 * @returns {Promise} Promesa con datos del contacto actualizado
 */
const updateContacto = async ({ id, data }) => {
  try {
    const response = await api.put(`${RESOURCE_URL}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating contacto id ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un contacto
 * @param {number|string} id - ID del contacto a eliminar
 * @returns {Promise} Promesa con el ID del contacto eliminado
 */
const deleteContacto = async (id) => {
  try {
    await api.delete(`${RESOURCE_URL}${id}/`);
    return id;
  } catch (error) {
    console.error(`Error deleting contacto id ${id}:`, error);
    throw error;
  }
};

// React Query Hooks

/**
 * Hook para obtener contactos con React Query
 * @param {Object} params - Parámetros de consulta
 * @param {Object} options - Opciones adicionales para el hook useQuery
 * @returns {Object} Objeto con datos, estado de carga y error
 */
export const useContactos = (params = {}, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => fetchContactos(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  });
};

/**
 * Hook para obtener un contacto por ID
 * @param {number|string} id - ID del contacto
 * @param {Object} options - Opciones adicionales para el hook useQuery
 * @returns {Object} Objeto con datos, estado de carga y error
 */
export const useContactoById = (id, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => fetchContactoById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    // Asegurar que siempre se devuelva un objeto si no hay datos
    placeholderData: { 
      id: null, 
      nombre: '', 
      alias: '',
      telefono: '',
      telefono2: '',
      email: '',
      direccion: '',
      obserbacion: '',
      ingerencia: ''
    },
    ...options,
  });
};

/**
 * Hook para obtener los clientes asociados a un contacto
 * @param {number|string} contactoId - ID del contacto
 * @param {Object} options - Opciones adicionales para el hook useQuery
 * @returns {Object} Objeto con datos, estado de carga y error
 */
export const useClientesByContacto = (contactoId, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, contactoId, 'clientes'],
    queryFn: () => fetchClientesByContacto(contactoId),
    enabled: !!contactoId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    ...options,
  });
};

/**
 * Hook para crear un contacto
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useCreateContacto = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createContacto,
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
 * Hook para actualizar un contacto
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useUpdateContacto = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateContacto,
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
 * Hook para eliminar un contacto
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useDeleteContacto = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteContacto,
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
 * Hook para obtener contactos con paginación infinita
 * @param {Object} filters - Filtros a aplicar a la consulta
 * @param {Object} options - Opciones adicionales para el hook useInfiniteQuery
 * @returns {Object} Objeto con datos, estados y funciones para paginación infinita
 */
export const useInfiniteContactos = (filters = {}, options = {}) => {
  // Aseguramos que page_size siempre tenga un valor
  const pageSize = filters.page_size || 10;
  
  return useInfiniteQuery({
    queryKey: [QUERY_KEY, 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => fetchContactos({ ...filters, page: pageParam, page_size: pageSize }),
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

export const contactoService = {
  fetchContactos,
  fetchContactoById,
  fetchClientesByContacto,
  createContacto,
  updateContacto,
  deleteContacto,
};

export default contactoService;