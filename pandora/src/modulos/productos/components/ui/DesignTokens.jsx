/**
 * Design System Tokens para productos
 * Reemplaza colores fijos con tokens de diseño para soporte de temas
 */

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Tokens de color semánticos usando variables CSS de shadcn/ui
 */
export const colorTokens = {
  // Estados primarios
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))',
    hover: 'hsl(var(--primary) / 0.9)',
    light: 'hsl(var(--primary) / 0.1)'
  },
  
  // Estados secundarios
  secondary: {
    DEFAULT: 'hsl(var(--secondary))',
    foreground: 'hsl(var(--secondary-foreground))',
    hover: 'hsl(var(--secondary) / 0.8)',
    light: 'hsl(var(--secondary) / 0.1)'
  },
  
  // Estados de éxito
  success: {
    DEFAULT: 'hsl(142 76% 36%)', // green-600 equivalente
    foreground: 'hsl(355.7 100% 97.3%)', // white
    hover: 'hsl(142 76% 32%)',
    light: 'hsl(142 76% 36% / 0.1)',
    muted: 'hsl(142 76% 36% / 0.15)'
  },
  
  // Estados de advertencia
  warning: {
    DEFAULT: 'hsl(38 92% 50%)', // amber-500 equivalente
    foreground: 'hsl(0 0% 0%)', // black
    hover: 'hsl(38 92% 45%)',
    light: 'hsl(38 92% 50% / 0.1)',
    muted: 'hsl(38 92% 50% / 0.15)'
  },
  
  // Estados destructivos
  destructive: {
    DEFAULT: 'hsl(var(--destructive))',
    foreground: 'hsl(var(--destructive-foreground))',
    hover: 'hsl(var(--destructive) / 0.9)',
    light: 'hsl(var(--destructive) / 0.1)',
    muted: 'hsl(var(--destructive) / 0.15)'
  },
  
  // Estados informativos
  info: {
    DEFAULT: 'hsl(221 83% 53%)', // blue-600 equivalente
    foreground: 'hsl(210 40% 98%)', // white
    hover: 'hsl(221 83% 48%)',
    light: 'hsl(221 83% 53% / 0.1)',
    muted: 'hsl(221 83% 53% / 0.15)'
  },
  
  // Neutrales
  muted: {
    DEFAULT: 'hsl(var(--muted))',
    foreground: 'hsl(var(--muted-foreground))',
    hover: 'hsl(var(--muted) / 0.8)'
  },
  
  // Bordes y fondos
  border: 'hsl(var(--border))',
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  card: 'hsl(var(--card))',
  cardForeground: 'hsl(var(--card-foreground))'
};

/**
 * Tokens de espacio y dimensiones
 */
export const spaceTokens = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
};

/**
 * Tokens de radio/border-radius
 */
export const radiusTokens = {
  none: '0',
  sm: 'calc(var(--radius) - 4px)',
  DEFAULT: 'var(--radius)',
  md: 'calc(var(--radius) + 2px)',
  lg: 'calc(var(--radius) + 4px)',
  xl: 'calc(var(--radius) + 8px)',
  full: '9999px'
};

/**
 * Componente Badge con tokens de diseño
 */
export const ThemedBadge = React.forwardRef(({
  variant = 'default',
  size = 'default',
  className = '',
  children,
  ...props
}, ref) => {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    success: 'bg-success text-success-foreground hover:bg-success/80',
    warning: 'bg-warning text-warning-foreground hover:bg-warning/80',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
    info: 'bg-info text-info-foreground hover:bg-info/80',
    outline: 'border border-border bg-transparent text-foreground hover:bg-muted'
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    default: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1'
  };

  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-md font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});

ThemedBadge.displayName = 'ThemedBadge';

/**
 * Componente Alert con tokens de diseño
 */
export const ThemedAlert = React.forwardRef(({
  variant = 'default',
  className = '',
  children,
  ...props
}, ref) => {
  const variants = {
    default: 'border-border bg-background text-foreground',
    success: 'border-success/30 bg-success-light text-success-foreground [&>svg]:text-success',
    warning: 'border-warning/30 bg-warning-light text-warning-foreground [&>svg]:text-warning',
    destructive: 'border-destructive/30 bg-destructive-light text-destructive-foreground [&>svg]:text-destructive',
    info: 'border-info/30 bg-info-light text-info-foreground [&>svg]:text-info'
  };

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        'relative w-full rounded-lg border p-4',
        '[&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
        '[&>svg~*]:pl-7',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

ThemedAlert.displayName = 'ThemedAlert';

/**
 * Componente Progress con tokens de diseño
 */
export const ThemedProgress = React.forwardRef(({
  value = 0,
  max = 100,
  variant = 'default',
  size = 'default',
  showValue = false,
  className = '',
  ...props
}, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const variants = {
    default: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    destructive: 'bg-destructive',
    info: 'bg-info'
  };

  const sizes = {
    sm: 'h-1',
    default: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className={cn('w-full', className)} {...props}>
      <div 
        ref={ref}
        className={cn(
          'w-full bg-muted rounded-full overflow-hidden',
          sizes[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemax={max}
        aria-label={`Progreso: ${percentage.toFixed(0)}%`}
      >
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            variants[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValue && (
        <div className="mt-1 text-xs text-muted-foreground text-right">
          {percentage.toFixed(0)}%
        </div>
      )}
    </div>
  );
});

ThemedProgress.displayName = 'ThemedProgress';

/**
 * Componente Input con estados de validación
 */
export const ThemedInput = React.forwardRef(({
  variant = 'default',
  error,
  success,
  className = '',
  ...props
}, ref) => {
  const getVariantStyles = () => {
    if (error) {
      return 'border-destructive focus:border-destructive focus:ring-destructive';
    }
    if (success) {
      return 'border-success focus:border-success focus:ring-success';
    }
    return 'border-border focus:border-primary focus:ring-primary';
  };

  return (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm',
        'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        getVariantStyles(),
        className
      )}
      {...props}
    />
  );
});

ThemedInput.displayName = 'ThemedInput';

/**
 * Componente Button con variantes consistentes
 */
export const ThemedButton = React.forwardRef(({
  variant = 'default',
  size = 'default',
  className = '',
  ...props
}, ref) => {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    success: 'bg-success text-success-foreground hover:bg-success/90',
    warning: 'bg-warning text-warning-foreground hover:bg-warning/90',
    info: 'bg-info text-info-foreground hover:bg-info/90',
    outline: 'border border-border bg-background hover:bg-muted hover:text-muted-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-muted hover:text-muted-foreground',
    link: 'text-primary underline-offset-4 hover:underline'
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10'
  };

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});

ThemedButton.displayName = 'ThemedButton';

/**
 * Sistema de iconos con colores temáticos
 */
export const ThemedIcon = ({ 
  variant = 'default', 
  size = 16,
  className = '', 
  children,
  ...props 
}) => {
  const variants = {
    default: 'text-foreground',
    muted: 'text-muted-foreground',
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
    info: 'text-info'
  };

  return (
    <span
      className={cn('inline-flex items-center', variants[variant], className)}
      style={{ fontSize: size }}
      {...props}
    >
      {children}
    </span>
  );
};

/**
 * CSS custom properties para inyectar en el documento
 */
export const injectProductsTheme = () => {
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --success: 142 76% 36%;
      --success-foreground: 355.7 100% 97.3%;
      --warning: 38 92% 50%;
      --warning-foreground: 0 0% 0%;
      --info: 221 83% 53%;
      --info-foreground: 210 40% 98%;
    }
    
    .bg-success { background-color: hsl(var(--success)); }
    .text-success { color: hsl(var(--success)); }
    .text-success-foreground { color: hsl(var(--success-foreground)); }
    .border-success { border-color: hsl(var(--success)); }
    .bg-success-light { background-color: hsl(var(--success) / 0.1); }
    
    .bg-warning { background-color: hsl(var(--warning)); }
    .text-warning { color: hsl(var(--warning)); }
    .text-warning-foreground { color: hsl(var(--warning-foreground)); }
    .border-warning { border-color: hsl(var(--warning)); }
    .bg-warning-light { background-color: hsl(var(--warning) / 0.1); }
    
    .bg-info { background-color: hsl(var(--info)); }
    .text-info { color: hsl(var(--info)); }
    .text-info-foreground { color: hsl(var(--info-foreground)); }
    .border-info { border-color: hsl(var(--info)); }
    .bg-info-light { background-color: hsl(var(--info) / 0.1); }
  `;
  
  document.head.appendChild(style);
};

/**
 * Provider de tema para productos
 */
export const ProductsThemeProvider = ({ children }) => {
  React.useEffect(() => {
    injectProductsTheme();
  }, []);

  return children;
};

export default {
  colorTokens,
  spaceTokens,
  radiusTokens,
  ThemedBadge,
  ThemedAlert,
  ThemedProgress,
  ThemedInput,
  ThemedButton,
  ThemedIcon,
  ProductsThemeProvider
};