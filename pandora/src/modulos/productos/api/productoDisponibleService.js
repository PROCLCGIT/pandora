// /pandora/src/modulos/productos/api/productoDisponibleService.js

import api from '../../../config/axios';
import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

// Constantes
const RESOURCE_URL = '/productos/productos-disponibles/';

// Setup debugging interceptors safely
let requestInterceptor = null;
let responseInterceptor = null;

// Initialize interceptors only if api is available and has interceptors
if (api && api.interceptors) {
  try {
    requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (config.url === RESOURCE_URL && config.method === 'post') {
          console.log('=== INTERCEPTED REQUEST ===');
          console.log('URL:', config.baseURL + config.url);
          console.log('Method:', config.method);
          console.log('Headers:', config.headers);
          console.log('Data:', config.data);
          console.log('Data type:', typeof config.data);
        }
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    responseInterceptor = api.interceptors.response.use(
      (response) => {
        if (response.config.url === RESOURCE_URL && response.config.method === 'post') {
          console.log('=== INTERCEPTED RESPONSE SUCCESS ===');
          console.log('Status:', response.status);
          console.log('Data:', response.data);
        }
        return response;
      },
      (error) => {
        if (error.config?.url === RESOURCE_URL && error.config?.method === 'post') {
          console.error('=== INTERCEPTED RESPONSE ERROR ===');
          console.error('Status:', error.response?.status);
          console.error('Status Text:', error.response?.statusText);
          console.error('Response Data:', error.response?.data);
          console.error('Response Headers:', error.response?.headers);
        }
        return Promise.reject(error);
      }
    );
  } catch (interceptorError) {
    console.error('Failed to setup interceptors:', interceptorError);
  }
} else {
  console.warn('API interceptors not available, debugging will be limited');
}

// Estructura de claves para una invalidación consistente (similar a productos ofertados)
export const QUERY_KEYS = {
  all: ['productos', 'disponibles'],
  lists: () => [...QUERY_KEYS.all, 'list'],
  list: (filters) => [...QUERY_KEYS.lists(), filters],
  details: () => [...QUERY_KEYS.all, 'detail'],
  detail: (id) => [...QUERY_KEYS.details(), id],
};

// Mantener compatibilidad con componentes existentes
const QUERY_KEY = 'productosDisponibles';

/**
 * Obtiene lista de productos disponibles con posibilidad de filtrado y paginación
 * @param {Object} params - Parámetros de filtrado y paginación
 * @returns {Promise} Promesa con datos de productos disponibles
 */
const fetchProductosDisponibles = async (params = {}) => {
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
    console.error('Error fetching productos disponibles:', error);
    throw error;
  }
};

/**
 * Obtiene un producto disponible por su ID
 * @param {number|string} id - ID del producto disponible
 * @returns {Promise} Promesa con datos del producto disponible
 */
const fetchProductoDisponibleById = async (id) => {
  try {
    console.log(`[API DEBUG] Fetching producto disponible by ID: ${id}`);
    console.log(`[API DEBUG] Request URL: ${RESOURCE_URL}${id}/`);
    const response = await api.get(`${RESOURCE_URL}${id}/`);
    console.log(`[API DEBUG] Response received:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[API DEBUG] Error fetching producto disponible id ${id}:`, error);
    console.error(`[API DEBUG] Error details:`, error.response?.data);
    console.error(`Error fetching producto disponible id ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo producto disponible
 * @param {Object} data - Datos del producto disponible a crear
 * @returns {Promise} Promesa con datos del producto disponible creado
 */
const createProductoDisponible = async (data) => {
  try {
    console.log('=== API SERVICE DEBUG ===');
    console.log('RESOURCE_URL:', RESOURCE_URL);
    console.log('Data being sent to API:', data);
    console.log('Data type:', typeof data);
    console.log('Data constructor:', data.constructor.name);
    console.log('JSON.stringify data:', JSON.stringify(data, null, 2));
    
    const response = await api.post(RESOURCE_URL, data);
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=== API ERROR DETAILS ===');
    console.error('Error creating producto disponible:', error);
    console.error('Error status:', error.response?.status);
    console.error('Error status text:', error.response?.statusText);
    console.error('Error data:', error.response?.data);
    console.error('Error headers:', error.response?.headers);
    console.error('Request config:', error.config);
    throw error;
  }
};

/**
 * Actualiza un producto disponible existente
 * @param {Object} params - Objeto con id y data
 * @param {number|string} params.id - ID del producto disponible
 * @param {Object} params.data - Datos a actualizar
 * @returns {Promise} Promesa con datos del producto disponible actualizado
 */
const updateProductoDisponible = async ({ id, data }) => {
  try {
    const response = await api.put(`${RESOURCE_URL}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating producto disponible id ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un producto disponible
 * @param {number|string} id - ID del producto disponible a eliminar
 * @returns {Promise} Promesa con el ID del producto disponible eliminado
 */
const deleteProductoDisponible = async (id) => {
  try {
    await api.delete(`${RESOURCE_URL}${id}/`);
    return id;
  } catch (error) {
    console.error(`Error deleting producto disponible id ${id}:`, error);
    throw error;
  }
};

// React Query Hooks

/**
 * Hook para obtener productos disponibles con React Query
 * @param {Object} params - Parámetros de consulta
 * @param {Object} options - Opciones adicionales para el hook useQuery
 * @returns {Object} Objeto con datos, estado de carga y error
 */
export const useProductosDisponibles = (params = {}, options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.list(params),
    queryFn: () => fetchProductosDisponibles(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  });
};

/**
 * Hook para obtener un producto disponible por ID
 * @param {number|string} id - ID del producto disponible
 * @param {Object} options - Opciones adicionales para el hook useQuery
 * @returns {Object} Objeto con datos, estado de carga y error
 */
export const useProductoDisponibleById = (id, options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => fetchProductoDisponibleById(id),
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
      modelo: '',
      referencia: '',
      is_active: true,
      id_categoria: null,
      id_producto_ofertado: null,
      id_marca: null,
      unidad_presentacion: null,
      procedencia: null,
      tz_oferta: 0,
      tz_demanda: 0,
      tz_inflacion: 0,
      tz_calidad: 0,
      tz_eficiencia: 0,
      tz_referencial: 0,
      costo_referencial: 0,
      precio_sie_referencial: 0,
      precio_sie_tipob: 0,
      precio_venta_privado: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    ...options, // Permite pasar opciones adicionales
  });
};

/**
 * Hook para crear un producto disponible
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useCreateProductoDisponible = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createProductoDisponible,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
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
 * Hook para actualizar un producto disponible
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useUpdateProductoDisponible = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProductoDisponible,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
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
 * Hook para eliminar un producto disponible
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useDeleteProductoDisponible = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteProductoDisponible,
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
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
 * Hook para obtener productos disponibles con paginación infinita
 * @param {Object} filters - Filtros a aplicar a la consulta
 * @param {Object} options - Opciones adicionales para el hook useInfiniteQuery
 * @returns {Object} Objeto con datos, estados y funciones para paginación infinita
 */
export const useInfiniteProductosDisponibles = (filters = {}, options = {}) => {
  // Aseguramos que page_size siempre tenga un valor
  const pageSize = filters.page_size || 10;
  
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.list(filters),
    queryFn: ({ pageParam = 1 }) => fetchProductosDisponibles({ ...filters, page: pageParam, page_size: pageSize }),
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

export const productoDisponibleService = {
  fetchProductosDisponibles,
  fetchProductoDisponibleById,
  createProductoDisponible,
  updateProductoDisponible,
  deleteProductoDisponible,
};

export default productoDisponibleService;