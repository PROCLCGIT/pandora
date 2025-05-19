// /pandora/src/modulos/basic/components/ui/SearchInput.jsx

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

/**
 * Componente para campo de búsqueda con icono y estado de búsqueda
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.value - Valor actual del campo
 * @param {Function} props.onChange - Función al cambiar el valor
 * @param {string} props.placeholder - Texto de placeholder
 * @param {string} props.debouncedValue - Valor con debounce (para mostrar "Buscando...")
 * @param {Object} props.inputProps - Props adicionales para el Input
 */
export const SearchInput = ({
  value,
  onChange,
  placeholder = "Buscar...",
  debouncedValue,
  inputProps = {}
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="pl-9 h-9 border-blue-200 focus:border-blue-400"
        {...inputProps}
      />
      {value && debouncedValue !== value && (
        <div className="absolute right-2 top-2 text-xs text-muted-foreground">
          Buscando...
        </div>
      )}
    </div>
  );
};