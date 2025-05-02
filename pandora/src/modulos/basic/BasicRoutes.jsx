// pandora/src/modulos/basic/BasicRoutes.jsx

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy loading de componentes de categorías
const CategoriaPage = lazy(() => import('./categorias/categoriaPage'));
const AddCategoriaPage = lazy(() => import('./categorias/addcategoriaPage'));
const DetalleCategoria = lazy(() => import('./categorias/detalleCategoria'));

// Lazy loading de otros componentes (ciudades, etc.)


// Componente Loader para Suspense
const BasicModuleLoader = () => (
  <div className="flex justify-center items-center h-full w-full min-h-[200px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

// Layout del módulo Basic
const BasicLayout = ({ children }) => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Módulo de Datos Básicos</h1>
      <div className="mt-4">
        {children}
      </div>
    </div>
  );
};

const BasicRoutes = () => {
  return (
    <BasicLayout>
      <Suspense fallback={<BasicModuleLoader />}>
        <Routes>
          {/* Ruta por defecto del módulo basic */}
          <Route index element={<Navigate to="categorias" replace />} />
          
          {/* Rutas de Categorías */}
          <Route path="categorias" element={<CategoriaPage />} />
          <Route path="categorias/add" element={<AddCategoriaPage />} />
          <Route path="categorias/:id" element={<DetalleCategoria />} />
          <Route path="categorias/edit/:id" element={<AddCategoriaPage />} />
          
        
          
          {/* Aquí agregarías rutas para los demás componentes básicos */}
          <Route path="*" element={<Navigate to="categorias" replace />} />
        </Routes>
      </Suspense>
    </BasicLayout>
  );
};

export default BasicRoutes;