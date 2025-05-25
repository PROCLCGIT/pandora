import axios from '@/config/axios';

const API_URL = '/directorio/clientes';

export const clienteService = {
  // Get all clients with pagination and search
  getClientes: async (params = {}) => {
    try {
      const { page = 1, page_size = 10, search = '', ordering = '-created_at' } = params;
      console.log('Fetching clientes with params:', { page, page_size, search, ordering });
      
      const response = await axios.get(API_URL, {
        params: {
          page,
          page_size,
          search,
          ordering,
          activo: true // Only get active clients
        }
      });
      
      console.log('Clientes response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching clientes:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  // Get a single client by ID
  getCliente: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cliente:', error);
      throw error;
    }
  },

  // Get only active clients
  getClientesActivos: async (params = {}) => {
    try {
      const { page = 1, page_size = 10, search = '', ordering = '-created_at' } = params;
      console.log('Fetching active clientes with params:', { page, page_size, search });
      
      const response = await axios.get(`${API_URL}/activos/`, {
        params: {
          page,
          page_size,
          search,
          ordering
        }
      });
      
      console.log('Active clientes response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching active clientes:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  }
};