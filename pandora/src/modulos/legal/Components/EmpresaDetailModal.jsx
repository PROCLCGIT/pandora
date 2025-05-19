import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Clipboard, Mail, Phone, User, Building, FileText, Link } from "lucide-react";
import { Button } from "@/components/ui/button";

const EmpresaDetailModal = ({ isOpen, onClose, empresa, onCopy, entityType }) => {
  console.log("Modal recibió: ", { isOpen, empresa, entityType });
  
  // Si no hay empresa o no está abierto, no continuar renderizando
  if (!isOpen || !empresa) {
    console.log("Modal no va a renderizar - sin empresa o modal cerrado");
    return null;
  }
  
  // Log del tipo de entidad
  console.log(`EmpresaDetailModal - Tipo de entidad: ${entityType}`);
  
  // Verificar que la empresa tenga todos los campos necesarios
  if (!empresa.empresa || !empresa.ruc) {
    console.log("Empresa con datos incompletos:", empresa);
  }

  console.log("Modal renderizando con empresa:", empresa);

  // Función para renderizar un campo con su valor y botón de copia
  const renderField = (label, value, icon = null) => {
    if (value === undefined || value === null) {
      console.log(`Modal: Campo ${label} es nulo o undefined`);
      return null;
    }
    
    // Convertir a string para evitar errores de renderizado
    const stringValue = String(value);
    
    return (
      <div className="flex items-center justify-between py-2 border-b border-gray-100">
        <span className="font-medium text-gray-700 flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {label}:
        </span>
        <div className="flex items-center">
          <span className="text-gray-800 mr-2">{stringValue}</span>
          <button
            onClick={(e) => onCopy(stringValue, e)}
            className="p-1 hover:bg-gray-200 rounded-full"
          >
            <Clipboard size={16} className="text-gray-500" />
          </button>
        </div>
      </div>
    );
  };

  // Título del diálogo según el tipo de entidad
  const getTitle = () => {
    switch (entityType) {
      case "sri":
        return "Información del SRI";
      case "sercop":
        return "Información del SERCOP";
      case "supercom":
        return "Información del SUPERCOM";
      case "otrasinstituciones":
        return `Información de ${empresa.institucion || "Otra Institución"}`;
      default:
        return "Información de la Entidad";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            Datos detallados de {empresa.empresa}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
              <Building className="mr-2 h-5 w-5 text-primary" />
              {empresa.empresa}
            </div>
            
            <div className="space-y-3">
              {renderField("RUC", empresa.ruc, <FileText size={16} className="text-gray-500" />)}
              {renderField("Usuario", empresa.usuario, <User size={16} className="text-gray-500" />)}
              {renderField("Contraseña", empresa.contrasena)}
              {renderField("Correo", empresa.correo, <Mail size={16} className="text-gray-500" />)}
              {renderField("Teléfono", empresa.telefono, <Phone size={16} className="text-gray-500" />)}
              {renderField("Representante", empresa.representante, <User size={16} className="text-gray-500" />)}
              
              {/* Campos específicos para OtrasInstituciones */}
              {empresa.institucion && renderField("Institución", empresa.institucion, <Building size={16} className="text-gray-500" />)}
              
              {empresa.url && (
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-700 flex items-center">
                    <Link size={16} className="text-gray-500 mr-2" />
                    URL:
                  </span>
                  <div className="flex items-center">
                    <a 
                      href={empresa.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline mr-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {empresa.url.length > 30 ? empresa.url.substring(0, 30) + '...' : empresa.url}
                    </a>
                    <button
                      onClick={(e) => onCopy(empresa.url, e)}
                      className="p-1 hover:bg-gray-200 rounded-full"
                    >
                      <Clipboard size={16} className="text-gray-500" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onClose(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmpresaDetailModal;