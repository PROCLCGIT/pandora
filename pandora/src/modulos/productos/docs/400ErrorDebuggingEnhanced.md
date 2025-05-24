# Enhanced 400 Error Debugging Implementation

## Problem Persistence
Despite initial fixes, the 400 Bad Request error continues:
```
Bad Request: /api/productos/productos-disponibles/
[22/May/2025 08:32:11] "POST /api/productos/productos-disponibles/ HTTP/1.1" 400 43
```

## Enhanced Debugging Strategy

### 1. Comprehensive Request/Response Logging

#### Frontend Form Submission Debugging
```javascript
// Multi-level debugging approach
console.log("=== DEBUGGING PRODUCTO DISPONIBLE SUBMIT ===");
console.log("Raw form data:", data);
console.log("JSON.stringify productData:", JSON.stringify(productData, null, 2));

// Required field validation
const requiredFieldsCheck = {
  code: !!productData.code,
  nombre: !!productData.nombre,
  id_categoria: !!productData.id_categoria,
  id_producto_ofertado: !!productData.id_producto_ofertado,
  id_marca: !!productData.id_marca,
  unidad_presentacion: !!productData.unidad_presentacion,
  procedencia: !!productData.procedencia,
};

// Missing field detection
const missingFields = Object.entries(requiredFieldsCheck)
  .filter(([key, value]) => !value)
  .map(([key]) => key);
```

#### API Service Level Debugging
```javascript
const createProductoDisponible = async (data) => {
  try {
    console.log('=== API SERVICE DEBUG ===');
    console.log('RESOURCE_URL:', RESOURCE_URL);
    console.log('Data being sent to API:', data);
    console.log('Data type:', typeof data);
    console.log('Data constructor:', data.constructor.name);
    console.log('JSON.stringify data:', JSON.stringify(data, null, 2));
    
    const response = await api.post(RESOURCE_URL, data);
    return response.data;
  } catch (error) {
    console.error('=== API ERROR DETAILS ===');
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('Error headers:', error.response?.headers);
    console.error('Request config:', error.config);
    throw error;
  }
};
```

#### Axios Interceptor Debugging
```javascript
// Request interceptor to capture outgoing data
const requestInterceptor = api.interceptors.request.use(
  (config) => {
    if (config.url === RESOURCE_URL && config.method === 'post') {
      console.log('=== INTERCEPTED REQUEST ===');
      console.log('URL:', config.baseURL + config.url);
      console.log('Method:', config.method);
      console.log('Headers:', config.headers);
      console.log('Data:', config.data);
      console.log('Data type:', typeof config.data);
    }
    return config;
  }
);

// Response interceptor to capture errors
const responseInterceptor = api.interceptors.response.use(
  (response) => {
    if (response.config.url === RESOURCE_URL) {
      console.log('=== INTERCEPTED RESPONSE SUCCESS ===');
      console.log('Status:', response.status);
      console.log('Data:', response.data);
    }
    return response;
  },
  (error) => {
    if (error.config?.url === RESOURCE_URL) {
      console.error('=== INTERCEPTED RESPONSE ERROR ===');
      console.error('Status:', error.response?.status);
      console.error('Response Data:', error.response?.data);
      console.error('Response Headers:', error.response?.headers);
    }
    return Promise.reject(error);
  }
);
```

### 2. Progressive Testing Strategy

#### Minimal Payload Testing
```javascript
// Test with absolute minimum data first
const minimalPayload = {
  code: productData.code || 'TEST-001',
  nombre: productData.nombre || 'Test Product',
};

try {
  console.log("Attempting minimal payload submission...");
  await createMutation.mutateAsync(minimalPayload);
  console.log("✅ Minimal payload SUCCESS - issue is with additional fields");
} catch (minimalError) {
  console.error("❌ Minimal payload FAILED - core issue exists");
  // Try full payload for comparison
}
```

#### Data Validation Enhancement
```javascript
// Validate each field type and content
const productData = {
  code: data.code,
  nombre: data.nombre,
  modelo: data.modelo || '',
  referencia: data.referencia || '',
  is_active: data.is_active ?? true,
  // Explicit numeric conversion
  tz_oferta: parseFloat(data.tz_oferta) || 0,
  tz_demanda: parseFloat(data.tz_demanda) || 0,
  // ... other numeric fields
};

// Only add ID fields if valid
if (data.id_categoria && data.id_categoria !== '') {
  productData.id_categoria = parseInt(data.id_categoria, 10);
}
```

### 3. Error Analysis Points

#### Potential Root Causes
1. **Backend Model Validation**: Field requirements not matching frontend schema
2. **Data Type Mismatches**: String/number conversion issues
3. **Foreign Key Constraints**: Invalid ID references
4. **Field Naming**: Backend expecting different field names
5. **Content-Type Issues**: JSON vs FormData handling
6. **Authentication**: Token or permission issues

#### Debugging Checkpoints
- ✅ **Form Validation**: React Hook Form + Zod schema passes
- ✅ **Data Preparation**: Type conversion and null handling
- ✅ **API Call**: Request interceptor captures exact payload
- ❌ **Backend Response**: 400 error with minimal details ("43" bytes)

### 4. Next Steps for Resolution

#### Immediate Actions
1. **Check Browser Network Tab**: Inspect actual HTTP request details
2. **Backend Logs**: Examine Django error logs for detailed validation errors
3. **Model Comparison**: Compare productos-disponibles vs productos-ofertados models
4. **API Documentation**: Verify expected field formats and requirements

#### Testing Scenarios
1. **Minimal Data**: Test with only required fields
2. **Field by Field**: Add one field at a time to isolate problematic data
3. **Different Values**: Test with various data types and formats
4. **Comparison**: Test productos-ofertados creation to compare working flow

### 5. Debugging Output Analysis

When the error occurs, the enhanced logging will show:
- **Form Data Structure**: Complete object being submitted
- **Type Validation**: Each field type and value
- **Required Fields**: Which fields are missing or invalid
- **Network Request**: Exact HTTP request being sent
- **Backend Response**: Detailed error information from server

### 6. Resolution Strategy

Once the exact cause is identified through enhanced logging:
1. **Fix Data Format**: Adjust field types, names, or structures
2. **Update Validation**: Modify frontend schema to match backend requirements
3. **Handle Edge Cases**: Add proper null/undefined handling
4. **Test Thoroughly**: Verify fix works across different scenarios

## Benefits

✅ **Complete Visibility**: Every step of the request is logged
✅ **Progressive Testing**: Isolate issues with minimal payloads
✅ **Error Tracing**: Detailed error information at each layer
✅ **Field Validation**: Verify each field meets requirements
✅ **Network Debugging**: Capture exact HTTP request/response

The enhanced debugging approach provides comprehensive visibility into the 400 error, making it possible to identify and fix the exact cause of the problem.