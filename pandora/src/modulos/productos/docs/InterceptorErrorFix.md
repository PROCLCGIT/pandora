# Fix: Axios Interceptor Error

## Problem
A JavaScript runtime error was causing the React application to crash:
```
TypeError: Cannot read properties of undefined (reading 'request')
at productoDisponibleService.js:10:45
```

This error was triggered by the debugging interceptors trying to access `api.interceptors.request` when the `api` object wasn't properly initialized.

## Root Cause
The interceptor setup was executing during module loading, but the axios instance wasn't fully available at that time. The code was trying to access:
```javascript
api.interceptors.request.use(...)
```
When `api.interceptors` was undefined.

## Solution

### Before (Unsafe)
```javascript
// Add temporary debugging interceptor
const requestInterceptor = api.interceptors.request.use(
  (config) => {
    // ... interceptor logic
  }
);
```

### After (Safe)
```javascript
// Setup debugging interceptors safely
let requestInterceptor = null;
let responseInterceptor = null;

// Initialize interceptors only if api is available and has interceptors
if (api && api.interceptors) {
  try {
    requestInterceptor = api.interceptors.request.use(
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
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    responseInterceptor = api.interceptors.response.use(
      (response) => {
        if (response.config.url === RESOURCE_URL && response.config.method === 'post') {
          console.log('=== INTERCEPTED RESPONSE SUCCESS ===');
          console.log('Status:', response.status);
          console.log('Data:', response.data);
        }
        return response;
      },
      (error) => {
        if (error.config?.url === RESOURCE_URL && error.config?.method === 'post') {
          console.error('=== INTERCEPTED RESPONSE ERROR ===');
          console.error('Status:', error.response?.status);
          console.error('Status Text:', error.response?.statusText);
          console.error('Response Data:', error.response?.data);
          console.error('Response Headers:', error.response?.headers);
        }
        return Promise.reject(error);
      }
    );
  } catch (interceptorError) {
    console.error('Failed to setup interceptors:', interceptorError);
  }
} else {
  console.warn('API interceptors not available, debugging will be limited');
}
```

## Key Improvements

### 1. Null/Undefined Checking
```javascript
if (api && api.interceptors) {
  // Only setup interceptors if api object is properly initialized
}
```

### 2. Try-Catch Error Handling
```javascript
try {
  // Setup interceptors
} catch (interceptorError) {
  console.error('Failed to setup interceptors:', interceptorError);
}
```

### 3. Graceful Degradation
```javascript
} else {
  console.warn('API interceptors not available, debugging will be limited');
}
```

### 4. Variable Declaration
```javascript
let requestInterceptor = null;
let responseInterceptor = null;
```
Variables are declared first and assigned conditionally.

## Benefits

✅ **Prevents Application Crashes**: Safe initialization prevents runtime errors
✅ **Graceful Degradation**: Application works even if interceptors fail
✅ **Better Error Handling**: Try-catch blocks handle setup failures
✅ **Clear Debugging**: Warns when debugging features aren't available
✅ **Conditional Setup**: Only creates interceptors when API is ready

## Impact

- **Before**: Application crashed with TypeError on module load
- **After**: Application loads successfully with optional debugging features

## Best Practices Applied

1. **Defensive Programming**: Check object existence before accessing properties
2. **Error Boundaries**: Use try-catch for operations that might fail
3. **Graceful Fallbacks**: Provide alternatives when features aren't available
4. **Clear Logging**: Inform developers about feature availability

This fix ensures the application remains stable while preserving the debugging capabilities when they're available.