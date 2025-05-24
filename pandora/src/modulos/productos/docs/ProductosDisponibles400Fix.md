# Fix: 400 Bad Request Error - Productos Disponibles

## Problem
Users were encountering a `400 Bad Request` error when trying to create productos disponibles:
```
Bad Request: /api/productos/productos-disponibles/
[22/May/2025 08:29:12] "POST /api/productos/productos-disponibles/ HTTP/1.1" 400 43
```

## Root Cause Analysis
The 400 error was likely caused by:
1. **Invalid data format** - Backend expecting specific data types/formats
2. **Empty ID fields** - Sending empty strings instead of null for optional foreign keys
3. **Complex FormData structure** - Nested array format for images/documents might be malformed
4. **Type mismatch** - String values being sent where numbers were expected

## Solution Implemented

### 1. Enhanced Data Validation and Type Conversion
```javascript
// Before: Sending raw form data without validation
Object.keys(data).forEach(key => {
  formData.append(key, data[key]);
});

// After: Proper type conversion and validation
const productData = {
  code: data.code,
  nombre: data.nombre,
  modelo: data.modelo || '',
  referencia: data.referencia || '',
  is_active: data.is_active ?? true,
  // Convert numeric fields
  tz_oferta: parseFloat(data.tz_oferta) || 0,
  tz_demanda: parseFloat(data.tz_demanda) || 0,
  // ... other numeric fields
};

// Only add ID fields if they have valid values
if (data.id_categoria && data.id_categoria !== '') {
  productData.id_categoria = parseInt(data.id_categoria, 10);
}
```

### 2. Simplified Data Submission
```javascript
// Temporary fix: Send JSON instead of FormData to isolate the issue
// This eliminates potential FormData formatting problems

// Before: Complex FormData with nested arrays
const formData = new FormData();
formData.append(`imagenes[${index}][imagen]`, img.file);
formData.append(`imagenes[${index}][descripcion]`, img.descripcion);

// After: Clean JSON object
const productData = {
  // ... validated product fields
};
await createMutation.mutateAsync(productData);
```

### 3. Comprehensive Error Logging
```javascript
// Enhanced debugging to identify the exact cause
console.log("=== DEBUGGING PRODUCTO DISPONIBLE SUBMIT ===");
console.log("Raw form data:", data);
console.log("Prepared product data:", productData);

// Better error handling
} catch (error) {
  console.error('=== ERROR EN EL FORMULARIO ===');
  console.error('Error objeto completo:', error);
  console.error('Error response:', error.response);
  if (error.response?.data) {
    console.error('Error response data:', error.response.data);
  }
}
```

### 4. Field Validation Rules
Applied proper validation for different field types:

- **ID Fields**: Only send if non-empty, convert to integers
- **Numeric Fields**: Parse as float with fallback to 0
- **String Fields**: Send empty string for optional fields
- **Boolean Fields**: Ensure proper boolean values

## Technical Details

### Data Processing Flow
1. **Form Validation**: React Hook Form validates with Zod schema
2. **Type Conversion**: Convert string IDs to integers, parse numeric fields
3. **Null Handling**: Skip empty ID fields instead of sending empty strings
4. **JSON Submission**: Send clean JSON object instead of FormData

### Affected Fields
- `id_categoria`, `id_producto_ofertado`, `id_marca` → Integer conversion
- `tz_*` fields, `costo_*`, `precio_*` → Float conversion
- `modelo`, `referencia` → Optional strings
- `is_active` → Boolean validation

## Benefits

✅ **Data Integrity** - Proper type conversion prevents backend validation errors
✅ **Better Debugging** - Comprehensive logging for troubleshooting
✅ **Cleaner API** - JSON format is simpler than complex FormData
✅ **Robust Validation** - Handles edge cases like empty strings and null values

## Next Steps

1. **Test the Fix**: Verify the 400 error is resolved with simplified JSON submission
2. **Re-add File Support**: Once basic product creation works, re-implement image/document upload
3. **Backend Validation**: Ensure backend properly handles the new data format
4. **User Feedback**: Add better error messages for validation failures

## File Upload Note

This fix temporarily removes image and document upload to isolate the core 400 error. Once the basic product creation works, file upload can be re-implemented with proper FormData handling or separate API endpoints.

## Testing

- ✅ Build successful
- ✅ Enhanced error logging implemented
- ✅ Type conversion and validation added
- ✅ Simplified data structure for testing

The fix provides a clean foundation for debugging and resolving the 400 Bad Request error while maintaining data integrity and proper validation.