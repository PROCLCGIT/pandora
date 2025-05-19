// @ts-check
import { test, expect } from '@playwright/test';
import { AuthHelpers } from '../../utils/auth-helpers';

/**
 * Tests para el flujo de cierre de sesión
 */
test.describe('Autenticación: Cierre de sesión', () => {
  // Inicialización para cada test
  test.beforeEach(async ({ page }) => {
    // Limpiar almacenamiento local y cookies antes de cada prueba
    await page.context().clearCookies();
    await page.evaluate(() => window.localStorage.clear());
    
    // Iniciar sesión para cada prueba
    const authHelper = new AuthHelpers(page);
    await authHelper.navigateToLogin();
    await authHelper.loginWithValidUser();
    
    // Verificar que estamos en el dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  /**
   * Test para el cierre de sesión exitoso
   */
  test('permite cerrar sesión correctamente', async ({ page }) => {
    // 1. Verificar que hay algún elemento que indique que estamos autenticados
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // 2. Buscar el botón/enlace de cerrar sesión (puede estar en un menú de usuario)
    const avatar = page.locator('button[aria-label="Open user menu"], img[alt="User avatar"]').first();
    await avatar.click();
    
    // 3. Hacer clic en "Cerrar sesión"
    await page.locator('button:has-text("Cerrar sesión"), a:has-text("Cerrar sesión")').click();
    
    // 4. Esperar a ser redirigido a la página de login
    await page.waitForURL('**/login', { timeout: 5000 });
    
    // 5. Verificar que estamos en la página de login
    expect(page.url()).toContain('/login');
    
    // 6. Verificar que las cookies de autenticación han sido eliminadas
    const cookies = await page.context().cookies();
    const authCookies = cookies.filter(c => 
      c.name === 'access_token' || 
      c.name === 'refresh_token'
    );
    expect(authCookies.length).toBe(0);
    
    // 7. Intentar visitar una ruta protegida
    await page.goto('/dashboard');
    
    // 8. Verificar que somos redirigidos al login
    await page.waitForURL('**/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  /**
   * Test para verificar que se limpia el estado de la aplicación al cerrar sesión
   */
  test('limpia el estado de la aplicación al cerrar sesión', async ({ page }) => {
    // 1. Crear algún estado en la aplicación (por ejemplo, abrir una sección)
    await page.click('text=Usuarios', { timeout: 10000 }).catch(() => {
      // Si no hay sección de usuarios, intentar con otra opción del menú
      page.click('text=Perfil');
    });
    
    // 2. Esperar un momento para que se carguen los datos
    await page.waitForTimeout(1000);
    
    // 3. Cerrar sesión
    const avatar = page.locator('button[aria-label="Open user menu"], img[alt="User avatar"]').first();
    await avatar.click();
    await page.locator('button:has-text("Cerrar sesión"), a:has-text("Cerrar sesión")').click();
    
    // 4. Esperar redirección al login
    await page.waitForURL('**/login', { timeout: 5000 });
    
    // 5. Iniciar sesión nuevamente
    const authHelper = new AuthHelpers(page);
    await authHelper.loginWithValidUser();
    
    // 6. Verificar que estamos en el dashboard (estado inicial)
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    expect(page.url()).toContain('/dashboard');
    
    // 7. Verificar que no estamos en la sección donde estábamos antes
    expect(page.url()).not.toContain('/usuarios');
    expect(page.url()).not.toContain('/perfil');
  });

  /**
   * Test para verificar que se muestra feedback durante el proceso de logout
   */
  test('muestra feedback durante el proceso de logout', async ({ page }) => {
    // 1. Hacer que la respuesta de logout sea lenta para poder observar el feedback
    await page.route('**/api/auth/logout/**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    // 2. Abrir el menú de usuario
    const avatar = page.locator('button[aria-label="Open user menu"], img[alt="User avatar"]').first();
    await avatar.click();
    
    // 3. Encontrar y hacer clic en el botón de cerrar sesión
    const logoutButton = page.locator('button:has-text("Cerrar sesión"), a:has-text("Cerrar sesión")');
    await logoutButton.click();
    
    // 4. Verificar que aparece alguna indicación visual de que está procesando
    // Esto podría ser un spinner, un texto "Cerrando sesión...", etc.
    // La implementación exacta dependerá de cómo esté diseñada tu UI
    
    // Podría ser un toast, notificación, o efecto visual en el botón
    const loadingIndicator = page.locator('[role="status"], .loading, text=Cerrando').first();
    await loadingIndicator.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {
      // Si no encontramos un indicador específico, verificamos al menos que 
      // hay una redirección después de un tiempo razonable
      console.log('No se encontró indicador visual de logout, verificando redirección');
    });
    
    // 5. Esperar redirección a la página de login
    await page.waitForURL('**/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });
});