// Test service para verificar la API de Brief
import axios from '@/config/axios';

const API_BASE_URL = '/api/brief';

export const testGetChoices = async () => {
  console.log('=== TEST DIRECT API CALL ===');
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('Full URL:', `${API_BASE_URL}/briefs/choices/`);
  
  try {
    const response = await axios.get(`${API_BASE_URL}/briefs/choices/`);
    console.log('✅ Response received:', response);
    console.log('✅ Response data:', response.data);
    console.log('✅ Response status:', response.status);
    console.log('✅ Response headers:', response.headers);
    
    // Verificar estructura
    if (response.data) {
      console.log('📊 Data structure:');
      console.log('- Has origin?', 'origin' in response.data);
      console.log('- Origin is array?', Array.isArray(response.data.origin));
      console.log('- Origin length:', response.data.origin?.length);
      console.log('- First origin item:', response.data.origin?.[0]);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Test API call failed:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response,
      request: error.request,
      config: error.config
    });
    throw error;
  }
};

// Función para probar desde la consola del navegador
window.testBriefChoices = testGetChoices;