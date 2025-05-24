/**
 * Servicio centralizado para todas las consultas de productos
 * Elimina duplicación entre productos ofertados y disponibles
 */

import { 
  useQuery, 
  useInfiniteQuery, 
  useMutation, 
  useQueryClient 
} from '@tanstack/react-query';
import { 
  createFetchFunction,
  createQueryKeys,
  createInvalidationPattern,
  DEFAULT_QUERY_CONFIG,
  LIST_QUERY_CONFIG,
  DETAIL_QUERY_CONFIG,
  INFINITE_QUERY_CONFIG,
  handleQueryError,
  handleQuerySuccess
} from './baseQueryService.js';

/**
 * Configuración de recursos
 */
const RECURSOS = {
  OFERTADOS: {
    name: 'ofertados',
    url: '/productos/productos-ofertados/',
    displayName: 'Productos Ofertados'
  },
  DISPONIBLES: {
    name: 'disponibles', 
    url: '/productos/productos-disponibles/',
    displayName: 'Productos Disponibles'
  }
};

/**
 * Factory para crear servicios de productos
 */
const createProductoService = (recurso) => {
  const { name, url, displayName } = recurso;
  const fetchFunctions = createFetchFunction(url);
  const queryKeys = createQueryKeys(name);

  /**
   * Hook para obtener lista paginada
   */
  const useList = (params = {}, options = {}) => {
    return useQuery({
      queryKey: queryKeys.list(params),
      queryFn: () => fetchFunctions.fetchList(params),
      ...LIST_QUERY_CONFIG,
      ...options
    });
  };

  /**
   * Hook para infinite query (scroll infinito)
   */
  const useInfiniteList = (params = {}, options = {}) => {
    return useInfiniteQuery({
      queryKey: queryKeys.infinite(params),
      queryFn: ({ pageParam = 1 }) => 
        fetchFunctions.fetchList({ ...params, page: pageParam }),
      ...INFINITE_QUERY_CONFIG,
      ...options
    });
  };

  /**
   * Hook para obtener detalle por ID
   */
  const useDetail = (id, options = {}) => {
    return useQuery({
      queryKey: queryKeys.detail(id),
      queryFn: () => fetchFunctions.fetchById(id),
      enabled: !!id,
      ...DETAIL_QUERY_CONFIG,
      ...options
    });
  };

  /**
   * Hook para crear nuevo producto
   */
  const useCreate = (options = {}) => {
    const queryClient = useQueryClient();
    const invalidation = createInvalidationPattern(queryClient, queryKeys);

    return useMutation({
      mutationFn: fetchFunctions.create,
      onSuccess: (data, variables, context) => {
        // Invalidar listas
        invalidation.invalidateLists();
        
        // Notificación de éxito
        if (options.toast) {
          handleQuerySuccess(options.toast, `${displayName} creado`, `Se ha creado exitosamente`);
        }
        
        // Callback personalizado
        options.onSuccess?.(data, variables, context);
      },
      onError: (error, variables, context) => {
        if (options.toast) {
          handleQueryError(error, options.toast, `Error al crear ${displayName.toLowerCase()}`);
        }
        options.onError?.(error, variables, context);
      },
      ...options
    });
  };

  /**
   * Hook para actualizar producto existente
   */
  const useUpdate = (options = {}) => {
    const queryClient = useQueryClient();
    const invalidation = createInvalidationPattern(queryClient, queryKeys);

    return useMutation({
      mutationFn: fetchFunctions.update,
      onMutate: async ({ id, data }) => {
        // Cancelar queries en curso
        await queryClient.cancelQueries({ queryKey: queryKeys.detail(id) });
        
        // Obtener datos anteriores para rollback
        const previousData = queryClient.getQueryData(queryKeys.detail(id));
        
        // Actualización optimista
        if (previousData) {
          queryClient.setQueryData(queryKeys.detail(id), { ...previousData, ...data });
        }
        
        return { previousData, id };
      },
      onSuccess: (data, variables, context) => {
        // Actualizar caché con datos reales del servidor
        invalidation.setQueryData(queryKeys.detail(variables.id), data);
        
        // Invalidar listas para reflejar cambios
        invalidation.invalidateLists();
        
        if (options.toast) {
          handleQuerySuccess(options.toast, `${displayName} actualizado`, `Se ha actualizado exitosamente`);
        }
        
        options.onSuccess?.(data, variables, context);
      },
      onError: (error, variables, context) => {
        // Rollback en caso de error
        if (context?.previousData) {
          invalidation.setQueryData(queryKeys.detail(context.id), context.previousData);
        }
        
        if (options.toast) {
          handleQueryError(error, options.toast, `Error al actualizar ${displayName.toLowerCase()}`);
        }
        options.onError?.(error, variables, context);
      },
      ...options
    });
  };

  /**
   * Hook para actualización parcial (PATCH)
   */
  const usePartialUpdate = (options = {}) => {
    const queryClient = useQueryClient();
    const invalidation = createInvalidationPattern(queryClient, queryKeys);

    return useMutation({
      mutationFn: fetchFunctions.partialUpdate,
      onMutate: async ({ id, data }) => {
        await queryClient.cancelQueries({ queryKey: queryKeys.detail(id) });
        const previousData = queryClient.getQueryData(queryKeys.detail(id));
        
        if (previousData) {
          queryClient.setQueryData(queryKeys.detail(id), { ...previousData, ...data });
        }
        
        return { previousData, id };
      },
      onSuccess: (data, variables, context) => {
        invalidation.setQueryData(queryKeys.detail(variables.id), data);
        invalidation.invalidateLists();
        
        if (options.toast) {
          handleQuerySuccess(options.toast, `${displayName} actualizado`);
        }
        
        options.onSuccess?.(data, variables, context);
      },
      onError: (error, variables, context) => {
        if (context?.previousData) {
          invalidation.setQueryData(queryKeys.detail(context.id), context.previousData);
        }
        
        if (options.toast) {
          handleQueryError(error, options.toast, `Error al actualizar ${displayName.toLowerCase()}`);
        }
        options.onError?.(error, variables, context);
      },
      ...options
    });
  };

  /**
   * Hook para eliminar producto
   */
  const useDelete = (options = {}) => {
    const queryClient = useQueryClient();
    const invalidation = createInvalidationPattern(queryClient, queryKeys);

    return useMutation({
      mutationFn: fetchFunctions.remove,
      onSuccess: (data, variables, context) => {
        // Remover de caché
        invalidation.removeQuery(queryKeys.detail(variables));
        
        // Invalidar listas
        invalidation.invalidateLists();
        
        if (options.toast) {
          handleQuerySuccess(options.toast, `${displayName} eliminado`, `Se ha eliminado exitosamente`);
        }
        
        options.onSuccess?.(data, variables, context);
      },
      onError: (error, variables, context) => {
        if (options.toast) {
          handleQueryError(error, options.toast, `Error al eliminar ${displayName.toLowerCase()}`);
        }
        options.onError?.(error, variables, context);
      },
      ...options
    });
  };

  /**
   * Funciones de prefetch para optimización de navegación
   */
  const prefetch = {
    list: async (params = {}, queryClient) => {
      const invalidation = createInvalidationPattern(queryClient, queryKeys);
      await invalidation.prefetch(
        queryKeys.list(params),
        () => fetchFunctions.fetchList(params),
        LIST_QUERY_CONFIG
      );
    },
    
    detail: async (id, queryClient) => {
      const invalidation = createInvalidationPattern(queryClient, queryKeys);
      await invalidation.prefetch(
        queryKeys.detail(id),
        () => fetchFunctions.fetchById(id),
        DETAIL_QUERY_CONFIG
      );
    },
    
    infinite: async (params = {}, queryClient) => {
      const invalidation = createInvalidationPattern(queryClient, queryKeys);
      await invalidation.prefetch(
        queryKeys.infinite(params),
        () => fetchFunctions.fetchList({ ...params, page: 1 }),
        INFINITE_QUERY_CONFIG
      );
    }
  };

  return {
    // Hooks
    useList,
    useInfiniteList,
    useDetail,
    useCreate,
    useUpdate,
    usePartialUpdate,
    useDelete,
    
    // Prefetch
    prefetch,
    
    // Utilidades
    queryKeys,
    invalidation: (queryClient) => createInvalidationPattern(queryClient, queryKeys),
    
    // Metadatos
    meta: {
      name,
      url,
      displayName
    }
  };
};

/**
 * Servicios específicos para cada tipo de producto
 */
export const productosOfertadosQuery = createProductoService(RECURSOS.OFERTADOS);
export const productosDisponiblesQuery = createProductoService(RECURSOS.DISPONIBLES);

/**
 * Hook combinado para acceder a ambos servicios
 */
export const useProductosQuery = () => ({
  ofertados: productosOfertadosQuery,
  disponibles: productosDisponiblesQuery
});

/**
 * Funciones de prefetch globales para optimización de rutas
 */
export const prefetchProductos = {
  /**
   * Prefetch para la página de productos ofertados
   */
  ofertados: async (queryClient, params = {}) => {
    await productosOfertadosQuery.prefetch.list(params, queryClient);
  },
  
  /**
   * Prefetch para la página de productos disponibles
   */
  disponibles: async (queryClient, params = {}) => {
    await productosDisponiblesQuery.prefetch.list(params, queryClient);
  },
  
  /**
   * Prefetch para detalle de producto ofertado
   */
  detalleOfertado: async (queryClient, id) => {
    await productosOfertadosQuery.prefetch.detail(id, queryClient);
  },
  
  /**
   * Prefetch para detalle de producto disponible
   */
  detalleDisponible: async (queryClient, id) => {
    await productosDisponiblesQuery.prefetch.detail(id, queryClient);
  },
  
  /**
   * Prefetch múltiple para dashboard o páginas que muestran ambos tipos
   */
  all: async (queryClient, params = {}) => {
    await Promise.all([
      productosOfertadosQuery.prefetch.list(params, queryClient),
      productosDisponiblesQuery.prefetch.list(params, queryClient)
    ]);
  }
};

/**
 * Exportar query keys para uso externo si es necesario
 */
export const QUERY_KEYS = {
  OFERTADOS: productosOfertadosQuery.queryKeys,
  DISPONIBLES: productosDisponiblesQuery.queryKeys
};