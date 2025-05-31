// /pandora/src/modulos/proformas/v1/components/form/InfoBaseSection.jsx
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText } from 'lucide-react';

const InfoBaseSection = ({
  detallesProforma,
  setDetallesProforma,
  empresas,
  tiposContratacion,
  fieldErrors,
  setFieldErrors 
}) => {
  return (
    <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-blue-700" />
        <h2 className="text-lg font-semibold text-blue-900">Información Base</h2>
      </div>
      
      <div className="space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Empresa */}
          <div className="grid grid-cols-[140px,1fr] items-center gap-3">
            <label className="text-sm font-medium text-blue-800">
              Empresa: <span className="text-red-500">*</span>
            </label>
            <Select 
              value={detallesProforma.empresa?.toString() || ''}
              onValueChange={(value) => {
                setDetallesProforma({...detallesProforma, empresa: value});
                setFieldErrors(prev => ({...prev, empresa: false}));
              }}
            >
              <SelectTrigger className={`w-full bg-white h-8 text-sm ${fieldErrors.empresa ? 'border-red-500 focus:border-red-500' : 'border-blue-300'}`}>
                <SelectValue placeholder="Seleccione una empresa" />
              </SelectTrigger>
              <SelectContent>
                {empresas.map((empresa) => (
                  <SelectItem key={empresa.id} value={empresa.id.toString()}>
                    {empresa.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Tipo de Contrato */}
          <div className="grid grid-cols-[140px,1fr] items-center gap-3">
            <label className="text-sm font-medium text-blue-800">
              Tipo de Contrato: <span className="text-red-500">*</span>
            </label>
            <Select 
              value={detallesProforma.tipoContratacion?.toString() || ''}
              onValueChange={(value) => {
                setDetallesProforma({...detallesProforma, tipoContratacion: parseInt(value)});
                setFieldErrors(prev => ({...prev, tipoContratacion: false}));
              }}
            >
              <SelectTrigger className={`w-full bg-white h-8 text-sm ${fieldErrors.tipoContratacion ? 'border-red-500 focus:border-red-500' : 'border-blue-300'}`}>
                <SelectValue placeholder="Seleccione tipo de contrato" />
              </SelectTrigger>
              <SelectContent>
                {tiposContratacion.map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.id.toString()}>
                    {tipo.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Nombre de Proforma */}
        <div className="grid grid-cols-[140px,1fr] items-center gap-3">
          <label className="text-sm font-medium text-blue-800">
            Nombre de Proforma: <span className="text-red-500">*</span>
          </label>
          <Input
            value={detallesProforma.nombre || ''}
            onChange={(e) => {
              setDetallesProforma({...detallesProforma, nombre: e.target.value});
              setFieldErrors(prev => ({...prev, nombre: false}));
            }}
            placeholder="Ingrese un nombre descriptivo para la proforma"
            className={`bg-white h-8 text-sm ${fieldErrors.nombre ? 'border-red-500 focus:border-red-500' : 'border-blue-300'}`}
          />
        </div>
      </div>
    </div>
  );
};

export default InfoBaseSection;
