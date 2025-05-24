// /pandora/src/modulos/basic/components/layout/PageHeader.jsx

import { Button } from '@/components/ui/button';

/**
 * Componente reutilizable para cabeceras de página
 * 
 * @param {Object} props - Propiedades del componente
 * @param {ReactNode} props.icon - Icono a mostrar
 * @param {string} props.title - Título de la página
 * @param {string} props.description - Descripción de la página
 * @param {Object|Array} props.action - Configuración del botón de acción o array de acciones
 * @param {string} props.action.label - Texto del botón
 * @param {ReactNode} props.action.icon - Icono del botón
 * @param {Function} props.action.onClick - Función a ejecutar al hacer clic
 * @param {string} props.action.variant - Variante del botón (default, secondary, outline)
 */
export const PageHeader = ({ 
  icon, 
  title, 
  description,
  action,
  actions 
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
        {(action || actions) && (
          <div className="flex flex-col items-end gap-2 md:items-stretch">
            {actions ? (
              <div className="flex gap-2">
                {actions.map((actionItem, index) => (
                  <Button 
                    key={index}
                    onClick={actionItem.onClick} 
                    variant={actionItem.variant || "default"}
                    className={
                      actionItem.variant === "outline" 
                        ? "border-blue-600 text-blue-600 hover:bg-blue-50"
                        : actionItem.variant === "secondary"
                        ? "bg-gray-600 hover:bg-gray-700 text-white"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                    }
                  >
                    {actionItem.icon && <span className="mr-2">{actionItem.icon}</span>}
                    {actionItem.label}
                  </Button>
                ))}
              </div>
            ) : (
              <Button 
                onClick={action.onClick} 
                variant={action.variant || "default"}
                className={
                  action.variant === "outline" 
                    ? "border-blue-600 text-blue-600 hover:bg-blue-50"
                    : action.variant === "secondary"
                    ? "bg-gray-600 hover:bg-gray-700 text-white"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white flex items-center shadow-sm"
                }
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};