// src/utils/format.js

/**
 * Formatea un valor numérico como moneda
 * @param {number} amount - Cantidad a formatear
 * @param {string} locale - Configuración regional (por defecto: 'es-EC')
 * @param {string} currency - Código de moneda (por defecto: 'USD')
 * @returns {string} Valor formateado como moneda
 */
export const formatMoney = (amount, locale = 'es-EC', currency = 'USD') => {
  if (amount === null || amount === undefined) return '';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formatea una fecha 
 * @param {string|Date} date - Fecha a formatear
 * @param {string} locale - Configuración regional (por defecto: 'es-EC')
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, locale = 'es-EC') => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Trunca un texto si excede la longitud máxima
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima (por defecto: 100)
 * @returns {string} Texto truncado
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};
