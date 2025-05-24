/**
 * Ejemplo completo de formulario de producto con todas las mejoras de accesibilidad y UX
 * Demuestra la implementación de:
 * - Switches accesibles con role="switch" y aria-checked
 * - Diálogos con foco inicial y cierre con ESC
 * - Validación numérica mejorada con límites apropiados
 * - Stepper horizontal en lugar de círculo de progreso
 * - Tokens de diseño en lugar de colores fijos
 */

import React, { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Componentes accesibles mejorados
import { 
  AccessibleSwitch,
  LabeledSwitch,
  ActiveStatusSwitch,
  OptionalFieldsToggle,
  CodeModeSwitch
} from '../components/ui/AccessibleSwitch.jsx';

import {
  AccessibleDialog,
  FormDialog,
  ConfirmationDialog
} from '../components/ui/AccessibleDialog.jsx';

import {
  HorizontalStepper,
  ProductFormStepper,
  useStepper
} from '../components/ui/HorizontalStepper.jsx';

import {
  ThemedBadge,
  ThemedAlert,
  ThemedProgress,
  ThemedInput,
  ThemedButton,
  ThemedIcon,
  ProductsThemeProvider
} from '../components/ui/DesignTokens.jsx';

// Esquemas de validación mejorados
import { productoDisponibleSchema } from '../schemas/validationSchemas.js';

// Hooks optimizados
import { useFormProgress, useCategoryWatch } from '../hooks/useOptimizedFormWatch.js';
import { useOptimizedImageManager } from '../hooks/useImageMemoryManagement.js';

import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Componente de campo de entrada numérica accesible
 */
const AccessibleNumericInput = React.forwardRef(({
  label,
  error,
  success,
  description,
  required = false,
  min = 0,
  max = 999999,
  step = 0.01,
  unit,
  placeholder,
  ...props
}, ref) => {
  const inputId = React.useId();
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="space-y-2">
      <Label 
        htmlFor={inputId}
        className={error ? 'text-destructive' : ''}
      >
        {label}
        {required && <span className="text-destructive ml-1" aria-label="requerido">*</span>}
      </Label>
      
      {description && (
        <p 
          id={descriptionId}
          className="text-sm text-muted-foreground"
        >
          {description}
        </p>
      )}
      
      <div className="relative">
        <ThemedInput
          ref={ref}
          id={inputId}
          type="number"
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          error={!!error}
          success={!!success}
          aria-describedby={cn(descriptionId, errorId).trim() || undefined}
          aria-invalid={!!error}
          {...props}
        />
        
        {unit && (
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
        )}
      </div>
      
      {error && (
        <p 
          id={errorId} 
          className="text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
      
      {success && !error && (
        <p className="text-sm text-success">
          {success}
        </p>
      )}
    </div>
  );
});

AccessibleNumericInput.displayName = 'AccessibleNumericInput';

/**
 * Componente principal del formulario accesible
 */
export const AccessibleProductFormExample = () => {
  const { toast } = useToast();
  
  // Estado para diálogos y configuración
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [isManualCodeMode, setIsManualCodeMode] = useState(false);
  
  // Referencias para foco inicial en diálogos
  const imageFileInputRef = useRef(null);
  const confirmDeleteButtonRef = useRef(null);
  
  // Stepper para navegación del formulario
  const {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    isFirst,
    isLast,
    progress
  } = useStepper(5);

  // Form setup con validación mejorada
  const {
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(productoDisponibleSchema),
    defaultValues: {
      code: '',
      nombre: '',
      id_categoria: '',
      id_producto_ofertado: '',
      id_marca: '',
      unidad_presentacion: '',
      procedencia: '',
      costo_referencial: 0,
      precio_sie_referencial: 0,
      precio_sie_tipob: 0,
      precio_venta_privado: 0,
      tz_oferta: 0,
      tz_demanda: 0,
      tz_inflacion: 0,
      tz_calidad: 0,
      tz_eficiencia: 0,
      tz_referencial: 0,
      is_active: true
    }
  });

  // Observación optimizada de campos específicos
  const categoria = useCategoryWatch(control);
  const isActive = watch('is_active');
  
  // Progress del formulario
  const requiredFields = ['code', 'nombre', 'id_categoria', 'id_producto_ofertado', 'id_marca', 'unidad_presentacion', 'procedencia'];
  const formProgress = useFormProgress(control, requiredFields, getValues);
  
  // Gestión de imágenes con cleanup automático
  const imageManager = useOptimizedImageManager(toast);

  // Manejadores de eventos
  const onSubmit = async (data) => {
    try {
      console.log('Datos del formulario:', data);
      console.log('Imágenes:', imageManager.imagenes);
      
      // Simular envío
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Producto guardado",
        description: "El producto se ha guardado exitosamente",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: error.message || "Ha ocurrido un error inesperado",
        variant: "destructive"
      });
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const success = imageManager.addImage({
        file,
        descripcion: '',
        isPrimary: imageManager.imagenes.length === 0
      });
      
      if (success) {
        setImageDialogOpen(false);
        event.target.value = ''; // Reset input
      }
    }
  };

  const handleDeleteProduct = () => {
    console.log('Producto eliminado');
    setDeleteDialogOpen(false);
    toast({
      title: "Producto eliminado",
      description: "El producto se ha eliminado correctamente",
      variant: "destructive"
    });
  };

  return (
    <ProductsThemeProvider>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header con stepper horizontal */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Crear Producto Disponible</h1>
            <ThemedBadge variant="info">
              {formProgress}% completado
            </ThemedBadge>
          </div>
          
          {/* Stepper horizontal mejorado */}
          <ProductFormStepper
            currentStep={currentStep}
            onStepClick={goToStep}
            formProgress={{
              general: formProgress,
              specs: 0,
              prices: 0,
              media: imageManager.imagenes.length > 0 ? 100 : 0,
              documents: 0
            }}
          />
        </div>

        {/* Alertas contextuales */}
        {formProgress === 100 && (
          <ThemedAlert variant="success">
            <CheckIcon className="h-4 w-4" />
            <div>
              <h4 className="font-medium">Formulario completo</h4>
              <p className="text-sm">Todos los campos requeridos han sido completados.</p>
            </div>
          </ThemedAlert>
        )}

        {Object.keys(errors).length > 0 && (
          <ThemedAlert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <div>
              <h4 className="font-medium">Errores en el formulario</h4>
              <p className="text-sm">Por favor, corrige los errores antes de continuar.</p>
            </div>
          </ThemedAlert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Paso 1: Información General */}
          {currentStep === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Switch para estado activo */}
                <LabeledSwitch
                  label="Estado del producto"
                  description="Define si el producto está disponible para venta"
                  checked={isActive}
                  onCheckedChange={(checked) => setValue('is_active', checked)}
                />

                {/* Switch para modo de código */}
                <CodeModeSwitch
                  isManualMode={isManualCodeMode}
                  onModeChange={setIsManualCodeMode}
                />

                {/* Campo de código */}
                <div className="space-y-2">
                  <Label htmlFor="code">
                    Código del producto <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="code"
                    control={control}
                    render={({ field }) => (
                      <ThemedInput
                        {...field}
                        id="code"
                        placeholder="Ej: MED-A-001"
                        error={!!errors.code}
                        readOnly={!isManualCodeMode}
                        aria-describedby="code-description"
                      />
                    )}
                  />
                  <p id="code-description" className="text-sm text-muted-foreground">
                    {isManualCodeMode 
                      ? 'Puedes editar el código manualmente' 
                      : 'El código se genera automáticamente al seleccionar una categoría'
                    }
                  </p>
                  {errors.code && (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.code.message}
                    </p>
                  )}
                </div>

                {/* Campo de nombre */}
                <div className="space-y-2">
                  <Label htmlFor="nombre">
                    Nombre del producto <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="nombre"
                    control={control}
                    render={({ field }) => (
                      <ThemedInput
                        {...field}
                        id="nombre"
                        placeholder="Ingresa el nombre del producto"
                        error={!!errors.nombre}
                      />
                    )}
                  />
                  {errors.nombre && (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.nombre.message}
                    </p>
                  )}
                </div>

                {/* Toggle para campos opcionales */}
                <OptionalFieldsToggle
                  checked={showOptionalFields}
                  onCheckedChange={setShowOptionalFields}
                  fieldsCount={3}
                />

                {/* Campos opcionales */}
                {showOptionalFields && (
                  <div className="space-y-4 border-l-4 border-muted pl-4">
                    <Controller
                      name="modelo"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <Label htmlFor="modelo">Modelo</Label>
                          <ThemedInput
                            {...field}
                            id="modelo"
                            placeholder="Modelo del producto"
                          />
                        </div>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Paso 2: Precios */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Información de Precios</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="costo_referencial"
                  control={control}
                  render={({ field }) => (
                    <AccessibleNumericInput
                      {...field}
                      label="Costo referencial"
                      description="Costo base del producto"
                      min={0}
                      max={9999999.99}
                      step={0.01}
                      unit="$"
                      placeholder="0.00"
                      error={errors.costo_referencial?.message}
                    />
                  )}
                />

                <Controller
                  name="precio_venta_privado"
                  control={control}
                  render={({ field }) => (
                    <AccessibleNumericInput
                      {...field}
                      label="Precio venta privado"
                      description="Precio para clientes privados"
                      min={0}
                      max={9999999.99}
                      step={0.01}
                      unit="$"
                      placeholder="0.00"
                      error={errors.precio_venta_privado?.message}
                    />
                  )}
                />

                {/* Campos de tendencias con validación de rango */}
                <Controller
                  name="tz_oferta"
                  control={control}
                  render={({ field }) => (
                    <AccessibleNumericInput
                      {...field}
                      label="Tendencia de oferta"
                      description="Porcentaje de cambio en la oferta (-100 a 100)"
                      min={-100}
                      max={100}
                      step={0.1}
                      unit="%"
                      placeholder="0.0"
                      error={errors.tz_oferta?.message}
                    />
                  )}
                />

                <Controller
                  name="tz_demanda"
                  control={control}
                  render={({ field }) => (
                    <AccessibleNumericInput
                      {...field}
                      label="Tendencia de demanda"
                      description="Porcentaje de cambio en la demanda (-100 a 100)"
                      min={-100}
                      max={100}
                      step={0.1}
                      unit="%"
                      placeholder="0.0"
                      error={errors.tz_demanda?.message}
                    />
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Paso 3: Imágenes */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Imágenes del Producto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Lista de imágenes */}
                {imageManager.imagenes.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imageManager.imagenes.map((imagen, index) => (
                      <div key={imagen.id} className="relative group">
                        <img
                          src={imagen.imagen}
                          alt={imagen.descripcion || `Imagen ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md border"
                        />
                        
                        {imagen.is_primary && (
                          <ThemedBadge 
                            variant="success" 
                            className="absolute top-2 left-2"
                          >
                            Principal
                          </ThemedBadge>
                        )}
                        
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ThemedButton
                            size="icon"
                            variant="destructive"
                            onClick={() => imageManager.removeImage(index)}
                            aria-label={`Eliminar imagen ${index + 1}`}
                          >
                            <X className="h-4 w-4" />
                          </ThemedButton>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Botón para añadir imágenes */}
                <ThemedButton
                  type="button"
                  variant="outline"
                  onClick={() => setImageDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Imagen
                </ThemedButton>

                {/* Estadísticas de memoria (solo en desarrollo) */}
                {import.meta.env.DEV && (
                  <ThemedAlert variant="info">
                    <InfoIcon className="h-4 w-4" />
                    <div>
                      <p className="text-sm">
                        Memoria utilizada: {imageManager.getMemoryStats().totalSizeMB}MB
                      </p>
                    </div>
                  </ThemedAlert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navegación del stepper */}
          <div className="flex justify-between items-center pt-6 border-t">
            <ThemedButton
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={isFirst}
            >
              Anterior
            </ThemedButton>

            <ThemedProgress 
              value={progress} 
              variant="info"
              className="flex-1 mx-4"
              showValue
            />

            <div className="space-x-2">
              {!isLast ? (
                <ThemedButton
                  type="button"
                  onClick={nextStep}
                >
                  Siguiente
                </ThemedButton>
              ) : (
                <ThemedButton
                  type="submit"
                  disabled={isSubmitting}
                  variant="success"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
                </ThemedButton>
              )}
              
              <ThemedButton
                type="button"
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Eliminar
              </ThemedButton>
            </div>
          </div>
        </form>

        {/* Diálogo accesible para subir imágenes */}
        <FormDialog
          open={imageDialogOpen}
          onOpenChange={setImageDialogOpen}
          title="Añadir Imagen"
          description="Selecciona una imagen para añadir al producto"
          onSubmit={(e) => {
            e.preventDefault();
            imageFileInputRef.current?.click();
          }}
          submitLabel="Seleccionar archivo"
          maxWidth="max-w-sm"
        >
          <input
            ref={imageFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            aria-label="Seleccionar archivo de imagen"
          />
          
          <p className="text-sm text-muted-foreground">
            Formatos soportados: JPEG, PNG, GIF, WebP. Tamaño máximo: 5MB.
          </p>
        </FormDialog>

        {/* Diálogo de confirmación accesible */}
        <ConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="¿Eliminar producto?"
          description="Esta acción no se puede deshacer. El producto será eliminado permanentemente."
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          variant="destructive"
          onConfirm={handleDeleteProduct}
          onCancel={() => setDeleteDialogOpen(false)}
        />
      </div>
    </ProductsThemeProvider>
  );
};

export default AccessibleProductFormExample;