// /pandora/src/modulos/productos/api/productoOfertadoService.js

import api from '../../../config/axios';
import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

// Función de utilidad para logs solo en desarrollo
const debug = (...args) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

// Constantes
const RESOURCE_URL = '/productos/productos-ofertados/';
// Definir keys en formato array para mejor manejo de invalidaciones y cash
export const QUERY_KEYS = {
  all: ['productos', 'ofertados'],
  lists: () => [...QUERY_KEYS.all, 'list'],
  list: (filters) => [...QUERY_KEYS.lists(), filters],
  details: () => [...QUERY_KEYS.all, 'detail'],
  detail: (id) => [...QUERY_KEYS.details(), id],
};
// Mantener compatibilidad con código existente
const QUERY_KEY = 'productosOfertados';

/**
 * Obtiene lista de productos ofertados con posibilidad de filtrado y paginación
 * @param {Object} params - Parámetros de filtrado y paginación
 * @returns {Promise} Promesa con datos de productos ofertados
 */
const fetchProductosOfertados = async (params = {}) => {
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
    debug('Error fetching productos ofertados:', error);
    throw error;
  }
};

/**
 * Obtiene un producto ofertado por su ID
 * @param {number|string} id - ID del producto ofertado
 * @returns {Promise} Promesa con datos del producto ofertado
 */
const fetchProductoOfertadoById = async (id) => {
  try {
    const response = await api.get(`${RESOURCE_URL}${id}/`);
    return response.data;
  } catch (error) {
    debug(`Error fetching producto ofertado id ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo producto ofertado
 * @param {Object} data - Datos del producto ofertado a crear
 * @returns {Promise} Promesa con datos del producto ofertado creado
 */
const createProductoOfertado = async (data) => {
  try {
    const isFormData = data instanceof FormData;

    // Manejar específicamente el campo especialidad
    if (isFormData) {
      // Si especialidad es vacía o 'none', eliminarla completamente del FormData
      const especialidad = data.get('especialidad');
      if (!especialidad || especialidad === '' || especialidad === 'none') {
        // Eliminar el campo completamente en lugar de enviarlo vacío o null
        data.delete('especialidad');
        debug('🔍 Eliminando campo especialidad del FormData');
      }

      // Log FormData keys for debugging
      debug('🔍 FormData keys being sent:', Array.from(data.keys()));

      // Log key values that are important for debugging
      debug('🔍 especialidad value:', data.get('especialidad'));
      debug('🔍 id_categoria value:', data.get('id_categoria'));
      debug('🔍 code value:', data.get('code'));
      debug('🔍 cudim value:', data.get('cudim'));
      debug('🔍 nombre value:', data.get('nombre'));

      // Check for file uploads
      debug('🔍 Has image uploads:', data.getAll('uploaded_images').length > 0);
      debug('🔍 Has document uploads:', data.getAll('uploaded_documents').length > 0);

      // Log all form data for debugging
      debug('🔍 Complete FormData contents:');
      for (const pair of data.entries()) {
        debug(`  - ${pair[0]}: ${pair[1]}`);
      }
    }

    // No establecemos manualmente Content-Type para FormData.
    // El navegador (o axios) lo añadirá con el boundary correcto.
    const config = {
      timeout: 60000, // Increase timeout to 60 seconds for uploads
    };

    // Usar la ruta alternativa sin dependencia de file_handler
    debug(`🔄 Sending ${isFormData ? 'FormData' : 'JSON'} to productos-ofertados-simple/`);
    const response = await api.post('/productos/productos-ofertados-simple/', data, config);

    debug('✅ Product created successfully:', response.status, response.statusText);
    return response.data;
  } catch (error) {
    debug('Error creating producto ofertado:', error);

    // Enhanced error logging
    if (error.response) {
      debug('Server responded with error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });

      // If there's detailed error data from server, log it
      if (error.response.data) {
        debug('Detailed error from server:', error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response received
      debug('No response received from server:', {
        requestConfig: error.request.config,
        requestMethod: error.request.method,
        requestURL: error.request.url
      });
    } else {
      // Error during request setup
      debug('Error setting up request:', error.message);
    }

    throw error;
  }
};

/**
 * Actualiza un producto ofertado existente
 * @param {Object} params - Objeto con id y data
 * @param {number|string} params.id - ID del producto ofertado
 * @param {Object} params.data - Datos a actualizar
 * @returns {Promise} Promesa con datos del producto ofertado actualizado
 */
const updateProductoOfertado = async ({ id, data }) => {
  try {
    const isFormData = data instanceof FormData;
    debug(`🔄 Actualizando producto ${id} con FormData:`, isFormData);

    // Si es FormData, mostrar algunas claves para depuración
    if (isFormData) {
      debug('🔍 Contenido del FormData:');
      for (let [key, value] of data.entries()) {
        if (value instanceof File) {
          debug(`  - ${key}: [File: ${value.name}]`);
        } else {
          debug(`  - ${key}: ${value}`);
        }
      }
      
      // Manejar especialidad
      const especialidad = data.get('especialidad');
      if (!especialidad || especialidad === '' || especialidad === 'none') {
        // Si el FormData ya tiene el campo, establecerlo a null
        data.set('especialidad', ''); // Enviar vacío para que el backend lo interprete como null
        debug('⚠️ Especialidad vacía detectada, ajustando a cadena vacía');
      }

      debug('FormData keys después de ajustes:', Array.from(data.keys()));

      // Verificar si hay archivos
      const hasFiles = Array.from(data.keys()).some(key =>
        key === 'uploaded_images' || key === 'uploaded_documents'
      );
      debug('FormData contiene archivos:', hasFiles);

      // Log valores importantes
      debug('🔍 especialidad value:', data.get('especialidad'));
      debug('🔍 id_categoria value:', data.get('id_categoria'));
    }

    debug(`🚀 Enviando actualización a: ${RESOURCE_URL}${id}/`);
    
    const response = await api.put(
      `${RESOURCE_URL}${id}/`,
      data,
      isFormData
        ? {
            // Dejar que axios genere Content-Type con boundary
            timeout: 60000, // 60 segundos
          }
        : undefined
    );

    debug('✅ Respuesta de actualización:', response.status, response.statusText);
    return response.data;
  } catch (error) {
    debug(`❌ Error updating producto ofertado id ${id}:`, error);

    // Mostrar información detallada sobre el error
    if (error.response) {
      // El servidor respondió con un código de error
      debug('Respuesta de error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    } else if (error.request) {
      // La solicitud se realizó pero no se recibió respuesta
      debug('No se recibió respuesta del servidor:', error.request);
    } else {
      // Error al configurar la solicitud
      debug('Error al configurar la solicitud:', error.message);
    }

    throw error;
  }
};

/**
 * Elimina un producto ofertado
 * @param {number|string} id - ID del producto ofertado a eliminar
 * @returns {Promise} Promesa con el ID del producto ofertado eliminado
 */
const deleteProductoOfertado = async (id) => {
  try {
    await api.delete(`${RESOURCE_URL}${id}/`);
    return id;
  } catch (error) {
    debug(`Error deleting producto ofertado id ${id}:`, error);
    throw error;
  }
};

// React Query Hooks

/**
 * Hook para obtener productos ofertados con React Query
 * @param {Object} params - Parámetros de consulta
 * @param {Object} options - Opciones adicionales para el hook useQuery
 * @returns {Object} Objeto con datos, estado de carga y error
 */
export const useProductosOfertados = (params = {}, options = {}) => {
  return useQuery({
    // Usamos la clave estructurada para listas para que coincida con las invalidaciones
    queryKey: QUERY_KEYS.list(params),
    queryFn: () => fetchProductosOfertados(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 1,
    ...options, // Permite pasar opciones adicionales
  });
};

/**
 * Hook para obtener un producto ofertado por ID
 * @param {number|string} id - ID del producto ofertado
 * @param {Object} options - Opciones adicionales para el hook useQuery
 * @returns {Object} Objeto con datos, estado de carga y error
 */
export const useProductoOfertadoById = (id, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => fetchProductoOfertadoById(id),
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
      cudim: '',
      descripcion: '',
      especialidad: '',
      referencias: '',
      is_active: true,
      id_categoria: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    ...options, // Permite pasar opciones adicionales
  });
};

/**
 * Hook para crear un producto ofertado con soporte para Optimistic UI
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useCreateProductoOfertado = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProductoOfertado,

    // Configuración para Optimistic UI
    onMutate: async (newProductData) => {
      const isFormData = newProductData instanceof FormData;

      // Crear un objeto optimista para usar en la UI
      // Si es FormData, intentamos extraer algunos datos básicos para mostrar
      const optimisticProduct = isFormData
        ? {
            id: `temp-${Date.now()}`,
            code: newProductData.get('code') || 'Nuevo producto',
            nombre: newProductData.get('nombre') || 'Cargando...',
            is_active: true,
            // Otros campos con valores por defecto o datos del FormData
            createdAt: new Date().toISOString(),
            _isOptimistic: true // Flag para identificar que es un item optimista
          }
        : {
            ...newProductData,
            id: `temp-${Date.now()}`,
            createdAt: new Date().toISOString(),
            _isOptimistic: true
          };

      // Cancelar consultas en curso para evitar sobrescrituras
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.lists() });

      // Guardar el estado anterior para restaurarlo en caso de error
      const previousProductsData = queryClient.getQueryData(QUERY_KEYS.lists());

      // Si hay opciones de onMutate personalizadas, ejecutarlas
      let customContext = {};
      if (options.onMutate) {
        customContext = await options.onMutate(newProductData);
      }

      // Actualizar la caché con el producto optimista si tenemos datos previos
      if (previousProductsData) {
        try {
          queryClient.setQueryData(QUERY_KEYS.lists(), old => {
            // Si los datos tienen formato paginado
            if (old && old.results) {
              return {
                ...old,
                count: old.count + 1,
                results: [optimisticProduct, ...old.results]
              };
            }
            // Si es un array simple
            return [optimisticProduct, ...(old || [])];
          });
        } catch (error) {
          debug('Error al aplicar actualización optimista:', error);
        }
      }

      // Retornar contexto para usarlo en onError
      return {
        previousProductsData,
        optimisticProduct,
        ...customContext
      };
    },

    // En caso de error, revertir a los datos anteriores
    onError: (err, newProductData, context) => {
      if (context?.previousProductsData) {
        queryClient.setQueryData(QUERY_KEYS.lists(), context.previousProductsData);
      }

      // Mostrar toast con el error
      debug('Error en la mutación:', err);

      // Llamar al callback de error personalizado si existe
      if (options.onError) {
        options.onError(err, newProductData, context);
      }
    },

    // Después de éxito o error, asegurar que los datos estén actualizados
    onSettled: (data, error, variables) => {
      // Invalidar consultas relacionadas para asegurar datos frescos
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });

      // Llamar al callback de onSettled personalizado si existe
      if (options.onSettled) {
        options.onSettled(data, error, variables);
      }
    },

    // En caso de éxito, actualizar la caché y llamar al callback
    onSuccess: (data, variables, context) => {
      // Actualizar el caché de detalles para el nuevo producto
      queryClient.setQueryData(QUERY_KEYS.detail(data.id), data);

      // Llamar al callback de éxito personalizado si existe
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },

    // Incluir otras opciones que se hayan pasado (excepto los callbacks que ya manejamos)
    ...Object.fromEntries(
      Object.entries(options).filter(([key]) =>
        !['onMutate', 'onError', 'onSuccess', 'onSettled'].includes(key)
      )
    ),
  });
};

/**
 * Hook para actualizar un producto ofertado con soporte para Optimistic UI
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useUpdateProductoOfertado = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProductoOfertado,

    // Configuración para Optimistic UI
    onMutate: async ({ id, data }) => {
      const isFormData = data instanceof FormData;

      // Cancelar consultas en curso para evitar sobrescrituras
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.detail(id) });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.lists() });

      // Guardar estados anteriores
      const previousProductData = queryClient.getQueryData(QUERY_KEYS.detail(id));
      const previousProductsData = queryClient.getQueryData(QUERY_KEYS.lists());

      // Si hay opciones de onMutate personalizadas, ejecutarlas
      let customContext = {};
      if (options.onMutate) {
        customContext = await options.onMutate({ id, data });
      }

      // Para FormData, necesitamos extraer algunos campos clave
      // y combinarlos con los datos anteriores
      let optimisticData;

      if (isFormData && previousProductData) {
        optimisticData = {
          ...previousProductData,
          code: data.get('code') || previousProductData.code,
          nombre: data.get('nombre') || previousProductData.nombre,
          is_active: data.get('is_active') === 'true' || previousProductData.is_active,
          _isOptimistic: true
        };
      } else if (!isFormData) {
        // Si no es FormData, usar los datos proporcionados
        optimisticData = {
          ...previousProductData,
          ...data,
          id, // Asegurar que el ID está presente
          _isOptimistic: true
        };
      }

      // Actualizar la caché del detalle si tenemos datos optimistas
      if (optimisticData) {
        try {
          queryClient.setQueryData(QUERY_KEYS.detail(id), optimisticData);

          // También actualizar en la lista si está en caché
          if (previousProductsData) {
            queryClient.setQueryData(QUERY_KEYS.lists(), old => {
              // Si los datos tienen formato paginado
              if (old && old.results) {
                return {
                  ...old,
                  results: old.results.map(item =>
                    item.id === id ? optimisticData : item
                  )
                };
              }
              // Si es un array simple
              return (old || []).map(item =>
                item.id === id ? optimisticData : item
              );
            });
          }
        } catch (error) {
          debug('Error al aplicar actualización optimista:', error);
        }
      }

      // Retornar contexto para usarlo en onError
      return {
        previousProductData,
        previousProductsData,
        optimisticData,
        ...customContext
      };
    },

    // En caso de error, revertir a los datos anteriores
    onError: (err, { id }, context) => {
      // Restaurar datos de detalle
      if (context?.previousProductData) {
        queryClient.setQueryData(QUERY_KEYS.detail(id), context.previousProductData);
      }

      // Restaurar datos de lista
      if (context?.previousProductsData) {
        queryClient.setQueryData(QUERY_KEYS.lists(), context.previousProductsData);
      }

      // Mostrar toast con el error
      debug('Error en la mutación:', err);

      // Llamar al callback de error personalizado si existe
      if (options.onError) {
        options.onError(err, { id }, context);
      }
    },

    // Después de éxito o error, asegurar que los datos estén actualizados
    onSettled: (data, error, variables) => {
      const { id } = variables;

      // Invalidar consultas relacionadas para asegurar datos frescos
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });

      // Llamar al callback de onSettled personalizado si existe
      if (options.onSettled) {
        options.onSettled(data, error, variables);
      }
    },

    // En caso de éxito, actualizar la caché y llamar al callback
    onSuccess: (data, variables, context) => {
      // Actualizar el caché de detalles con los datos reales
      queryClient.setQueryData(QUERY_KEYS.detail(data.id), data);

      // Llamar al callback de éxito personalizado si existe
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },

    // Incluir otras opciones que se hayan pasado (excepto los callbacks que ya manejamos)
    ...Object.fromEntries(
      Object.entries(options).filter(([key]) =>
        !['onMutate', 'onError', 'onSuccess', 'onSettled'].includes(key)
      )
    ),
  });
};

/**
 * Hook para eliminar un producto ofertado con soporte para Optimistic UI
 * @param {Object} options - Opciones adicionales para el hook useMutation
 * @returns {Object} Objeto con función de mutación y estados
 */
export const useDeleteProductoOfertado = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProductoOfertado,

    // Configuración para Optimistic UI
    onMutate: async (id) => {
      // Cancelar consultas en curso para evitar sobrescrituras
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.detail(id) });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.lists() });

      // Guardar estados anteriores
      const previousProductData = queryClient.getQueryData(QUERY_KEYS.detail(id));
      const previousProductsData = queryClient.getQueryData(QUERY_KEYS.lists());

      // Si hay opciones de onMutate personalizadas, ejecutarlas
      let customContext = {};
      if (options.onMutate) {
        customContext = await options.onMutate(id);
      }

      // Remover optimistamente el elemento de la caché
      try {
        // Eliminar de la caché de detalles
        queryClient.removeQueries({ queryKey: QUERY_KEYS.detail(id) });

        // Eliminar de la lista si está en caché
        if (previousProductsData) {
          queryClient.setQueryData(QUERY_KEYS.lists(), old => {
            // Si los datos tienen formato paginado
            if (old && old.results) {
              return {
                ...old,
                count: Math.max(0, old.count - 1),
                results: old.results.filter(item => item.id !== id)
              };
            }
            // Si es un array simple
            return (old || []).filter(item => item.id !== id);
          });
        }
      } catch (error) {
        debug('Error al aplicar eliminación optimista:', error);
      }

      // Retornar contexto para usarlo en onError
      return {
        previousProductData,
        previousProductsData,
        ...customContext
      };
    },

    // En caso de error, revertir a los datos anteriores
    onError: (err, id, context) => {
      // Restaurar datos de detalle
      if (context?.previousProductData) {
        queryClient.setQueryData(QUERY_KEYS.detail(id), context.previousProductData);
      }

      // Restaurar datos de lista
      if (context?.previousProductsData) {
        queryClient.setQueryData(QUERY_KEYS.lists(), context.previousProductsData);
      }

      // Mostrar toast con el error
      debug('Error al eliminar producto:', err);

      // Llamar al callback de error personalizado si existe
      if (options.onError) {
        options.onError(err, id, context);
      }
    },

    // Después de éxito o error, asegurar que los datos estén actualizados
    onSettled: (data, error, variables) => {
      const id = variables; // El id es el argumento que se pasa a la mutación

      // Invalidar consultas relacionadas para asegurar datos frescos
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });

      // Llamar al callback de onSettled personalizado si existe
      if (options.onSettled) {
        options.onSettled(data, error, variables);
      }
    },

    // En caso de éxito, remover completamente de la caché y llamar al callback
    onSuccess: (_, id, context) => {
      // Remover completamente de la caché
      queryClient.removeQueries({ queryKey: QUERY_KEYS.detail(id) });

      // Llamar al callback de éxito personalizado si existe
      if (options.onSuccess) {
        options.onSuccess(id, id, context);
      }
    },

    // Incluir otras opciones que se hayan pasado (excepto los callbacks que ya manejamos)
    ...Object.fromEntries(
      Object.entries(options).filter(([key]) =>
        !['onMutate', 'onError', 'onSuccess', 'onSettled'].includes(key)
      )
    ),
  });
};

/**
 * Hook para obtener productos ofertados con paginación infinita
 * @param {Object} filters - Filtros a aplicar a la consulta
 * @param {Object} options - Opciones adicionales para el hook useInfiniteQuery
 * @returns {Object} Objeto con datos, estados y funciones para paginación infinita
 */
export const useInfiniteProductosOfertados = (filters = {}, options = {}) => {
  // Aseguramos que page_size siempre tenga un valor
  const pageSize = filters.page_size || 10;
  
  return useInfiniteQuery({
    queryKey: [QUERY_KEY, 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => fetchProductosOfertados({ ...filters, page: pageParam, page_size: pageSize }),
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

export const productoOfertadoService = {
  fetchProductosOfertados,
  fetchProductoOfertadoById,
  createProductoOfertado,
  updateProductoOfertado,
  deleteProductoOfertado,
};

export default productoOfertadoService;