// src/components/EmpresaCard.jsx
import React from "react";
import { Clipboard, Pencil, Mail, Phone, User, Link, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const EmpresaCard = ({ empresa, onCopy }) => {
  // Verificar que empresa exista antes de usarla
  if (!empresa || typeof empresa !== 'object') {
    console.error("EmpresaCard: No se recibió un objeto empresa válido", empresa);
    return (
      <div className="bg-gray-50 p-6 rounded-xl shadow border border-red-200 text-center">
        <p className="text-red-500">Error: Datos de empresa no válidos</p>
      </div>
    );
  }
  
  // Determinar si es una institución especial (tiene campos adicionales)
  const isOtraInstitucion = empresa?.institucion || empresa?.url;
  
  // Función para renderizar un campo con su valor y botón de copia
  const renderField = (label, value, icon = null) => {
    if (value === undefined || value === null) {
      console.log(`Campo ${label} es nulo o undefined`);
      return null;
    }
    
    // Convertir a string para evitar errores de renderizado
    const stringValue = String(value);
    
    return (
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-600 flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {label}:
        </span>
        <div className="flex items-center">
          <span className="text-gray-800">{stringValue}</span>
          <button
            onClick={(e) => onCopy(stringValue, e)}
            className="ml-3 p-1 hover:bg-gray-200 rounded-full"
          >
            <Clipboard size={18} className="text-gray-500" />
          </button>
        </div>
      </div>
    );
  };

  // Impresión de diagnóstico para detectar propiedades faltantes
  console.log("Renderizando EmpresaCard con datos:", {
    empresa: empresa?.empresa || '[FALTA]',
    ruc: empresa?.ruc || '[FALTA]',
    usuario: empresa?.usuario || '[FALTA]',
    contrasena: empresa?.contrasena ? (empresa.contrasena.substring(0, 3) + "...") : '[FALTA]'
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30">
      <div className="mb-4 flex justify-between items-center">
        <p className="text-xl font-semibold text-gray-700">{empresa?.empresa || 'Sin nombre'}</p>
        <div className="flex space-x-2">
          {isOtraInstitucion && (
            <Badge variant="outline" className="bg-blue-50">
              {empresa?.institucion || 'Otra institución'}
            </Badge>
          )}
          <Badge variant="default" className="bg-green-600">
            {empresa?.id ? `ID: ${empresa.id}` : 'Nuevo'}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-3">
        {renderField("RUC", empresa?.ruc)}
        {renderField("Usuario", empresa?.usuario, <User size={16} className="text-gray-500" />)}
        {renderField("Contraseña", empresa?.contrasena)}
        {renderField("Correo", empresa?.correo, <Mail size={16} className="text-gray-500" />)}
        {renderField("Teléfono", empresa?.telefono, <Phone size={16} className="text-gray-500" />)}
        {renderField("Representante", empresa?.representante, <User size={16} className="text-gray-500" />)}
        
        {/* Campos especiales para OtrasInstituciones */}
        {empresa?.institucion && renderField("Institución", empresa.institucion, <Building size={16} className="text-gray-500" />)}
        
        {empresa?.url && (
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-600 flex items-center">
              <Link size={16} className="text-gray-500 mr-2" />
              URL:
            </span>
            <div className="flex items-center">
              <a 
                href={empresa.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {empresa.url.length > 30 ? empresa.url.substring(0, 30) + '...' : empresa.url}
              </a>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy(empresa.url, e);
                }}
                className="ml-3 p-1 hover:bg-gray-200 rounded-full"
              >
                <Clipboard size={18} className="text-gray-500" />
              </button>
            </div>
          </div>
        )}
        
        <div className="mt-4 flex justify-end">
          {/* El botón de editar solo tiene efecto visual por ahora */}
          <button 
            className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              console.log("Botón de editar presionado para:", empresa?.empresa);
            }}
          >
            <Pencil size={18} className="text-blue-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmpresaCard;
