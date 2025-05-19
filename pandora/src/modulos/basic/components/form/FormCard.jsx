// /pandora/src/modulos/basic/components/form/FormCard.jsx

import { ArrowLeft, Save } from 'lucide-react';
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
 * Componente para encapsular formularios en una tarjeta con diseño consistente
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título del formulario
 * @param {string} props.description - Descripción del formulario
 * @param {ReactNode} props.children - Contenido del formulario
 * @param {Function} props.onSubmit - Función a ejecutar al enviar
 * @param {Function} props.onCancel - Función a ejecutar al cancelar
 * @param {string} props.backLink - Enlace para el botón de volver
 * @param {boolean} props.isSubmitting - Estado de envío del formulario
 * @param {string} props.submitLabel - Texto para el botón de envío
 * @param {string} props.cancelLabel - Texto para el botón de cancelar
 * @param {boolean} props.hideBackButton - Ocultar botón de volver
 * @param {ReactNode} props.icon - Icono a mostrar junto al título
 */
export const FormCard = ({
  title,
  description,
  children,
  onSubmit,
  onCancel,
  backLink,
  isSubmitting = false,
  submitLabel = "Guardar",
  cancelLabel = "Cancelar",
  hideBackButton = false,
  icon
}) => {
  return (
    <div className="container mx-auto py-6">
      {!hideBackButton && (
        <Button
          variant="ghost"
          onClick={onCancel}
          className="mb-4 text-blue-700 hover:text-blue-800 hover:bg-blue-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> {backLink}
        </Button>
      )}

      <Card className="shadow-md border-blue-100">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 rounded-t-lg">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-lg shadow-sm flex items-center justify-center">
                {icon}
              </div>
            )}
            <div>
              <CardTitle className="text-xl text-blue-900">{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {children}
        </CardContent>
        <CardFooter className="flex justify-between bg-gradient-to-r from-blue-50/40 to-transparent py-4 border-t border-blue-100">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Guardando..." : submitLabel}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};