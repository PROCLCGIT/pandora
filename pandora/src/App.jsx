// pandora/src/App.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from './modulos/auth/authContext';
import EmergencyFallback from './components/ui/EmergencyFallback';

function App() {
  const { backendAvailable, loading } = useAuth();
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Efecto para detectar posibles ciclos infinitos o errores persistentes
  useEffect(() => {
    // Contador para detectar demasiados cambios de estado en poco tiempo
    let loadingChanges = 0;
    let timer = null;
    
    const handleStateChange = () => {
      loadingChanges++;
      
      // Si detectamos demasiados cambios en poco tiempo, mostrar pantalla de emergencia
      if (loadingChanges > 5) {
        console.error("Posible ciclo de renderizado detectado en App.jsx");
        setHasError(true);
      }
    };
    
    // Reiniciar contador cada 5 segundos
    timer = setInterval(() => {
      loadingChanges = 0;
    }, 5000);
    
    // Observar cambios en estado de autenticación
    handleStateChange();
    
    return () => {
      clearInterval(timer);
    };
  }, [loading]);
  
  // Si hay demasiados reintentos o errores detectados, mostrar fallback
  if (hasError || retryCount > 3) {
    return <EmergencyFallback />;
  }

  // Nota: Con el nuevo enfoque, no necesitamos definir rutas aquí
  // El componente RouterProvider en main.jsx se encarga de eso
  
  // Ahora este componente solo se usa para la detección de errores
  // y el indicador de backend no disponible
  
  // Indicador de backend no disponible
  if (!backendAvailable) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-1 px-2 z-50 text-sm">
        ⚠️ Servidor no disponible - Consulta el botón "Config Backend" abajo a la derecha
      </div>
    );
  }
  
  // El resto del contenido se renderiza a través del RouterProvider
  return null;
}

export default App;