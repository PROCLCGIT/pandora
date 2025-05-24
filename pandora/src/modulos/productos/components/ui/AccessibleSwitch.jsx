/**
 * Componente Switch accesible con soporte completo para lectores de pantalla
 * Implementa WAI-ARIA Switch Pattern
 */

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Switch accesible básico
 */
export const AccessibleSwitch = forwardRef(({
  checked = false,
  onCheckedChange,
  disabled = false,
  className = '',
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  children,
  size = 'default',
  variant = 'default',
  ...props
}, ref) => {
  
  const handleKeyDown = (event) => {
    // Solo espacios y Enter deberían activar el switch
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (!disabled) {
        onCheckedChange?.(!checked);
      }
    }
  };

  const handleClick = () => {
    if (!disabled) {
      onCheckedChange?.(!checked);
    }
  };

  // Variantes de tamaño
  const sizeClasses = {
    sm: 'h-4 w-7',
    default: 'h-5 w-9',
    lg: 'h-6 w-11'
  };

  // Variantes de color
  const variantClasses = {
    default: checked 
      ? 'bg-primary border-primary' 
      : 'bg-muted border-muted-foreground/20',
    destructive: checked 
      ? 'bg-destructive border-destructive' 
      : 'bg-muted border-muted-foreground/20',
    success: checked 
      ? 'bg-green-600 border-green-600' 
      : 'bg-muted border-muted-foreground/20'
  };

  // Tamaño del thumb
  const thumbSizeClasses = {
    sm: 'h-3 w-3',
    default: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      disabled={disabled}
      id={id}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        // Estilos base
        'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
        
        // Tamaño
        sizeClasses[size],
        
        // Variante de color
        variantClasses[variant],
        
        // Estados
        disabled && 'cursor-not-allowed opacity-50',
        
        className
      )}
      {...props}
    >
      {/* Thumb del switch */}
      <span
        className={cn(
          'pointer-events-none inline-block rounded-full bg-background shadow-lg ring-0 transition-transform duration-200 ease-in-out',
          thumbSizeClasses[size],
          checked 
            ? size === 'sm' ? 'translate-x-3' : size === 'lg' ? 'translate-x-5' : 'translate-x-4'
            : 'translate-x-0'
        )}
        aria-hidden="true"
      />
      
      {/* Texto oculto para lectores de pantalla */}
      <span className="sr-only">
        {checked ? 'Activado' : 'Desactivado'}
        {children && `: ${children}`}
      </span>
    </button>
  );
});

AccessibleSwitch.displayName = 'AccessibleSwitch';

/**
 * Switch con etiqueta incorporada
 */
export const LabeledSwitch = forwardRef(({
  label,
  description,
  required = false,
  error,
  className = '',
  labelClassName = '',
  switchClassName = '',
  ...switchProps
}, ref) => {
  const switchId = React.useId();
  const descriptionId = description ? `${switchId}-description` : undefined;
  const errorId = error ? `${switchId}-error` : undefined;

  return (
    <div className={cn('flex items-center justify-between space-x-3', className)}>
      <div className="space-y-0.5">
        <label 
          htmlFor={switchId}
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            error && 'text-destructive',
            labelClassName
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1" aria-label="requerido">*</span>}
        </label>
        
        {description && (
          <p 
            id={descriptionId}
            className="text-sm text-muted-foreground"
          >
            {description}
          </p>
        )}
        
        {error && (
          <p 
            id={errorId} 
            className="text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
      
      <AccessibleSwitch
        ref={ref}
        id={switchId}
        aria-describedby={cn(descriptionId, errorId).trim() || undefined}
        className={cn(error && 'border-destructive', switchClassName)}
        {...switchProps}
      />
    </div>
  );
});

LabeledSwitch.displayName = 'LabeledSwitch';

/**
 * Switch especial para is_active con estados semánticos
 */
export const ActiveStatusSwitch = forwardRef(({
  checked = false,
  onCheckedChange,
  disabled = false,
  className = '',
  showLabels = true,
  ...props
}, ref) => {
  return (
    <div className={cn('flex items-center space-x-3', className)}>
      <AccessibleSwitch
        ref={ref}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        variant={checked ? 'success' : 'default'}
        aria-label={`Estado del producto: ${checked ? 'activo' : 'inactivo'}`}
        {...props}
      />
      
      {showLabels && (
        <div className="flex items-center space-x-2">
          <span 
            className={cn(
              'text-sm font-medium',
              checked ? 'text-green-700' : 'text-muted-foreground'
            )}
          >
            {checked ? 'Activo' : 'Inactivo'}
          </span>
          
          {/* Indicador visual adicional */}
          <div 
            className={cn(
              'h-2 w-2 rounded-full',
              checked ? 'bg-green-500' : 'bg-muted-foreground'
            )}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
});

ActiveStatusSwitch.displayName = 'ActiveStatusSwitch';

/**
 * Toggle para mostrar/ocultar campos opcionales
 */
export const OptionalFieldsToggle = forwardRef(({
  checked = false,
  onCheckedChange,
  fieldsCount = 0,
  className = '',
  ...props
}, ref) => {
  return (
    <LabeledSwitch
      ref={ref}
      checked={checked}
      onCheckedChange={onCheckedChange}
      label={checked ? 'Ocultar campos opcionales' : 'Mostrar campos opcionales'}
      description={`${fieldsCount} campos adicionales disponibles`}
      className={className}
      {...props}
    />
  );
});

OptionalFieldsToggle.displayName = 'OptionalFieldsToggle';

/**
 * Switch para modo manual/automático de código
 */
export const CodeModeSwitch = forwardRef(({
  isManualMode = false,
  onModeChange,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={cn('flex items-center space-x-3', className)}>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Automático</span>
        
        <AccessibleSwitch
          ref={ref}
          checked={isManualMode}
          onCheckedChange={onModeChange}
          disabled={disabled}
          aria-label={`Modo de edición de código: ${isManualMode ? 'manual' : 'automático'}`}
          size="sm"
          {...props}
        />
        
        <span className="text-sm font-medium">Manual</span>
      </div>
      
      {/* Descripción del modo actual */}
      <span className="text-xs text-muted-foreground">
        {isManualMode 
          ? 'Puedes editar el código libremente' 
          : 'El código se genera automáticamente'
        }
      </span>
    </div>
  );
});

CodeModeSwitch.displayName = 'CodeModeSwitch';

/**
 * Hook para gestionar estado de switches múltiples
 */
export const useSwitchGroup = (initialState = {}) => {
  const [switches, setSwitches] = React.useState(initialState);

  const toggle = React.useCallback((key) => {
    setSwitches(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  const set = React.useCallback((key, value) => {
    setSwitches(prev => ({
      ...prev,
      [key]: !!value
    }));
  }, []);

  const reset = React.useCallback(() => {
    setSwitches(initialState);
  }, [initialState]);

  return {
    switches,
    toggle,
    set,
    reset
  };
};

export default AccessibleSwitch;