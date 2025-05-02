// pandora/src/modulos/basic/routes/BasicRoutes.jsx

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy loading de componentes de categorías
const CategoriaPage = lazy(() => import('../pages/categorias/categoriaPage'));
const AddCategoriaPage = lazy(() => import('../pages/categorias/addcategoriaPage'));
const DetalleCategoria = lazy(() => import('../pages/categorias/detalleCategoria'));
const CategoriasInfinitePage = lazy(() => import('../pages/categorias/CategoriasInfinitePage'));

// Lazy loading de componentes de ciudades
const CiudadPage = lazy(() => import('../pages/ciudades/ciudadPage'));
const AddCiudadPage = lazy(() => import('../pages/ciudades/addCiudadPage'));
const DetalleCiudad = lazy(() => import('../pages/ciudades/detalleCiudad'));
const CiudadesInfinitePage = lazy(() => import('../pages/ciudades/CiudadesInfinitePage'));

// Lazy loading de componentes de marcas
const MarcaPage = lazy(() => import('../pages/marcas/marcaPage'));
const AddMarcaPage = lazy(() => import('../pages/marcas/addMarcaPage'));
const DetalleMarca = lazy(() => import('../pages/marcas/detalleMarca'));
const MarcasInfinitePage = lazy(() => import('../pages/marcas/MarcasInfinitePage'));

// Lazy loading de componentes de ejemplo
const CamposDinamicosPage = lazy(() => import('../pages/ejemplos/CamposDinamicosPage'));

// Lazy loading de componentes de zonas
const ZonaPage = lazy(() => import('../pages/zonas/zonaPage'));
const AddZonaPage = lazy(() => import('../pages/zonas/addZonaPage'));
const DetalleZona = lazy(() => import('../pages/zonas/detalleZona'));
const ZonasInfinitePage = lazy(() => import('../pages/zonas/ZonasInfinitePage'));

// Lazy loading de otros componentes


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
          
          {/* Rutas de Categorías - El orden importa */}
          <Route path="categorias" element={<CategoriaPage />} />
          <Route path="categorias/infinite" element={<CategoriasInfinitePage />} />
          <Route path="categorias/add" element={<AddCategoriaPage />} />
          <Route path="categorias/edit/:id" element={<AddCategoriaPage />} />
          <Route path="categorias/:id" element={<DetalleCategoria />} />
          
          {/* Rutas de Ciudades - El orden importa */}
          <Route path="ciudades" element={<CiudadPage />} />
          <Route path="ciudades/infinite" element={<CiudadesInfinitePage />} />
          <Route path="ciudades/add" element={<AddCiudadPage />} />
          <Route path="ciudades/edit/:id" element={<AddCiudadPage />} />
          <Route path="ciudades/:id" element={<DetalleCiudad />} />
          
          {/* Rutas de Marcas - El orden importa */}
          <Route path="marcas" element={<MarcaPage />} />
          <Route path="marcas/infinite" element={<MarcasInfinitePage />} />
          <Route path="marcas/add" element={<AddMarcaPage />} />
          <Route path="marcas/edit/:id" element={<AddMarcaPage />} />
          <Route path="marcas/:id" element={<DetalleMarca />} />
          
          {/* Rutas de Zonas - El orden importa */}
          <Route path="zonas" element={<ZonaPage />} />
          <Route path="zonas/infinite" element={<ZonasInfinitePage />} />
          <Route path="zonas/add" element={<AddZonaPage />} />
          <Route path="zonas/edit/:id" element={<AddZonaPage />} />
          <Route path="zonas/:id" element={<DetalleZona />} />
          
          {/* Rutas de ejemplos */}
          <Route path="ejemplos/campos-dinamicos" element={<CamposDinamicosPage />} />
          
          {/* Aquí agregarías rutas para los demás componentes básicos */}
          <Route path="*" element={<Navigate to="categorias" replace />} />
        </Routes>
      </Suspense>
    </BasicLayout>
  );
};

export default BasicRoutes;