import axios from '@/config/axios';

// Base URL para el módulo fastinfo
const FASTINFO_BASE_URL = '/api/fastinfo';

// ===============================
// Servicios para Nombre Entidad
// ===============================

export const getNombresEntidad = async (params = {}) => {
  try {
    const response = await axios.get(`${FASTINFO_BASE_URL}/nombres-entidad/`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching nombres entidad:', error);
    throw error;
  }
};

export const getNombreEntidadById = async (id) => {
  try {
    const response = await axios.get(`${FASTINFO_BASE_URL}/nombres-entidad/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching nombre entidad by id:', error);
    throw error;
  }
};

export const createNombreEntidad = async (data) => {
  try {
    const response = await axios.post(`${FASTINFO_BASE_URL}/nombres-entidad/`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating nombre entidad:', error);
    throw error;
  }
};

export const updateNombreEntidad = async (id, data) => {
  try {
    const response = await axios.put(`${FASTINFO_BASE_URL}/nombres-entidad/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating nombre entidad:', error);
    throw error;
  }
};

export const deleteNombreEntidad = async (id) => {
  try {
    const response = await axios.delete(`${FASTINFO_BASE_URL}/nombres-entidad/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting nombre entidad:', error);
    throw error;
  }
};

// ===============================
// Servicios para Datos Institucionales
// ===============================

export const getDatosInstitucionales = async (params = {}) => {
  try {
    const response = await axios.get(`${FASTINFO_BASE_URL}/datos-institucionales/`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching datos institucionales:', error);
    throw error;
  }
};

export const getDatosInstitucionalesById = async (id) => {
  try {
    const response = await axios.get(`${FASTINFO_BASE_URL}/datos-institucionales/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching datos institucionales by id:', error);
    throw error;
  }
};

export const createDatosInstitucionales = async (data) => {
  try {
    const response = await axios.post(`${FASTINFO_BASE_URL}/datos-institucionales/`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating datos institucionales:', error);
    throw error;
  }
};

export const updateDatosInstitucionales = async (id, data) => {
  try {
    const response = await axios.put(`${FASTINFO_BASE_URL}/datos-institucionales/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating datos institucionales:', error);
    throw error;
  }
};

export const deleteDatosInstitucionales = async (id) => {
  try {
    const response = await axios.delete(`${FASTINFO_BASE_URL}/datos-institucionales/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting datos institucionales:', error);
    throw error;
  }
};

// ===============================
// Servicios específicos adicionales
// ===============================

export const getEntidadesActivas = async () => {
  try {
    const response = await axios.get(`${FASTINFO_BASE_URL}/datos-institucionales/activas/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching entidades activas:', error);
    throw error;
  }
};

export const verificarContrasena = async (id, contrasena) => {
  try {
    const response = await axios.post(`${FASTINFO_BASE_URL}/datos-institucionales/${id}/verificar_contrasena/`, {
      contrasena
    });
    return response.data;
  } catch (error) {
    console.error('Error verificando contraseña:', error);
    throw error;
  }
};

export const getEstadisticas = async () => {
  try {
    const response = await axios.get(`${FASTINFO_BASE_URL}/datos-institucionales/estadisticas/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching estadísticas:', error);
    throw error;
  }
};

// ===============================
// Servicios de utilidad
// ===============================

export const buscarPorRuc = async (ruc) => {
  try {
    const response = await axios.get(`${FASTINFO_BASE_URL}/datos-institucionales/`, {
      params: { ruc }
    });
    return response.data;
  } catch (error) {
    console.error('Error buscando por RUC:', error);
    throw error;
  }
};

export const buscarPorEntidad = async (nombreEntidadId) => {
  try {
    const response = await axios.get(`${FASTINFO_BASE_URL}/datos-institucionales/`, {
      params: { nombre_entidad: nombreEntidadId }
    });
    return response.data;
  } catch (error) {
    console.error('Error buscando por entidad:', error);
    throw error;
  }
};