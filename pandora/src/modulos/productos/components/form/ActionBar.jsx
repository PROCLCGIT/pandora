// /pandora/src/modulos/productos/components/form/ActionBar.jsx

import { CheckCircle, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Componente para la barra de acciones flotante del formulario
 */
export function ActionBar({
  isEditing,
  isManualCodeMode,
  isSubmitting,
  isDirty,
  imagenes,
  documentos,
  onCancel,
  onSubmit
}) {
  return (
    <div className="sticky bottom-4 py-4 z-10">
      <div className="bg-white backdrop-blur-md bg-opacity-95 p-4 rounded-xl shadow-lg border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-gray-500 hidden md:block">
          {isEditing ? (
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-indigo-600 mr-2" />
              <span>Actualice los campos necesarios y guarde los cambios.</span>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></div>
                <span>Complete los campos requeridos para crear un nuevo producto.</span>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${isManualCodeMode ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
                <span className="text-xs">
                  {isManualCodeMode ? '✏️ Código manual' : '🤖 Código automático'}
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            className="rounded-lg px-6 border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          
          <Button
            type="submit"
            className="rounded-lg px-8 bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto shadow-md transition-all duration-300 hover:shadow-lg"
            disabled={isSubmitting || (!isDirty && !imagenes.length && !documentos.length)}
            onClick={onSubmit}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Guardando...
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Actualizar Producto' : 'Guardar Producto'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}