import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: `${API_URL}/inventario`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const inventoryApi = {
  // Almacenes
  getAlmacenes: () => api.get('/almacenes/'),
  getAlmacen: (id) => api.get(`/almacenes/${id}/`),
  createAlmacen: (data) => api.post('/almacenes/', data),
  updateAlmacen: (id, data) => api.put(`/almacenes/${id}/`, data),
  deleteAlmacen: (id) => api.delete(`/almacenes/${id}/`),

  // Stocks
  getStocks: (params) => api.get('/stocks/', { params }),
  getStock: (id) => api.get(`/stocks/${id}/`),
  getStockAlertas: () => api.get('/stocks/alertas/'),
  getStockResumen: () => api.get('/stocks/resumen/'),
  ajustarMinimos: (id, data) => api.post(`/stocks/${id}/ajustar_minimos/`, data),

  // Movimientos
  getMovimientos: (params) => api.get('/movimientos/', { params }),
  getMovimiento: (id) => api.get(`/movimientos/${id}/`),
  createMovimiento: (data) => api.post('/movimientos/', data),
  confirmarMovimiento: (id) => api.post(`/movimientos/${id}/confirmar/`),
  anularMovimiento: (id) => api.post(`/movimientos/${id}/anular/`),

  // Tipos de Movimiento
  getTiposMovimiento: () => api.get('/tipos-movimiento/'),

  // Alertas
  getAlertas: (params) => api.get('/alertas/', { params }),
  marcarAlertaLeida: (id) => api.post(`/alertas/${id}/marcar_leida/`),
  marcarTodasLeidas: () => api.post('/alertas/marcar_todas_leidas/'),
};
