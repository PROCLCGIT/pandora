// /pandora/src/modulos/basic/components/ui/ActionButtons.jsx

import { Eye, FileEdit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * Componente para botón de acción con tooltip
 */
const ActionButton = ({ 
  icon: Icon, 
  tooltip, 
  onClick, 
  variant = "ghost", 
  className = "" 
}) => (
  <TooltipProvider delayDuration={100}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size="icon"
          className={`h-8 w-8 p-0 ${className}`}
          onClick={onClick}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

/**
 * Componente para botón de visualización
 */
export const ViewButton = ({ onClick }) => (
  <ActionButton
    icon={Eye}
    tooltip="Ver detalles"
    onClick={onClick}
    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
  />
);

/**
 * Componente para botón de edición
 */
export const EditButton = ({ onClick }) => (
  <ActionButton
    icon={FileEdit}
    tooltip="Editar"
    onClick={onClick}
    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
  />
);

/**
 * Componente para botón de eliminación
 */
export const DeleteButton = ({ onClick }) => (
  <ActionButton
    icon={Trash2}
    tooltip="Eliminar"
    onClick={onClick}
    className="text-red-500 hover:text-red-700 hover:bg-red-50"
  />
);

/**
 * Componente que agrupa los botones de acción comunes
 */
export const ActionButtons = ({ 
  onView, 
  onEdit, 
  onDelete,
  hideView = false,
  hideEdit = false,
  hideDelete = false
}) => {
  return (
    <div className="flex justify-center items-center gap-1">
      {!hideView && onView && <ViewButton onClick={onView} />}
      {!hideEdit && onEdit && <EditButton onClick={onEdit} />}
      {!hideDelete && onDelete && <DeleteButton onClick={onDelete} />}
    </div>
  );
};