# Sistema de Gestión de Sesiones Avanzado

Este sistema proporciona una gestión completa de sesiones de usuario con características avanzadas como renovación automática de tokens, advertencias de expiración, gestión de inactividad y más.

## 🚀 Características

- ✅ Renovación automática de tokens
- ✅ Gestión de inactividad del usuario
- ✅ Advertencias antes de expiración
- ✅ Indicador visual de estado de sesión
- ✅ Configuración personalizable por usuario
- ✅ Logging detallado para debugging
- ✅ Soporte para múltiples ambientes
- ✅ Auto-guardado de formularios
- ✅ Remembrar última página visitada

## 📁 Estructura de Archivos

```
src/
├── config/
│   ├── auth.js                 # Configuración principal
│   └── axios.js               # Cliente HTTP con integración de auth
├── hooks/custom/
│   └── useSessionManager.js   # Hook principal de gestión
├── components/ui/auth/
│   ├── SessionProvider.jsx    # Proveedor de contexto
│   ├── SessionIndicator.jsx   # Indicador visual
│   ├── SessionSettings.jsx    # Configuración de usuario
│   └── index.js              # Exportaciones centralizadas
```

## 🔧 Configuración Básica

### 1. Integrar el SessionProvider en tu aplicación

```jsx
// App.jsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SessionProvider } from '@/components/ui/auth';
import AppRoutes from './routes';

function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <AppRoutes />
      </SessionProvider>
    </BrowserRouter>
  );
}

export default App;
```

### 2. Configuración por ambiente

```javascript
// .env.development
VITE_API_BASE_URL=http://localhost:8000/api
VITE_AUTH_DEBUG=true

// .env.production  
VITE_API_BASE_URL=https://api.tudominio.com/api
VITE_AUTH_DEBUG=false
```

### 3. Personalizar configuración

```javascript
// config/auth.js - Modificar AUTH_CONFIG según tus necesidades
export const AUTH_CONFIG = {
  TOKEN_REFRESH_INTERVAL: 5 * 60 * 1000,  // 5 minutos
  SESSION_WARNING_TIME: 2 * 60 * 1000,    // 2 minutos antes
  AUTO_LOGOUT_TIME: 30 * 60 * 1000,       // 30 minutos
  // ... más configuraciones
};
```

## 🎯 Ejemplos de Uso

### 1. Hook básico de sesión

```jsx
import React from 'react';
import { useSession } from '@/components/ui/auth';

const MyComponent = () => {
  const { 
    isActive, 
    timeLeftReadable, 
    extendSession, 
    logout 
  } = useSession();

  if (!isActive) {
    return <div>Sesión no activa</div>;
  }

  return (
    <div>
      <p>Tiempo restante: {timeLeftReadable}</p>
      <button onClick={extendSession}>Extender Sesión</button>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
};
```

### 2. Componente protegido con HOC

```jsx
import React from 'react';
import { withSession } from '@/components/ui/auth';

const ProtectedComponent = () => {
  return (
    <div>
      <h1>Contenido protegido</h1>
      <p>Solo visible para usuarios autenticados</p>
    </div>
  );
};

export default withSession(ProtectedComponent);
```

### 3. Indicador personalizado

```jsx
import React from 'react';
import { SessionIndicator } from '@/components/ui/auth';

const Layout = ({ children }) => {
  return (
    <div>
      {children}
      
      {/* Indicador personalizado */}
      <SessionIndicator 
        variant="detailed"
        position="top-right"
        showTimeLeft={true}
        showActions={true}
      />
    </div>
  );
};
```

### 4. Configuración de usuario

```jsx
import React from 'react';
import { SessionSettings } from '@/components/ui/auth';

const SettingsPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1>Configuración de Sesión</h1>
      <SessionSettings />
    </div>
  );
};
```

### 5. Gestión manual de sesión

```jsx
import React from 'react';
import { useSessionManager } from '@/components/ui/auth';

const CustomSessionComponent = () => {
  const {
    sessionState,
    startSession,
    endSession,
    refreshTokens,
    updateActivity
  } = useSessionManager();

  const handleLogin = async () => {
    // Tu lógica de login aquí
    await startSession();
  };

  const handleLogout = () => {
    endSession();
  };

  return (
    <div>
      <p>Estado: {sessionState.isActive ? 'Activa' : 'Inactiva'}</p>
      <p>Última actividad: {new Date(sessionState.lastActivity).toLocaleString()}</p>
      
      <button onClick={handleLogin}>Iniciar Sesión</button>
      <button onClick={handleLogout}>Cerrar Sesión</button>
      <button onClick={refreshTokens}>Renovar Token</button>
      <button onClick={updateActivity}>Registrar Actividad</button>
    </div>
  );
};
```

## 🔍 Debugging y Logs

### Habilitar logs de autenticación

```javascript
// En desarrollo, los logs están habilitados por defecto
// Para habilitarlos manualmente:
import { authLogger, AUTH_EVENTS } from '@/config/auth';

// Log personalizado
authLogger.log(AUTH_EVENTS.LOGIN_SUCCESS, { userId: 123 });
authLogger.warn(AUTH_EVENTS.SESSION_WARNING, { timeLeft: 120000 });
authLogger.error(AUTH_EVENTS.TOKEN_EXPIRED, new Error('Token expired'));
```

### Eventos disponibles

```javascript
// Todos los eventos disponibles en AUTH_EVENTS
LOGIN_SUCCESS: 'auth:login:success'
LOGIN_FAILURE: 'auth:login:failure'
LOGOUT: 'auth:logout'
TOKEN_REFRESH: 'auth:token:refresh'
TOKEN_EXPIRED: 'auth:token:expired'
SESSION_WARNING: 'auth:session:warning'
SESSION_EXPIRED: 'auth:session:expired'
ACTIVITY_DETECTED: 'auth:activity:detected'
INACTIVITY_TIMEOUT: 'auth:inactivity:timeout'
```

## ⚙️ Configuraciones Avanzadas

### 1. Eventos de actividad personalizados

```javascript
// Añadir eventos adicionales que resetean el timer de inactividad
const customConfig = {
  ...AUTH_CONFIG,
  ACTIVITY_EVENTS: [
    ...AUTH_CONFIG.ACTIVITY_EVENTS,
    'focus',
    'visibilitychange',
    'resize'
  ]
};
```

### 2. Notificaciones personalizadas

```javascript
const customNotifications = {
  SESSION_NOTIFICATIONS: {
    WARNING: {
      title: 'Tu sesión va a expirar',
      message: 'Tienes {minutes} minutos restantes',
      type: 'warning',
      duration: 0,
      actions: ['Continuar', 'Salir']
    }
  }
};
```

### 3. Rutas públicas personalizadas

```javascript
const customRoutes = {
  PUBLIC_ROUTES: [
    '/login',
    '/register',
    '/forgot-password',
    '/terms',
    '/privacy',
    '/help'
  ]
};
```

## 🔒 Seguridad

### Mejores prácticas implementadas:

1. **Tokens HttpOnly**: Los tokens se manejan mediante cookies HttpOnly
2. **Renovación automática**: Los tokens se renuevan antes de expirar
3. **Logout por inactividad**: Cierre automático tras periodo de inactividad
4. **Throttling**: Limitación de intentos de renovación
5. **Validación de rutas**: Protección automática de rutas privadas
6. **Logging de seguridad**: Registro de eventos críticos

### Configuración de seguridad:

```javascript
const securityConfig = {
  TOKEN_EXPIRY_BUFFER: 2 * 60 * 1000,  // Buffer antes de expiración
  MAX_REFRESH_RETRIES: 3,              // Máximo reintentos
  AUTO_LOGOUT_TIME: 30 * 60 * 1000,    // Tiempo de inactividad
  LOGOUT_CONFIRMATION: true            // Confirmar logout manual
};
```

## 🚀 Despliegue

### Variables de entorno recomendadas:

```bash
# Desarrollo
VITE_API_BASE_URL=http://localhost:8000/api
VITE_AUTH_DEBUG=true
VITE_SESSION_TIMEOUT=1800000  # 30 minutos

# Producción
VITE_API_BASE_URL=https://api.tudominio.com/api
VITE_AUTH_DEBUG=false
VITE_SESSION_TIMEOUT=3600000  # 60 minutos
```

## 🤝 Contribuir

Para contribuir al sistema de autenticación:

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Haz commits: `git commit -am 'Añadir nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Crea un Pull Request

## 📝 Notas

- Los tokens se manejan automáticamente mediante cookies HttpOnly
- El sistema es compatible con SSR/Next.js
- Funciona con cualquier backend que implemente JWT con cookies
- Totalmente personalizable mediante configuración
- Optimizado para performance y UX