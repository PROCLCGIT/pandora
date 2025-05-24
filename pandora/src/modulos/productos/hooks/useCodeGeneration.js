// /pandora/src/modulos/productos/hooks/useCodeGeneration.js

/**
 * DEPRECATED: Este hook está siendo reemplazado por useCodigoProductoDisponible
 * 
 * @deprecated Use useCodigoProductoDisponible instead
 * Se mantiene por compatibilidad hasta completar la migración
 */

import { useCodigoProductoDisponible } from './useCodigoProductoDisponible.js';

/**
 * Hook de compatibilidad que delega al nuevo hook especializado
 * 
 * @deprecated Use useCodigoProductoDisponible directly
 */
export function useCodeGeneration(
  formValues, 
  categoriasData, 
  isEditing, 
  isManualCodeMode, 
  setValue, 
  toast
) {
  // Usar el nuevo hook especializado
  const codigoHook = useCodigoProductoDisponible({
    setValue,
    toast,
    formValues,
    categoriasData,
    isEditing
  });

  // Mantener compatibilidad con la API anterior
  return {
    customCodeSettings: codigoHook.codeSettings,
    setCustomCodeSettings: codigoHook.saveCodeSettings,
    generateCategoryBasedCode: codigoHook.generateNewCode,
    generateCustomCode: codigoHook.generateNewCode,
    regenerateCode: codigoHook.regenerateCode,
    enableManualMode: codigoHook.enableManualMode,
    enableAutoMode: codigoHook.enableAutoMode,
    
    // Propiedades adicionales del nuevo hook
    isManualCodeMode: codigoHook.isManualCodeMode,
    getSelectedCategory: codigoHook.getSelectedCategory,
    getCategoryCode: codigoHook.getCategoryCode,
    validateCurrentCode: codigoHook.validateCurrentCode,
    parseCurrentCode: codigoHook.parseCurrentCode
  };
}