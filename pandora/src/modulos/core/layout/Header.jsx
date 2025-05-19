// frontend/src/components/layout/Header.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  Menu, 
  ChevronDown, 
  User, 
  LogOut, 
  Settings,
  Moon,
  Sun,
  UserCircle,
  Server
} from 'lucide-react';
import { useAuth } from '../../auth/authContext';
import { BackendConfig } from '../../../components/ui/BackendConfig';
import { getCurrentBackendUrl } from '../../../utils/checkBackend';

const Header = ({ toggleSidebar, isCollapsed }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [backendUrl, setBackendUrl] = useState('');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Obtener la URL del backend al montar el componente
  useEffect(() => {
    setBackendUrl(getCurrentBackendUrl());
  }, []);

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
          {/* Botón configuración backend */}
          <BackendConfig inHeader={true} />
          
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
              {user?.profileImage ? (
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                  <img 
                    src={user.profileImage ? (
                      user.profileImage.startsWith('http') 
                        ? user.profileImage 
                        : `${backendUrl}${user.profileImage.startsWith('/') ? '' : '/media/'}${user.profileImage}`
                      ) : ''
                    } 
                    alt="Perfil" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Error loading profile image:', e);
                      console.log('Current backend URL:', backendUrl);
                      console.log('Image path:', user.profileImage);
                      console.log('Attempted full URL:', e.target.src);
                      e.target.onerror = null; // Prevenir loop infinito
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-indigo-600 text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>';
                    }}
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  <User size={16} />
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.firstName ? `${user.firstName} ${user.lastName}` : (user?.name || 'Usuario')}</p>
                <p className="text-xs text-gray-500">{user?.position || user?.role || 'Administrador'}</p>
              </div>
              <ChevronDown size={16} className="hidden md:block" />
            </button>

            {/* Menú desplegable de usuario */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden border border-border z-30">
                <div className="p-3 border-b border-border">
                  <p className="font-medium">{user?.firstName ? `${user.firstName} ${user.lastName}` : (user?.name || 'Usuario')}</p>
                  <p className="text-sm text-gray-500">{user?.email || 'usuario@empresa.com'}</p>
                </div>
                <div>
                  <Link 
                    to="/profile" 
                    onClick={() => setShowUserMenu(false)}
                    className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <UserCircle size={16} />
                    <span>Mi perfil</span>
                  </Link>
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