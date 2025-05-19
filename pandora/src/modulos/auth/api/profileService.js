import axios from '../../../config/axios';

/**
 * Servicio para gestionar el perfil del usuario
 */
export const profileService = {
  /**
   * Obtiene los datos del perfil del usuario actual
   * @returns {Promise} Datos del perfil
   */
  getProfile: async () => {
    try {
      const response = await axios.get('/users/me/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al obtener el perfil' };
    }
  },

  /**
   * Actualiza los datos del perfil del usuario actual
   * @param {Object} profileData - Datos a actualizar
   * @returns {Promise} Datos del perfil actualizado
   */
  updateProfile: async (profileData) => {
    try {
      // Usamos FormData para manejar subida de archivos (imagen de perfil)
      const formData = new FormData();
      
      // Agregamos cada campo al FormData, excluyendo los campos undefined
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== undefined) {
          formData.append(key, profileData[key]);
        }
      });
      
      const response = await axios.patch('/users/update_profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al actualizar el perfil' };
    }
  },

  /**
   * Cambia la contraseña del usuario actual
   * @param {Object} passwordData - Datos de contraseña (old_password, new_password, new_password2)
   * @returns {Promise} Mensaje de éxito
   */
  changePassword: async (passwordData) => {
    try {
      const response = await axios.post('/users/change_password/', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al cambiar la contraseña' };
    }
  }
};

export default profileService;