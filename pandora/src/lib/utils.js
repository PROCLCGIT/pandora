// Helper para combinar clases de tailwind (usado por shadcn/ui)
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases de Tailwind CSS de manera eficiente evitando conflictos
 * @param {...string} inputs - Clases CSS para combinar
 * @returns {string} - String con las clases combinadas
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un número como moneda
 * @param {number} amount - Cantidad a formatear
 * @param {string} currency - Código de moneda (default: 'USD')
 * @returns {string} - String formateado como moneda
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Formatea una fecha
 * @param {Date|string} date - Fecha a formatear
 * @param {object} options - Opciones de formato
 * @returns {string} - String de fecha formateada
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  return new Intl.DateTimeFormat('es-MX', finalOptions).format(
    typeof date === 'string' ? new Date(date) : date
  );
}

/**
 * Trunca un texto a una longitud específica
 * @param {string} text - Texto a truncar
 * @param {number} length - Longitud máxima
 * @returns {string} - Texto truncado con ellipsis si es necesario
 */
export function truncateText(text, length = 50) {
  if (!text || text.length <= length) return text;
  return `${text.substring(0, length)}...`;
}
