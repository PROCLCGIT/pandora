// /pandora/src/modulos/productos/hooks/useProductForm.js

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';

// Esquema de validación
const productoDisponibleSchema = z.object({
  code: z.string().min(1, 'El código es obligatorio'),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  modelo: z.string().optional(),
  id_categoria: z.string().min(1, 'La categoría es obligatoria'),
  id_producto_ofertado: z.string().min(1, 'El producto ofertado es obligatorio'),
  id_marca: z.string().min(1, 'La marca es obligatoria'),
  unidad_presentacion: z.string().min(1, 'La unidad de presentación es obligatoria'),
  procedencia: z.string().min(1, 'La procedencia es obligatoria'),
  referencia: z.string().optional(),
  tz_oferta: z.coerce.number().optional().default(0),
  tz_demanda: z.coerce.number().optional().default(0),
  tz_inflacion: z.coerce.number().optional().default(0),
  tz_calidad: z.coerce.number().optional().default(0),
  tz_eficiencia: z.coerce.number().optional().default(0),
  tz_referencial: z.coerce.number().optional().default(0),
  costo_referencial: z.coerce.number().optional().default(0),
  precio_sie_referencial: z.coerce.number().optional().default(0),
  precio_sie_tipob: z.coerce.number().optional().default(0),
  precio_venta_privado: z.coerce.number().optional().default(0),
  is_active: z.boolean().default(true),
});

/**
 * Hook personalizado para manejar la lógica del formulario de productos
 */
export function useProductForm(isEditing, productoData) {
  const { toast } = useToast();

  // React Hook Form
  const {
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(productoDisponibleSchema),
    defaultValues: {
      code: '', // El código se generará después de seleccionar la categoría
      nombre: '',
      modelo: '',
      id_categoria: '',
      id_producto_ofertado: '',
      id_marca: '',
      unidad_presentacion: '',
      procedencia: '',
      referencia: '',
      tz_oferta: 0,
      tz_demanda: 0,
      tz_inflacion: 0,
      tz_calidad: 0,
      tz_eficiencia: 0,
      tz_referencial: 0,
      costo_referencial: 0,
      precio_sie_referencial: 0,
      precio_sie_tipob: 0,
      precio_venta_privado: 0,
      is_active: true,
    },
  });

  // Estados adicionales
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [isManualCodeMode, setIsManualCodeMode] = useState(false);

  // Valores del formulario para mostrar en tiempo real
  const formValues = watch();

  // Calcular el progreso del formulario
  const requiredFields = ['code', 'nombre', 'id_categoria', 'id_producto_ofertado', 'id_marca', 'unidad_presentacion', 'procedencia'];
  const completedRequiredFields = requiredFields.filter(field => formValues[field] && formValues[field].toString().trim() !== '').length;
  const formProgress = Math.round((completedRequiredFields / requiredFields.length) * 100);

  // Efecto para cargar los datos en el formulario cuando se obtienen del API
  useEffect(() => {
    if (isEditing && productoData) {
      // Si es edición, siempre mostrar los campos opcionales
      setShowOptionalFields(true);
      
      // Convertir IDs a strings para los selects
      const formData = {
        ...productoData,
        id_categoria: productoData.id_categoria?.toString() || '',
        id_producto_ofertado: productoData.id_producto_ofertado?.toString() || '',
        id_marca: productoData.id_marca?.toString() || '',
        unidad_presentacion: productoData.unidad_presentacion?.toString() || '',
        procedencia: productoData.procedencia?.toString() || '',
      };
      reset(formData);
    }
  }, [isEditing, productoData, reset]);

  return {
    // Form methods
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    
    // Form state
    errors,
    isSubmitting,
    isDirty,
    formValues,
    formProgress,
    
    // Additional state
    showOptionalFields,
    setShowOptionalFields,
    isManualCodeMode,
    setIsManualCodeMode,
    
    // Helper values
    requiredFields,
    completedRequiredFields,
    
    // Toast for notifications
    toast
  };
}