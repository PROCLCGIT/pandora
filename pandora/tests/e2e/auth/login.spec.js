// @ts-check
import { test, expect } from '@playwright/test';
import { AuthHelpers } from '../../utils/auth-helpers';

/**
 * Tests para el flujo de inicio de sesión
 */
test.describe('Autenticación: Inicio de sesión', () => {
  // Inicialización para cada test
  test.beforeEach(async ({ page }) => {
    // Limpiar almacenamiento local y cookies antes de cada prueba
    await page.context().clearCookies();
    await page.evaluate(() => window.localStorage.clear());
  });

  /**
   * Test para un inicio de sesión exitoso
   */
  test('permite iniciar sesión con credenciales válidas', async ({ page }) => {
    // Inicializar helper
    const authHelper = new AuthHelpers(page);
    
    // 1. Navegar a la página de login
    await authHelper.navigateToLogin();
    
    // 2. Completar el formulario con credenciales válidas
    await authHelper.fillLoginForm('op@proclc.com', '251510');
    
    // 3. Observar el cambio en el botón a estado de carga
    await page.locator('button[type="submit"]').click();
    
    // 4. Verificar que el botón muestra estado de carga
    const loadingButton = page.locator('button:has-text("Autenticando")');
    await expect(loadingButton).toBeVisible();
    
    // 5. Esperar redirección al dashboard tras inicio de sesión exitoso
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // 6. Verificar que estamos en el dashboard
    expect(page.url()).toContain('/dashboard');
    
    // 7. Verificar que el dashboard muestra contenido para usuarios autenticados
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  /**
   * Test para un inicio de sesión fallido
   */
  test('muestra error con credenciales inválidas', async ({ page }) => {
    // Inicializar helper
    const authHelper = new AuthHelpers(page);
    
    // 1. Navegar a la página de login
    await authHelper.navigateToLogin();
    
    // 2. Completar el formulario con credenciales inválidas
    await authHelper.fillLoginForm('usuario.incorrecto@example.com', 'contraseñaerronea');
    
    // 3. Enviar formulario
    await page.locator('button[type="submit"]').click();
    
    // 4. Verificar que aparece mensaje de error
    const errorMessage = page.locator('[class*="bg-red-50"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Credenciales inválidas');
    
    // 5. Verificar que seguimos en la página de login
    expect(page.url()).toContain('/login');
    
    // 6. Verificar que el formulario tiene clase de animación de error
    const form = page.locator('form');
    await expect(form).toHaveClass(/animate-shake/);
  });

  /**
   * Test para el checkbox "Usar credenciales de prueba"
   */
  test('checkbox de credenciales de prueba funciona correctamente', async ({ page }) => {
    // Inicializar helper
    const authHelper = new AuthHelpers(page);
    
    // 1. Navegar a la página de login
    await authHelper.navigateToLogin();
    
    // 2. Marcar el checkbox "Usar credenciales de prueba"
    await page.locator('#rememberMe').check();
    
    // 3. Enviar formulario sin completar los campos (las credenciales se utilizan automáticamente)
    await page.locator('button[type="submit"]').click();
    
    // 4. Esperar redirección al dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // 5. Verificar que estamos en el dashboard
    expect(page.url()).toContain('/dashboard');
  });

  /**
   * Test para el botón "Completar" de credenciales de ejemplo
   */
  test('botón Completar rellena credenciales de ejemplo', async ({ page }) => {
    // Inicializar helper
    const authHelper = new AuthHelpers(page);
    
    // 1. Navegar a la página de login
    await authHelper.navigateToLogin();
    
    // 2. Hacer clic en el botón "Completar"
    await page.locator('button:has-text("Completar")').click();
    
    // 3. Verificar que los campos estén completados con las credenciales de ejemplo
    await expect(page.locator('#email')).toHaveValue('op@proclc.com');
    await expect(page.locator('#password')).toHaveValue('251510');
    
    // 4. Enviar formulario
    await page.locator('button[type="submit"]').click();
    
    // 5. Esperar redirección al dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    expect(page.url()).toContain('/dashboard');
  });

  /**
   * Test para la prevención de envíos múltiples durante carga
   */
  test('previene múltiples envíos durante carga', async ({ page }) => {
    // Inicializar helper
    const authHelper = new AuthHelpers(page);
    
    // 1. Modificar la red para ralentizar las respuestas
    await page.route('**/api/auth/login/**', async (route) => {
      // Simular una respuesta lenta (2 segundos)
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });
    
    // 2. Navegar a la página de login
    await authHelper.navigateToLogin();
    
    // 3. Completar el formulario
    await authHelper.fillLoginForm('op@proclc.com', '251510');
    
    // 4. Enviar formulario
    await page.locator('button[type="submit"]').click();
    
    // 5. Verificar que el botón está deshabilitado y muestra estado de carga
    const button = page.locator('button[type="submit"]');
    await expect(button).toBeDisabled();
    await expect(button).toContainText('Autenticando');
    
    // 6. Intentar hacer clic en el botón otra vez (no debería tener efecto)
    await button.click({ force: true });
    
    // 7. Verificar que los campos están deshabilitados durante la carga
    await expect(page.locator('#email')).toBeDisabled();
    await expect(page.locator('#password')).toBeDisabled();
  });
});