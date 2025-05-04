// pandora/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './store';
import App from './App';
import './styles/globals.css';
import { AuthProvider } from './modulos/auth/authContext';

// Crear cliente de React Query para la gestión de datos del servidor
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
      // Manejador global de errores
      onError: (error) => {
        // Log para errores de autenticación
        if (error?.response?.status === 401) {
          console.warn('Error de autenticación 401 en React Query');
          // Forzar un token para desarrollo
          const demoToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE5OTk5OTk5OTl9.demo-signature-very-secure-fixed';
          localStorage.setItem('accessToken', demoToken);
          localStorage.setItem('refreshToken', 'refresh-token-example');
        }
      }
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);