import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/fastinfo/api';

class FastinfoApi {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Nombres de Entidad
  async getNombresEntidad(params = {}) {
    const response = await this.client.get('/nombres-entidad/', { params });
    return response.data;
  }

  async getNombreEntidad(id) {
    const response = await this.client.get(`/nombres-entidad/${id}/`);
    return response.data;
  }

  async createNombreEntidad(data) {
    const response = await this.client.post('/nombres-entidad/', data);
    return response.data;
  }

  async updateNombreEntidad(id, data) {
    const response = await this.client.put(`/nombres-entidad/${id}/`, data);
    return response.data;
  }

  async deleteNombreEntidad(id) {
    const response = await this.client.delete(`/nombres-entidad/${id}/`);
    return response.data;
  }

  async getNombresEntidadActivos() {
    const response = await this.client.get('/nombres-entidad/activos/');
    return response.data;
  }

  // Datos Institucionales
  async getDatosInstitucionales(params = {}) {
    const response = await this.client.get('/datos-institucionales/', { params });
    return response.data;
  }

  async getDatoInstitucional(id) {
    const response = await this.client.get(`/datos-institucionales/${id}/`);
    return response.data;
  }

  async createDatoInstitucional(data) {
    const response = await this.client.post('/datos-institucionales/', data);
    return response.data;
  }

  async updateDatoInstitucional(id, data) {
    const response = await this.client.put(`/datos-institucionales/${id}/`, data);
    return response.data;
  }

  async deleteDatoInstitucional(id) {
    const response = await this.client.delete(`/datos-institucionales/${id}/`);
    return response.data;
  }

  async getDatosInstitucionalesActivos() {
    const response = await this.client.get('/datos-institucionales/activos/');
    return response.data;
  }

  async getDatosPorEntidad(entidadId) {
    const response = await this.client.get('/datos-institucionales/por_entidad/', {
      params: { entidad_id: entidadId }
    });
    return response.data;
  }

  async verificarContrasena(id, contrasena) {
    const response = await this.client.post(`/datos-institucionales/${id}/verificar_contrasena/`, {
      contrasena
    });
    return response.data;
  }

  async getEstadisticas() {
    const response = await this.client.get('/datos-institucionales/estadisticas/');
    return response.data;
  }
}

export default new FastinfoApi();