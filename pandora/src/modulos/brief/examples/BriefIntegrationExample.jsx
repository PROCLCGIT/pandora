// /pandora/src/modulos/brief/examples/BriefIntegrationExample.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Importar el módulo Brief completo
import { 
  BriefRoutes, 
  briefModuleConfig,
  useBriefModule 
} from '../index';

// Crear cliente de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      cacheTime: 300000,
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
});

// Componente de ejemplo para integrar el módulo Brief
const BriefIntegrationExample = () => {
  const { moduleInfo, config } = useBriefModule();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {/* Header de la aplicación */}
          <header className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h1 className="text-xl font-bold text-gray-900">
                    Sistema de Gestión
                  </h1>
                  <span className="text-sm text-gray-500">
                    v{moduleInfo.version}
                  </span>
                </div>
                <nav className="flex items-center gap-4">
                  <a 
                    href="/briefs" 
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Briefs
                  </a>
                  <a 
                    href="/productos" 
                    className="text-gray-600 hover:text-gray-700"
                  >
                    Productos
                  </a>
                  <a 
                    href="/directorio" 
                    className="text-gray-600 hover:text-gray-700"
                  >
                    Directorio
                  </a>
                </nav>
              </div>
            </div>
          </header>

          {/* Contenido principal */}
          <main>
            <Routes>
              {/* Ruta raíz redirige a briefs */}
              <Route path="/" element={<Navigate to="/briefs" replace />} />
              
              {/* Rutas del módulo Brief */}
              <Route path="/briefs/*" element={<BriefRoutes />} />
              
              {/* Otras rutas de la aplicación */}
              <Route path="/productos/*" element={
                <div className="container mx-auto px-4 py-8">
                  <h2 className="text-2xl font-bold mb-4">Módulo Productos</h2>
                  <p>Aquí iría el módulo de productos...</p>
                </div>
              } />
              
              <Route path="/directorio/*" element={
                <div className="container mx-auto px-4 py-8">
                  <h2 className="text-2xl font-bold mb-4">Módulo Directorio</h2>
                  <p>Aquí iría el módulo de directorio...</p>
                </div>
              } />
              
              {/* Ruta 404 */}
              <Route path="*" element={
                <div className="container mx-auto px-4 py-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Página no encontrada</h2>
                  <p className="text-gray-600 mb-4">
                    La página que buscas no existe.
                  </p>
                  <a 
                    href="/briefs" 
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Ir al Dashboard de Briefs
                  </a>
                </div>
              } />
            </Routes>
          </main>

          {/* Footer opcional */}
          <footer className="bg-white border-t mt-auto">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>
                  © 2025 Sistema de Gestión - Módulo Brief v{moduleInfo.version}
                </div>
                <div className="flex items-center gap-4">
                  <span>Módulos activos: {Object.keys(config).length}</span>
                  <span>•</span>
                  <span>Estado: Activo</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </Router>
      
      {/* React Query DevTools (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
};

export default BriefIntegrationExample;
