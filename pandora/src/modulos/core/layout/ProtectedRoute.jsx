import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/authContext';

/**
 * Componente para proteger rutas que requieren autenticación
 * Si el usuario no está autenticado, redirige a la página de login
 * 
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar si está autenticado
 * @param {string} props.redirectTo - Ruta a la que redirigir si no está autenticado
 * @returns {React.ReactNode} El componente hijo o un Navigate
 */
const ProtectedRoute = ({ 
  children,
  redirectTo = '/login'
}) => {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  // Si está cargando, mostramos un spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Si no está autenticado, redirige a login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }
  
  // Si está autenticado, renderiza los hijos
  return children;
};

export default ProtectedRoute;