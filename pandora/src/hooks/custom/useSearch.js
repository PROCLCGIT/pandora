/**
 * Hook personalizado para búsqueda con debounce
 * Permite buscar con un retraso mientras el usuario escribe
 * 
 * @param {Object} options - Opciones de configuración
 * @param {string} options.initialValue - Valor inicial (por defecto '')
 * @param {number} options.delay - Tiempo de retraso en ms (por defecto 500ms)
 * @param {Function} options.onSearch - Callback opcional a ejecutar cuando cambia el valor con debounce
 * @returns {Object} - Objeto con el valor de entrada, valor con debounce y función setter
 */
import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';

export function useSearch({
  initialValue = '',
  delay = 500,
  onSearch = null
} = {}) {
  // Estado para el valor de entrada actual
  const [inputValue, setInputValue] = useState(initialValue);
  
  // Aplicar debounce al valor de entrada
  const debouncedValue = useDebounce(inputValue, delay);

  // Efecto para ejecutar el callback cuando cambia el valor con debounce
  useEffect(() => {
    if (onSearch && typeof onSearch === 'function') {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, onSearch]);

  return {
    inputValue,
    setInputValue,
    debouncedValue
  };
}

export default useSearch;