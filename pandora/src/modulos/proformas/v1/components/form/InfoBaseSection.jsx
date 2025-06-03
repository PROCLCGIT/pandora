// /pandora/src/modulos/proformas/v1/components/form/InfoBaseSection.jsx
import React, { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Settings, Save } from 'lucide-react';

const InfoBaseSection = ({
  detallesProforma,
  setDetallesProforma,
  empresas,
  tiposContratacion,
  fieldErrors,
  setFieldErrors,
  numeroProforma
}) => {
  // Establecer valores por defecto cuando las listas se cargan
  useEffect(() => {
    // Solo establecer si la lista está cargada y no hay valor actual
    if (empresas.length > 0 && (!detallesProforma.empresa || detallesProforma.empresa === '')) {
      // Buscar empresa con ID 1
      const empresaConId1 = empresas.find(e => e.id === 1 || e.id === '1');
      if (empresaConId1) {
        console.log('Estableciendo empresa por defecto ID 1:', empresaConId1);
        setDetallesProforma(prev => ({ ...prev, empresa: '1' }));
      }
    }
  }, [empresas, detallesProforma.empresa, setDetallesProforma]);

  useEffect(() => {
    // Solo establecer si la lista está cargada y no hay valor actual
    if (tiposContratacion.length > 0 && (!detallesProforma.tipoContratacion || detallesProforma.tipoContratacion === '')) {
      // Buscar tipo con ID 1
      const tipoConId1 = tiposContratacion.find(t => t.id === 1 || t.id === '1');
      if (tipoConId1) {
        console.log('Estableciendo tipo contratación por defecto ID 1:', tipoConId1);
        setDetallesProforma(prev => ({ ...prev, tipoContratacion: '1' }));
      }
    }
  }, [tiposContratacion, detallesProforma.tipoContratacion, setDetallesProforma]);
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-blue-300/20 px-4 py-3 border-b border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-700" />
            <h2 className="text-lg font-semibold text-blue-900">
              Información Base
            </h2>
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-7 px-2">
              <Settings className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" className="h-7 px-2">
              <Save className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
      <div className="p-6">
      
      <div className="space-y-3">
        {/* Número de Proforma */}
        <div className="grid grid-cols-[140px,1fr] items-center gap-3">
          <label className="text-sm font-medium text-gray-700">
            Número:
          </label>
          <div className="text-sm font-semibold text-blue-600">
            {numeroProforma ? `#${numeroProforma}` : '# Se generará automáticamente'}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Empresa */}
          <div className="grid grid-cols-[140px,1fr] items-center gap-3">
            <label className="text-sm font-medium text-gray-700">
              Empresa: <span className="text-red-500">*</span>
            </label>
            <Select 
              value={detallesProforma.empresa?.toString() || '1'}
              onValueChange={(value) => {
                setDetallesProforma({...detallesProforma, empresa: value});
                setFieldErrors(prev => ({...prev, empresa: false}));
              }}
            >
              <SelectTrigger className={`w-full bg-white h-8 text-sm ${fieldErrors.empresa ? 'border-red-500 focus:border-red-500' : 'border-gray-300'}`}>
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
            <label className="text-sm font-medium text-gray-700">
              Tipo de Contrato: <span className="text-red-500">*</span>
            </label>
            <Select 
              value={detallesProforma.tipoContratacion?.toString() || '1'}
              onValueChange={(value) => {
                setDetallesProforma({...detallesProforma, tipoContratacion: value});
                setFieldErrors(prev => ({...prev, tipoContratacion: false}));
              }}
            >
              <SelectTrigger className={`w-full bg-white h-8 text-sm ${fieldErrors.tipoContratacion ? 'border-red-500 focus:border-red-500' : 'border-gray-300'}`}>
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
          <label className="text-sm font-medium text-gray-700">
            Nombre de Proforma: <span className="text-red-500">*</span>
          </label>
          <Input
            value={detallesProforma.nombre || ''}
            onChange={(e) => {
              setDetallesProforma({...detallesProforma, nombre: e.target.value});
              setFieldErrors(prev => ({...prev, nombre: false}));
            }}
            placeholder="Ingrese un nombre descriptivo para la proforma"
            className={`bg-white h-8 text-sm ${fieldErrors.nombre ? 'border-red-500 focus:border-red-500' : 'border-gray-300'}`}
          />
        </div>
      </div>
      </div>
    </div>
  );
};

export default InfoBaseSection;
