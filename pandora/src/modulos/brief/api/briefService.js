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
  const url = queryString ? `${API_BASE_URL}/briefs/stats/?${queryString}` : `${API_BASE_URL}/briefs/stats/`;
  
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching brief stats:', error);
    throw error;
  }
};

// Change brief status
export const changeBriefStatus = async (id, status, reason = '') => {
  try {
    const response = await axios.post(`${API_BASE_URL}/briefs/${id}/change_status/`, {
      status,
      reason
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
    const response = await axios.get(`${API_BASE_URL}/brief-items/?brief=${briefId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching items for brief ${briefId}:`, error);
    throw error;
  }
};

// Get specific item
export const getBriefItem = async (itemId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/brief-items/${itemId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching item ${itemId}:`, error);
    throw error;
  }
};

// Add item to brief
export const addBriefItem = async (itemData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/brief-items/`, itemData);
    return response.data;
  } catch (error) {
    console.error(`Error adding item to brief:`, error);
    throw error;
  }
};

// Update brief item
export const updateBriefItem = async (itemId, itemData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/brief-items/${itemId}/`, itemData);
    return response.data;
  } catch (error) {
    console.error(`Error updating item ${itemId}:`, error);
    throw error;
  }
};

// Delete brief item
export const deleteBriefItem = async (itemId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/brief-items/${itemId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting item ${itemId}:`, error);
    throw error;
  }
};


// Get choices for dropdowns
export const getBriefChoices = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/briefs/choices/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching brief choices:', error);
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
  getBriefChoices
};