// @ts-check
import { expect } from '@playwright/test';

/**
 * Utilidades para pruebas de autenticación
 */
export class AuthHelpers {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    
    // Selectores comunes
    this.selectors = {
      emailInput: '#email',
      passwordInput: '#password',
      loginButton: 'button[type="submit"]',
      rememberMeCheckbox: '#rememberMe',
      errorMessage: '.auth-feedback-container [class*="bg-red-50"]',
      successMessage: '.auth-feedback-container [class*="bg-green-50"]',
      logoutButton: 'button:has-text("Cerrar sesión")',
      profileMenu: 'button[aria-label="Open user menu"]',
      userNameDisplay: '[data-testid="user-display-name"]',
      dashboardTitle: 'h1:has-text("Dashboard")',
      sessionNotification: '[id^="auth-notification-root"]',
    };
    
    // Credenciales de prueba
    this.credentials = {
      validUser: {
        email: 'op@proclc.com',
        password: '251510',
      },
      invalidUser: {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      },
    };
  }
  
  /**
   * Navega a la página de login
   */
  async navigateToLogin() {
    await this.page.goto('/login');
    await expect(this.page).toHaveURL('/login');
    await expect(this.page.locator('h2:has-text("Iniciar sesión")')).toBeVisible();
  }
  
  /**
   * Completa el formulario de login y lo envía
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @param {boolean} rememberMe - Si marcar la casilla de recordarme
   */
  async fillLoginForm(email, password, rememberMe = false) {
    await this.page.locator(this.selectors.emailInput).fill(email);
    await this.page.locator(this.selectors.passwordInput).fill(password);
    
    // Marcar/desmarcar el checkbox según corresponda
    const checkbox = this.page.locator(this.selectors.rememberMeCheckbox);
    const isChecked = await checkbox.isChecked();
    
    if (rememberMe && !isChecked) {
      await checkbox.check();
    } else if (!rememberMe && isChecked) {
      await checkbox.uncheck();
    }
  }
  
  /**
   * Realiza el inicio de sesión con las credenciales proporcionadas
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @param {boolean} expectSuccess - Si se espera un inicio de sesión exitoso
   */
  async login(email, password, expectSuccess = true) {
    await this.fillLoginForm(email, password);
    await this.page.locator(this.selectors.loginButton).click();
    
    if (expectSuccess) {
      // Esperar redirección al dashboard o mensaje de éxito
      await this.page.waitForNavigation({ timeout: 5000 }).catch(() => {});
      const redirected = this.page.url().includes('/dashboard');
      const hasSuccessMessage = await this.page.locator(this.selectors.successMessage).isVisible();
      
      expect(redirected || hasSuccessMessage).toBeTruthy();
    } else {
      // Esperar mensaje de error
      await expect(this.page.locator(this.selectors.errorMessage)).toBeVisible();
    }
  }
  
  /**
   * Realiza el inicio de sesión con usuario válido
   */
  async loginWithValidUser() {
    const { email, password } = this.credentials.validUser;
    await this.login(email, password, true);
  }
  
  /**
   * Realiza el inicio de sesión con usuario inválido
   */
  async loginWithInvalidUser() {
    const { email, password } = this.credentials.invalidUser;
    await this.login(email, password, false);
  }
  
  /**
   * Espera a que se complete un proceso de auto-login
   * @param {boolean} expectSuccess - Si se espera que el auto-login sea exitoso
   */
  async waitForAutoLogin(expectSuccess = true) {
    // Esperar que aparezca el indicador de auto-login
    await this.page.waitForSelector('text=Iniciando sesión automáticamente', { state: 'visible', timeout: 5000 }).catch(() => {});
    
    if (expectSuccess) {
      // Esperar redirección al dashboard
      await this.page.waitForNavigation({ timeout: 10000 }).catch(() => {});
      expect(this.page.url()).toContain('/dashboard');
    } else {
      // Esperar a que desaparezca el indicador
      await this.page.waitForSelector('text=Iniciando sesión automáticamente', { state: 'hidden', timeout: 10000 }).catch(() => {});
    }
  }
  
  /**
   * Verifica si el usuario está autenticado
   * @returns {Promise<boolean>}
   */
  async isAuthenticated() {
    // Verificar si estamos en una página protegida como el dashboard
    if (this.page.url().includes('/dashboard')) {
      return true;
    }
    
    // Verificar si hay un nombre de usuario visible
    const profileMenuVisible = await this.page.locator(this.selectors.profileMenu).isVisible().catch(() => false);
    if (profileMenuVisible) {
      return true;
    }
    
    // Otra forma: verificar si hay cookies de autenticación
    const cookies = await this.page.context().cookies();
    return cookies.some(cookie => 
      cookie.name === 'access_token' || 
      cookie.name === 'refresh_token'
    );
  }
  
  /**
   * Cierra la sesión del usuario
   */
  async logout() {
    // Si hay un menú de perfil, abrirlo primero
    const profileMenu = this.page.locator(this.selectors.profileMenu);
    if (await profileMenu.isVisible()) {
      await profileMenu.click();
    }
    
    // Buscar el botón de logout
    await this.page.locator(this.selectors.logoutButton).click();
    
    // Esperar redirección a login
    await this.page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    expect(this.page.url()).toContain('/login');
  }
  
  /**
   * Fuerza la expiración de tokens manipulando las cookies
   */
  async forceTokenExpiration() {
    // Eliminar cookies de acceso pero mantener refresh
    const context = this.page.context();
    const cookies = await context.cookies();
    
    // Eliminar cookie de acceso pero mantener refresh para simular expiración
    const accessCookie = cookies.find(c => c.name === 'access_token');
    if (accessCookie) {
      await context.clearCookies();
      
      // Recrear solo cookies distintas de access_token
      const otherCookies = cookies.filter(c => c.name !== 'access_token');
      await context.addCookies(otherCookies);
    }
  }
  
  /**
   * Espera a que aparezca una notificación de sesión
   * @param {string} notificationType - Tipo de notificación ('expired', 'error', 'refresh', etc.)
   */
  async waitForSessionNotification(notificationType) {
    let selector;
    
    switch (notificationType) {
      case 'expired':
        selector = 'text=Tu sesión ha expirado';
        break;
      case 'error':
        selector = 'text=Error de autenticación';
        break;
      case 'refresh':
        selector = 'text=Sesión extendida';
        break;
      default:
        selector = this.selectors.sessionNotification;
        break;
    }
    
    await this.page.waitForSelector(selector, { state: 'visible', timeout: 10000 }).catch(() => {});
    const notificationVisible = await this.page.locator(selector).isVisible();
    
    expect(notificationVisible).toBeTruthy();
  }
}