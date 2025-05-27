import axios from '@/config/axios';

const API_BASE_URL = '/api/inventario';

// Almacenes Service
export const almacenesService = {
  // Get all almacenes with pagination
  getAll: (params = {}) => {
    return axios.get(`${API_BASE_URL}/almacenes/`, { params });
  },

  // Get single almacen by ID
  getById: (id) => {
    return axios.get(`${API_BASE_URL}/almacenes/${id}/`);
  },

  // Create new almacen
  create: (data) => {
    return axios.post(`${API_BASE_URL}/almacenes/`, data);
  },

  // Update almacen
  update: (id, data) => {
    return axios.put(`${API_BASE_URL}/almacenes/${id}/`, data);
  },

  // Delete almacen
  delete: (id) => {
    return axios.delete(`${API_BASE_URL}/almacenes/${id}/`);
  }
};

// Stock Service
export const stockService = {
  // Get all stock items with pagination
  getAll: (params = {}) => {
    return axios.get(`${API_BASE_URL}/stock/`, { params });
  },

  // Get stock by ID
  getById: (id) => {
    return axios.get(`${API_BASE_URL}/stock/${id}/`);
  },

  // Get stock by product
  getByProducto: (productoId, params = {}) => {
    return axios.get(`${API_BASE_URL}/stock/producto/${productoId}/`, { params });
  },

  // Get stock by almacen
  getByAlmacen: (almacenId, params = {}) => {
    return axios.get(`${API_BASE_URL}/stock/almacen/${almacenId}/`, { params });
  },

  // Update stock quantity
  updateQuantity: (id, cantidad) => {
    return axios.patch(`${API_BASE_URL}/stock/${id}/`, { cantidad_actual: cantidad });
  }
};

// Movimientos Service
export const movimientosService = {
  // Get all movements with pagination
  getAll: (params = {}) => {
    return axios.get(`${API_BASE_URL}/movimientos/`, { params });
  },

  // Get movement by ID
  getById: (id) => {
    return axios.get(`${API_BASE_URL}/movimientos/${id}/`);
  },

  // Create new movement
  create: (data) => {
    return axios.post(`${API_BASE_URL}/movimientos/`, data);
  },

  // Get movements by almacen
  getByAlmacen: (almacenId, params = {}) => {
    return axios.get(`${API_BASE_URL}/movimientos/almacen/${almacenId}/`, { params });
  },

  // Get movements by product
  getByProducto: (productoId, params = {}) => {
    return axios.get(`${API_BASE_URL}/movimientos/producto/${productoId}/`, { params });
  }
};

// Alertas Service
export const alertasService = {
  // Get all alerts with pagination
  getAll: (params = {}) => {
    return axios.get(`${API_BASE_URL}/alertas/`, { params });
  },

  // Get alert by ID
  getById: (id) => {
    return axios.get(`${API_BASE_URL}/alertas/${id}/`);
  },

  // Get active alerts
  getActive: (params = {}) => {
    return axios.get(`${API_BASE_URL}/alertas/activas/`, { params });
  },

  // Mark alert as resolved
  resolve: (id) => {
    return axios.patch(`${API_BASE_URL}/alertas/${id}/resolver/`);
  },

  // Get alerts by almacen
  getByAlmacen: (almacenId, params = {}) => {
    return axios.get(`${API_BASE_URL}/alertas/almacen/${almacenId}/`, { params });
  }
};

// Dashboard Service
export const dashboardService = {
  // Get inventory summary
  getSummary: () => {
    return axios.get(`${API_BASE_URL}/dashboard/resumen/`);
  },

  // Get low stock alerts
  getLowStock: (params = {}) => {
    return axios.get(`${API_BASE_URL}/dashboard/stock-bajo/`, { params });
  },

  // Get recent movements
  getRecentMovements: (params = {}) => {
    return axios.get(`${API_BASE_URL}/dashboard/movimientos-recientes/`, { params });
  },

  // Get stock value by almacen
  getStockValue: () => {
    return axios.get(`${API_BASE_URL}/dashboard/valor-stock/`);
  }
};