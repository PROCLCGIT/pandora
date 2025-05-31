// /Users/clc/Ws/Appclc/pandora/src/components/ui/auth/index.js

/**
 * Exportaciones centralizadas para componentes de autenticación
 */

// Componentes existentes
export { default as AuthErrorPage } from './AuthErrorPage';
export { default as AuthLoader } from './AuthLoader';
export { default as AuthStates } from './AuthStates';
export { default as LoginWrapper } from './LoginWrapper';
export { default as SessionManager } from './SessionManager';

// Nuevos componentes de sesión
export { default as SessionIndicator } from './SessionIndicator';
export { SessionProvider, useSession, withSession } from './SessionProvider';
export { default as SessionSettings } from './SessionSettings';

// Hook personalizado
export { useSessionManager } from '@/hooks/custom/useSessionManager';

// Configuración
export { 
  getAuthConfig, 
  AUTH_CONFIG, 
  TIME_UTILS, 
  AUTH_EVENTS, 
  authLogger 
} from '@/config/auth';