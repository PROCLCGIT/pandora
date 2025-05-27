import { useState, useCallback } from 'react';
import { inventoryApi } from '../api/inventoryApi';
import { toast } from 'sonner';

export const useMovements = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [tiposMovimiento, setTiposMovimiento] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMovimientos = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await inventoryApi.getMovimientos(params);
      setMovimientos(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Error al cargar movimientos');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTiposMovimiento = useCallback(async () => {
    try {
      const response = await inventoryApi.getTiposMovimiento();
      setTiposMovimiento(response.data);
    } catch (err) {
      toast.error('Error al cargar tipos de movimiento');
    }
  }, []);

  const createMovimiento = async (data) => {
    setLoading(true);
    try {
      const response = await inventoryApi.createMovimiento(data);
      toast.success('Movimiento creado exitosamente');
      await fetchMovimientos();
      return response.data;
    } catch (err) {
      toast.error('Error al crear movimiento');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const confirmarMovimiento = async (movimientoId) => {
    try {
      await inventoryApi.confirmarMovimiento(movimientoId);
      toast.success('Movimiento confirmado');
      await fetchMovimientos();
    } catch (err) {
      toast.error('Error al confirmar movimiento');
      throw err;
    }
  };

  const anularMovimiento = async (movimientoId) => {
    try {
      await inventoryApi.anularMovimiento(movimientoId);
      toast.success('Movimiento anulado');
      await fetchMovimientos();
    } catch (err) {
      toast.error('Error al anular movimiento');
      throw err;
    }
  };

  return {
    movimientos,
    tiposMovimiento,
    loading,
    error,
    fetchMovimientos,
    fetchTiposMovimiento,
    createMovimiento,
    confirmarMovimiento,
    anularMovimiento,
  };
};
