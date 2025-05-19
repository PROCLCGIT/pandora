import React, { useState, useEffect, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './authContext';
import { 
  AuthLoading, 
  LoginButton,
  AuthFeedback
} from '../../components/ui/auth/AuthStates';

// Componente de panel lateral - separado para optimizar renderizado
const BrandPanel = memo(() => (
  <div className="hidden lg:block lg:w-1/2 bg-indigo-600 relative">
    <div className="absolute inset-0 bg-gradient-to-r from-indigo-800 to-indigo-500 opacity-90" />
    <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12">
      <h1 className="text-4xl font-bold mb-4">Pandora</h1>
      <p className="text-xl max-w-md text-center">
        Plataforma de gestión empresarial para pequeñas y medianas empresas
      </p>
    </div>
  </div>
));

// Componente de banner de modo emergencia
const EmergencyBanner = memo(({ isActive, onDeactivate }) => {
  if (!isActive) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-orange-600 text-white py-2 px-4 text-center flex justify-between items-center">
      <span>
        <span className="font-bold">MODO DE EMERGENCIA ACTIVO</span> - Usando datos locales sin backend
      </span>
      <button 
        onClick={onDeactivate}
        className="bg-white text-orange-700 hover:bg-orange-100 px-3 py-1 rounded text-sm font-medium"
      >
        Desactivar
      </button>
    </div>
  );
});

// Componente de alerta de backend no disponible
const BackendAlert = memo(({ isBackendAvailable, isEmergencyMode }) => {
  if (isBackendAvailable || isEmergencyMode) return null;
  
  return (
    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded text-yellow-800 text-sm">
      <div className="font-bold mb-1">⚠️ Servidor no disponible</div>
      <p>No se pudo conectar al backend. Use el modo de emergencia para trabajar sin conexión.</p>
    </div>
  );
});

// Componente principal de LoginPage
const LoginPage = () => {
  // Estados para el formulario
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  
  // Hooks de navegación y autenticación
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener estado global de AuthContext
  const { 
    login, 
    isAuthenticated, 
    loading: authLoading,
    error: authError,
    backendAvailable
  } = useAuth();
  
  // Verificar si estamos en modo emergencia al iniciar
  useEffect(() => {
    const checkEmergencyMode = () => {
      const emergencyMode = localStorage.getItem('forceEmergencyMode') === 'true';
      setIsEmergencyMode(emergencyMode);
    };
    
    // Verificar estado inicial
    checkEmergencyMode();
  }, []);
  
  // Obtener información de redirección y errores desde el state de location
  const from = location.state?.from || '/dashboard';
  const redirectError = location.state?.errorMessage || '';

  // Efecto para redirigir si está autenticado
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      console.log('Usuario autenticado, redirigiendo a:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, from]);

  // Efecto para mostrar errores
  useEffect(() => {
    if (redirectError) {
      setFormError(redirectError); // Priorizar error de redirección
    } else if (authError) {
      // Mejorar mensajes de error específicos
      if (authError.includes("No active account") || authError.includes("credenciales")) {
        setFormError(`${authError} Asegúrese que exista un usuario en la base de datos con estas credenciales.`);
      } else {
        setFormError(authError);
      }
    }
  }, [redirectError, authError]);

  // Auto-limpiar mensajes de error después de 5 segundos
  useEffect(() => {
    if (!formError) return;
    
    const timer = setTimeout(() => {
      setFormError('');
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [formError]);
  
  // Manejador de cambios en inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Resetear error del formulario al cambiar campos
    if (formError) setFormError('');
    
    setCredentials(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  
  // Manejador de envío de formulario optimizado
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevenir múltiples envíos
    if (formLoading || authLoading) return;
    
    setFormError('');
    setFormLoading(true);
    
    try {
      const result = await login(credentials.username, credentials.password);
      
      if (result === false || (typeof result === 'object' && !result.success)) {
        // Mostrar error específico del intento de login
        let errorMsg = 'Credenciales inválidas.';
        
        if (typeof result === 'object') {
          if (result.error) {
            errorMsg = result.error;
          } else if (result.detail) {
            errorMsg = result.detail;
          }
        }
        
        setFormError(errorMsg);
        
        // Feedback visual (shake)
        const form = e.target;
        form.classList.add('animate-shake');
        setTimeout(() => form.classList.remove('animate-shake'), 500);
      }
      // Si tiene éxito, el useEffect [isAuthenticated] se encargará de redirigir
    } catch (error) {
      console.error('Error inesperado de login:', error);
      setFormError('Error en el servidor. Inténtalo más tarde.');
    } finally {
      setFormLoading(false);
    }
  };
  
  // Limpiar mensajes de error
  const clearMessages = () => {
    setFormError('');
  };
  
  // Activar modo de emergencia
  const activateEmergencyMode = () => {
    setFormLoading(true);
    setFormError('');
    
    // Configurar estado de emergencia
    localStorage.setItem('accessToken', 
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE5OTk5OTk5OTl9.demo-signature');
    localStorage.setItem('refreshToken', 'refresh-token-example');
    
    localStorage.setItem('authCache', JSON.stringify({
      data: {
        isValid: true,
        userId: 1,
        expiresIn: 60
      },
      timestamp: Date.now()
    }));
    
    localStorage.setItem('forceEmergencyMode', 'true');
    
    console.log('🚨 Acceso de emergencia activado');
    
    // Retraso para feedback visual
    setTimeout(() => {
      window.location.replace('/dashboard');
    }, 800);
  };
  
  // Desactivar modo de emergencia
  const deactivateEmergencyMode = () => {
    // Limpiar todos los datos de autenticación
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('authCache');
    localStorage.removeItem('forceEmergencyMode');
    
    console.log('✅ Modo de emergencia desactivado');
    setIsEmergencyMode(false);
    
    // Recargar para aplicar cambios
    window.location.reload();
  };

  // Usar credenciales de demo
  const useDemoCredentials = (e) => {
    e.preventDefault();
    setCredentials({
      ...credentials,
      username: 'admin',
      password: 'admin123'
    });
    setFormError('');
  };

  // Eliminamos la redirección cuando está cargando para que siempre muestre el login
  // CAMBIO CRÍTICO: No bloquear la UI durante la carga

  // Mostrar el formulario de login
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Panel izquierdo con branding */}
      <BrandPanel />
      
      {/* Panel derecho - Formulario de login */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-12 xl:p-24">
        {/* Banner de modo emergencia */}
        <EmergencyBanner 
          isActive={isEmergencyMode} 
          onDeactivate={deactivateEmergencyMode} 
        />
      
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-1">
            Iniciar sesión
          </h2>
          <p className="text-center text-gray-600 mb-4">
            Acceda a su cuenta para continuar
          </p>
          
          {/* Alerta de backend no disponible */}
          <BackendAlert 
            isBackendAvailable={backendAvailable} 
            isEmergencyMode={isEmergencyMode} 
          />
        </div>
        
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Mensaje de feedback */}
          <AuthFeedback 
            error={formError} 
            onDismiss={clearMessages} 
          />
          
          {/* Formulario de login */}
          <form onSubmit={handleSubmit} className="space-y-6 transition-all duration-300">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Nombre de usuario
              </label>
              <input
                id="username"
                name="username"
                type="text" 
                autoComplete="username"
                required
                value={credentials.username}
                onChange={handleChange}
                disabled={formLoading || authLoading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:bg-gray-100"
                placeholder="admin"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={credentials.password}
                onChange={handleChange}
                disabled={formLoading || authLoading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:bg-gray-100"
                placeholder="••••••••"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={credentials.rememberMe}
                  onChange={handleChange}
                  disabled={formLoading || authLoading}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                  Recordarme
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  ¿Olvidó su contraseña?
                </a>
              </div>
            </div>
            
            <div>
              <LoginButton isLoading={formLoading} text="Iniciar Sesión" />
            </div>
          </form>
          
          <div className="mt-6 flex flex-col space-y-2">
            {/* Botón de credenciales demo */}
            <button 
              onClick={useDemoCredentials}
              disabled={formLoading || authLoading}
              className="text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
            >
              Usar credenciales de demostración
            </button>
            
            {/* Botón de modo emergencia */}
            <button
              onClick={activateEmergencyMode}
              disabled={formLoading || authLoading || isEmergencyMode}
              className="text-xs text-white bg-red-600 hover:bg-red-700 py-1 px-2 rounded transition-colors disabled:opacity-50"
            >
              {isEmergencyMode ? 'Modo de emergencia ya activado' : 'Modo de emergencia (sin backend)'}
            </button>
            
            {/* Ayuda y enlaces */}
            <div className="text-xs text-gray-500 mt-4">
              <p className="mb-1">Si tienes problemas para iniciar sesión:</p>
              <ul className="list-disc pl-5">
                <li>Verifica que el servidor backend esté funcionando</li>
                <li>Prueba con las credenciales de demostración</li>
                <li>Activa el modo de emergencia para trabajar sin conexión</li>
                <li>También puedes acceder directamente con <a href="/?emergency=true" className="text-indigo-600 hover:underline">este enlace</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;