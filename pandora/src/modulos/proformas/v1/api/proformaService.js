import axios from '@/config/axios';

const API_URL = '/proformas';

export const proformaService = {
  // Get all proformas with pagination
  getProformas: async (params = {}) => {
    try {
      const { page = 1, page_size = 10, search = '', ordering = '-fecha_emision' } = params;
      const response = await axios.get(`${API_URL}/proformas/`, {
        params: {
          page,
          page_size,
          search,
          ordering
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching proformas:', error);
      throw error;
    }
  },

  // Get a single proforma by ID
  getProforma: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/proformas/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching proforma:', error);
      throw error;
    }
  },

  // Create a new proforma
  createProforma: async (data) => {
    try {
      console.log('Creating proforma with data:', data);
      const response = await axios.post(`${API_URL}/proformas/`, data);
      console.log('Proforma created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating proforma:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  // Update an existing proforma
  updateProforma: async (id, data) => {
    try {
      const response = await axios.patch(`${API_URL}/proformas/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating proforma:', error);
      throw error;
    }
  },

  // Delete a proforma
  deleteProforma: async (id) => {
    try {
      await axios.delete(`${API_URL}/proformas/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting proforma:', error);
      throw error;
    }
  },

  // Change proforma state
  changeProformaState: async (id, estado) => {
    try {
      const response = await axios.post(`${API_URL}/proformas/${id}/cambiar-estado/`, { estado });
      return response.data;
    } catch (error) {
      console.error('Error changing proforma state:', error);
      throw error;
    }
  },

  // Duplicate a proforma
  duplicateProforma: async (id) => {
    try {
      const response = await axios.post(`${API_URL}/proformas/${id}/duplicar/`);
      return response.data;
    } catch (error) {
      console.error('Error duplicating proforma:', error);
      throw error;
    }
  },

  // Get proforma configuration
  getConfiguration: async () => {
    try {
      const response = await axios.get(`${API_URL}/configuracion-actual/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching configuration:', error);
      throw error;
    }
  },

  // Get companies
  getEmpresas: async () => {
    try {
      const response = await axios.get('/basic/empresas/');
      return response.data;
    } catch (error) {
      console.error('Error fetching empresas:', error);
      throw error;
    }
  },

  // Get contract types
  getTiposContratacion: async () => {
    try {
      const response = await axios.get('/basic/tipos-contratacion/');
      return response.data;
    } catch (error) {
      console.error('Error fetching tipos contratacion:', error);
      throw error;
    }
  },

  // Proforma Items
  getProformaItems: async (proformaId) => {
    try {
      const response = await axios.get(`${API_URL}/items-por-proforma/${proformaId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching proforma items:', error);
      throw error;
    }
  },

  createProformaItem: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/items/`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating proforma item:', error);
      throw error;
    }
  },

  updateProformaItem: async (id, data) => {
    try {
      const response = await axios.patch(`${API_URL}/items/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating proforma item:', error);
      throw error;
    }
  },

  deleteProformaItem: async (id) => {
    try {
      await axios.delete(`${API_URL}/items/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting proforma item:', error);
      throw error;
    }
  }
};