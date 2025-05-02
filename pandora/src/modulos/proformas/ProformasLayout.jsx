import { Outlet } from 'react-router-dom';

/**
 * Layout principal para el módulo de Proformas
 * Este componente servirá como contenedor para todas las vistas del módulo
 */
const ProformasLayout = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Proformas y Cotizaciones</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Gestión de proformas y cotizaciones para clientes.
        </p>
        
        {/* Pestañas o navegación interna del módulo */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            <a 
              href="/proformas/new" 
              className="px-1 py-4 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600"
            >
              Nuevas
            </a>
            <a 
              href="/proformas/in-progress" 
              className="px-1 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
            >
              En Proceso
            </a>
            <a 
              href="/proformas/approved" 
              className="px-1 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
            >
              Aprobadas
            </a>
            <a 
              href="/proformas/history" 
              className="px-1 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
            >
              Historial
            </a>
          </nav>
        </div>
      </div>
      
      {/* Contenido del módulo (cambiará según la ruta) */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <Outlet />
      </div>
    </div>
  );
};

export default ProformasLayout;