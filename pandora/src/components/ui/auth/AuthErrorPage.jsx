import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Página de error de autenticación que proporciona instrucciones para solucionar problemas
 */
function AuthErrorPage({ error, onRetry }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-red-600 p-4">
          <h2 className="text-white text-lg font-bold">Error de Autenticación</h2>
        </div>
        
        <div className="p-6">
          <div className="flex items-center mb-4">
            <svg className="h-8 w-8 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-gray-700 font-medium">
              {error || "No se pudo autenticar con el servidor"}
            </span>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium text-gray-800 mb-2">Pasos para solucionar:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Verifique que el servidor backend esté funcionando (<code className="bg-gray-200 px-1 rounded">python manage.py runserver</code>)</li>
              <li>Asegúrese de que exista un usuario en la base de datos con las credenciales correctas</li>
              <li>Para crear un superusuario ejecute:
                <pre className="bg-gray-200 p-2 rounded mt-1 text-sm overflow-auto">
                  python manage.py createsuperuser --username=admin --email=admin@example.com
                </pre>
              </li>
              <li>Verifique la configuración de CORS en el servidor (<code className="bg-gray-200 px-1 rounded">settings.py</code>)</li>
              <li>Reinicie tanto el servidor frontend como el backend</li>
            </ol>
          </div>
          
          <div className="flex justify-between">
            <Link 
              to="/login" 
              className="inline-block px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Volver al Login
            </Link>
            <button 
              onClick={onRetry}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              Reintentar Conexión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthErrorPage;