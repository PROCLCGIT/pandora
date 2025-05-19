// /src/modulos/proformas/routes/ProformasRoutes.jsx

import { Outlet, useRoutes } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Lazy-loaded components
const ProformaPage = lazy(() => import('../pages/ProformaPage.jsx'));
const AddProformaPage = lazy(() => import('../pages/addProformaPage.jsx'));
const DetalleProforma = lazy(() => import('../pages/detalleProforma.jsx'));

// Loading spinner para Suspense
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-full w-full min-h-[200px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

// Simple layout component
const SimpleLayout = () => {
  return <Outlet />;
};

// Componente principal que usa useRoutes
const ProformasRoutes = () => {
  const routes = useRoutes([
    {
      path: '/',
      element: <SimpleLayout />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<LoadingSpinner />}>
              <ProformaPage />
            </Suspense>
          )
        },
        {
          path: 'add',
          element: (
            <Suspense fallback={<LoadingSpinner />}>
              <AddProformaPage />
            </Suspense>
          )
        },
        {
          path: ':id',
          element: (
            <Suspense fallback={<LoadingSpinner />}>
              <DetalleProforma />
            </Suspense>
          )
        },
        {
          path: 'edit/:id',
          element: (
            <Suspense fallback={<LoadingSpinner />}>
              <AddProformaPage />
            </Suspense>
          )
        },
        {
          path: 'in-progress',
          element: (
            <Suspense fallback={<LoadingSpinner />}>
              <ProformaPage status="en-proceso" />
            </Suspense>
          )
        },
        {
          path: 'approved',
          element: (
            <Suspense fallback={<LoadingSpinner />}>
              <ProformaPage status="aprobada" />
            </Suspense>
          )
        }
      ]
    }
  ]);

  return routes;
};

export default ProformasRoutes;