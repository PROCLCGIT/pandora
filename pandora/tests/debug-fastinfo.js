// Debug script para FastInfo
// Ejecutar en la consola del navegador cuando estés en la aplicación

console.log('=== FastInfo Debug Script ===');

// 1. Verificar estado de autenticación
const checkAuth = async () => {
  console.log('🔍 Verificando autenticación...');
  
  // Verificar cookies
  console.log('🍪 Cookies disponibles:', document.cookie);
  
  // Verificar localStorage
  console.log('💾 LocalStorage:', { ...localStorage });
  
  // Verificar sessionStorage
  console.log('📦 SessionStorage:', { ...sessionStorage });
  
  // Intentar hacer una petición de verificación
  try {
    const response = await fetch('/api/auth/verify/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Verificación de auth - Status:', response.status);
    if (response.ok) {
      const data = await response.text();
      console.log('✅ Auth válida:', data);
    } else {
      console.log('❌ Auth inválida:', await response.text());
    }
  } catch (error) {
    console.error('❌ Error verificando auth:', error);
  }
};

// 2. Verificar endpoints de FastInfo
const checkFastInfoEndpoints = async () => {
  console.log('🔍 Verificando endpoints de FastInfo...');
  
  const endpoints = [
    '/api/fastinfo/',
    '/api/fastinfo/nombres-entidad/',
    '/api/fastinfo/datos-institucionales/'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`${endpoint} - Status: ${response.status}`);
      
      if (response.status === 401) {
        console.log(`❌ ${endpoint} - No autenticado`);
      } else if (response.status === 404) {
        console.log(`❌ ${endpoint} - No encontrado`);
      } else if (response.ok) {
        console.log(`✅ ${endpoint} - OK`);
      } else {
        console.log(`⚠️ ${endpoint} - Error: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ ${endpoint} - Error:`, error);
    }
  }
};

// 3. Intentar hacer login si no está autenticado
const attemptLogin = async (username, password) => {
  console.log('🔑 Intentando hacer login...');
  
  try {
    const response = await fetch('/api/auth/login/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    console.log('Login response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login exitoso:', data);
      return true;
    } else {
      const error = await response.text();
      console.log('❌ Login fallido:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error en login:', error);
    return false;
  }
};

// 4. Probar crear una entidad
const testCreateEntidad = async () => {
  console.log('🧪 Probando crear entidad...');
  
  const testData = {
    codigo: 'TEST',
    nombre: 'Entidad de Prueba',
    descripcion: 'Esta es una entidad de prueba',
    activo: true
  };
  
  try {
    const response = await fetch('/api/fastinfo/nombres-entidad/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log('Create entidad response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Entidad creada:', data);
      return data;
    } else {
      const error = await response.text();
      console.log('❌ Error creando entidad:', error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error en request:', error);
    return null;
  }
};

// Ejecutar todas las verificaciones
const runAllChecks = async () => {
  await checkAuth();
  console.log('\n' + '='.repeat(50) + '\n');
  await checkFastInfoEndpoints();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Si quieres probar el login, descomenta esta línea y proporciona credenciales
  // await attemptLogin('tu_usuario', 'tu_password');
  
  // Si quieres probar crear una entidad, descomenta esta línea
  // await testCreateEntidad();
};

// Exportar funciones para uso manual
window.fastInfoDebug = {
  checkAuth,
  checkFastInfoEndpoints,
  attemptLogin,
  testCreateEntidad,
  runAllChecks
};

console.log('📚 Funciones disponibles:');
console.log('- fastInfoDebug.checkAuth()');
console.log('- fastInfoDebug.checkFastInfoEndpoints()');
console.log('- fastInfoDebug.attemptLogin("usuario", "password")');
console.log('- fastInfoDebug.testCreateEntidad()');
console.log('- fastInfoDebug.runAllChecks()');

console.log('\n🚀 Ejecutando verificaciones automáticas...');
runAllChecks();