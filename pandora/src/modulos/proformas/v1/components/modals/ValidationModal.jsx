import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const ValidationModal = ({ 
  isOpen, 
  onClose, 
  validationResults = { errors: [], warnings: [], info: [] } 
}) => {
  const hasErrors = validationResults.errors.length > 0;
  const hasWarnings = validationResults.warnings.length > 0;
  const hasInfo = validationResults.info.length > 0;
  const isValid = !hasErrors && !hasWarnings;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isValid ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Validación Exitosa
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-red-600" />
                Resultados de Validación
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isValid 
              ? "Todos los productos cumplen con los requisitos del modelo seleccionado."
              : "Se encontraron los siguientes problemas que requieren atención:"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] mt-4">
          <div className="space-y-4">
            {/* Errores */}
            {hasErrors && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4" />
                  Errores ({validationResults.errors.length})
                </h3>
                <ul className="space-y-2">
                  {validationResults.errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Advertencias */}
            {hasWarnings && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  Advertencias ({validationResults.warnings.length})
                </h3>
                <ul className="space-y-2">
                  {validationResults.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                      <span className="text-yellow-600 mt-0.5">•</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Información */}
            {hasInfo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  Información ({validationResults.info.length})
                </h3>
                <ul className="space-y-2">
                  {validationResults.info.map((info, index) => (
                    <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{info}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mensaje de éxito */}
            {isValid && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-green-800 font-medium">
                      ¡Validación completada sin errores!
                    </p>
                    <p className="text-green-700 text-sm mt-1">
                      Todos los productos tienen la información requerida para el modelo seleccionado.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          {hasErrors && (
            <Button 
              variant="default" 
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700"
            >
              Corregir Errores
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ValidationModal;