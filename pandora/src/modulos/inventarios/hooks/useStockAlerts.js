import { useState, useCallback, useEffect } from 'react';
import { inventoryApi } from '../api/inventoryApi';
import { toast } from 'sonner';

export const useStockAlerts = (autoRefresh = false, refreshInterval = 60000) => {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchAlertas = useCallback(async (params = { leida: false }) => {
    setLoading(true);
    try {
      const response = await inventoryApi.getAlertas(params);
      setAlertas(response.data);
      setUnreadCount(response.data.filter(a => !a.leida).length);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error al cargar alertas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const marcarComoLeida = async (alertaId) => {
    try {
      await inventoryApi.marcarAlertaLeida(alertaId);
      setAlertas(prev => prev.filter(a => a.id !== alertaId));
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Alerta marcada como leída');
    } catch (err) {
      toast.error('Error al marcar alerta');
      throw err;
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      await inventoryApi.marcarTodasLeidas();
      setAlertas([]);
      setUnreadCount(0);
      toast.success('Todas las alertas marcadas como leídas');
    } catch (err) {
      toast.error('Error al marcar alertas');
      throw err;
    }
  };

  // Auto-refresh si está habilitado
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchAlertas();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchAlertas]);

  // Cargar alertas inicialmente
  useEffect(() => {
    fetchAlertas();
  }, [fetchAlertas]);

  return {
    alertas,
    loading,
    error,
    unreadCount,
    fetchAlertas,
    marcarComoLeida,
    marcarTodasLeidas,
  };
};
