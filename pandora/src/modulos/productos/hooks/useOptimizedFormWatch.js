/**
 * Hook optimizado para observar campos específicos del formulario
 * Evita re-renders globales causados por watch() sin desestructurar
 */

import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';

/**
 * Hook optimizado para observar un campo específico del formulario
 * @param {Object} control - Control del formulario de React Hook Form
 * @param {string} fieldName - Nombre del campo a observar
 * @returns {any} Valor del campo observado
 */
export const useOptimizedFieldWatch = (control, fieldName) => {
  return useWatch({
    control,
    name: fieldName
  });
};

/**
 * Hook optimizado para observar múltiples campos específicos
 * @param {Object} control - Control del formulario de React Hook Form
 * @param {Array<string>} fieldNames - Array de nombres de campos a observar
 * @returns {Object} Objeto con los valores de los campos observados
 */
export const useOptimizedFieldsWatch = (control, fieldNames = []) => {
  const watchedValues = useWatch({
    control,
    name: fieldNames
  });

  // Convertir array de valores a objeto con nombres de campos como keys
  return useMemo(() => {
    if (!Array.isArray(watchedValues)) return watchedValues;
    
    return fieldNames.reduce((acc, fieldName, index) => {
      acc[fieldName] = watchedValues[index];
      return acc;
    }, {});
  }, [fieldNames, watchedValues]);
};

/**
 * Hook optimizado para calcular progreso del formulario
 * Solo recalcula cuando cambian los campos requeridos específicos
 */
export const useFormProgress = (control, requiredFields = [], getValues) => {
  // Observar solo los campos requeridos
  const requiredFieldValues = useOptimizedFieldsWatch(control, requiredFields);

  return useMemo(() => {
    const filledFields = requiredFields.filter(field => {
      const value = requiredFieldValues[field];
      return value && value.toString().trim() !== '';
    }).length;

    return Math.round((filledFields / requiredFields.length) * 100);
  }, [requiredFieldValues, requiredFields.length]);
};

/**
 * Hook para observar categoría específicamente (común en productos)
 */
export const useCategoryWatch = (control) => {
  return useOptimizedFieldWatch(control, 'id_categoria');
};

/**
 * Hook para observar cambios en campos críticos de productos
 */
export const useProductFormWatch = (control) => {
  const categoria = useOptimizedFieldWatch(control, 'id_categoria');
  const nombre = useOptimizedFieldWatch(control, 'nombre');
  const code = useOptimizedFieldWatch(control, 'code');
  const productoOfertado = useOptimizedFieldWatch(control, 'id_producto_ofertado');

  return useMemo(() => ({
    categoria,
    nombre,
    code,
    productoOfertado
  }), [categoria, nombre, code, productoOfertado]);
};

/**
 * Hook para observar solo cambios en precios (evita recálculos innecesarios)
 */
export const usePriceFieldsWatch = (control) => {
  const priceFields = [
    'costo_referencial',
    'precio_sie_referencial', 
    'precio_sie_tipob',
    'precio_venta_privado'
  ];

  return useOptimizedFieldsWatch(control, priceFields);
};

/**
 * Hook para observar campos de tendencias/indicadores
 */
export const useTrendFieldsWatch = (control) => {
  const trendFields = [
    'tz_oferta',
    'tz_demanda', 
    'tz_inflacion',
    'tz_calidad',
    'tz_eficiencia',
    'tz_referencial'
  ];

  return useOptimizedFieldsWatch(control, trendFields);
};

/**
 * Hook personalizado para validación en tiempo real de campos específicos
 * @param {Object} control - Control del formulario
 * @param {string} fieldName - Campo a validar
 * @param {Function} validator - Función de validación personalizada
 */
export const useFieldValidation = (control, fieldName, validator) => {
  const fieldValue = useOptimizedFieldWatch(control, fieldName);

  return useMemo(() => {
    if (!validator || !fieldValue) return { isValid: true, error: null };
    
    return validator(fieldValue);
  }, [fieldValue, validator]);
};

/**
 * Hook para observar cambios y calcular valores derivados de forma optimizada
 */
export const useDerivedValues = (control, derivationConfig = {}) => {
  // derivationConfig formato: { outputField: { dependencies: ['field1', 'field2'], calculator: (values) => result } }
  
  const allDependencies = useMemo(() => {
    const deps = new Set();
    Object.values(derivationConfig).forEach(config => {
      config.dependencies?.forEach(dep => deps.add(dep));
    });
    return Array.from(deps);
  }, [derivationConfig]);

  const dependencyValues = useOptimizedFieldsWatch(control, allDependencies);

  return useMemo(() => {
    const results = {};
    
    Object.entries(derivationConfig).forEach(([outputField, config]) => {
      if (config.calculator && typeof config.calculator === 'function') {
        const relevantValues = {};
        config.dependencies?.forEach(dep => {
          relevantValues[dep] = dependencyValues[dep];
        });
        
        results[outputField] = config.calculator(relevantValues);
      }
    });

    return results;
  }, [dependencyValues, derivationConfig]);
};

export default {
  useOptimizedFieldWatch,
  useOptimizedFieldsWatch,
  useFormProgress,
  useCategoryWatch,
  useProductFormWatch,
  usePriceFieldsWatch,
  useTrendFieldsWatch,
  useFieldValidation,
  useDerivedValues
};