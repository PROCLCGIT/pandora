/**
 * Esquemas de validación optimizados con mensajes de error mejorados
 * Incluye validación numérica con límites apropiados y mensajes contextuales
 */

import * as z from 'zod';

/**
 * Validador numérico mejorado con límites y mensajes personalizados
 */
const createNumericValidator = ({
  min = 0,
  max = 999999,
  decimals = 2,
  fieldName = 'campo',
  required = false,
  allowNegative = false
} = {}) => {
  let validator = z.coerce.number({
    errorMap: (issue, ctx) => {
      switch (issue.code) {
        case z.ZodIssueCode.invalid_type:
          return { message: `${fieldName} debe ser un número válido` };
        case z.ZodIssueCode.too_small:
          return { 
            message: allowNegative 
              ? `${fieldName} debe ser mayor o igual a ${min}`
              : `${fieldName} debe ser un número positivo (mínimo ${min})`
          };
        case z.ZodIssueCode.too_big:
          return { message: `${fieldName} no puede ser mayor a ${max.toLocaleString()}` };
        default:
          return { message: `${fieldName} no es válido` };
      }
    }
  });

  // Aplicar validaciones según configuración
  if (!allowNegative) {
    validator = validator.nonnegative();
  }
  
  if (min !== undefined) {
    validator = validator.min(min);
  }
  
  if (max !== undefined) {
    validator = validator.max(max);
  }

  // Validar decimales si es necesario
  if (decimals === 0) {
    validator = validator.int(`${fieldName} debe ser un número entero`);
  }

  // Hacer opcional si no es requerido
  if (!required) {
    validator = validator.optional().default(0);
  }

  return validator;
};

/**
 * Validador para precios monetarios
 */
export const priceValidator = (fieldName, required = false) => 
  createNumericValidator({
    min: 0,
    max: 9999999.99,
    decimals: 2,
    fieldName,
    required,
    allowNegative: false
  });

/**
 * Validador para porcentajes/tendencias
 */
export const percentageValidator = (fieldName, required = false) => 
  createNumericValidator({
    min: -100,
    max: 100,
    decimals: 1,
    fieldName,
    required,
    allowNegative: true
  });

/**
 * Validador para cantidades/inventario
 */
export const quantityValidator = (fieldName, required = false) => 
  createNumericValidator({
    min: 0,
    max: 999999,
    decimals: 0,
    fieldName,
    required,
    allowNegative: false
  });

/**
 * Validador para códigos con formato específico
 */
export const codeValidator = z.string({
  required_error: 'El código es requerido'
})
.min(1, 'El código no puede estar vacío')
.max(50, 'El código no puede tener más de 50 caracteres')
.regex(/^[A-Z0-9\-_]+$/, 'El código solo puede contener letras mayúsculas, números, guiones y guiones bajos')
.refine(
  (val) => val.trim() === val,
  'El código no puede tener espacios al inicio o final'
);

/**
 * Validador para nombres de productos
 */
export const productNameValidator = z.string({
  required_error: 'El nombre del producto es requerido'
})
.min(2, 'El nombre debe tener al menos 2 caracteres')
.max(200, 'El nombre no puede tener más de 200 caracteres')
.refine(
  (val) => val.trim().length >= 2,
  'El nombre debe tener contenido significativo'
);

/**
 * Esquema mejorado para productos disponibles
 */
export const productoDisponibleSchema = z.object({
  // Campos básicos requeridos
  code: codeValidator,
  nombre: productNameValidator,
  
  // Campos de relación requeridos
  id_categoria: z.string({
    required_error: 'Debe seleccionar una categoría'
  }).min(1, 'La categoría es obligatoria'),
  
  id_producto_ofertado: z.string({
    required_error: 'Debe seleccionar un producto ofertado'
  }).min(1, 'El producto ofertado es obligatorio'),
  
  id_marca: z.string({
    required_error: 'Debe seleccionar una marca'
  }).min(1, 'La marca es obligatoria'),
  
  unidad_presentacion: z.string({
    required_error: 'Debe especificar la unidad de presentación'
  }).min(1, 'La unidad de presentación es obligatoria'),
  
  procedencia: z.string({
    required_error: 'Debe especificar la procedencia'
  }).min(1, 'La procedencia es obligatoria'),

  // Campos opcionales
  modelo: z.string().max(100, 'El modelo no puede tener más de 100 caracteres').optional(),
  referencia: z.string().max(100, 'La referencia no puede tener más de 100 caracteres').optional(),

  // Tendencias/indicadores (permiten negativos para indicar declive)
  tz_oferta: percentageValidator('Tendencia de oferta'),
  tz_demanda: percentageValidator('Tendencia de demanda'),
  tz_inflacion: percentageValidator('Tendencia de inflación'),
  tz_calidad: percentageValidator('Tendencia de calidad'),
  tz_eficiencia: percentageValidator('Tendencia de eficiencia'),
  tz_referencial: percentageValidator('Tendencia referencial'),

  // Precios (solo positivos)
  costo_referencial: priceValidator('Costo referencial'),
  precio_sie_referencial: priceValidator('Precio SIE referencial'),
  precio_sie_tipob: priceValidator('Precio SIE tipo B'),
  precio_venta_privado: priceValidator('Precio venta privado'),

  // Estado activo
  is_active: z.boolean().default(true),
});

/**
 * Esquema para productos ofertados
 */
export const productoOfertadoSchema = z.object({
  // Campos básicos
  code: codeValidator,
  nombre: productNameValidator,
  cudim: z.string().min(1, 'El CUDIM es requerido').max(20, 'El CUDIM no puede tener más de 20 caracteres'),
  
  // Relaciones
  id_categoria: z.string().min(1, 'La categoría es obligatoria'),
  id_proveedor: z.string().min(1, 'El proveedor es obligatorio'),
  
  // Campos opcionales
  descripcion: z.string().max(1000, 'La descripción no puede tener más de 1000 caracteres').optional(),
  especificaciones: z.string().max(2000, 'Las especificaciones no pueden tener más de 2000 caracteres').optional(),
  
  // Especialidad (opcional)
  especialidad: z.string().optional().nullable(),
  
  // Precios
  precio_venta: priceValidator('Precio de venta', true), // Requerido para productos ofertados
  precio_costo: priceValidator('Precio de costo'),
  precio_descuento: priceValidator('Precio con descuento'),
  
  // Cantidades
  stock_minimo: quantityValidator('Stock mínimo'),
  stock_actual: quantityValidator('Stock actual'),
  
  // Estado
  is_active: z.boolean().default(true),
});

/**
 * Validadores para archivos
 */
export const imageFileValidator = z.object({
  file: z.instanceof(File, { message: 'Debe seleccionar un archivo de imagen' })
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      'La imagen no puede ser mayor a 5MB'
    )
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type),
      'Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)'
    ),
  descripcion: z.string().max(200, 'La descripción no puede tener más de 200 caracteres').optional(),
  is_primary: z.boolean().default(false)
});

export const documentFileValidator = z.object({
  file: z.instanceof(File, { message: 'Debe seleccionar un archivo' })
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      'El documento no puede ser mayor a 10MB'
    )
    .refine(
      (file) => [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
      ].includes(file.type),
      'Solo se permiten archivos PDF, Word, Excel o texto'
    ),
  tipo_documento: z.string().min(1, 'Debe especificar el tipo de documento'),
  titulo: z.string().min(1, 'El título es requerido').max(100, 'El título no puede tener más de 100 caracteres'),
  descripcion: z.string().max(500, 'La descripción no puede tener más de 500 caracteres').optional(),
  is_public: z.boolean().default(false)
});

/**
 * Función helper para obtener errores de validación formateados
 */
export const getValidationErrors = (error) => {
  if (!error?.errors) return {};
  
  return error.errors.reduce((acc, err) => {
    const path = err.path.join('.');
    acc[path] = err.message;
    return acc;
  }, {});
};

/**
 * Función para validar un objeto y devolver errores formateados
 */
export const validateWithSchema = (schema, data) => {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData, errors: {} };
  } catch (error) {
    return { 
      success: false, 
      data: null, 
      errors: getValidationErrors(error) 
    };
  }
};

/**
 * Custom hook para validación en tiempo real
 */
export const useFieldValidation = (schema, fieldName, value) => {
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    try {
      schema.shape[fieldName]?.parse(value);
      setError(null);
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Campo inválido');
    }
  }, [schema, fieldName, value]);

  return error;
};

export default {
  productoDisponibleSchema,
  productoOfertadoSchema,
  imageFileValidator,
  documentFileValidator,
  priceValidator,
  percentageValidator,
  quantityValidator,
  codeValidator,
  productNameValidator,
  validateWithSchema,
  getValidationErrors
};