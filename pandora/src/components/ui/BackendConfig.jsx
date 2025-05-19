import { useState, useEffect } from 'react';
import { Server } from 'lucide-react';
import { getCurrentBackendUrl, setManualBackendUrl, checkConnectionStatus } from '../../utils/checkBackend';

/**
 * Componente para configurar manualmente la URL del backend
 * Útil cuando la detección automática falla
 */
export function BackendConfig({ inHeader = false }) {
  const [backendUrl, setBackendUrl] = useState('');
  const [isManual, setIsManual] = useState(false);
  const [status, setStatus] = useState({ loading: false, connected: false, message: '', error: null });
  const [isOpen, setIsOpen] = useState(false);
  
  // Cargar URL actual al montar el componente
  useEffect(() => {
    const currentUrl = getCurrentBackendUrl();
    setBackendUrl(currentUrl);
    setIsManual(!!localStorage.getItem('manualBackendUrl'));
    
    // Verificar conexión inicial
    checkConnection();
  }, []);
  
  // Verificar conexión con el backend
  const checkConnection = async () => {
    setStatus({ ...status, loading: true, error: null });
    
    try {
      const result = await checkConnectionStatus(true);
      setStatus({
        loading: false,
        connected: result.connected,
        message: result.message,
        error: null,
        details: result.details
      });
    } catch (error) {
      setStatus({
        loading: false,
        connected: false,
        message: 'Error al verificar conexión',
        error: error.message
      });
    }
  };
  
  // Establecer URL manual
  const saveManualUrl = () => {
    try {
      // Validar URL
      const url = backendUrl.trim();
      if (!url) {
        throw new Error('La URL no puede estar vacía');
      }
      
      // Intentar parsear la URL para validar
      new URL(url);
      
      // Guardar la URL
      setManualBackendUrl(url);
      setIsManual(true);
      
      // Verificar nueva conexión
      checkConnection();
      
      return true;
    } catch (error) {
      setStatus({
        ...status,
        error: `URL inválida: ${error.message}`
      });
      return false;
    }
  };
  
  // Eliminar configuración manual
  const resetToAuto = () => {
    setManualBackendUrl(null);
    setIsManual(false);
    
    // Restablecer URL automática
    const autoUrl = getCurrentBackendUrl();
    setBackendUrl(autoUrl);
    
    // Verificar conexión
    checkConnection();
  };
  
  if (!isOpen) {
    if (inHeader) {
      return (
        <button 
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative"
          onClick={() => setIsOpen(true)}
          title="Configuración del Backend"
        >
          <Server size={18} />
          <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${
            status.connected ? 'bg-green-500' : 'bg-red-500'
          }`}></span>
        </button>
      );
    }
    
    return (
      <button 
        className="fixed bottom-3 right-3 bg-blue-500 hover:bg-blue-600 text-white p-1 rounded-md text-xs shadow-md z-50"
        onClick={() => setIsOpen(true)}
      >
        Config Backend
      </button>
    );
  }
  
  return (
    <div className="fixed bottom-0 right-0 bg-white shadow-lg rounded-t-lg border border-gray-300 p-4 m-3 z-50 w-96 max-w-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">Configuración del Backend</h3>
        <button 
          className="text-gray-500 hover:text-gray-700"
          onClick={() => setIsOpen(false)}
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Estado de conexión */}
        <div className="text-sm">
          <div className="flex items-center">
            <div 
              className={`w-3 h-3 rounded-full mr-2 ${status.connected ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span>
              {status.connected ? 'Conectado' : 'Desconectado'}
              {status.loading && ' (Verificando...)'}
            </span>
          </div>
          {status.message && <p className="text-gray-600 mt-1">{status.message}</p>}
          {status.error && <p className="text-red-500 mt-1">{status.error}</p>}
        </div>
        
        {/* Modo de configuración */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="manualMode"
            checked={isManual}
            onChange={(e) => {
              const checked = e.target.checked;
              if (checked) {
                saveManualUrl();
              } else {
                resetToAuto();
              }
            }}
            className="h-4 w-4 text-blue-500"
          />
          <label htmlFor="manualMode" className="text-sm">
            Configurar manualmente
          </label>
        </div>
        
        {/* Campo URL */}
        <div>
          <label htmlFor="backendUrl" className="block text-sm font-medium text-gray-700 mb-1">
            URL del Backend
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="backendUrl"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              disabled={!isManual}
              placeholder="http://localhost:8000"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
            />
            <button
              onClick={saveManualUrl}
              disabled={!isManual}
              className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm disabled:opacity-50 disabled:bg-gray-400"
            >
              Guardar
            </button>
          </div>
        </div>
        
        {/* Acciones */}
        <div className="flex justify-between">
          <button
            onClick={checkConnection}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
          >
            Verificar conexión
          </button>
          
          <button
            onClick={resetToAuto}
            className="px-3 py-1 text-blue-500 hover:text-blue-700 text-sm"
          >
            Restablecer automático
          </button>
        </div>
        
        {/* Tips */}
        <div className="text-xs text-gray-500 mt-2 border-t pt-2">
          <p className="font-medium mb-1">Consejos:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>En desarrollo local, prueba http://localhost:8000</li>
            <li>Asegúrate que la URL no contiene /api/ (se agrega automáticamente)</li>
            <li>Si tienes CORS habilitado, usa la URL exacta del backend</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default BackendConfig; 