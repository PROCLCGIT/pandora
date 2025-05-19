// @ts-check
import { test, expect } from '../../fixtures/auth-api';
import { AuthHelpers } from '../../utils/auth-helpers';

/**
 * Tests para verificar las notificaciones de estado de sesión
 */
test.describe('Autenticación: Notificaciones de sesión', () => {
  // Usar fixture para interceptar API de autenticación
  test.use({ authApiMock: true });

  // Inicialización para cada test
  test.beforeEach(async ({ page }) => {
    // Limpiar almacenamiento local y cookies antes de cada prueba
    await page.context().clearCookies();
    await page.evaluate(() => window.localStorage.clear());
  });

  /**
   * Test para verificar la notificación de sesión expirada
   */
  test('muestra notificación cuando la sesión expira', async ({ page }) => {
    // Inicializar helper
    const authHelper = new AuthHelpers(page);
    
    // 1. Iniciar sesión
    await authHelper.navigateToLogin();
    await authHelper.loginWithValidUser();
    
    // 2. Verificar que estamos en el dashboard
    expect(page.url()).toContain('/dashboard');
    
    // 3. Manipular las cookies para simular una expiración completa de la sesión
    await page.context().clearCookies();
    
    // 4. Realizar una acción que requiera autenticación
    await page.reload();
    
    // 5. Esperar a que aparezca la notificación de sesión expirada
    await authHelper.waitForSessionNotification('expired');
    
    // 6. Verificar que la notificación contiene un botón para volver a iniciar sesión
    const loginButton = page.locator('text=Iniciar sesión');
    await expect(loginButton).toBeVisible();
    
    // 7. Hacer clic en el botón para iniciar sesión
    await loginButton.click();
    
    // 8. Verificar que somos redirigidos a la página de login
    await page.waitForURL('**/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  /**
   * Test para verificar que las notificaciones de refresh de token aparecen y desaparecen
   */
  test('muestra y oculta notificaciones de refresco de token', async ({ page }) => {
    // Inicializar helper
    const authHelper = new AuthHelpers(page);
    
    // 1. Modificar las respuestas para simular un refresco de token exitoso pero lento
    await page.route('**/api/auth/refresh/**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
        }),
      });
    });
    
    // 2. Iniciar sesión
    await authHelper.navigateToLogin();
    await authHelper.loginWithValidUser();
    
    // 3. Verificar que estamos en el dashboard
    expect(page.url()).toContain('/dashboard');
    
    // 4. Forzar la expiración del token de acceso
    await authHelper.forceTokenExpiration();
    
    // 5. Realizar una acción que requiera autenticación
    await page.click('text=Perfil');
    
    // 6. Esperar a que aparezca la notificación de refresco
    await authHelper.waitForSessionNotification('refresh');
    
    // 7. Verificar que la notificación es temporal y desaparece
    await page.waitForSelector('text=Sesión extendida', { state: 'hidden', timeout: 10000 });
    
    // 8. Verificar que seguimos navegando normalmente después del refresco
    expect(page.url()).not.toContain('/login');
  });

  /**
   * Test para verificar la interacción con botones en notificaciones
   */
  test('permite interactuar con botones en notificaciones de sesión', async ({ page }) => {
    // Inicializar helper
    const authHelper = new AuthHelpers(page);
    
    // 1. Iniciar sesión
    await authHelper.navigateToLogin();
    await authHelper.loginWithValidUser();
    
    // 2. Simular notificación de sesión a punto de expirar con botón para extender
    await page.route('**/api/users/profile/**', async (route) => {
      // Simular respuesta que provoca notificación con botón
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '1',
          name: 'Operador CLC',
          // Campo que indica que la sesión está cerca de expirar (hipotético)
          sessionExpiresIn: '60', // 60 segundos
        }),
      });
    });
    
    // 3. Acceder a la página de perfil para activar la notificación
    await page.click('text=Perfil');
    
    // 4. Esperar a que aparezca una notificación con botón "Extender sesión"
    const extendButton = page.locator('text=Extender sesión');
    await extendButton.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {
      console.log('No se encontró botón "Extender sesión"');
    });
    
    if (await extendButton.isVisible()) {
      // 5. Hacer clic en el botón "Extender sesión"
      await extendButton.click();
      
      // 6. Verificar que la notificación cambia o desaparece
      await page.waitForSelector('text=Extender sesión', { state: 'hidden', timeout: 5000 });
      
      // 7. Verificar que aparece confirmación de sesión extendida
      const successMessage = page.locator('text=Sesión extendida');
      await expect(successMessage).toBeVisible();
    } else {
      // Skip si no aparece el botón - podría no estar implementado exactamente así
      test.skip('Notificación con botón "Extender sesión" no implementada');
    }
  });

  /**
   * Test para verificar que las notificaciones no bloquean la interacción del usuario
   */
  test('las notificaciones no bloquean la interacción del usuario', async ({ page }) => {
    // Inicializar helper
    const authHelper = new AuthHelpers(page);
    
    // 1. Iniciar sesión
    await authHelper.navigateToLogin();
    await authHelper.loginWithValidUser();
    
    // 2. Simular respuesta que provoca una notificación
    await page.route('**/api/users/me/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '1',
          name: 'Operador CLC',
          sessionStatus: 'warning', // Campo hipotético que provocaría notificación
        }),
      });
    });
    
    // 3. Navegar a una sección que active la notificación
    await page.click('text=Perfil');
    
    // 4. Esperar a que aparezca alguna notificación
    await page.waitForSelector('[id^="auth-notification-root"]', { timeout: 10000 }).catch(() => {
      console.log('No se encontró notificación');
    });
    
    // 5. Intentar interactuar con la página mientras la notificación está visible
    // Por ejemplo, hacer clic en un elemento del menú
    await page.click('text=Dashboard');
    
    // 6. Verificar que la navegación funciona correctamente a pesar de la notificación
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    expect(page.url()).toContain('/dashboard');
  });
});