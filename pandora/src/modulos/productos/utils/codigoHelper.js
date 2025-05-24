/**
 * Helper puro para la generación de códigos de productos disponibles
 * 
 * Este módulo contiene funciones puras para la generación de códigos,
 * sin dependencias de React ni efectos secundarios.
 */

/**
 * Configuración por defecto para la generación de códigos
 */
export const DEFAULT_CODE_CONFIG = {
  prefix: 'PDIS',
  numberLength: 3,
  separator: '-',
  includeDate: false,
  customPrefix: ''
};

/**
 * Genera un número aleatorio con la longitud especificada
 * @param {number} length - Longitud del número (default: 3)
 * @returns {string} Número con padding de ceros
 */
export function generateRandomNumber(length = 3) {
  if (length <= 0) return '001';
  
  const max = Math.pow(10, length) - 1;
  const min = 1;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomNumber.toString().padStart(length, '0');
}

/**
 * Genera una letra aleatoria del alfabeto (A-Z)
 * @returns {string} Una letra mayúscula aleatoria
 */
export function generateRandomLetter() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return letters[Math.floor(Math.random() * letters.length)];
}

/**
 * Genera una fecha en formato YYMMDD
 * @param {Date} date - Fecha a formatear (default: fecha actual)
 * @returns {string} Fecha en formato YYMMDD
 */
export function formatDateForCode(date = new Date()) {
  return date.toISOString().slice(2, 10).replace(/-/g, '');
}

/**
 * Valida si un código de categoría es válido
 * @param {string} categoryCode - Código de categoría
 * @returns {boolean} True si es válido
 */
export function isValidCategoryCode(categoryCode) {
  return typeof categoryCode === 'string' && 
         categoryCode.trim().length > 0 && 
         categoryCode.trim().length <= 20; // Aumentado a 20 para códigos más largos
}

/**
 * Limpia y normaliza un código de categoría
 * @param {string} categoryCode - Código de categoría
 * @returns {string} Código limpio y normalizado
 */
export function normalizeCategoryCode(categoryCode) {
  if (!categoryCode) return '';
  return categoryCode.toString().trim().toUpperCase();
}

/**
 * Genera un código basado en categoría
 * Formato: CODIGO_CATEGORIA-LETRA-NUMERO
 * 
 * @param {string} categoryCode - Código de la categoría
 * @param {Object} options - Opciones adicionales
 * @param {number} options.numberLength - Longitud del número (default: 3)
 * @returns {string} Código generado o string vacío si categoryCode es inválido
 */
export function generateCategoryBasedCode(categoryCode, options = {}) {
  const normalizedCode = normalizeCategoryCode(categoryCode);
  
  if (!isValidCategoryCode(normalizedCode)) {
    return '';
  }
  
  const { numberLength = 3 } = options;
  const letter = generateRandomLetter();
  const number = generateRandomNumber(numberLength);
  
  return `${normalizedCode}-${letter}-${number}`;
}

/**
 * Genera un código personalizado con configuración avanzada
 * 
 * @param {Object} config - Configuración para el código
 * @param {string} config.prefix - Prefijo del código
 * @param {string} config.customPrefix - Prefijo personalizado (sobrescribe prefix)
 * @param {number} config.numberLength - Longitud del número
 * @param {string} config.separator - Separador entre elementos
 * @param {boolean} config.includeDate - Si incluir fecha en el código
 * @param {Date} config.date - Fecha específica (default: fecha actual)
 * @returns {string} Código personalizado generado
 */
export function generateCustomCode(config = {}) {
  const finalConfig = { ...DEFAULT_CODE_CONFIG, ...config };
  const {
    prefix,
    customPrefix,
    numberLength,
    separator,
    includeDate,
    date
  } = finalConfig;
  
  const finalPrefix = customPrefix || prefix;
  const number = generateRandomNumber(numberLength);
  
  if (includeDate) {
    const dateStr = formatDateForCode(date);
    return `${finalPrefix}${separator}${dateStr}${separator}${number}`;
  }
  
  return `${finalPrefix}${separator}${number}`;
}

/**
 * Genera un código usando la estrategia apropiada
 * 
 * @param {string|null} categoryCode - Código de categoría (opcional)
 * @param {Object} customConfig - Configuración personalizada (opcional)
 * @returns {string} Código generado
 */
export function generateCode(categoryCode = null, customConfig = {}) {
  // Si hay código de categoría válido, usarlo
  if (categoryCode && isValidCategoryCode(categoryCode)) {
    return generateCategoryBasedCode(categoryCode, customConfig);
  }
  
  // Fallback a código personalizado
  return generateCustomCode(customConfig);
}

/**
 * Valida si un código tiene el formato correcto
 * 
 * @param {string} code - Código a validar
 * @param {string} expectedCategoryCode - Código de categoría esperado (opcional)
 * @returns {Object} Resultado de validación con isValid y detalles
 */
export function validateCodeFormat(code, expectedCategoryCode = null) {
  if (!code || typeof code !== 'string') {
    return {
      isValid: false,
      reason: 'El código no puede estar vacío'
    };
  }
  
  const trimmedCode = code.trim();
  
  if (trimmedCode.length < 3) {
    return {
      isValid: false,
      reason: 'El código debe tener al menos 3 caracteres'
    };
  }
  
  // Si se espera un código de categoría específico, validar formato
  if (expectedCategoryCode) {
    const normalizedExpected = normalizeCategoryCode(expectedCategoryCode);
    const categoryPattern = new RegExp(`^${normalizedExpected}-[A-Z]-\\d{3}$`);
    
    if (!categoryPattern.test(trimmedCode)) {
      return {
        isValid: false,
        reason: `El código debe seguir el formato: ${normalizedExpected}-LETRA-NÚMERO (ej: ${normalizedExpected}-A-001)`
      };
    }
  }
  
  return {
    isValid: true,
    reason: null
  };
}

/**
 * Extrae información de un código generado
 * 
 * @param {string} code - Código a analizar
 * @returns {Object} Información extraída del código
 */
export function parseCode(code) {
  if (!code || typeof code !== 'string') {
    return {
      prefix: null,
      letter: null,
      number: null,
      date: null,
      format: 'invalid'
    };
  }
  
  const trimmedCode = code.trim().toUpperCase();
  
  // Detectar formato de categoría: CATEGORIA-LETRA-NUMERO
  const categoryMatch = trimmedCode.match(/^([A-Z0-9]+)-([A-Z])-(\d+)$/);
  if (categoryMatch) {
    return {
      prefix: categoryMatch[1],
      letter: categoryMatch[2],
      number: categoryMatch[3],
      date: null,
      format: 'category-based'
    };
  }
  
  // Detectar formato personalizado con fecha: PREFIX-YYMMDD-NUMERO
  const dateMatch = trimmedCode.match(/^([A-Z0-9]+)-(\d{6})-(\d+)$/);
  if (dateMatch) {
    return {
      prefix: dateMatch[1],
      letter: null,
      number: dateMatch[3],
      date: dateMatch[2],
      format: 'custom-with-date'
    };
  }
  
  // Detectar formato personalizado simple: PREFIX-NUMERO
  const simpleMatch = trimmedCode.match(/^([A-Z0-9]+)-(\d+)$/);
  if (simpleMatch) {
    return {
      prefix: simpleMatch[1],
      letter: null,
      number: simpleMatch[2],
      date: null,
      format: 'custom-simple'
    };
  }
  
  return {
    prefix: null,
    letter: null,
    number: null,
    date: null,
    format: 'unknown'
  };
}