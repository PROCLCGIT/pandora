// @ts-check
import { test, expect } from '../../fixtures/auth-api';
import { AuthHelpers } from '../../utils/auth-helpers';

/**
 * Tests para el refresco automático de tokens
 */
test.describe('Autenticación: Refresco de token', () => {
  // Usar fixture para interceptar API de autenticación
  test.use({ authApiMock: true });
  
  // Inicialización para cada test
  test.beforeEach(async ({ page }) => {
    // Limpiar almacenamiento local y cookies antes de cada prueba
    await page.context().clearCookies();
    await page.evaluate(() => window.localStorage.clear());
  });

  /**
   * Test para verificar que el token se refresca automáticamente
   */
  test('refresca automáticamente el token cuando expira', async ({ page }) => {
    // Inicializar helper
    const authHelper = new AuthHelpers(page);
    
    // 1. Iniciar sesión
    await authHelper.navigateToLogin();
    await authHelper.loginWithValidUser();
    
    // 2. Verificar que estamos en el dashboard
    expect(page.url()).toContain('/dashboard');
    
    // 3. Forzar la expiración del token de acceso
    await authHelper.forceTokenExpiration();
    
    // 4. Realizar una acción que requiera autenticación (navegar a otra sección protegida)
    await page.click('text=Perfil');
    
    // 5. Verificar que la sesión sigue activa después del refresco automático
    // No deberíamos ver errores de autenticación y deberíamos estar en la página de perfil
    expect(page.url()).not.toContain('/login');
    
    // 6. Verificar que no hay notificaciones de error
    const errorNotificationVisible = await page.locator('text=Tu sesión ha expirado').isVisible();
    expect(errorNotificationVisible).toBeFalsy();
    
    // 7. Como verificación adicional, podemos comprobar la presencia de la nueva cookie
    const cookies = await page.context().cookies();
    const accessToken = cookies.find(c => c.name === 'access_token');
    expect(accessToken).toBeTruthy();
    expect(accessToken?.value).toContain('mock-new-access-token');
  });

  /**
   * Test para verificar que se muestra notificación de refresco
   */
  test('muestra notificación durante el refresco de token', async ({ page }) => {
    // Inicializar helper
    const authHelper = new AuthHelpers(page);
    
    // 1. Hacer que la respuesta del refresco sea más lenta para poder observar la notificación
    await page.route('**/api/auth/refresh/**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    // 2. Iniciar sesión
    await authHelper.navigateToLogin();
    await authHelper.loginWithValidUser();
    
    // 3. Verificar que estamos en el dashboard
    expect(page.url()).toContain('/dashboard');
    
    // 4. Forzar la expiración del token de acceso
    await authHelper.forceTokenExpiration();
    
    // 5. Forzar un refresco de token haciendo una petición protegida
    // Modificar para que al visitar profile, se fuerce un refresco de token
    await page.route('**/api/users/profile/**', async (route) => {
      const cookies = await page.context().cookies();
      const hasAccessToken = cookies.some(c => c.name === 'access_token' && c.value.includes('mock-new'));
      
      if (!hasAccessToken) {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Token de acceso expirado' })
        });
      } else {
        await route.continue();
      }
    });
    
    // 6. Iniciar la navegación para forzar el refresco
    await page.click('text=Perfil');
    
    // 7. Esperar a que aparezca y luego desaparezca la notificación de refresco
    // La notificación puede ser de "Sesión a punto de expirar" o "Sesión extendida"
    const refreshNotification = page.locator('text=/Extender sesión|Sesión exten/');
    
    // Debería aparecer pronto
    await refreshNotification.waitFor({ state: 'visible', timeout: 5000 });
    
    // Y luego desaparecer al completarse el refresco
    await refreshNotification.waitFor({ state: 'hidden', timeout: 10000 });
    
    // 8. Verificar que seguimos autenticados
    expect(page.url()).not.toContain('/login');
  });

  /**
   * Test para verificar que se redirige al login cuando el refresh token expira
   */
  test('redirige al login cuando el refresh token expira', async ({ page }) => {
    // Inicializar helper
    const authHelper = new AuthHelpers(page);
    
    // 1. Iniciar sesión
    await authHelper.navigateToLogin();
    await authHelper.loginWithValidUser();
    
    // 2. Modificar las respuestas para simular que el refresh token ha expirado
    await page.route('**/api/auth/refresh/**', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          detail: 'Refresh token expirado'
        })
      });
    });
    
    // 3. Forzar la expiración del token de acceso
    await authHelper.forceTokenExpiration();
    
    // 4. Realizar una acción que requiera autenticación para forzar el refresco
    await page.click('text=Perfil');
    
    // 5. Esperar a que aparezca la notificación de sesión expirada
    await authHelper.waitForSessionNotification('expired');
    
    // 6. Verificar que somos redirigidos al login
    await page.waitForURL('**/login', { timeout: 10000 });
    expect(page.url()).toContain('/login');
    
    // 7. Verificar que hay un mensaje de error indicando que la sesión expiró
    const errorMessage = page.locator('[class*="bg-red-50"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/sesión ha expirado|iniciar sesión nuevamente/i);
  });
});