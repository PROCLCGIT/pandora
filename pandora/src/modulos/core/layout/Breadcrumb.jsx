// frontend/src/components/layout/Breadcrumb.jsx
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = () => {
  const location = useLocation();
  
  // Generamos las rutas para las breadcrumbs basadas en la ruta actual
  const getPathSegments = () => {
    const pathnames = location.pathname.split('/').filter((path) => path);
    
    // Mapeamos las rutas a nombres más amigables
    const pathMap = {
      'dashboard': 'Dashboard',
      'products': 'Productos',
      'catalog': 'Catálogo',
      'available': 'Disponibles',
      'offered': 'Ofertados',
      'proformas': 'Proformas',
      'new': 'Nueva',
      'in-progress': 'En Proceso',
      'approved': 'Aprobadas',
      'brief': 'Brief',
      'legal': 'Legal',
      'docs': 'Documentos',
      'settings': 'Configuración',
      'profile': 'Perfil',
      'edit': 'Editar',
      'view': 'Ver',
      'add': 'Agregar',
    };
    
    return pathnames.map((value, index) => {
      // Construimos la ruta para este enlace
      const url = `/${pathnames.slice(0, index + 1).join('/')}`;
      
      // Usamos el nombre amigable o capitalizamos la primera letra
      const displayName = pathMap[value] || value.charAt(0).toUpperCase() + value.slice(1);
      
      return {
        name: displayName,
        path: url,
        active: index === pathnames.length - 1
      };
    });
  };
  
  const pathSegments = getPathSegments();
  
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap">
        <li className="flex items-center">
          <Link 
            to="/" 
            className="text-gray-500 hover:text-primary flex items-center"
          >
            <Home size={16} />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        
        {pathSegments.map((segment, index) => (
          <li key={segment.path} className="flex items-center">
            <ChevronRight size={16} className="mx-2 text-gray-400" />
            {segment.active ? (
              <span className="text-primary font-medium" aria-current="page">
                {segment.name}
              </span>
            ) : (
              <Link 
                to={segment.path} 
                className="text-gray-500 hover:text-primary"
              >
                {segment.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;