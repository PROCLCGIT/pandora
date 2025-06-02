import { useState, useEffect } from 'react';
import fastinfoApi from '../api/fastinfoApi';

export const useNombresEntidad = () => {
  const [nombres, setNombres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNombres = async (params = {}) => {
    setLoading(true);
    try {
      const data = await fastinfoApi.getNombresEntidad(params);
      setNombres(Array.isArray(data) ? data : data.results || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setNombres([]);
    } finally {
      setLoading(false);
    }
  };

  const createNombre = async (data) => {
    try {
      const newNombre = await fastinfoApi.createNombreEntidad(data);
      setNombres(prev => [...prev, newNombre]);
      return newNombre;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateNombre = async (id, data) => {
    try {
      const updatedNombre = await fastinfoApi.updateNombreEntidad(id, data);
      setNombres(prev => prev.map(item => item.id === id ? updatedNombre : item));
      return updatedNombre;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteNombre = async (id) => {
    try {
      await fastinfoApi.deleteNombreEntidad(id);
      setNombres(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchNombres();
  }, []);

  return {
    nombres,
    loading,
    error,
    fetchNombres,
    createNombre,
    updateNombre,
    deleteNombre
  };
};

export const useDatosInstitucionales = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDatos = async (params = {}) => {
    setLoading(true);
    try {
      const data = await fastinfoApi.getDatosInstitucionales(params);
      setDatos(Array.isArray(data) ? data : data.results || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setDatos([]);
    } finally {
      setLoading(false);
    }
  };

  const createDato = async (data) => {
    try {
      const newDato = await fastinfoApi.createDatoInstitucional(data);
      setDatos(prev => [...prev, newDato]);
      return newDato;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateDato = async (id, data) => {
    try {
      const updatedDato = await fastinfoApi.updateDatoInstitucional(id, data);
      setDatos(prev => prev.map(item => item.id === id ? updatedDato : item));
      return updatedDato;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteDato = async (id) => {
    try {
      await fastinfoApi.deleteDatoInstitucional(id);
      setDatos(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  return {
    datos,
    loading,
    error,
    fetchDatos,
    createDato,
    updateDato,
    deleteDato
  };
};