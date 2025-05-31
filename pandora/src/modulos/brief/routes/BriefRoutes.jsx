// /pandora/src/modulos/brief/routes/BriefRoutes.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Importar páginas del módulo Brief
import BriefDashboard from '../pages/BriefDashboard';
import BriefDetailPage from '../pages/BriefDetailPage';
import NuevoBriefPage from '../pages/NuevoBriefPage';
import TestNuevoBriefDebug from '../pages/TestNuevoBriefDebug';

// Componente de loading
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
    <div className="flex items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <span className="text-lg text-gray-600">Cargando...</span>
    </div>
  </div>
);

const BriefRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Ruta principal - Dashboard */}
        <Route path="/" element={<BriefDashboard />} />
        
        {/* Ruta de listado (alias del dashboard) */}
        <Route path="/dashboard" element={<BriefDashboard />} />
        
        {/* Ruta para crear nuevo brief */}
        <Route path="/nuevo" element={<NuevoBriefPage />} />
        
        {/* Ruta de debug temporal */}
        <Route path="/debug" element={<TestNuevoBriefDebug />} />
        
        {/* Ruta de edición de brief */}
        <Route path="/editar/:briefId" element={<NuevoBriefPage />} />
        
        {/* Ruta de detalle de brief - DEBE IR AL FINAL por el parámetro dinámico */}
        <Route path="/:briefId" element={<BriefDetailPage />} />
        
        {/* Rutas adicionales si las necesitas */}
        <Route path="/reportes" element={<BriefDashboard />} />
        
        {/* Ruta 404 para rutas no encontradas dentro del módulo */}
        <Route path="*" element={
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-6">La página que buscas no existe en el módulo Brief.</p>
              <a 
                href="/briefs" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Volver al Dashboard
              </a>
            </div>
          </div>
        } />
      </Routes>
    </Suspense>
  );
};

export default BriefRoutes;

