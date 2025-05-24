/**
 * Componente Stepper horizontal accesible para indicar progreso del formulario
 * Mejor UX que el círculo de progreso para procesos multi-paso
 */

import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Estados posibles para cada paso
 */
export const StepStatus = {
  PENDING: 'pending',
  CURRENT: 'current', 
  COMPLETED: 'completed',
  ERROR: 'error'
};

/**
 * Componente individual de paso
 */
const Step = React.memo(({
  number,
  title,
  description,
  status = StepStatus.PENDING,
  isFirst = false,
  isLast = false,
  onClick,
  className = '',
  ...props
}) => {
  const isClickable = onClick && (status === StepStatus.COMPLETED || status === StepStatus.CURRENT);
  
  // Estilos para el círculo del paso
  const circleStyles = {
    [StepStatus.PENDING]: 'bg-muted text-muted-foreground border-muted-foreground/30',
    [StepStatus.CURRENT]: 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/20',
    [StepStatus.COMPLETED]: 'bg-green-600 text-white border-green-600',
    [StepStatus.ERROR]: 'bg-destructive text-destructive-foreground border-destructive ring-2 ring-destructive/20'
  };

  // Estilos para el texto
  const textStyles = {
    [StepStatus.PENDING]: 'text-muted-foreground',
    [StepStatus.CURRENT]: 'text-foreground font-medium',
    [StepStatus.COMPLETED]: 'text-foreground',
    [StepStatus.ERROR]: 'text-destructive'
  };

  // Estilos para la línea conectora
  const lineStyles = {
    [StepStatus.PENDING]: 'bg-muted',
    [StepStatus.CURRENT]: 'bg-muted',
    [StepStatus.COMPLETED]: 'bg-green-600',
    [StepStatus.ERROR]: 'bg-destructive'
  };

  const handleClick = () => {
    if (isClickable) {
      onClick?.(number - 1);
    }
  };

  const handleKeyDown = (event) => {
    if (isClickable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div className={cn('flex items-center', className)} {...props}>
      {/* Línea izquierda (no mostrar en el primer paso) */}
      {!isFirst && (
        <div 
          className={cn('flex-1 h-0.5 transition-colors duration-200', lineStyles[status])}
          aria-hidden="true"
        />
      )}

      {/* Paso */}
      <div className="relative flex flex-col items-center mx-4">
        {/* Círculo del paso */}
        <div
          role={isClickable ? 'button' : undefined}
          tabIndex={isClickable ? 0 : undefined}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200',
            circleStyles[status],
            isClickable && 'cursor-pointer hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
          )}
          aria-label={`Paso ${number}: ${title}${status === StepStatus.COMPLETED ? ' - Completado' : status === StepStatus.CURRENT ? ' - Actual' : status === StepStatus.ERROR ? ' - Error' : ' - Pendiente'}`}
        >
          {status === StepStatus.COMPLETED ? (
            <Check className="w-4 h-4" aria-hidden="true" />
          ) : status === StepStatus.ERROR ? (
            <AlertCircle className="w-4 h-4" aria-hidden="true" />
          ) : (
            <span className="text-sm font-medium" aria-hidden="true">
              {number}
            </span>
          )}
        </div>

        {/* Texto del paso */}
        <div className="mt-2 text-center">
          <div className={cn('text-sm font-medium transition-colors duration-200', textStyles[status])}>
            {title}
          </div>
          {description && (
            <div className="text-xs text-muted-foreground mt-1 max-w-20 break-words">
              {description}
            </div>
          )}
        </div>
      </div>

      {/* Línea derecha (no mostrar en el último paso) */}
      {!isLast && (
        <div 
          className={cn('flex-1 h-0.5 transition-colors duration-200', lineStyles[status])}
          aria-hidden="true"
        />
      )}
    </div>
  );
});

Step.displayName = 'Step';

/**
 * Componente principal del Stepper horizontal
 */
export const HorizontalStepper = ({
  steps = [],
  currentStep = 0,
  onStepClick,
  className = '',
  variant = 'default',
  showDescription = true,
  allowClickableSteps = true,
  ...props
}) => {
  // Validar props
  if (!Array.isArray(steps) || steps.length === 0) {
    console.warn('HorizontalStepper: steps prop debe ser un array no vacío');
    return null;
  }

  // Función para determinar el estado de cada paso
  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) {
      return StepStatus.COMPLETED;
    } else if (stepIndex === currentStep) {
      return StepStatus.CURRENT;
    } else {
      return StepStatus.PENDING;
    }
  };

  // Variantes de estilo
  const variantStyles = {
    default: '',
    compact: 'py-2',
    minimal: 'py-1'
  };

  return (
    <nav
      aria-label="Progreso del formulario"
      className={cn('w-full', variantStyles[variant], className)}
      {...props}
    >
      <ol className="flex items-center justify-between w-full">
        {steps.map((step, index) => (
          <li key={step.id || index} className="flex-1 first:flex-none last:flex-none">
            <Step
              number={index + 1}
              title={step.title}
              description={showDescription ? step.description : undefined}
              status={step.status || getStepStatus(index)}
              isFirst={index === 0}
              isLast={index === steps.length - 1}
              onClick={allowClickableSteps ? onStepClick : undefined}
            />
          </li>
        ))}
      </ol>
    </nav>
  );
};

/**
 * Hook para gestionar el estado del stepper
 */
export const useStepper = (totalSteps) => {
  const [currentStep, setCurrentStep] = React.useState(0);

  const nextStep = React.useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const prevStep = React.useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const goToStep = React.useCallback((step) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  const reset = React.useCallback(() => {
    setCurrentStep(0);
  }, []);

  return {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    reset,
    isFirst: currentStep === 0,
    isLast: currentStep === totalSteps - 1,
    progress: Math.round((currentStep / (totalSteps - 1)) * 100)
  };
};

/**
 * Stepper específico para formularios de productos
 */
export const ProductFormStepper = ({
  currentStep = 0,
  onStepClick,
  formProgress = {},
  className = '',
  ...props
}) => {
  // Definir los pasos del formulario de productos
  const steps = [
    {
      id: 'general',
      title: 'Datos Generales',
      description: 'Información básica',
      requiredFields: ['code', 'nombre', 'id_categoria', 'id_producto_ofertado', 'id_marca', 'unidad_presentacion', 'procedencia']
    },
    {
      id: 'specs',
      title: 'Especificaciones',
      description: 'Detalles técnicos',
      requiredFields: []
    },
    {
      id: 'prices',
      title: 'Precios',
      description: 'Información financiera',
      requiredFields: []
    },
    {
      id: 'media',
      title: 'Imágenes',
      description: 'Contenido visual',
      requiredFields: []
    },
    {
      id: 'documents',
      title: 'Documentos',
      description: 'Archivos adjuntos',
      requiredFields: []
    }
  ];

  // Calcular el estado de cada paso basado en el progreso del formulario
  const stepsWithStatus = steps.map((step, index) => {
    let status = StepStatus.PENDING;
    
    if (index < currentStep) {
      status = StepStatus.COMPLETED;
    } else if (index === currentStep) {
      status = StepStatus.CURRENT;
    }

    // Si hay progreso específico para este paso, usarlo
    if (formProgress[step.id] !== undefined) {
      const progress = formProgress[step.id];
      if (progress === 100) {
        status = StepStatus.COMPLETED;
      } else if (progress > 0 && index === currentStep) {
        status = StepStatus.CURRENT;
      } else if (progress > 0) {
        status = StepStatus.PENDING;
      }
    }

    return {
      ...step,
      status
    };
  });

  return (
    <HorizontalStepper
      steps={stepsWithStatus}
      currentStep={currentStep}
      onStepClick={onStepClick}
      className={className}
      {...props}
    />
  );
};

/**
 * Stepper compacto para mostrar solo progreso numérico
 */
export const CompactStepper = ({
  totalSteps,
  currentStep = 0,
  className = '',
  ...props
}) => {
  const progress = Math.round((currentStep / (totalSteps - 1)) * 100);

  return (
    <div className={cn('flex items-center space-x-2', className)} {...props}>
      <span className="text-sm font-medium text-muted-foreground">
        Paso {currentStep + 1} de {totalSteps}
      </span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-sm font-medium text-muted-foreground">
        {progress}%
      </span>
    </div>
  );
};

export default HorizontalStepper;