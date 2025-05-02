// pandora/src/routes.jsx

import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import MainLayout from './modulos/core/layout/MainLayout';
import ProtectedRoute from './modulos/core/layout/ProtectedRoute';
import LoginPage from './modulos/auth/LoginPage';

// Lazy loading de componentes para mejorar el rendimiento
const Dashboard = lazy(() => import('./modulos/core/dashboard/Dashboard'));

// Lazy loading para los módulos de la aplicación
const ProductsModule = lazy(() => import('./modulos/productos/ProductsLayout'));
const ProformasModule = lazy(() => import('./modulos/proformas/ProformasLayout'));
const BasicModule = lazy(() => import('./modulos/basic/routes/BasicRoutes')); // Módulo Basic

// Componente Loader para Suspense
const LazyLoadingSpinner = () => (
  <div className="flex justify-center items-center h-full w-full min-h-[200px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

// Componente placeholder
const ModulePlaceholder = ({ moduleName }) => (
  <div className="p-4">
    <h2 className="text-xl font-semibold mb-4">Módulo de {moduleName}</h2>
    <p className="text-gray-600">
      Este módulo está actualmente en desarrollo. Estará disponible próximamente.
    </p>
  </div>
);

// Objeto con todas las rutas de la aplicación
export const routes = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<LazyLoadingSpinner />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'basic/*',
        element: (
          <Suspense fallback={<LazyLoadingSpinner />}>
            <BasicModule />
          </Suspense>
        ),
      },
      {
        path: 'products/*',
        element: (
          <Suspense fallback={<LazyLoadingSpinner />}>
            <ProductsModule />
          </Suspense>
        ),
      },
      {
        path: 'proformas/*',
        element: (
          <Suspense fallback={<LazyLoadingSpinner />}>
            <ProformasModule />
          </Suspense>
        ),
      },
      {
        path: 'brief/*',
        element: (
          <Suspense fallback={<LazyLoadingSpinner />}>
            <ModulePlaceholder moduleName="Brief" />
          </Suspense>
        ),
      },
      {
        path: 'legal/*',
        element: (
          <Suspense fallback={<LazyLoadingSpinner />}>
            <ModulePlaceholder moduleName="Legal" />
          </Suspense>
        ),
      },
      {
        path: 'docs/*',
        element: (
          <Suspense fallback={<LazyLoadingSpinner />}>
            <ModulePlaceholder moduleName="Gestión Documental" />
          </Suspense>
        ),
      },
      {
        path: 'settings/*',
        element: (
          <Suspense fallback={<LazyLoadingSpinner />}>
            <ModulePlaceholder moduleName="Configuración" />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '*',
    element: (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold text-gray-800">404</h1>
        <p className="text-xl text-gray-600">Página no encontrada</p>
        <button 
          onClick={() => window.location.href = '/dashboard'} 
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Volver al Dashboard
        </button>
      </div>
    ),
  },
];