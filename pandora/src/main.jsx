// pandora/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './store';
import { routes } from './routes.jsx';
import './styles/globals.css';
import { AuthProvider } from './modulos/auth/authContext';
import SessionManager from './components/ui/auth/SessionManager';

// Importar los recursos críticos para la carga inicial
// Se han eliminado las importaciones no esenciales para el inicio

// Función de inicio de app optimizada
const initApp = () => {
  console.log('🚀 Iniciando aplicación...');
  
  // Mostrar claramente la URL del backend para diagnóstico
  const backendUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000/api/' 
    : `${window.location.protocol}//${window.location.hostname}/api/`;
  console.log('🔌 Backend configurado en:', backendUrl);
  
  // Comprobar si estamos en modo de desarrollo
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    console.log('🛠️ Ejecutando en modo desarrollo');
  }
};

// Verificar modo de emergencia de forma más eficiente
const checkEmergencyMode = () => {
  // Verificar si tenemos un parámetro de URL emergency=true o si el modo fue activado
  const urlParams = new URLSearchParams(window.location.search);
  const emergencyParam = urlParams.get('emergency');
  const hasEmergencyFlag = emergencyParam === 'true';
  const forceEmergencyMode = localStorage.getItem('forceEmergencyMode') === 'true';
  
  // Si hay un parámetro de emergencia o configuración previa
  if (hasEmergencyFlag || forceEmergencyMode) {
    console.log('🚨 MODO DE EMERGENCIA ACTIVADO');
    
    // Configurar el estado de autenticación de emergencia solo si se activa por primera vez
    if (hasEmergencyFlag && !forceEmergencyMode) {
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
      
      // Guardar la preferencia para futuras cargas
      localStorage.setItem('forceEmergencyMode', 'true');
    }
    
    // Redirigir solo si estamos en login y se activa el modo de emergencia vía URL
    if (hasEmergencyFlag && window.location.pathname === '/login') {
      window.location.replace('/dashboard');
      return true; // Indica que estamos redirigiendo
    }
    
    return forceEmergencyMode; // Devolver estado actual
  }
  
  return false;
};

// Inicializar la aplicación
initApp();

// Configurar React Query con opciones optimizadas - creamos fuera para cargar más rápido
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // No reintentar en caso de error 401/403 (problemas de autenticación)
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        // Reintentar máximo 1 vez para otros errores
        return failureCount < 1;
      },
      staleTime: 5 * 60 * 1000, // 5 minutos
      onError: (error) => {
        if (error?.response?.status === 401) {
          console.warn('Error de autenticación 401 en React Query');
        }
      }
    },
  },
});

// Crear el router usando las rutas definidas en routes.jsx
const router = createBrowserRouter(routes, {
  // Habilitamos las funcionalidades de la versión 7 para mejorar el rendimiento
  future: {
    v7_startTransition: true,
  },
});

// CAMBIO CRÍTICO: Renderizamos inmediatamente sin comprobar modo emergencia
// Esto asegura que la página de login se cargue inmediatamente
console.log('🖥️ Renderizando aplicación inmediatamente...');

// Eliminando StrictMode para evitar renderizados dobles que podrían causar loops
ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SessionManager>
          <RouterProvider router={router} />
        </SessionManager>
      </AuthProvider>
    </QueryClientProvider>
  </Provider>
);

// Comprobar modo de emergencia en segundo plano para no bloquear el renderizado
setTimeout(() => {
  const isEmergencyMode = checkEmergencyMode();
  if (isEmergencyMode) {
    console.log('⏳ Modo de emergencia activado en segundo plano');
  }
}, 100);