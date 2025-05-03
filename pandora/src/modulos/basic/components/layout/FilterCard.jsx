// /pandora/src/modulos/basic/components/layout/FilterCard.jsx

import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * Componente de tarjeta para filtros de búsqueda
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título de la tarjeta de filtros
 * @param {string} props.description - Descripción de la funcionalidad de filtrado
 * @param {ReactNode} props.children - Contenido de los filtros
 * @param {Function} props.onClear - Función para limpiar los filtros
 * @param {ReactNode} props.icon - Icono opcional (por defecto es Filter)
 * @param {ReactNode} props.footerContent - Contenido adicional para el pie de la tarjeta
 */
export const FilterCard = ({ 
  title = "Filtros de Búsqueda", 
  description,
  children,
  onClear,
  icon = <Filter className="mr-2 h-5 w-5 text-blue-600" />,
  footerContent
}) => {
  return (
    <Card className="mb-6 border-blue-100">
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-t-lg">
        <CardTitle className="flex items-center text-lg font-semibold text-blue-900">
          {icon}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-5">
        <div className="grid grid-cols-1 gap-4">
          {children}
        </div>
      </CardContent>
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
    </Card>
  );
};