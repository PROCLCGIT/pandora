// src/modulos/core/layout/Sidebar.jsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Package, FileText, Briefcase, Scale, 
  FolderOpen, Settings, ChevronDown, ChevronRight 
} from 'lucide-react';

// Estructura de navegación del sidebar
const navigationItems = [
  {
    title: 'Dashboard',
    icon: <Home size={20} />,
    path: '/dashboard',
  },
  {
    title: 'Productos',
    icon: <Package size={20} />,
    path: '/products',
    submenu: [
      { title: 'Catálogo', path: '/products/catalog' },
      { title: 'Disponibles', path: '/products/available' },
      { title: 'Ofertados', path: '/products/offered' },
    ],
  },
  {
    title: 'Proformas',
    icon: <FileText size={20} />,
    path: '/proformas',
    submenu: [
      { title: 'Nuevas', path: '/proformas/new' },
      { title: 'En proceso', path: '/proformas/in-progress' },
      { title: 'Aprobadas', path: '/proformas/approved' },
    ],
  },
  {
    title: 'Brief',
    icon: <Briefcase size={20} />,
    path: '/brief',
  },
  {
    title: 'Categorías',
    icon: <Scale size={20} />,
    path: '/basic/categorias',
  },
  {
    title: 'Documentos',
    icon: <FolderOpen size={20} />,
    path: '/docs',
  },
  {
    title: 'Configuración',
    icon: <Settings size={20} />,
    path: '/settings',
  },
];

const Sidebar = ({ isCollapsed, toggleCollapse }) => {
  const location = useLocation();
  const [openSubmenus, setOpenSubmenus] = useState({});

  // Maneja la apertura/cierre de submenús
  const toggleSubmenu = (title) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Verifica si un enlace está activo
  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/') return true;
    return location.pathname.startsWith(path);
  };

  return (
    <aside 
      className={`bg-white dark:bg-gray-800 h-screen border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      } fixed left-0 top-0 z-30`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {!isCollapsed && (
          <Link to="/" className="font-bold text-xl text-indigo-600">
            MediSupply
          </Link>
        )}
        {isCollapsed && (
          <Link to="/" className="mx-auto font-bold text-xl text-indigo-600">
            MS
          </Link>
        )}
      </div>

      <div className="overflow-y-auto h-[calc(100vh-4rem)]">
        <nav className="mt-4 px-2">
          <ul className="space-y-1">
            {navigationItems.map((item) => (
              <li key={item.title}>
                {item.submenu ? (
                  <div className="space-y-1">
                    <button
                      className={`flex justify-between items-center w-full px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
                        isActive(item.path) ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300' : ''
                      }`}
                      onClick={() => toggleSubmenu(item.title)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{item.icon}</span>
                        {!isCollapsed && <span>{item.title}</span>}
                      </div>
                      {!isCollapsed && (
                        <span>
                          {openSubmenus[item.title] ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </span>
                      )}
                    </button>

                    {(openSubmenus[item.title] || isActive(item.path)) && !isCollapsed && (
                      <ul className="pl-6 space-y-1">
                        {item.submenu.map((subitem) => (
                          <li key={subitem.title}>
                            <Link
                              to={subitem.path}
                              className={`flex items-center px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
                                location.pathname === subitem.path ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300' : ''
                              }`}
                            >
                              <span>{subitem.title}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
                      isActive(item.path) ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300' : ''
                    }`}
                  >
                    <span className="text-gray-500">{item.icon}</span>
                    {!isCollapsed && <span>{item.title}</span>}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;