// pandora/src/modulos/basic/routes/BasicRoutes.jsx

import { lazy, Suspense } from 'react';
import { Navigate, Outlet, useRoutes } from 'react-router-dom';

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

// Lazy loading de componentes de empresas CLC
const EmpresaPage = lazy(() => import('../pages/empresas/empresaPage'));
const AddEmpresaPage = lazy(() => import('../pages/empresas/addEmpresaPage'));
const DetalleEmpresa = lazy(() => import('../pages/empresas/detalleEmpresa'));
const EmpresasInfinitePage = lazy(() => import('../pages/empresas/EmpresasInfinitePage'));

// Lazy loading de componentes de especialidades
const EspecialidadPage = lazy(() => import('../pages/especialidades/especialidadPage'));
const AddEspecialidadPage = lazy(() => import('../pages/especialidades/addEspecialidadPage'));
const DetalleEspecialidad = lazy(() => import('../pages/especialidades/detalleEspecialidad'));
const EspecialidadesInfinitePage = lazy(() => import('../pages/especialidades/EspecialidadesInfinitePage'));

// Lazy loading de componentes de marcas
const MarcaPage = lazy(() => import('../pages/marcas/marcaPage'));
const AddMarcaPage = lazy(() => import('../pages/marcas/addMarcaPage'));
const DetalleMarca = lazy(() => import('../pages/marcas/detalleMarca'));
const MarcasInfinitePage = lazy(() => import('../pages/marcas/MarcasInfinitePage'));

// Lazy loading de componentes de procedencias
const ProcedenciaPage = lazy(() => import('../pages/procedencias/procedenciaPage'));
const AddProcedenciaPage = lazy(() => import('../pages/procedencias/addProcedenciaPage'));
const DetalleProcedencia = lazy(() => import('../pages/procedencias/detalleProcedencia'));
const ProcedenciasInfinitePage = lazy(() => import('../pages/procedencias/ProcedenciasInfinitePage'));

// Lazy loading de componentes de tipos de cliente
const TipoClientePage = lazy(() => import('../pages/tiposcliente/tipoClientePage'));
const AddTipoClientePage = lazy(() => import('../pages/tiposcliente/addTipoClientePage'));
const DetalleTipoCliente = lazy(() => import('../pages/tiposcliente/detalleTipoCliente'));
const TiposClienteInfinitePage = lazy(() => import('../pages/tiposcliente/TiposClienteInfinitePage'));

// Lazy loading de componentes de tipos de contratación
const TipoContratacionPage = lazy(() => import('../pages/tiposcontratacion/tipoContratacionPage'));
const AddTipoContratacionPage = lazy(() => import('../pages/tiposcontratacion/addTipoContratacionPage'));
const DetalleTipoContratacion = lazy(() => import('../pages/tiposcontratacion/detalleTipoContratacion'));
const TiposContratacionInfinitePage = lazy(() => import('../pages/tiposcontratacion/TiposContratacionInfinitePage'));

// Lazy loading de componentes de unidades
const UnidadPage = lazy(() => import('../pages/unidades/unidadPage'));
const AddUnidadPage = lazy(() => import('../pages/unidades/addUnidadPage'));
const DetalleUnidad = lazy(() => import('../pages/unidades/detalleUnidad'));
const UnidadesInfinitePage = lazy(() => import('../pages/unidades/UnidadesInfinitePage'));

// Lazy loading de componentes de ejemplo
const CamposDinamicosPage = lazy(() => import('../pages/ejemplos/CamposDinamicosPage'));

// Lazy loading de componentes de zonas
const ZonaPage = lazy(() => import('../pages/zonas/zonaPage'));
const AddZonaPage = lazy(() => import('../pages/zonas/addZonaPage'));
const DetalleZona = lazy(() => import('../pages/zonas/detalleZona'));
const ZonasInfinitePage = lazy(() => import('../pages/zonas/ZonasInfinitePage'));

// Componente Loader para Suspense
const BasicModuleLoader = () => (
  <div className="flex justify-center items-center h-full w-full min-h-[200px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

// Layout del módulo Basic
const BasicLayout = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Módulo de Datos Básicos</h1>
      <div className="mt-4">
        <Suspense fallback={<BasicModuleLoader />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
};

// Definición de rutas para este módulo
const basicRoutes = [
  {
    element: <BasicLayout />,
    children: [
      { index: true, element: <Navigate to="categorias" replace /> },
      
      // Rutas de Categorías
      { path: 'categorias', element: <CategoriaPage /> },
      { path: 'categorias/infinite', element: <CategoriasInfinitePage /> },
      { path: 'categorias/add', element: <AddCategoriaPage /> },
      { path: 'categorias/edit/:id', element: <AddCategoriaPage /> },
      { path: 'categorias/:id', element: <DetalleCategoria /> },
      
      // Rutas de Ciudades
      { path: 'ciudades', element: <CiudadPage /> },
      { path: 'ciudades/infinite', element: <CiudadesInfinitePage /> },
      { path: 'ciudades/add', element: <AddCiudadPage /> },
      { path: 'ciudades/edit/:id', element: <AddCiudadPage /> },
      { path: 'ciudades/:id', element: <DetalleCiudad /> },
      
      // Rutas de Empresas CLC
      { path: 'empresas', element: <EmpresasInfinitePage /> },
      { path: 'empresas/add', element: <AddEmpresaPage /> },
      { path: 'empresas/edit/:id', element: <EmpresaPage /> },
      { path: 'empresas/:id', element: <DetalleEmpresa /> },
      
      // Rutas de Especialidades
      { path: 'especialidades', element: <EspecialidadesInfinitePage /> },
      { path: 'especialidades/add', element: <AddEspecialidadPage /> },
      { path: 'especialidades/edit/:id', element: <EspecialidadPage /> },
      { path: 'especialidades/:id', element: <DetalleEspecialidad /> },
      
      // Rutas de Marcas
      { path: 'marcas', element: <MarcaPage /> },
      { path: 'marcas/infinite', element: <MarcasInfinitePage /> },
      { path: 'marcas/add', element: <AddMarcaPage /> },
      { path: 'marcas/edit/:id', element: <AddMarcaPage /> },
      { path: 'marcas/:id', element: <DetalleMarca /> },
      
      // Rutas de Procedencias
      { path: 'procedencias', element: <ProcedenciasInfinitePage /> },
      { path: 'procedencias/add', element: <AddProcedenciaPage /> },
      { path: 'procedencias/edit/:id', element: <ProcedenciaPage /> },
      { path: 'procedencias/:id', element: <DetalleProcedencia /> },
      
      // Rutas de Tipos de Cliente
      { path: 'tiposcliente', element: <TiposClienteInfinitePage /> },
      { path: 'tiposcliente/add', element: <AddTipoClientePage /> },
      { path: 'tiposcliente/edit/:id', element: <TipoClientePage /> },
      { path: 'tiposcliente/:id', element: <DetalleTipoCliente /> },
      
      // Rutas de Tipos de Contratación
      { path: 'tiposcontratacion', element: <TiposContratacionInfinitePage /> },
      { path: 'tiposcontratacion/add', element: <AddTipoContratacionPage /> },
      { path: 'tiposcontratacion/edit/:id', element: <TipoContratacionPage /> },
      { path: 'tiposcontratacion/:id', element: <DetalleTipoContratacion /> },
      
      // Rutas de Unidades
      { path: 'unidades', element: <UnidadesInfinitePage /> },
      { path: 'unidades/add', element: <AddUnidadPage /> },
      { path: 'unidades/edit/:id', element: <UnidadPage /> },
      { path: 'unidades/:id', element: <DetalleUnidad /> },
      
      // Rutas de Zonas
      { path: 'zonas', element: <ZonaPage /> },
      { path: 'zonas/infinite', element: <ZonasInfinitePage /> },
      { path: 'zonas/add', element: <AddZonaPage /> },
      { path: 'zonas/edit/:id', element: <AddZonaPage /> },
      { path: 'zonas/:id', element: <DetalleZona /> },
      
      // Rutas de ejemplos
      { path: 'ejemplos/campos-dinamicos', element: <CamposDinamicosPage /> },
      
      // Ruta de fallback
      { path: '*', element: <Navigate to="categorias" replace /> }
    ]
  }
];

const BasicRoutes = () => {
  const element = useRoutes(basicRoutes);
  return element;
};

export default BasicRoutes;