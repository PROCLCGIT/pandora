/**
 * Hook personalizado para manejar códigos de productos disponibles
 * 
 * Este hook encapsula toda la lógica de generación de códigos,
 * configuración y modos de edición para productos disponibles.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  generateCode, 
  generateCategoryBasedCode,
  validateCodeFormat,
  parseCode,
  DEFAULT_CODE_CONFIG 
} from '../utils/codigoHelper.js';

/**
 * Configuraciones por defecto específicas para productos disponibles
 */
const PRODUCTOS_DISPONIBLES_CONFIG = {
  ...DEFAULT_CODE_CONFIG,
  storageKey: 'productos_code_settings',
  configKey: 'disponibles'
};

/**
 * Hook para manejar códigos de productos disponibles
 * 
 * @param {Object} options - Opciones de configuración
 * @param {Function} options.setValue - Función para establecer valores en el formulario
 * @param {Function} options.toast - Función para mostrar notificaciones
 * @param {Object} options.formValues - Valores actuales del formulario
 * @param {Array} options.categoriasData - Datos de categorías disponibles
 * @param {boolean} options.isEditing - Si está en modo edición
 * @returns {Object} Estado y funciones para manejar códigos
 */
export function useCodigoProductoDisponible({
  setValue,
  toast,
  formValues = {},
  categoriasData = null,
  isEditing = false
}) {
  
  // Estados
  const [isManualCodeMode, setIsManualCodeMode] = useState(false);
  const [codeSettings, setCodeSettings] = useState(PRODUCTOS_DISPONIBLES_CONFIG);
  const [lastGeneratedCode, setLastGeneratedCode] = useState('');

  /**
   * Cargar configuraciones guardadas desde localStorage
   */
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(PRODUCTOS_DISPONIBLES_CONFIG.storageKey);
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings[PRODUCTOS_DISPONIBLES_CONFIG.configKey]) {
          setCodeSettings(prev => ({
            ...prev,
            ...settings[PRODUCTOS_DISPONIBLES_CONFIG.configKey]
          }));
        }
      }
    } catch (error) {
      console.error('Error loading code settings:', error);
    }
  }, []);

  /**
   * Guardar configuraciones en localStorage
   */
  const saveCodeSettings = useCallback((newSettings) => {
    try {
      const savedSettings = localStorage.getItem(PRODUCTOS_DISPONIBLES_CONFIG.storageKey);
      const allSettings = savedSettings ? JSON.parse(savedSettings) : {};
      
      allSettings[PRODUCTOS_DISPONIBLES_CONFIG.configKey] = newSettings;
      localStorage.setItem(PRODUCTOS_DISPONIBLES_CONFIG.storageKey, JSON.stringify(allSettings));
      
      setCodeSettings(prev => ({ ...prev, ...newSettings }));
    } catch (error) {
      console.error('Error saving code settings:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las configuraciones",
        variant: "destructive",
      });
    }
  }, [toast]);

  /**
   * Obtener la categoría seleccionada actualmente
   */
  const getSelectedCategory = useCallback(() => {
    if (!formValues.id_categoria || !categoriasData?.results) {
      return null;
    }
    
    return categoriasData.results.find(cat => 
      cat.id.toString() === formValues.id_categoria
    );
  }, [formValues.id_categoria, categoriasData]);

  /**
   * Obtener el código de la categoría seleccionada
   */
  const getCategoryCode = useCallback(() => {
    const category = getSelectedCategory();
    if (!category) return null;
    
    // Priorizar el campo 'codigo' si existe, sino usar los primeros 3 caracteres del nombre
    return category.codigo || category.nombre?.substring(0, 3).toUpperCase();
  }, [getSelectedCategory]);

  /**
   * Generar un nuevo código basado en la configuración actual
   */
  const generateNewCode = useCallback(() => {
    const categoryCode = getCategoryCode();
    
    if (categoryCode) {
      return generateCategoryBasedCode(categoryCode, {
        numberLength: codeSettings.numberLength
      });
    }
    
    // Fallback a código personalizado
    return generateCode(null, codeSettings);
  }, [getCategoryCode, codeSettings]);

  /**
   * Establecer un código en el formulario
   */
  const setCodeInForm = useCallback((code, options = {}) => {
    const { 
      shouldValidate = true, 
      shouldDirty = true,
      showNotification = false,
      notificationMessage = ''
    } = options;
    
    setValue('code', code, { shouldValidate, shouldDirty });
    setLastGeneratedCode(code);
    
    if (showNotification && notificationMessage) {
      toast({
        title: "Código actualizado",
        description: notificationMessage,
      });
    }
  }, [setValue, toast]);

  /**
   * Regenerar código manualmente
   */
  const regenerateCode = useCallback(() => {
    if (isManualCodeMode) {
      toast({
        title: "Modo manual activo",
        description: "Cambia a modo automático para regenerar el código",
        variant: "destructive",
      });
      return false;
    }
    
    const categoryCode = getCategoryCode();
    if (!categoryCode) {
      toast({
        title: "Selecciona una categoría",
        description: "Primero debes seleccionar una categoría para generar el código",
        variant: "destructive",
      });
      return false;
    }
    
    const newCode = generateNewCode();
    setCodeInForm(newCode, {
      showNotification: true,
      notificationMessage: `Nuevo código: ${newCode}`
    });
    
    return true;
  }, [isManualCodeMode, getCategoryCode, generateNewCode, setCodeInForm, toast]);

  /**
   * Activar modo manual de edición
   */
  const enableManualMode = useCallback(() => {
    setIsManualCodeMode(true);
    toast({
      title: "Modo manual activado",
      description: "Ahora puedes editar el código libremente",
    });
  }, [toast]);

  /**
   * Activar modo automático
   */
  const enableAutoMode = useCallback(() => {
    setIsManualCodeMode(false);
    
    const categoryCode = getCategoryCode();
    if (categoryCode) {
      const newCode = generateNewCode();
      setCodeInForm(newCode, {
        showNotification: true,
        notificationMessage: `Código regenerado automáticamente: ${newCode}`
      });
    } else {
      toast({
        title: "Modo automático activado",
        description: "Selecciona una categoría para generar el código automáticamente",
      });
    }
  }, [getCategoryCode, generateNewCode, setCodeInForm, toast]);

  /**
   * Validar el código actual
   */
  const validateCurrentCode = useCallback((code) => {
    if (!code) return { isValid: false, reason: 'El código es requerido' };
    
    const categoryCode = getCategoryCode();
    return validateCodeFormat(code, categoryCode);
  }, [getCategoryCode]);

  /**
   * Parsear el código actual para obtener información
   */
  const parseCurrentCode = useCallback((code) => {
    return parseCode(code);
  }, []);

  /**
   * Efecto para generar código automáticamente cuando se selecciona una categoría
   */
  useEffect(() => {
    // Solo generar automáticamente si:
    // - No está en modo edición
    // - No está en modo manual
    // - Se seleccionó una categoría
    // - El formulario tiene un id_categoria válido
    if (!isEditing && 
        !isManualCodeMode && 
        formValues.id_categoria && 
        formValues.id_categoria !== '') {
      
      const categoryCode = getCategoryCode();
      if (categoryCode) {
        const newCode = generateNewCode();
        
        // Usar setTimeout para asegurar que la actualización se ejecute correctamente
        setTimeout(() => {
          setCodeInForm(newCode, {
            showNotification: true,
            notificationMessage: `Código generado automáticamente: ${newCode}`
          });
        }, 100);
      }
    }
  }, [
    formValues.id_categoria, 
    isEditing, 
    isManualCodeMode, 
    getCategoryCode, 
    generateNewCode, 
    setCodeInForm
  ]);

  return {
    // Estado
    isManualCodeMode,
    codeSettings,
    lastGeneratedCode,
    
    // Configuración
    saveCodeSettings,
    
    // Información de categoría
    getSelectedCategory,
    getCategoryCode,
    
    // Generación de códigos
    generateNewCode,
    regenerateCode,
    
    // Modos de edición
    enableManualMode,
    enableAutoMode,
    
    // Validación y análisis
    validateCurrentCode,
    parseCurrentCode,
    
    // Utilidades
    setCodeInForm
  };
}