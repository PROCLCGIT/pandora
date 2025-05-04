# Tests End-to-End con Playwright

Este directorio contiene pruebas automatizadas end-to-end para validar el funcionamiento de la aplicación, con especial énfasis en los flujos de autenticación.

## Requisitos

- Node.js 14 o superior
- npm o yarn
- Navegadores modernos (Chrome, Firefox, Safari)

## Instalación

Ejecutar el siguiente comando para instalar Playwright y sus dependencias:

```bash
npm install
npx playwright install
```

## Estructura de directorios

```
tests/
├── e2e/                  # Pruebas end-to-end
│   └── auth/             # Pruebas de autenticación
│       ├── login.spec.js         # Pruebas de inicio de sesión
│       ├── logout.spec.js        # Pruebas de cierre de sesión
│       ├── token-refresh.spec.js # Pruebas de refresco de tokens
│       └── session-notification.spec.js # Pruebas de notificaciones
├── fixtures/             # Datos y configuraciones para pruebas
│   └── auth-api.js       # Mock de API de autenticación
├── utils/                # Utilidades para pruebas
│   └── auth-helpers.js   # Helpers para pruebas de autenticación
└── README.md             # Este archivo
```

## Ejecución de pruebas

Para ejecutar todas las pruebas:

```bash
npm test
```

Para ejecutar solo las pruebas de autenticación:

```bash
npm run test:auth
```

Para ejecutar las pruebas con la interfaz visual:

```bash
npm run test:ui
```

Para ejecutar las pruebas con navegadores visibles:

```bash
npm run test:headed
```

## Casos de prueba de autenticación

### Login
- ✅ Permite iniciar sesión con credenciales válidas
- ✅ Muestra error con credenciales inválidas
- ✅ Checkbox de credenciales de prueba funciona correctamente
- ✅ Botón "Completar" rellena credenciales de ejemplo
- ✅ Previene múltiples envíos durante carga

### Logout
- ✅ Permite cerrar sesión correctamente
- ✅ Limpia el estado de la aplicación al cerrar sesión
- ✅ Muestra feedback durante el proceso de logout

### Refresco de token
- ✅ Refresca automáticamente el token cuando expira
- ✅ Muestra notificación durante el refresco de token
- ✅ Redirige al login cuando el refresh token expira

### Notificaciones de sesión
- ✅ Muestra notificación cuando la sesión expira
- ✅ Muestra y oculta notificaciones de refresco de token
- ✅ Permite interactuar con botones en notificaciones de sesión
- ✅ Las notificaciones no bloquean la interacción del usuario

## Extensiones posibles

- **Pruebas de registro de usuarios**: validación de formularios, verificación de email, etc.
- **Pruebas de recuperación de contraseña**: flujo completo de recuperación.
- **Pruebas de autorización**: acceso a rutas con diferentes roles de usuario.
- **Pruebas de rendimiento**: tiempo de carga de la aplicación con autenticación.
- **Pruebas de accesibilidad**: verificar que los flujos de autenticación son accesibles.

## Mocks y simulaciones

Para facilitar las pruebas y hacerlas independientes del backend, se utilizan mocks para simular respuestas de API. Esto permite probar diferentes escenarios sin depender de un servidor real.

Los mocks están configurados en `fixtures/auth-api.js` y se pueden personalizar según las necesidades.