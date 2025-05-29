import axios from '@/config/axios';

const API_BASE_URL = '/api/brief';

// Helper function to build query string
const buildQueryString = (params) => {
  const query = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      query.append(key, params[key]);
    }
  });
  return query.toString();
};

// Fetch briefs list with filters
export const getBriefs = async (params = {}) => {
  const queryString = buildQueryString(params);
  const url = queryString ? `${API_BASE_URL}/briefs/?${queryString}` : `${API_BASE_URL}/briefs/`;
  
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching briefs:', error);
    throw error;
  }
};

// Get brief details by ID
export const getBriefById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/briefs/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching brief ${id}:`, error);
    throw error;
  }
};

// Create new brief
export const createBrief = async (briefData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/briefs/`, briefData);
    return response.data;
  } catch (error) {
    console.error('Error creating brief:', error);
    throw error;
  }
};

// Update brief
export const updateBrief = async (id, briefData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/briefs/${id}/`, briefData);
    return response.data;
  } catch (error) {
    console.error(`Error updating brief ${id}:`, error);
    throw error;
  }
};

// Partial update brief
export const patchBrief = async (id, briefData) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/briefs/${id}/`, briefData);
    return response.data;
  } catch (error) {
    console.error(`Error patching brief ${id}:`, error);
    throw error;
  }
};

// Delete brief
export const deleteBrief = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/briefs/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting brief ${id}:`, error);
    throw error;
  }
};

// Get brief statistics
export const getBriefStats = async (params = {}) => {
  const queryString = buildQueryString(params);
  const url = queryString ? `${API_BASE_URL}/stats/?${queryString}` : `${API_BASE_URL}/stats/`;
  
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching brief stats:', error);
    throw error;
  }
};

// Change brief status
export const changeBriefStatus = async (id, status, notes = '') => {
  try {
    const response = await axios.post(`${API_BASE_URL}/briefs/${id}/change-status/`, {
      status,
      notes
    });
    return response.data;
  } catch (error) {
    console.error(`Error changing status for brief ${id}:`, error);
    throw error;
  }
};

// Duplicate brief
export const duplicateBrief = async (id, options = {}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/briefs/${id}/duplicate/`, options);
    return response.data;
  } catch (error) {
    console.error(`Error duplicating brief ${id}:`, error);
    throw error;
  }
};

// Get brief history
export const getBriefHistory = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/briefs/${id}/history/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching history for brief ${id}:`, error);
    throw error;
  }
};

// Brief Items Management
// Get all items for a brief
export const getBriefItems = async (briefId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/briefs/${briefId}/items/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching items for brief ${briefId}:`, error);
    throw error;
  }
};

// Get specific item
export const getBriefItem = async (briefId, itemId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/briefs/${briefId}/items/${itemId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching item ${itemId} for brief ${briefId}:`, error);
    throw error;
  }
};

// Add item to brief
export const addBriefItem = async (briefId, itemData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/briefs/${briefId}/items/`, itemData);
    return response.data;
  } catch (error) {
    console.error(`Error adding item to brief ${briefId}:`, error);
    throw error;
  }
};

// Update brief item
export const updateBriefItem = async (briefId, itemId, itemData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/briefs/${briefId}/items/${itemId}/`, itemData);
    return response.data;
  } catch (error) {
    console.error(`Error updating item ${itemId} for brief ${briefId}:`, error);
    throw error;
  }
};

// Delete brief item
export const deleteBriefItem = async (briefId, itemId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/briefs/${briefId}/items/${itemId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting item ${itemId} from brief ${briefId}:`, error);
    throw error;
  }
};

// Batch update brief items
export const batchUpdateBriefItems = async (briefId, items) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/briefs/${briefId}/items/batch-update/`, {
      items
    });
    return response.data;
  } catch (error) {
    console.error(`Error batch updating items for brief ${briefId}:`, error);
    throw error;
  }
};

// Get choices for dropdowns
export const getBriefChoices = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/choices/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching brief choices:', error);
    throw error;
  }
};

// Get status choices
export const getBriefStatusChoices = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/status-choices/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching brief status choices:', error);
    throw error;
  }
};

// Get priority choices
export const getBriefPriorityChoices = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/priority-choices/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching brief priority choices:', error);
    throw error;
  }
};

// Export brief to PDF
export const exportBriefToPDF = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/briefs/${id}/export-pdf/`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `brief-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error(`Error exporting brief ${id} to PDF:`, error);
    throw error;
  }
};

// Send brief by email
export const sendBriefByEmail = async (id, emailData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/briefs/${id}/send-email/`, emailData);
    return response.data;
  } catch (error) {
    console.error(`Error sending brief ${id} by email:`, error);
    throw error;
  }
};

// Get brief templates
export const getBriefTemplates = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/templates/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching brief templates:', error);
    throw error;
  }
};

// Create brief from template
export const createBriefFromTemplate = async (templateId, briefData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/templates/${templateId}/create-brief/`, briefData);
    return response.data;
  } catch (error) {
    console.error(`Error creating brief from template ${templateId}:`, error);
    throw error;
  }
};

// Search briefs
export const searchBriefs = async (searchTerm, filters = {}) => {
  const params = {
    search: searchTerm,
    ...filters
  };
  
  try {
    const response = await axios.get(`${API_BASE_URL}/briefs/search/`, { params });
    return response.data;
  } catch (error) {
    console.error('Error searching briefs:', error);
    throw error;
  }
};

// Get recent briefs
export const getRecentBriefs = async (limit = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/briefs/recent/`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent briefs:', error);
    throw error;
  }
};

// Archive brief
export const archiveBrief = async (id) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/briefs/${id}/archive/`);
    return response.data;
  } catch (error) {
    console.error(`Error archiving brief ${id}:`, error);
    throw error;
  }
};

// Unarchive brief
export const unarchiveBrief = async (id) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/briefs/${id}/unarchive/`);
    return response.data;
  } catch (error) {
    console.error(`Error unarchiving brief ${id}:`, error);
    throw error;
  }
};

// Get brief comments
export const getBriefComments = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/briefs/${id}/comments/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching comments for brief ${id}:`, error);
    throw error;
  }
};

// Add comment to brief
export const addBriefComment = async (id, comment) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/briefs/${id}/comments/`, { comment });
    return response.data;
  } catch (error) {
    console.error(`Error adding comment to brief ${id}:`, error);
    throw error;
  }
};

// Get brief attachments
export const getBriefAttachments = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/briefs/${id}/attachments/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching attachments for brief ${id}:`, error);
    throw error;
  }
};

// Upload attachment to brief
export const uploadBriefAttachment = async (id, file, description = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('description', description);
  
  try {
    const response = await axios.post(`${API_BASE_URL}/briefs/${id}/attachments/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error uploading attachment to brief ${id}:`, error);
    throw error;
  }
};

// Delete brief attachment
export const deleteBriefAttachment = async (briefId, attachmentId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/briefs/${briefId}/attachments/${attachmentId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting attachment ${attachmentId} from brief ${briefId}:`, error);
    throw error;
  }
};

// Export all functions as default object for convenience
export default {
  getBriefs,
  getBriefById,
  createBrief,
  updateBrief,
  patchBrief,
  deleteBrief,
  getBriefStats,
  changeBriefStatus,
  duplicateBrief,
  getBriefHistory,
  getBriefItems,
  getBriefItem,
  addBriefItem,
  updateBriefItem,
  deleteBriefItem,
  batchUpdateBriefItems,
  getBriefChoices,
  getBriefStatusChoices,
  getBriefPriorityChoices,
  exportBriefToPDF,
  sendBriefByEmail,
  getBriefTemplates,
  createBriefFromTemplate,
  searchBriefs,
  getRecentBriefs,
  archiveBrief,
  unarchiveBrief,
  getBriefComments,
  addBriefComment,
  getBriefAttachments,
  uploadBriefAttachment,
  deleteBriefAttachment
};