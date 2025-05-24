/**
 * Diálogos accesibles con gestión automática de foco y teclas
 * Implementa WAI-ARIA Dialog Pattern con focus trapping
 */

import React, { forwardRef, useEffect, useRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Hook para gestión automática de foco en diálogos
 */
const useFocusManagement = (isOpen, initialFocusRef) => {
  const containerRef = useRef(null);
  const lastFocusedElement = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Guardar el elemento que tenía foco antes del diálogo
      lastFocusedElement.current = document.activeElement;
      
      // Enfocar el elemento inicial después de que se monte el diálogo
      const timer = setTimeout(() => {
        if (initialFocusRef?.current) {
          initialFocusRef.current.focus();
        } else {
          // Buscar el primer elemento enfocable
          const focusableElement = containerRef.current?.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          focusableElement?.focus();
        }
      }, 100);

      return () => clearTimeout(timer);
    } else {
      // Restaurar foco al cerrar el diálogo
      if (lastFocusedElement.current && document.contains(lastFocusedElement.current)) {
        lastFocusedElement.current.focus();
      }
    }
  }, [isOpen, initialFocusRef]);

  return containerRef;
};

/**
 * Root del diálogo (re-export de Radix)
 */
const Dialog = DialogPrimitive.Root;

/**
 * Trigger del diálogo (re-export de Radix)
 */
const DialogTrigger = DialogPrimitive.Trigger;

/**
 * Portal del diálogo (re-export de Radix)
 */
const DialogPortal = DialogPrimitive.Portal;

/**
 * Overlay del diálogo con animaciones
 */
const DialogOverlay = forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

/**
 * Contenido del diálogo con focus management mejorado
 */
const DialogContent = forwardRef(({
  className,
  children,
  initialFocus,
  onEscapeKeyDown,
  onPointerDownOutside,
  showCloseButton = true,
  closeButtonLabel = 'Cerrar diálogo',
  ...props
}, ref) => {
  const initialFocusRef = useRef(initialFocus);
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = useFocusManagement(isOpen, initialFocusRef);

  // Detectar cuando el diálogo se abre/cierra
  useEffect(() => {
    const handleOpenChange = () => {
      setIsOpen(true);
    };

    const handleCloseChange = () => {
      setIsOpen(false);
    };

    // Listener para detectar cambios en el estado del diálogo
    const timer = setTimeout(() => setIsOpen(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Manejador mejorado de ESC
  const handleEscapeKeyDown = (event) => {
    event.preventDefault();
    onEscapeKeyDown?.(event);
    // Si no hay manejador personalizado, cerrar el diálogo
    if (!onEscapeKeyDown) {
      // Buscar el contexto del diálogo y cerrarlo
      const dialogContext = event.currentTarget.closest('[data-state]');
      if (dialogContext) {
        const closeButton = dialogContext.querySelector('[data-dialog-close]');
        closeButton?.click();
      }
    }
  };

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        onEscapeKeyDown={handleEscapeKeyDown}
        onPointerDownOutside={onPointerDownOutside}
        className={cn(
          'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
          'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          'sm:rounded-lg',
          className
        )}
        {...props}
      >
        <div ref={containerRef}>
          {children}
        </div>
        
        {showCloseButton && (
          <DialogPrimitive.Close
            data-dialog-close
            className={cn(
              'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity',
              'hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground'
            )}
            aria-label={closeButtonLabel}
          >
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

/**
 * Header del diálogo
 */
const DialogHeader = ({ className, ...props }) => (
  <div
    className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

/**
 * Footer del diálogo
 */
const DialogFooter = ({ className, ...props }) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

/**
 * Título del diálogo con heading apropiado
 */
const DialogTitle = forwardRef(({ className, level = 2, ...props }, ref) => {
  const Heading = `h${level}`;
  
  return (
    <DialogPrimitive.Title
      ref={ref}
      asChild
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    >
      <Heading />
    </DialogPrimitive.Title>
  );
});
DialogTitle.displayName = DialogPrimitive.Title.displayName;

/**
 * Descripción del diálogo
 */
const DialogDescription = forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

/**
 * Botón de cierre del diálogo
 */
const DialogClose = DialogPrimitive.Close;

/**
 * Componente de diálogo completo con configuración común
 */
export const AccessibleDialog = ({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  initialFocus,
  maxWidth = 'max-w-lg',
  showCloseButton = true,
  closeOnOutsideClick = true,
  closeOnEscape = true,
  className = '',
  ...props
}) => {
  const initialFocusRef = useRef(null);

  // Configurar la referencia del foco inicial
  useEffect(() => {
    if (initialFocus) {
      initialFocusRef.current = initialFocus.current || initialFocus;
    }
  }, [initialFocus]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      
      <DialogContent
        initialFocus={initialFocusRef.current}
        showCloseButton={showCloseButton}
        onEscapeKeyDown={closeOnEscape ? undefined : (e) => e.preventDefault()}
        onPointerDownOutside={closeOnOutsideClick ? undefined : (e) => e.preventDefault()}
        className={cn(maxWidth, className)}
        {...props}
      >
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        
        <div className="py-4">
          {children}
        </div>
        
        {footer && (
          <DialogFooter>
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

/**
 * Diálogo de confirmación con accesibilidad mejorada
 */
export const ConfirmationDialog = ({
  open,
  onOpenChange,
  title = '¿Estás seguro?',
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'default',
  children,
  ...props
}) => {
  const confirmButtonRef = useRef(null);

  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange?.(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  const variantStyles = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
  };

  return (
    <AccessibleDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      initialFocus={confirmButtonRef}
      maxWidth="max-w-sm"
      footer={
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={handleConfirm}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              variantStyles[variant]
            )}
          >
            {confirmLabel}
          </button>
        </div>
      }
      {...props}
    >
      {children}
    </AccessibleDialog>
  );
};

/**
 * Diálogo de formulario con foco automático en primer input
 */
export const FormDialog = ({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  submitLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  children,
  isSubmitting = false,
  ...props
}) => {
  const formRef = useRef(null);
  const firstInputRef = useRef(null);

  // Buscar el primer input cuando se abre el diálogo
  useEffect(() => {
    if (open && formRef.current) {
      const firstInput = formRef.current.querySelector('input, select, textarea');
      if (firstInput) {
        firstInputRef.current = firstInput;
      }
    }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <AccessibleDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      initialFocus={firstInputRef}
      maxWidth="max-w-md"
      footer={
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => onOpenChange?.(false)}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            form="dialog-form"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Guardando...
              </span>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      }
      {...props}
    >
      <form ref={formRef} id="dialog-form" onSubmit={handleSubmit}>
        {children}
      </form>
    </AccessibleDialog>
  );
};

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

export default AccessibleDialog;