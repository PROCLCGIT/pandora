import { useState, useEffect, useCallback } from 'react';
import { inventoryApi } from '../api/inventoryApi';
import { toast } from 'sonner';

export const useInventory = () => {
  const [stocks, setStocks] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStocks = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await inventoryApi.getStocks(params);
      setStocks(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Error al cargar el inventario');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAlmacenes = useCallback(async () => {
    try {
      const response = await inventoryApi.getAlmacenes();
      setAlmacenes(response.data);
    } catch (err) {
      toast.error('Error al cargar almacenes');
    }
  }, []);

  const fetchResumen = useCallback(async () => {
    try {
      const response = await inventoryApi.getStockResumen();
      setResumen(response.data);
    } catch (err) {
      toast.error('Error al cargar resumen');
    }
  }, []);

  const ajustarStock = async (stockId, minimo, maximo) => {
    try {
      await inventoryApi.ajustarMinimos(stockId, {
        stock_minimo: minimo,
        stock_maximo: maximo,
      });
      toast.success('Stock ajustado correctamente');
      await fetchStocks();
    } catch (err) {
      toast.error('Error al ajustar stock');
      throw err;
    }
  };

  useEffect(() => {
    fetchAlmacenes();
    fetchResumen();
  }, [fetchAlmacenes, fetchResumen]);

  return {
    stocks,
    almacenes,
    resumen,
    loading,
    error,
    fetchStocks,
    ajustarStock,
    refetch: () => {
      fetchStocks();
      fetchResumen();
    },
  };
};
