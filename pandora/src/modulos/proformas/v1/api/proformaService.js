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
      console.log('[ProformaService] Creating proforma item with data:', data);
      
      // Validate required fields
      const requiredFields = ['proforma', 'codigo', 'descripcion', 'unidad', 'cantidad', 'precio_unitario'];
      const missingFields = requiredFields.filter(field => !data[field] && data[field] !== 0);
      
      if (missingFields.length > 0) {
        console.error('[ProformaService] Missing required fields:', missingFields);
        throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
      }
      
      // Log data types for debugging
      console.log('[ProformaService] Data types:', {
        proforma: typeof data.proforma,
        unidad: typeof data.unidad,
        cantidad: typeof data.cantidad,
        precio_unitario: typeof data.precio_unitario,
        total: typeof data.total
      });
      
      const response = await axios.post(`${API_URL}/items/`, data);
      console.log('[ProformaService] Item created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('[ProformaService] Error creating proforma item:', error);
      
      if (error.response) {
        console.error('[ProformaService] Error status:', error.response.status);
        console.error('[ProformaService] Error headers:', error.response.headers);
        console.error('[ProformaService] Error data:', error.response.data);
        
        // Log detailed field errors
        if (error.response.data && typeof error.response.data === 'object') {
          Object.entries(error.response.data).forEach(([field, errors]) => {
            console.error(`[ProformaService] Field '${field}' errors:`, errors);
          });
        }
      }
      
      console.error('[ProformaService] Request data that failed:', JSON.stringify(data, null, 2));
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
  },

  // Generate PDF
  generatePDF: async (id, template = 'classic') => {
    try {
      console.log(`[ProformaService] Generating PDF for proforma ID: ${id} with template: ${template}`);
      
      const response = await axios.get(`${API_URL}/proformas/${id}/generar_pdf/`, {
        params: { template },
        responseType: 'blob',
        timeout: 30000 // 30 seconds timeout for PDF generation
      });
      
      // Validate response
      if (!response.data || response.data.size === 0) {
        throw new Error('El PDF generado está vacío');
      }
      
      // Create a blob URL for the PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `proforma_${id}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[*]?=['"]?([^;'"\n]*?)['"]?$/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      // Check if browser supports download
      if (typeof window !== 'undefined' && window.document) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Cleanup after a short delay
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);
      } else {
        // Fallback for environments without DOM
        window.open(url, '_blank');
      }
      
      console.log(`[ProformaService] PDF downloaded successfully: ${filename}`);
      return {
        success: true,
        filename,
        blob
      };
    } catch (error) {
      console.error('[ProformaService] Error generating PDF:', error);
      
      // Enhanced error handling
      if (error.code === 'ECONNABORTED') {
        throw new Error('Tiempo de espera agotado. El PDF puede tardar más tiempo en generar.');
      } else if (error.response?.status === 404) {
        throw new Error('La proforma no fue encontrada.');
      } else if (error.response?.status === 400) {
        throw new Error('Datos de la proforma inválidos para generar PDF.');
      } else if (error.response?.status >= 500) {
        throw new Error('Error del servidor al generar el PDF.');
      }
      
      throw error;
    }
  },

  // Preview PDF (opens in new tab)
  previewPDF: async (id, template = 'classic') => {
    try {
      console.log(`[ProformaService] Previewing PDF for proforma ID: ${id} with template: ${template}`);
      
      const response = await axios.get(`${API_URL}/proformas/${id}/generar_pdf/`, {
        params: { template },
        responseType: 'blob',
        timeout: 30000
      });
      
      // Validate response
      if (!response.data || response.data.size === 0) {
        throw new Error('El PDF generado está vacío');
      }
      
      // Create a blob URL for the PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Open in new tab
      const newTab = window.open(url, '_blank');
      if (!newTab) {
        throw new Error('No se pudo abrir el PDF. Verifique que su navegador permita ventanas emergentes.');
      }
      
      // Cleanup URL after some time
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000); // 1 minute
      
      console.log(`[ProformaService] PDF preview opened successfully`);
      return {
        success: true,
        url
      };
    } catch (error) {
      console.error('[ProformaService] Error previewing PDF:', error);
      throw error;
    }
  },

  // Get available PDF templates
  getAvailableTemplates: async () => {
    try {
      console.log('[ProformaService] Fetching available PDF templates');
      
      const response = await axios.get(`${API_URL}/proformas/plantillas_pdf/`);
      return response.data;
    } catch (error) {
      console.error('[ProformaService] Error fetching templates:', error);
      
      // Return default templates as fallback
      return {
        plantillas_disponibles: [
          {
            nombre: 'classic',
            descripcion: 'Plantilla clásica profesional con colores azules',
            preview: 'Diseño conservador y formal',
            color: 'blue',
            features: ['Encabezado profesional', 'Tabla estructurada', 'Pie de página completo']
          },
          {
            nombre: 'modern',
            descripcion: 'Plantilla moderna minimalista con colores verdes',
            preview: 'Diseño contemporáneo y limpio',
            color: 'green',
            features: ['Diseño minimalista', 'Tipografía moderna', 'Espaciado optimizado']
          }
        ],
        plantilla_default: 'classic'
      };
    }
  }
};