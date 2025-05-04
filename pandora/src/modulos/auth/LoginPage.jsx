import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './authContext';
import { 
  AuthError, 
  AuthSuccess, 
  AuthLoading, 
  SessionExpired, 
  AutoLoginStatus,
  LoginButton,
  AuthFeedback
} from '../../components/ui/auth/AuthStates';

const LoginPage = () => {
  // Estados para el formulario y mensajes
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [autoLoginStatus, setAutoLoginStatus] = useState(null);
  const [submitCount, setSubmitCount] = useState(0); // Para evitar múltiples envíos
  
  // Hooks de navegación y autenticación
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, checkSession } = useAuth();
  
  // Obtener información de redirección y errores desde el state de location
  const from = location.state?.from || '/dashboard';
  const redirectError = location.state?.errorMessage || '';
  const errorType = location.state?.errorType || '';
  
  // Mostrar mensaje de error si viene de una redirección
  useEffect(() => {
    if (redirectError) {
      setError(redirectError);
    }
    
    // Verificar si hay error de sesión expirada
    if (errorType === 'session_expired') {
      setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    }
  }, [redirectError, errorType]);
  
  // Limpiar mensajes después de 5 segundos
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, success]);
  
  // Verificar sesión al cargar
  useEffect(() => {
    const checkExistingSession = async () => {
      // Si ya estamos autenticados, redirigir
      if (isAuthenticated) {
        navigate(from, { replace: true });
        return;
      }
      
      // Intentar verificar si hay una sesión existente
      setAutoLoginStatus('inProgress');
      try {
        const isValid = await checkSession();
        if (isValid) {
          setAutoLoginStatus('success');
          setSuccess('Sesión iniciada correctamente');
          
          // Redirigir después de un breve retraso para mostrar el mensaje
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 1000);
        } else {
          setAutoLoginStatus(null);
        }
      } catch (error) {
        setAutoLoginStatus('failure');
        console.error('Error verificando sesión:', error);
      }
    };
    
    checkExistingSession();
  }, [isAuthenticated, checkSession, navigate, from]);
  
  // Manejador de cambios en inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Resetear mensajes de error al cambiar campos
    if (error) setError('');
    
    setCredentials({
      ...credentials,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  // Manejador de envío de formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Evitar múltiples envíos
    if (loading) return;
    
    // Incrementar contador de envíos - útil para debugging
    setSubmitCount(prevCount => prevCount + 1);
    
    // Limpiar mensajes
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      // Usar credenciales predeterminadas si está marcado "Recordarme"
      const email = credentials.rememberMe ? 'op@proclc.com' : credentials.email;
      const password = credentials.rememberMe ? '251510' : credentials.password;
      
      console.log(`Iniciando sesión con: ${email} (Intento #${submitCount + 1})`);
      
      // Intentar login
      const result = await login(email, password);
      
      if (result.success) {
        // Mostrar mensaje de éxito brevemente antes de redirigir
        setSuccess('Inicio de sesión exitoso. Redirigiendo...');
        
        // Esperar un momento para mostrar el mensaje antes de redirigir
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 800);
      } else {
        // Mostrar mensaje de error específico
        const errorMsg = result.error || 'Credenciales inválidas. Por favor, inténtalo de nuevo.';
        setError(errorMsg);
        
        // Vibrar el formulario para feedback visual
        const form = document.querySelector('form');
        form.classList.add('animate-shake');
        setTimeout(() => form.classList.remove('animate-shake'), 500);
      }
    } catch (error) {
      console.error('Error de login:', error);
      setError('Error en el servidor. Por favor, inténtalo más tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  // Limpiar mensajes
  const clearMessages = () => {
    setError('');
    setSuccess('');
  };
  
  // Prerellenar credenciales de ejemplo
  const fillDemoCredentials = (e) => {
    e.preventDefault();
    setCredentials({
      ...credentials,
      email: 'op@proclc.com',
      password: '251510'
    });
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Panel izquierdo - Imagen de fondo */}
      <div className="hidden lg:block lg:w-1/2 bg-indigo-600 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-800 to-indigo-500 opacity-90" />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12">
          <h1 className="text-4xl font-bold mb-4">MediSupply</h1>
          <p className="text-xl max-w-md text-center">
            Plataforma de gestión de equipos e insumos médicos
          </p>
        </div>
      </div>
      
      {/* Panel derecho - Formulario de login */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-12 xl:p-24">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-1">
            Iniciar sesión
          </h2>
          <p className="text-center text-gray-600 mb-4">
            Acceda a su cuenta para continuar
          </p>
          
          {/* Mostrar estado de auto-login si está en progreso */}
          {autoLoginStatus && (
            <div className="mb-4 flex justify-center">
              <AutoLoginStatus 
                status={autoLoginStatus} 
                message={autoLoginStatus === 'failure' ? "No se encontró sesión activa" : ""}
              />
            </div>
          )}
        </div>
        
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Mensajes de feedback */}
          <AuthFeedback 
            error={error} 
            success={success} 
            onDismiss={clearMessages} 
          />
          
          {/* Formulario de login */}
          <form onSubmit={handleSubmit} className="space-y-6 transition-all duration-300">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={credentials.email}
                onChange={handleChange}
                disabled={loading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:bg-gray-100"
                placeholder="usuario@empresa.com"
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
                disabled={loading}
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
                  disabled={loading}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Usar credenciales de prueba
                </label>
              </div>
              
              <div className="text-sm">
                <a 
                  href="#" 
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  ¿Olvidó su contraseña?
                </a>
              </div>
            </div>
            
            <div>
              <LoginButton 
                loading={loading} 
                disabled={loading}
                loadingText="Autenticando..."
              >
                Iniciar sesión
              </LoginButton>
            </div>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Para pruebas, utilice:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded p-2 flex justify-between items-center">
              <div className="text-left">
                <p className="text-xs text-gray-500">Usuario</p>
                <p className="font-mono text-sm">op@proclc.com</p>
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-500">Contraseña</p>
                <p className="font-mono text-sm">251510</p>
              </div>
              <button 
                onClick={fillDemoCredentials}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Completar
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Estilos para la animación de shake */}
      <style jsx="true">{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;