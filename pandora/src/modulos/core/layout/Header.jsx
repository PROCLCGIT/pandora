// frontend/src/components/layout/Header.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  Menu, 
  ChevronDown, 
  User, 
  LogOut, 
  Settings,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../../auth/authContext';

const Header = ({ toggleSidebar, isCollapsed }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Manejar cerrar sesión
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Manejar cambio de tema (claro/oscuro)
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Notificaciones de ejemplo
  const notifications = [
    {
      id: 1,
      title: 'Nueva proforma aprobada',
      message: 'La proforma #1234 ha sido aprobada',
      time: '5 min',
      read: false
    },
    {
      id: 2,
      title: 'Recordatorio de mantenimiento',
      message: 'Equipo de radiología requiere mantenimiento',
      time: '2 horas',
      read: false
    },
    {
      id: 3,
      title: 'Documento expirado',
      message: 'La certificación de producto XYZ ha expirado',
      time: 'Ayer',
      read: true
    }
  ];

  return (
    <header className={`fixed z-20 top-0 ${isCollapsed ? 'left-16' : 'left-64'} right-0 transition-all duration-300 bg-white dark:bg-gray-800 border-b border-border h-16`}>
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu size={20} />
          </button>
          
          <div className="hidden md:flex items-center relative">
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-9 pr-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-primary w-64"
            />
            <Search size={18} className="absolute left-3 text-gray-500" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón de tema (claro/oscuro) */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          {/* Botón de notificaciones */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative"
            >
              <Bell size={18} />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            
            {/* Panel de notificaciones */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden border border-border z-30">
                <div className="p-3 border-b border-border flex justify-between items-center">
                  <h3 className="font-medium">Notificaciones</h3>
                  <button className="text-xs text-primary hover:underline">
                    Marcar todas como leídas
                  </button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-3 border-b border-border last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{notification.title}</h4>
                          <span className="text-xs text-gray-500">{notification.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {notification.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No hay notificaciones
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-border">
                  <button className="w-full text-center p-2 text-sm text-primary hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md">
                    Ver todas
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Usuario y menú de perfil */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full pl-2 pr-3 py-1"
            >
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                <User size={16} />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.name || 'Usuario'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'Administrador'}</p>
              </div>
              <ChevronDown size={16} className="hidden md:block" />
            </button>

            {/* Menú desplegable de usuario */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden border border-border z-30">
                <div className="p-3 border-b border-border">
                  <p className="font-medium">{user?.name || 'Usuario'}</p>
                  <p className="text-sm text-gray-500">{user?.email || 'usuario@empresa.com'}</p>
                </div>
                <div>
                  <button className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                    <User size={16} />
                    <span>Mi perfil</span>
                  </button>
                  <button className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                    <Settings size={16} />
                    <span>Configuración</span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-red-500"
                  >
                    <LogOut size={16} />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;