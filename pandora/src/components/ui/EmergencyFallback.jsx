import React, { useState } from 'react';

/**
 * Componente de emergencia para mostrar cuando hay problemas graves de carga
 * Proporciona opciones de recuperación y herramientas de diagnóstico
 */
function EmergencyFallback() {
  const [debugInfo, setDebugInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Función para verificar el estado del backend
  const checkBackend = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/auth/debug/');
      const data = await response.json();
      setDebugInfo({
        status: response.status,
        data,
        time: new Date().toLocaleTimeString()
      });
    } catch (error) {
      setDebugInfo({
        error: error.message,
        time: new Date().toLocaleTimeString()
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para intentar arreglar manualmente los tokens
  const fixAuth = () => {
    try {
      // Token JWT de ejemplo con fecha de expiración extendida para desarrollo
      localStorage.setItem('accessToken', 
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE5OTk5OTk5OTl9.demo-signature-very-secure-fixed');
      localStorage.setItem('refreshToken', 
        'refresh-token-example-very-secure-fixed');
        
      // Guardar info en localStorage para authContext
      localStorage.setItem('authCache', JSON.stringify({
        data: {
          isValid: true,
          userId: 1,
          expiresIn: 60
        },
        timestamp: Date.now()
      }));
      
      setDebugInfo({
        message: "Tokens de emergencia configurados. Intenta recargar la página.",
        time: new Date().toLocaleTimeString()
      });
    } catch (error) {
      setDebugInfo({
        error: `Error al configurar tokens: ${error.message}`,
        time: new Date().toLocaleTimeString()
      });
    }
  };
  
  // Función para limpiar el almacenamiento local
  const clearStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      setDebugInfo({
        message: "Almacenamiento local limpiado. Intenta recargar la página.",
        time: new Date().toLocaleTimeString()
      });
    } catch (error) {
      setDebugInfo({
        error: `Error al limpiar almacenamiento: ${error.message}`,
        time: new Date().toLocaleTimeString()
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-red-600 p-4">
          <h2 className="text-white text-xl font-bold">
            ⚠️ Modo de Recuperación de Emergencia
          </h2>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Problema detectado</h3>
            <p className="text-gray-700 mb-4">
              La aplicación está experimentando problemas para cargar correctamente. Esto puede deberse a:
            </p>
            <ul className="list-disc pl-5 mb-4 text-gray-700 space-y-1">
              <li>Problemas de autenticación con el servidor backend</li>
              <li>Errores en el almacenamiento local del navegador</li>
              <li>Ciclos de renderizado infinitos en la aplicación</li>
              <li>Falta de usuarios válidos en la base de datos del servidor</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <h4 className="font-medium text-yellow-800 mb-2">Acciones recomendadas:</h4>
            <ol className="list-decimal pl-5 text-yellow-800 space-y-2">
              <li>
                <span className="font-medium">Ir a la página de login:</span>{' '}
                <a 
                  href="/login" 
                  className="text-blue-600 hover:underline font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = '/login';
                  }}
                >
                  Navegar al login
                </a>
              </li>
              <li>
                <span className="font-medium">Crear un usuario en el backend:</span>{' '}
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  python manage.py createsuperuser
                </code>
              </li>
              <li>
                <span className="font-medium">Limpiar localStorage:</span>{' '}
                <button 
                  onClick={clearStorage}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-sm"
                >
                  Limpiar almacenamiento
                </button>
              </li>
              <li>
                <span className="font-medium">Recargar la página:</span>{' '}
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded text-sm"
                >
                  Recargar ahora
                </button>
              </li>
            </ol>
          </div>
          
          <div className="border border-gray-200 rounded-md p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Herramientas de diagnóstico:</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              <button 
                onClick={checkBackend}
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
              >
                {isLoading ? 'Verificando...' : 'Verificar backend'}
              </button>
              
              <button 
                onClick={fixAuth}
                className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded"
              >
                Arreglar tokens (desarrollo)
              </button>
              
              <a 
                href="/dashboard" 
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded inline-block"
                onClick={(e) => {
                  e.preventDefault();
                  // Configurar tokens directamente
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
                  // Forzar navegación directa al dashboard
                  window.location.href = '/dashboard';
                }}
              >
                Entrar en modo DEMO
              </a>
            </div>
            
            {debugInfo && (
              <div className="bg-gray-50 p-3 rounded-md overflow-auto max-h-60 text-sm">
                <div className="font-mono mb-1 text-gray-500">Hora: {debugInfo.time}</div>
                {debugInfo.error && (
                  <div className="text-red-600 font-medium">{debugInfo.error}</div>
                )}
                {debugInfo.message && (
                  <div className="text-green-600 font-medium">{debugInfo.message}</div>
                )}
                {debugInfo.data && (
                  <pre className="whitespace-pre-wrap break-words">
                    {JSON.stringify(debugInfo.data, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
          
          <div className="text-xs text-gray-500 mt-4">
            Modo de emergencia - Desactivar después de resolver los problemas modificando App.jsx
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmergencyFallback;