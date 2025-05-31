// src/modulos/core/layout/Sidebar.jsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Package, FileText, Briefcase, Scale, 
  FolderOpen, Settings, ChevronDown, ChevronRight,
  Code, MapPin, Building, Layers, Users, 
  FileArchive, Database, Files, Upload, Tags, FolderTree,
  FileUp, Download, FilePlus, FileSpreadsheet, ShoppingBag,
  Warehouse, PackageSearch, TruckIcon, AlertCircle
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
    path: '/productos',
    submenu: [
      { title: 'Productos Ofertados', path: '/productos/productos-ofertados', icon: <Tags size={16} /> },
      { title: 'Productos Disponibles', path: '/productos/productos-disponibles', icon: <ShoppingBag size={16} /> },
    ],
  },
  {
    title: 'Inventario',
    icon: <Warehouse size={20} />,
    path: '/inventario',
    submenu: [
      { title: 'Dashboard', path: '/inventario/dashboard', icon: <Home size={16} /> },
      { title: 'Almacenes', path: '/inventario/almacenes', icon: <Warehouse size={16} /> },
      { title: 'Stock', path: '/inventario/stock', icon: <PackageSearch size={16} /> },
      { title: 'Movimientos', path: '/inventario/movimientos', icon: <TruckIcon size={16} /> },
      { title: 'Alertas', path: '/inventario/alertas', icon: <AlertCircle size={16} /> },
    ],
  },
  {
    title: 'Proformas',
    icon: <FileText size={20} />,
    path: '/proformas',
    submenu: [
      { title: 'Dash Proforma', path: '/proformas/dashboard' },
      { title: 'Nueva Proforma', path: '/proformas/add' },
    ],
  },
  {
    title: 'Brief',
    icon: <Briefcase size={20} />,
    path: '/brief',
    submenu: [
      { title: 'Dashboard', path: '/brief/dashboard', icon: <Home size={16} /> },
      { title: 'Nuevo Brief', path: '/brief/nuevo', icon: <FilePlus size={16} /> },
      { title: 'Reportes', path: '/brief/reportes', icon: <FileText size={16} /> },
    ],
  },
  {
    title: 'Directorio',
    icon: <Users size={20} />,
    path: '/directorio',
    submenu: [
      { title: 'Clientes', path: '/directorio/clientes' },
      { title: 'Proveedores', path: '/directorio/proveedores' },
      { title: 'Contactos', path: '/directorio/contactos' },
      { title: 'Vendedores', path: '/directorio/vendedores' },
    ],
  },
  {
    title: 'Datos Básicos',
    icon: <Database size={20} />,
    path: '/basic',
    submenu: [
      { title: 'Categorías', path: '/basic/categorias' },
      { title: 'Ciudades', path: '/basic/ciudades' },
      { title: 'Empresas CLC', path: '/basic/empresas' },
      { title: 'Especialidades', path: '/basic/especialidades' },
      { title: 'Marcas', path: '/basic/marcas' },
      { title: 'Procedencias', path: '/basic/procedencias' },
      { title: 'Tipos de Cliente', path: '/basic/tiposcliente' },
      { title: 'Tipos de Contratación', path: '/basic/tiposcontratacion' },
      { title: 'Unidades de Medida', path: '/basic/unidades' },
      { title: 'Zonas', path: '/basic/zonas' },
    ],
  },
  {
    title: 'Documentos',
    icon: <Files size={20} />,
    path: '/docmanager',
    submenu: [
      { title: 'Gestor de Documentos', path: '/docmanager', icon: <Files size={16} /> },
      { title: 'Ver Documentos', path: '/docmanager/documentos', icon: <FileText size={16} /> },
      { title: 'Categorías', path: '/docmanager/categorias', icon: <FolderTree size={16} /> },
      { title: 'Subir Documento', path: '/docmanager/documentos/add', icon: <Upload size={16} /> },
    ],
  },
  {
    title: 'Importar/Exportar',
    icon: <FileUp size={20} />,
    path: '/importexport',
    submenu: [
      { title: 'Panel Principal', path: '/importexport', icon: <FileSpreadsheet size={16} /> },
      { title: 'Importar Productos Ofertados', path: '/importexport/productos-ofertados', icon: <FilePlus size={16} /> },
    ],
  },
  {
    title: 'Ejemplos',
    icon: <Code size={20} />,
    path: '/basic/ejemplos',
    submenu: [
      { title: 'Campos Dinámicos', path: '/basic/ejemplos/campos-dinamicos' },
    ],
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
                        <span className={`${isActive(item.path) ? 'text-indigo-600' : 'text-gray-500'}`}>{item.icon}</span>
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
                            {subitem.submenu ? (
                              <div className="space-y-1">
                                <button
                                  className={`flex justify-between items-center w-full px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700`}
                                  onClick={() => toggleSubmenu(`${item.title}-${subitem.title}`)}
                                >
                                  <div className="flex items-center">
                                    {subitem.icon && <span className="mr-2">{subitem.icon}</span>}
                                    <span>{subitem.title}</span>
                                  </div>
                                  <span>
                                    {openSubmenus[`${item.title}-${subitem.title}`] ? (
                                      <ChevronDown size={14} />
                                    ) : (
                                      <ChevronRight size={14} />
                                    )}
                                  </span>
                                </button>
                                {openSubmenus[`${item.title}-${subitem.title}`] && (
                                  <ul className="pl-6 space-y-1">
                                    {subitem.submenu.map((nestedItem) => (
                                      <li key={nestedItem.title}>
                                        <Link
                                          to={nestedItem.path}
                                          className={`flex items-center px-4 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
                                            location.pathname === nestedItem.path ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300' : ''
                                          }`}
                                        >
                                          <span>{nestedItem.title}</span>
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ) : (
                              <Link
                                to={subitem.path}
                                className={`flex items-center px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
                                  location.pathname === subitem.path ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300' : ''
                                }`}
                              >
                                {subitem.icon && <span className="mr-2">{subitem.icon}</span>}
                                <span>{subitem.title}</span>
                              </Link>
                            )}
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
                    <span className={`${isActive(item.path) ? 'text-indigo-600' : 'text-gray-500'}`}>{item.icon}</span>
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