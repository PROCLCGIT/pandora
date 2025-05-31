// Componente de debug para NuevoBriefPage
import React, { useState, useEffect } from 'react';
import * as briefService from '../api/briefService';
import api from '@/config/axios';

const TestNuevoBriefDebug = () => {
  const [choices, setChoices] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState([]);

  const addDebugLog = (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const log = { timestamp, message, data };
    console.log(`[${timestamp}] ${message}`, data);
    setDebugInfo(prev => [...prev, log]);
  };

  const loadChoices = async () => {
    setLoading(true);
    setError(null);
    addDebugLog('Iniciando carga de choices...');

    try {
      // Test 1: Direct API call
      addDebugLog('Test 1: Llamada directa a API');
      const directResponse = await api.get('/brief/briefs/choices/');
      addDebugLog('Respuesta directa:', directResponse.data);

      // Test 2: Using briefService
      addDebugLog('Test 2: Usando briefService.getBriefChoices()');
      const serviceResponse = await briefService.getBriefChoices();
      addDebugLog('Respuesta del servicio:', serviceResponse);

      // Set choices
      setChoices(serviceResponse);
      addDebugLog('Choices guardados en estado', serviceResponse);

      // Verify structure
      if (serviceResponse.origin) {
        addDebugLog(`✅ origin: ${serviceResponse.origin.length} opciones`);
      } else {
        addDebugLog('❌ origin NO encontrado');
      }

      if (serviceResponse.priority) {
        addDebugLog(`✅ priority: ${serviceResponse.priority.length} opciones`);
      } else {
        addDebugLog('❌ priority NO encontrado');
      }

      if (serviceResponse.forma_pago) {
        addDebugLog(`✅ forma_pago: ${serviceResponse.forma_pago.length} opciones`);
      } else {
        addDebugLog('❌ forma_pago NO encontrado');
      }

    } catch (err) {
      addDebugLog('❌ Error:', err.message);
      setError(err.message);
      console.error('Error completo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChoices();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug NuevoBriefPage - Choices</h1>
      
      {/* Status */}
      <div className="mb-6 p-4 rounded-lg bg-gray-100">
        <h2 className="font-semibold mb-2">Estado:</h2>
        {loading && <p className="text-blue-600">Cargando...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}
        {!loading && !error && <p className="text-green-600">Carga completa</p>}
      </div>

      {/* Choices Display */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Origen ({choices.origin?.length || 0} opciones)</h3>
          <select className="w-full p-2 border rounded">
            <option value="">Seleccionar...</option>
            {choices.origin?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {!choices.origin && <p className="text-red-500 text-sm mt-1">No hay opciones</p>}
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Prioridad ({choices.priority?.length || 0} opciones)</h3>
          <select className="w-full p-2 border rounded">
            <option value="">Seleccionar...</option>
            {choices.priority?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {!choices.priority && <p className="text-red-500 text-sm mt-1">No hay opciones</p>}
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Forma de Pago ({choices.forma_pago?.length || 0} opciones)</h3>
          <select className="w-full p-2 border rounded">
            <option value="">Seleccionar...</option>
            {choices.forma_pago?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {!choices.forma_pago && <p className="text-red-500 text-sm mt-1">No hay opciones</p>}
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Destino ({choices.destino?.length || 0} opciones)</h3>
          <select className="w-full p-2 border rounded">
            <option value="">Seleccionar...</option>
            {choices.destino?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {!choices.destino && <p className="text-red-500 text-sm mt-1">No hay opciones</p>}
        </div>
      </div>

      {/* Raw Choices Data */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <h3 className="font-semibold mb-2">Datos Raw de Choices:</h3>
        <pre className="text-xs overflow-x-auto">
          {JSON.stringify(choices, null, 2)}
        </pre>
      </div>

      {/* Debug Logs */}
      <div className="p-4 border rounded-lg bg-gray-900 text-white">
        <h3 className="font-semibold mb-2">Debug Logs:</h3>
        <div className="space-y-1 text-xs font-mono">
          {debugInfo.map((log, index) => (
            <div key={index}>
              <span className="text-gray-400">[{log.timestamp}]</span> {log.message}
              {log.data && (
                <pre className="ml-4 text-gray-300">
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6">
        <button 
          onClick={loadChoices}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Recargar Choices
        </button>
      </div>
    </div>
  );
};

export default TestNuevoBriefDebug;