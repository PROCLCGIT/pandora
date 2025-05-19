/**
 * Hook personalizado para debounce de valores
 * Útil para retrasar la ejecución de acciones mientras el usuario sigue escribiendo
 * 
 * @param {any} value - El valor a aplicar debounce
 * @param {number} delay - El tiempo de retraso en milisegundos (por defecto 500ms)
 * @returns {any} - El valor con debounce aplicado
 */
import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 500) {
  // Estado para almacenar el valor con debounce
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Configurar un timer para actualizar el valor después del retraso
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancelar el timer si el valor o el retraso cambian
    // o si el componente se desmonta
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]); // Ejecutar efecto cuando cambie el valor o el retraso

  return debouncedValue;
}

export default useDebounce;