// /pandora/src/modulos/basic/components/layout/PageHeader.jsx

import { Button } from '@/components/ui/button';

/**
 * Componente reutilizable para cabeceras de página
 * 
 * @param {Object} props - Propiedades del componente
 * @param {ReactNode} props.icon - Icono a mostrar
 * @param {string} props.title - Título de la página
 * @param {string} props.description - Descripción de la página
 * @param {Object} props.action - Configuración del botón de acción
 * @param {string} props.action.label - Texto del botón
 * @param {ReactNode} props.action.icon - Icono del botón
 * @param {Function} props.action.onClick - Función a ejecutar al hacer clic
 */
export const PageHeader = ({ 
  icon, 
  title, 
  description,
  action 
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm p-6 mb-8 border border-blue-100">
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        {icon && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 rounded-xl shadow-md flex items-center justify-center">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
          </div>
          {description && <p className="text-gray-600 font-medium">{description}</p>}
        </div>
        {action && (
          <div className="flex flex-col items-end gap-2 md:items-stretch">
            <Button 
              onClick={action.onClick} 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white flex items-center shadow-sm"
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};