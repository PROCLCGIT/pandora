// @ts-check
import { test as base } from '@playwright/test';

/**
 * Fixture para simular respuestas de la API de autenticación
 * Esto nos permite probar diferentes escenarios sin depender del backend real
 */
export const test = base.extend({
  /**
   * @param {import('@playwright/test').Page} page
   * @param {import('@playwright/test').APIRequestContext} apiContext
   */
  authApiMock: async ({ page }, use) => {
    // Interceptar peticiones a los endpoints de autenticación
    await page.route('**/api/auth/login/**', async (route) => {
      const json = await route.request().postDataJSON().catch(() => ({}));
      
      // Verificar credenciales
      if (json.username === 'op@proclc.com' && json.password === '251510') {
        // Respuesta exitosa
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Set-Cookie': [
              'access_token=mock-access-token; Path=/; HttpOnly; SameSite=Lax',
              'refresh_token=mock-refresh-token; Path=/; HttpOnly; SameSite=Lax',
            ],
          },
          body: JSON.stringify({
            detail: 'Autenticación exitosa',
            csrf_token: 'mock-csrf-token',
          }),
        });
      } else {
        // Credenciales inválidas
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            detail: 'Credenciales inválidas',
          }),
        });
      }
    });
    
    // Interceptar peticiones de verificación de token
    await page.route('**/api/auth/verify/**', async (route) => {
      // Acceder a las cookies para simular verificación
      const cookies = await page.context().cookies();
      const hasAccessToken = cookies.some(c => c.name === 'access_token');
      
      if (hasAccessToken) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            detail: 'Token válido',
          }),
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            detail: 'Token inválido o expirado',
          }),
        });
      }
    });
    
    // Interceptar peticiones de refresco de token
    await page.route('**/api/auth/refresh/**', async (route) => {
      const cookies = await page.context().cookies();
      const hasRefreshToken = cookies.some(c => c.name === 'refresh_token');
      
      if (hasRefreshToken) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Set-Cookie': [
              'access_token=mock-new-access-token; Path=/; HttpOnly; SameSite=Lax',
            ],
          },
          body: JSON.stringify({
            detail: 'Token refrescado exitosamente',
            csrf_token: 'mock-csrf-token',
          }),
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            detail: 'Refresh token inválido o expirado',
          }),
        });
      }
    });
    
    // Interceptar peticiones de logout
    await page.route('**/api/auth/logout/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'Set-Cookie': [
            'access_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
            'refresh_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
          ],
        },
        body: JSON.stringify({
          detail: 'Sesión cerrada exitosamente',
        }),
      });
    });
    
    // Interceptar peticiones al perfil de usuario
    await page.route('**/api/users/me/**', async (route) => {
      const cookies = await page.context().cookies();
      const hasAccessToken = cookies.some(c => c.name === 'access_token');
      
      if (hasAccessToken) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: '1',
            name: 'Operador CLC',
            email: 'op@proclc.com',
            role: 'admin',
          }),
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            detail: 'Autenticación requerida',
          }),
        });
      }
    });
    
    await use();
  },
});

export { expect } from '@playwright/test';