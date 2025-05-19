// frontend/src/components/layout/MainLayout.jsx
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import Breadcrumb from './Breadcrumb';

const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const location = useLocation();
  
  // Función para cambiar el estado del sidebar
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    
    // Guardar preferencia en localStorage
    localStorage.setItem('sidebarCollapsed', !isCollapsed);
  };
  
  // Establecer el título de la página según la ruta
  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    
    // Mapa de rutas a títulos
    const pathTitleMap = {
      '': 'Dashboard',
      'dashboard': 'Dashboard',
      'products': 'Gestión de Productos',
      'proformas': 'Proformas y Cotizaciones',
      'brief': 'Documentos de Brief',
      'legal': 'Aspectos Legales',
      'docs': 'Gestor Documental',
      'settings': 'Configuración',
    };
    
    // Determinamos el título según el primer segmento de la ruta
    if (pathSegments.length > 0) {
      const rootPath = pathSegments[0];
      setPageTitle(pathTitleMap[rootPath] || 'Dashboard');
    } else {
      setPageTitle('Dashboard');
    }
    
  }, [location]);
  
  // Recuperar preferencia de sidebar al cargar
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true');
    }
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} toggleCollapse={toggleSidebar} />
      
      {/* Content area */}
      <div 
        className={`flex flex-col flex-1 ${
          isCollapsed ? 'ml-16' : 'ml-64'
        } transition-all duration-300`}
      >
        {/* Top header con controles de usuario */}
        <Header toggleSidebar={toggleSidebar} isCollapsed={isCollapsed} />
        
        {/* Main content area */}
        <main className="flex-1 p-6 mt-16 overflow-auto">
          <div className="container mx-auto">
            {/* Header de la página con título y breadcrumbs */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                {pageTitle}
              </h1>
              <Breadcrumb />
            </div>
            
            {/* Contenido de la página (renderizado por el router) */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
              <Outlet />
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <Footer isCollapsed={isCollapsed} />
      </div>
    </div>
  );
};

export default MainLayout;