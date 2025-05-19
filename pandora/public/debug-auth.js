// Debug script para verificar la autenticación
(function() {
  console.log('==== DEBUG AUTENTICACIÓN ====');
  
  // Verificar tokens almacenados
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
  
  // Verificar formato de Authorization header
  const checkAuthHeader = () => {
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
      this.addEventListener('load', function() {
        console.log(`${this.responseURL} - Status: ${this.status}`);
      });
      originalXHROpen.apply(this, arguments);
    };
    
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      const promise = originalFetch.apply(this, arguments);
      promise.then(response => {
        console.log(`${response.url} - Status: ${response.status}`);
      });
      return promise;
    };
    
    console.log('✅ Instalados interceptores para monitorear peticiones HTTP');
  };
  
  // Añadir función para arreglar la autenticación
  window.fixAuth = function() {
    console.log('🔧 Arreglando tokens de autenticación...');
    
    // Token JWT de ejemplo - con fecha de expiración extendida para el desarrollo
    localStorage.setItem('accessToken', 
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE5OTk5OTk5OTl9.demo-signature-very-secure-fixed');
    localStorage.setItem('refreshToken', 
      'refresh-token-example-very-secure-fixed');
    
    console.log('✅ Tokens generados y guardados en localStorage');
    console.log('👉 Recarga la página para aplicar los cambios');
  };
  
  // Función para hacer una petición de prueba
  window.testAuth = function() {
    console.log('🧪 Probando autenticación con fetch...');
    
    const token = localStorage.getItem('accessToken');
    
    console.log('Token para prueba:', token);
    
    // Intentar petición con diferentes formatos de Authorization header
    const testHeaders = [
      { name: 'Standard Bearer', header: { 'Authorization': 'Bearer ' + token } },
      { name: 'No Space', header: { 'Authorization': 'Bearer' + token } },
      { name: 'Lower Case', header: { 'Authorization': 'bearer ' + token } },
      { name: 'Token Only', header: { 'Authorization': token } }
    ];
    
    // Probar múltiples formatos para identificar cuál funciona
    testHeaders.forEach(test => {
      console.log(`🔍 Probando formato "${test.name}"...`);
      
      fetch('http://localhost:8000/api/basic/categorias/?page=1&page_size=1', {
        headers: test.header
      })
      .then(response => {
        console.log(`Respuesta [${test.name}]: ${response.status} ${response.statusText}`);
        if (response.status === 200) {
          return response.json().then(data => {
            console.log(`✅ ÉXITO con formato "${test.name}":`, data);
          });
        }
      })
      .catch(error => {
        console.error(`Error con formato "${test.name}":`, error);
      });
    });
    
    // Para referencia, también probamos con XMLHttpRequest
    console.log('🧪 Probando con XMLHttpRequest...');
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:8000/api/basic/categorias/?page=1&page_size=1');
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.onload = function() {
      console.log(`XHR Respuesta: ${xhr.status}`);
      if (xhr.status === 200) {
        console.log('XHR Datos:', JSON.parse(xhr.responseText));
      }
    };
    xhr.onerror = function() {
      console.error('XHR Error');
    };
    xhr.send();
  };
  
  // Añadir función para ver el contenido del localStorage
  window.showLocalStorage = function() {
    console.log('==== CONTENIDO DE LOCALSTORAGE ====');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      console.log(`${key}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
    }
  };
  
  checkAuthHeader();
  
  // Función para obtener un nuevo token del servidor
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
        console.log('Token guardado:', data.access);
        console.log('Refresca la página para aplicar');
      } else {
        console.error('Error, no se recibió token:', data);
      }
    })
    .catch(error => {
      console.error('Error obteniendo token:', error);
    });
  };

  console.log('🛠️ Herramientas de Debug:');
  console.log('- window.fixAuth() - Arregla los tokens de autenticación');
  console.log('- window.testAuth() - Prueba una petición con autenticación');
  console.log('- window.getNewToken() - Solicita un token nuevo al servidor');
  console.log('- window.showLocalStorage() - Muestra el contenido de localStorage');
  console.log('📄 MODO DESARROLLO: Probar diferentes formatos de autenticación');
  
  console.log('============================');
})();