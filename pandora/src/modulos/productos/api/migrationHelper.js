/**
 * Helper de migración para transicionar de los servicios antiguos al nuevo sistema centralizado
 * Permite una migración gradual sin romper el código existente
 */

import { productosOfertadosQuery, productosDisponiblesQuery } from './productosQueryService.js';
import { useToast } from '../../../hooks/use-toast';

/**
 * Mapeo de hooks antiguos a nuevos para productos ofertados
 * Mantiene compatibilidad con la API existente
 */
export const createOfertadosCompatibility = () => {
  const { toast } = useToast();

  return {
    // Hook de lista compatible con el anterior
    useProductosOfertados: (params = {}, options = {}) => {
      return productosOfertadosQuery.useList(params, {
        ...options,
        onError: (error) => {
          if (options.onError) {
            options.onError(error);
          } else {
            toast({
              title: "Error al cargar productos ofertados",
              description: error?.response?.data?.message || error?.message || "Error desconocido",
              variant: "destructive",
            });
          }
        }
      });
    },

    // Hook de detalle compatible
    useProductoOfertadoDetail: (id, options = {}) => {
      return productosOfertadosQuery.useDetail(id, {
        ...options,
        onError: (error) => {
          if (options.onError) {
            options.onError(error);
          } else {
            toast({
              title: "Error al cargar producto ofertado",
              description: error?.response?.data?.message || error?.message || "Error desconocido",
              variant: "destructive",
            });
          }
        }
      });
    },

    // Hook de infinite query compatible
    useProductosOfertadosInfinite: (params = {}, options = {}) => {
      return productosOfertadosQuery.useInfiniteList(params, options);
    },

    // Hook de creación compatible
    useCreateProductoOfertado: (options = {}) => {
      return productosOfertadosQuery.useCreate({
        toast,
        ...options
      });
    },

    // Hook de actualización compatible
    useUpdateProductoOfertado: (options = {}) => {
      return productosOfertadosQuery.useUpdate({
        toast,
        ...options
      });
    },

    // Hook de eliminación compatible
    useDeleteProductoOfertado: (options = {}) => {
      return productosOfertadosQuery.useDelete({
        toast,
        ...options
      });
    },

    // Exportar query keys para compatibilidad
    QUERY_KEYS: productosOfertadosQuery.queryKeys
  };
};

/**
 * Mapeo de hooks antiguos a nuevos para productos disponibles
 */
export const createDisponiblesCompatibility = () => {
  const { toast } = useToast();

  return {
    // Hook de lista compatible con el anterior
    useProductosDisponibles: (params = {}, options = {}) => {
      return productosDisponiblesQuery.useList(params, {
        ...options,
        onError: (error) => {
          if (options.onError) {
            options.onError(error);
          } else {
            toast({
              title: "Error al cargar productos disponibles",
              description: error?.response?.data?.message || error?.message || "Error desconocido",
              variant: "destructive",
            });
          }
        }
      });
    },

    // Hook de detalle compatible
    useProductoDisponibleDetail: (id, options = {}) => {
      return productosDisponiblesQuery.useDetail(id, {
        ...options,
        onError: (error) => {
          if (options.onError) {
            options.onError(error);
          } else {
            toast({
              title: "Error al cargar producto disponible",
              description: error?.response?.data?.message || error?.message || "Error desconocido",
              variant: "destructive",
            });
          }
        }
      });
    },

    // Hook de infinite query compatible
    useProductosDisponiblesInfinite: (params = {}, options = {}) => {
      return productosDisponiblesQuery.useInfiniteList(params, options);
    },

    // Hook de creación compatible
    useCreateProductoDisponible: (options = {}) => {
      return productosDisponiblesQuery.useCreate({
        toast,
        ...options
      });
    },

    // Hook de actualización compatible
    useUpdateProductoDisponible: (options = {}) => {
      return productosDisponiblesQuery.useUpdate({
        toast,
        ...options
      });
    },

    // Hook de eliminación compatible
    useDeleteProductoDisponible: (options = {}) => {
      return productosDisponiblesQuery.useDelete({
        toast,
        ...options
      });
    },

    // Exportar query keys para compatibilidad
    QUERY_KEYS: productosDisponiblesQuery.queryKeys
  };
};

/**
 * Función para migrar gradualmente un componente
 * Permite habilitar la nueva API de forma progresiva
 */
export const useMigratedProductosQuery = (type = 'ofertados', enableNewAPI = false) => {
  if (!enableNewAPI) {
    // Usar la API antigua (importar dinámicamente para no romper)
    console.warn(`Usando API antigua para ${type}. Considera migrar a la nueva API.`);
    return null;
  }

  // Usar la nueva API centralizada
  if (type === 'ofertados') {
    return productosOfertadosQuery;
  } else if (type === 'disponibles') {
    return productosDisponiblesQuery;
  }

  throw new Error(`Tipo de producto desconocido: ${type}`);
};

/**
 * Utilidad para comparar rendimiento entre APIs
 */
export const createPerformanceMonitor = (componentName) => {
  return {
    startMeasure: (operation) => {
      if (import.meta.env.DEV) {
        performance.mark(`${componentName}-${operation}-start`);
      }
    },

    endMeasure: (operation) => {
      if (import.meta.env.DEV) {
        performance.mark(`${componentName}-${operation}-end`);
        performance.measure(
          `${componentName}-${operation}`,
          `${componentName}-${operation}-start`,
          `${componentName}-${operation}-end`
        );
        
        const measure = performance.getEntriesByName(`${componentName}-${operation}`)[0];
        console.log(`[Performance] ${componentName} ${operation}: ${measure.duration.toFixed(2)}ms`);
      }
    }
  };
};

/**
 * Hook para facilitar la migración progresiva
 */
export const useMigrationStatus = (componentName) => {
  const isNewAPIEnabled = localStorage.getItem(`productos_new_api_${componentName}`) === 'true';
  
  const enableNewAPI = () => {
    localStorage.setItem(`productos_new_api_${componentName}`, 'true');
    window.location.reload(); // Recargar para aplicar cambios
  };

  const disableNewAPI = () => {
    localStorage.setItem(`productos_new_api_${componentName}`, 'false');
    window.location.reload();
  };

  return {
    isNewAPIEnabled,
    enableNewAPI,
    disableNewAPI
  };
};

/**
 * Wrapper para componentes en migración
 */
export const withMigrationSupport = (WrappedComponent, componentName) => {
  const ComponentWithMigration = (props) => {
    const { isNewAPIEnabled } = useMigrationStatus(componentName);
    
    return (
      <WrappedComponent 
        {...props} 
        useNewAPI={isNewAPIEnabled}
        migrationUtils={{
          componentName,
          isNewAPIEnabled
        }}
      />
    );
  };

  ComponentWithMigration.displayName = `withMigrationSupport(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return ComponentWithMigration;
};

/**
 * Exportaciones para facilitar la migración
 */
export const MigrationAPI = {
  // Servicios nuevos
  ofertados: productosOfertadosQuery,
  disponibles: productosDisponiblesQuery,
  
  // Compatibilidad
  ofertadosCompat: createOfertadosCompatibility,
  disponiblesCompat: createDisponiblesCompatibility,
  
  // Utilidades
  useMigratedQuery: useMigratedProductosQuery,
  usePerformanceMonitor: createPerformanceMonitor,
  useMigrationStatus,
  withMigrationSupport
};

export default MigrationAPI;