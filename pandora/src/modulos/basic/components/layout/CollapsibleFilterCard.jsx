// /pandora/src/modulos/basic/components/layout/CollapsibleFilterCard.jsx

import { useState } from 'react';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Componente de tarjeta colapsable para filtros de búsqueda
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título de la tarjeta de filtros
 * @param {string} props.description - Descripción de la funcionalidad de filtrado
 * @param {ReactNode} props.children - Contenido de los filtros
 * @param {Function} props.onClear - Función para limpiar los filtros
 * @param {ReactNode} props.icon - Icono opcional (por defecto es Filter)
 * @param {ReactNode} props.footerContent - Contenido adicional para el pie de la tarjeta
 * @param {boolean} props.defaultExpanded - Estado inicial expandido/colapsado (por defecto true)
 */
export const CollapsibleFilterCard = ({ 
  title = "Filtros de Búsqueda", 
  description,
  children,
  onClear,
  icon = <Filter className="mr-2 h-5 w-5 text-blue-600" />,
  footerContent,
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className="mb-6 border-blue-100 transition-all duration-300">
      <CardHeader 
        className={cn(
          "py-2 px-4 bg-gradient-to-r from-blue-50 to-blue-100/50 cursor-pointer select-none",
          isExpanded ? "rounded-t-lg" : "rounded-lg"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <CardTitle className="flex items-center text-sm font-medium text-blue-900">
              {icon}
              {title}
            </CardTitle>
            {!isExpanded && (
              <span className="text-xs text-gray-500 ml-2">
                (Click para expandir)
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 gap-4">
            {children}
          </div>
        </CardContent>
        
        {(footerContent || onClear) && (
          <CardFooter className="flex justify-end bg-gradient-to-r from-blue-50/50 to-transparent py-3 border-t border-blue-100">
            {footerContent}
            {onClear && (
              <Button 
                variant="outline" 
                onClick={onClear} 
                className="ml-auto border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                Limpiar Filtros
              </Button>
            )}
          </CardFooter>
        )}
      </div>
    </Card>
  );
};