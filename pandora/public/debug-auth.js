// /Users/clc/Ws/Appclc/pandora/public/debug-auth.js

// CAMBIO CRÍTICO: Script de debug optimizado que NO causa recargas automáticas
(function() {
  console.log('==== DEBUG AUTENTICACIÓN OPTIMIZADO ====');
  
  // Flag para controlar el debug
  let debugEnabled = localStorage.getItem('authDebugEnabled') === 'true';
  
  if (!debugEnabled) {
    console.log('🔒 Debug de autenticación DESHABILITADO por defecto');
    console.log('Para habilitar: localStorage.setItem("authDebugEnabled", "true"); y recarga la página');
    return;
  }
  
  console.log('🔍 Debug de autenticación HABILITADO');
  
  // Verificar tokens almacenados solo si debug está habilitado
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  console.log('Access Token:', accessToken ? 'Presente' : 'No encontrado');
  console.log('Refresh Token:', refreshToken ? 'Presente' : 'No encontrado');
  
  if (accessToken) {
    try {
      // Decodificar token para ver los datos
      const tokenParts = accessToken.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('Token payload:', payload);
        
        // Verificar expiración
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < currentTime) {
          console.log('⚠️ Token expirado:', new Date(payload.exp * 1000));
        } else if (payload.exp) {
          console.log('✅ Token válido hasta:', new Date(payload.exp * 1000));
        }
      } else {
        console.log('⚠️ Formato de token inválido');
      }
    } catch (e) {
      console.log('⚠️ Error al decodificar token:', e);
    }
  }
  
  // CAMBIO CRÍTICO: NO instalar interceptores automáticos
  // Esto evita monitoring constante que puede causar recargas
  
  // Función para arreglar la autenticación (solo para desarrollo)
  window.fixAuth = function() {
    console.log('🔧 Arreglando tokens de autenticación...');
    
    // CAMBIO CRÍTICO: Token con expiración de 24 horas para desarrollo
    const tomorrow = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
    const tokenPayload = {
      user_id: 1,
      exp: tomorrow
    };
    
    const header = btoa(JSON.stringify({alg: "HS256", typ: "JWT"}));
    const payload = btoa(JSON.stringify(tokenPayload));
    const signature = "demo-signature-very-secure-fixed";
    
    const token = `${header}.${payload}.${signature}`;
    
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', 'refresh-token-example-very-secure-fixed');
    
    console.log('✅ Tokens generados y guardados en localStorage');
    console.log('👉 Recarga la página para aplicar los cambios');
  };
  
  // Función para hacer una petición de prueba (solo manual)
  window.testAuth = function() {
    console.log('🧪 Probando autenticación con fetch...');
    
    const token = localStorage.getItem('accessToken');
    console.log('Token para prueba:', token ? 'Presente' : 'No encontrado');
    
    if (!token) {
      console.log('❌ No hay token disponible. Ejecuta window.fixAuth() primero');
      return;
    }
    
    const testUrl = 'http://localhost:8000/api/basic/categorias/?page=1&page_size=1';
    
    console.log(`🔍 Probando petición a: ${testUrl}`);
    
    fetch(testUrl, {
      headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(response => {
      console.log(`✅ Respuesta: ${response.status} ${response.statusText}`);
      if (response.status === 200) {
        return response.json().then(data => {
          console.log('✅ ÉXITO - Datos recibidos:', data);
        });
      } else {
        console.log('⚠️ Error en la respuesta');
      }
    })
    .catch(error => {
      console.error('❌ Error en la petición:', error);
    });
  };
  
  // Función para ver el contenido del localStorage (solo manual)
  window.showLocalStorage = function() {
    console.log('==== CONTENIDO DE LOCALSTORAGE ====');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      console.log(`${key}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
    }
  };
  
  // Función para obtener un nuevo token del servidor (solo manual)
  window.getNewToken = function() {
    console.log('🔑 Solicitando nuevo token al servidor...');
    
    fetch('http://localhost:8000/api/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin@example.com',
        password: 'admin123'
      })
    })
    .then(response => {
      console.log(`Respuesta token: ${response.status}`);
      return response.json();
    })
    .then(data => {
      if (data.access) {
        console.log('✅ Token recibido correctamente');
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        console.log('Token guardado, refresca la página para aplicar');
      } else {
        console.error('Error, no se recibió token:', data);
      }
    })
    .catch(error => {
      console.error('Error obteniendo token:', error);
    });
  };
  
  // Función para habilitar/deshabilitar debug
  window.toggleAuthDebug = function() {
    const current = localStorage.getItem('authDebugEnabled') === 'true';
    localStorage.setItem('authDebugEnabled', (!current).toString());
    console.log(`Debug de autenticación ${!current ? 'HABILITADO' : 'DESHABILITADO'}`);
    console.log('Recarga la página para aplicar el cambio');
  };

  console.log('🛠️ Herramientas de Debug Disponibles:');
  console.log('- window.fixAuth() - Arregla los tokens de autenticación');
  console.log('- window.testAuth() - Prueba una petición con autenticación');
  console.log('- window.getNewToken() - Solicita un token nuevo al servidor');
  console.log('- window.showLocalStorage() - Muestra el contenido de localStorage');
  console.log('- window.toggleAuthDebug() - Habilita/deshabilita el debug');
  console.log('📄 MODO DESARROLLO: Herramientas manuales - NO automáticas');
  
  console.log('============================');
})();