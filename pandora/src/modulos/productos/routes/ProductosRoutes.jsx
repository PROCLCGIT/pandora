// /pandora/src/modulos/productos/routes/ProductosRoutes.jsx

import { lazy, Suspense } from 'react';
import { Navigate, Outlet, useRoutes } from 'react-router-dom';
import { ProductosPrefetchWrapper } from '../components/prefetch/ProductosPrefetchWrapper.jsx';

// Lazy loading de páginas de productos ofertados
const ProductosOfertadosPage = lazy(() => import('../pages/productosOfertados/ProductosOfertadosPage'));
const AddProductoOfertadoPage = lazy(() => import('../pages/productosOfertados/AddProductoOfertadoPage'));
const DetalleProductoOfertado = lazy(() => import('../pages/productosOfertados/DetalleProductoOfertado'));
//const ProductosOfertadosInfinitePage = lazy(() => import('../pages/productosOfertados/ProductosOfertadosInfinitePage'));

// Lazy loading de páginas de productos disponibles
const ProductosDisponiblesPage = lazy(() => import('../pages/productosDisponibles/ProductosDisponiblesPage'));
const AddProductoDisponiblePage = lazy(() => import('../pages/productosDisponibles/AddProductoDisponiblePage'));
const DetalleProductoDisponible = lazy(() => import('../pages/productosDisponibles/DetalleProductoDisponible'));
//const ProductosDisponiblesInfinitePage = lazy(() => import('../pages/productosDisponibles/ProductosDisponiblesInfinitePage'));

// Lazy loading de página de configuración
const ConfiguracionPage = lazy(() => import('../pages/ConfiguracionPage'));

// Componente Loader básico de fallback
const ProductsModuleLoader = () => (
  <div className="flex justify-center items-center h-full w-full min-h-[200px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

// Layout del módulo de Productos con prefetch
const ProductosLayout = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Productos</h1>
      <div className="mt-4">
        <ProductosPrefetchWrapper enablePrefetch={true}>
          <Outlet />
        </ProductosPrefetchWrapper>
      </div>
    </div>
  );
};

// Definición de rutas para este módulo
const productosRoutes = [
  {
    element: <ProductosLayout />,
    children: [
      { index: true, element: <Navigate to="productos-ofertados" replace /> },
      
      // Rutas de Productos Ofertados
      { path: 'productos-ofertados', element: <ProductosOfertadosPage /> },
      //{ path: 'productos-ofertados/infinite', element: <ProductosOfertadosInfinitePage /> },
      { path: 'productos-ofertados/add', element: <AddProductoOfertadoPage /> },
      { path: 'productos-ofertados/edit/:id', element: <AddProductoOfertadoPage /> },
      { path: 'productos-ofertados/:id', element: <DetalleProductoOfertado /> },

      
      // Rutas de Productos Disponibles
      { path: 'productos-disponibles', element: <ProductosDisponiblesPage /> },
      //{ path: 'productos-disponibles/infinite', element: <ProductosDisponiblesInfinitePage /> },
      { path: 'productos-disponibles/add', element: <AddProductoDisponiblePage /> },
      { path: 'productos-disponibles/edit/:id', element: <AddProductoDisponiblePage /> },
      { path: 'productos-disponibles/:id', element: <DetalleProductoDisponible /> },
      
      // Ruta de Configuración
      { path: 'configuracion', element: <ConfiguracionPage /> },
      
      // Ruta de fallback
      { path: '*', element: <Navigate to="productos-ofertados" replace /> }
    ]
  }
];

const ProductosRoutes = () => {
  const element = useRoutes(productosRoutes);
  return element;
};

export default ProductosRoutes;