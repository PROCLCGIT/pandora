// /Users/clc/Ws/Appclc/pandora/src/modulos/importexport/services/importExportService.js
import api from '@/config/axios';

// Corregimos la URL base (teniendo en cuenta que BASE_URL ya incluye '/api')
const API_URL = '/importexport';

export const importExportService = {
  // Obtener lista de tareas de importación
  getImportTasks: () => {
    return api.get(`${API_URL}/import-tasks/`);
  },

  // Subir archivo para importación
  uploadFile: (file, tipo, onUploadProgress) => {
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('tipo', tipo);

    return api.post(`${API_URL}/import-tasks/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
  },

  // Procesar archivo subido
  processFile: (taskId) => {
    return api.post(`${API_URL}/import-tasks/${taskId}/procesar/`);
  },
  
  // Descargar plantilla
  downloadTemplate: (tipo) => {
    window.location.href = `${API_URL}/import-tasks/plantilla/?tipo=${tipo}`;
    return Promise.resolve();
  },
  
  // Exportar productos ofertados
  exportProductosOfertados: () => {
    window.location.href = `${API_URL}/export/productos_ofertados/`;
    return Promise.resolve();
  },
  
  // Exportar productos disponibles
  exportProductosDisponibles: () => {
    window.location.href = `${API_URL}/export/productos_disponibles/`;
    return Promise.resolve();
  }
};

export default importExportService;