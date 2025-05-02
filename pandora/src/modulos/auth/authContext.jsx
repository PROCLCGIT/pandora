import { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto
const AuthContext = createContext(null);

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Verificar si hay un token guardado al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        try {
          // En una aplicación real, aquí verificaríamos el token con el backend
          // Por ahora, simplemente simulamos un usuario autenticado
          setUser({
            id: '1',
            name: 'Usuario Demo',
            email: 'demo@example.com',
            role: 'admin'
          });
        } catch (error) {
          console.error('Error al verificar la autenticación:', error);
          localStorage.removeItem('authToken');
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Función para iniciar sesión
  const login = async (email, password) => {
    // Simular una petición a la API
    try {
      // En una aplicación real, aquí haríamos la petición al backend
      if (email === 'demo@example.com' && password === 'password') {
        const demoUser = {
          id: '1',
          name: 'Usuario Demo',
          email,
          role: 'admin'
        };
        
        // Guardar el token y la información del usuario
        localStorage.setItem('authToken', 'example-token');
        setUser(demoUser);
        return { success: true, user: demoUser };
      } else {
        throw new Error('Credenciales inválidas');
      }
    } catch (error) {
      console.error('Error de login:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };
  
  // Valor del contexto que estará disponible
  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;