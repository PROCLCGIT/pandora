/**
 * Wrapper de prefetch para rutas de productos
 * Implementa prefetching inteligente y manejo de Suspense
 */

import React, { Suspense, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation, useParams } from 'react-router-dom';
import { prefetchProductos } from '../../api/productosQueryService.js';
import { ProductosListSkeleton, ProductoDetailSkeleton, ProductoFormSkeleton } from '../skeletons/ProductosSkeleton.jsx';

/**
 * Map de rutas a sus respectivos skeletons
 */
const ROUTE_SKELETONS = {
  list: ProductosListSkeleton,
  detail: ProductoDetailSkeleton,
  form: ProductoFormSkeleton,
  default: ProductosListSkeleton
};

/**
 * Hook para detectar el tipo de página actual
 */
const usePageType = () => {
  const location = useLocation();
  const params = useParams();
  
  // Detectar tipo de página basado en la ruta
  if (location.pathname.includes('/add') || location.pathname.includes('/edit')) {
    return 'form';
  }
  
  if (params.id && !location.pathname.includes('/add') && !location.pathname.includes('/edit')) {
    return 'detail';
  }
  
  return 'list';
};

/**
 * Hook para prefetch inteligente basado en navegación
 */
const usePrefetchStrategy = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const params = useParams();
  
  useEffect(() => {
    const prefetchData = async () => {
      const pathname = location.pathname;
      
      try {
        // Prefetch para páginas de lista de productos ofertados
        if (pathname.includes('productos-ofertados') && !params.id) {
          await prefetchProductos.ofertados(queryClient);
          
          // Prefetch adicional: primera página de disponibles para navegación rápida
          setTimeout(() => {
            prefetchProductos.disponibles(queryClient);
          }, 1000);
        }
        
        // Prefetch para páginas de lista de productos disponibles
        else if (pathname.includes('productos-disponibles') && !params.id) {
          await prefetchProductos.disponibles(queryClient);
          
          // Prefetch adicional: primera página de ofertados para navegación rápida
          setTimeout(() => {
            prefetchProductos.ofertados(queryClient);
          }, 1000);
        }
        
        // Prefetch para detalle de producto ofertado
        else if (pathname.includes('productos-ofertados') && params.id) {
          await prefetchProductos.detalleOfertado(queryClient, params.id);
        }
        
        // Prefetch para detalle de producto disponible
        else if (pathname.includes('productos-disponibles') && params.id) {
          await prefetchProductos.detalleDisponible(queryClient, params.id);
        }
        
        // Prefetch para páginas de formulario (agregar/editar)
        else if (pathname.includes('/add') || pathname.includes('/edit')) {
          // Prefetch de listas para después de crear/editar
          if (pathname.includes('productos-ofertados')) {
            prefetchProductos.ofertados(queryClient);
          } else if (pathname.includes('productos-disponibles')) {
            prefetchProductos.disponibles(queryClient);
          }
          
          // Si es edición, prefetch del detalle
          if (params.id && pathname.includes('/edit')) {
            if (pathname.includes('productos-ofertados')) {
              prefetchProductos.detalleOfertado(queryClient, params.id);
            } else if (pathname.includes('productos-disponibles')) {
              prefetchProductos.detalleDisponible(queryClient, params.id);
            }
          }
        }
        
        // Prefetch general para página principal del módulo
        else if (pathname === '/productos' || pathname.endsWith('/productos/')) {
          await prefetchProductos.all(queryClient);
        }
        
      } catch (error) {
        console.warn('Prefetch failed:', error);
        // No hacer nada en caso de error de prefetch - la página funcionará normalmente
      }
    };

    // Ejecutar prefetch con pequeño delay para no bloquear la navegación
    const timeoutId = setTimeout(prefetchData, 50);
    
    return () => clearTimeout(timeoutId);
  }, [location.pathname, params.id, queryClient]);
};

/**
 * Componente de error boundary específico para productos
 */
class ProductosErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ProductosErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="text-center space-y-4">
            <div className="text-6xl">😔</div>
            <h2 className="text-2xl font-bold text-gray-900">
              Algo salió mal
            </h2>
            <p className="text-gray-600 max-w-md">
              Ha ocurrido un error inesperado. Por favor, recarga la página o intenta nuevamente.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Recargar página
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Intentar nuevamente
              </button>
            </div>
            
            {/* Mostrar error en desarrollo */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  Detalles del error (desarrollo)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-w-md">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Componente wrapper principal con prefetch y Suspense
 */
export const ProductosPrefetchWrapper = ({ 
  children, 
  skeletonType = 'default',
  enablePrefetch = true,
  fallback = null 
}) => {
  const pageType = usePageType();
  
  // Aplicar estrategia de prefetch si está habilitada
  if (enablePrefetch) {
    usePrefetchStrategy();
  }
  
  // Seleccionar skeleton apropiado
  const SkeletonComponent = ROUTE_SKELETONS[skeletonType] || ROUTE_SKELETONS[pageType] || ROUTE_SKELETONS.default;
  const defaultFallback = fallback || <SkeletonComponent />;

  return (
    <ProductosErrorBoundary>
      <Suspense fallback={defaultFallback}>
        {children}
      </Suspense>
    </ProductosErrorBoundary>
  );
};

/**
 * HOC para wrappear páginas con prefetch automático
 */
export const withProductosPrefetch = (WrappedComponent, options = {}) => {
  const ComponentWithPrefetch = (props) => (
    <ProductosPrefetchWrapper {...options}>
      <WrappedComponent {...props} />
    </ProductosPrefetchWrapper>
  );
  
  ComponentWithPrefetch.displayName = `withProductosPrefetch(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return ComponentWithPrefetch;
};

/**
 * Hook para controlar prefetch manualmente
 */
export const usePrefetchProductos = () => {
  const queryClient = useQueryClient();
  
  return {
    prefetchOfertados: (params) => prefetchProductos.ofertados(queryClient, params),
    prefetchDisponibles: (params) => prefetchProductos.disponibles(queryClient, params),
    prefetchDetalleOfertado: (id) => prefetchProductos.detalleOfertado(queryClient, id),
    prefetchDetalleDisponible: (id) => prefetchProductos.detalleDisponible(queryClient, id),
    prefetchAll: (params) => prefetchProductos.all(queryClient, params)
  };
};

export default ProductosPrefetchWrapper;