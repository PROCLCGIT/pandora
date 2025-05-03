// pandora/src/routes.jsx

import React, { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import MainLayout from './modulos/core/layout/MainLayout';
import ProtectedRoute from './modulos/core/layout/ProtectedRoute';
import LoginPage from './modulos/auth/LoginPage';

// Spinner mostrado durante la carga de módulos perezosos
const LazyLoadingSpinner = () => (
  <div className="flex justify-center items-center h-full w-full min-h-[200px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

// Helper para envolver componentes lazy con Suspense
const withSuspense = (Component) => (
  <Suspense fallback={<LazyLoadingSpinner />}>
    <Component />
  </Suspense>
);

// Componentes lazy de cada módulo
const Dashboard = lazy(() => import('./modulos/core/dashboard/Dashboard'));
const BasicModule = lazy(() => import('./modulos/basic/routes/BasicRoutes'));
const ProductsModule = lazy(() => import('./modulos/productos/ProductsLayout'));
const ProformasModule = lazy(() => import('./modulos/proformas/ProformasLayout'));
const BriefModule = lazy(() => import('./modulos/brief/pages/BriefDetallePage'));

// Placeholder genérico para módulos en desarrollo
const ModulePlaceholder = ({ moduleName }) => (
  <div className="p-4">
    <h2 className="text-xl font-semibold mb-4">Módulo de {moduleName}</h2>
    <p className="text-gray-600">
      Este módulo está actualmente en desarrollo. Estará disponible próximamente.
    </p>
  </div>
);

// Definición de rutas de manera más lineal y DRY
const protectedChildren = [
  { path: 'dashboard', element: withSuspense(Dashboard) },
  { path: 'basic/*', element: withSuspense(BasicModule) },
  { path: 'products/*', element: withSuspense(ProductsModule) },
  { path: 'proformas/*', element: withSuspense(ProformasModule) },
  { path: 'brief/*', element: withSuspense(BriefModule) },
  { path: 'legal/*', element: withSuspense(() => <ModulePlaceholder moduleName="Legal" />) },
  { path: 'docs/*', element: withSuspense(() => <ModulePlaceholder moduleName="Gestión Documental" />) },
  { path: 'settings/*', element: withSuspense(() => <ModulePlaceholder moduleName="Configuración" />) },
];

export const routes = [
  { path: '/login', element: <LoginPage /> },
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: protectedChildren,
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
