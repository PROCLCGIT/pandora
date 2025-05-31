import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, AlertCircle, User, Clock, DollarSign, TruckIcon, FileText } from 'lucide-react';

export const OriginSelect = ({ value, onChange, choices = [], error }) => {
  console.log('OriginSelect render:', { value, choicesLength: choices.length });
  
  return (
    <>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`transition-all duration-200 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}>
          <SelectValue placeholder="¿Cómo nos contactó?" />
        </SelectTrigger>
        <SelectContent>
          {choices.length === 0 ? (
            <div className="p-2 text-center text-gray-500 text-sm">Cargando opciones...</div>
          ) : (
            choices.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  {option.value === 'telefono' && <Phone className="h-4 w-4 text-blue-500" />}
                  {option.value === 'email' && <AlertCircle className="h-4 w-4 text-purple-500" />}
                  {option.value === 'whatsapp' && <AlertCircle className="h-4 w-4 text-green-500" />}
                  {option.value === 'presencial' && <User className="h-4 w-4 text-orange-500" />}
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {error && (
        <p className="flex items-center gap-1 text-sm text-red-600 mt-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </>
  );
};

export const PrioritySelect = ({ value, onChange, choices = [], error }) => {
  console.log('PrioritySelect render:', { value, choicesLength: choices.length });
  
  return (
    <>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`transition-all duration-200 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}>
          <SelectValue placeholder="Seleccionar prioridad" />
        </SelectTrigger>
        <SelectContent>
          {choices.length === 0 ? (
            <div className="p-2 text-center text-gray-500 text-sm">Cargando opciones...</div>
          ) : (
            choices.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    option.value === 'baja' ? 'bg-green-500' :
                    option.value === 'media' ? 'bg-yellow-500' :
                    option.value === 'alta' ? 'bg-orange-500' :
                    option.value === 'urgente' ? 'bg-red-500' :
                    option.value === 'critica' ? 'bg-purple-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="capitalize">{option.label}</span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {error && (
        <p className="flex items-center gap-1 text-sm text-red-600 mt-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </>
  );
};

export const FormaPagoSelect = ({ value, onChange, choices = [], error }) => {
  console.log('FormaPagoSelect render:', { value, choicesLength: choices.length });
  
  return (
    <>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`transition-all duration-200 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}>
          <SelectValue placeholder="Seleccionar forma de pago" />
        </SelectTrigger>
        <SelectContent>
          {choices.length === 0 ? (
            <div className="p-2 text-center text-gray-500 text-sm">Cargando opciones...</div>
          ) : (
            choices.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  {option.value === 'contado' && <DollarSign className="h-4 w-4 text-green-500" />}
                  {option.value.includes('credito') && <Clock className="h-4 w-4 text-blue-500" />}
                  {option.value === 'transferencia' && <TruckIcon className="h-4 w-4 text-purple-500" />}
                  {option.value === 'cheque' && <FileText className="h-4 w-4 text-gray-500" />}
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {error && (
        <p className="flex items-center gap-1 text-sm text-red-600 mt-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </>
  );
};

export const DestinoSelect = ({ value, onChange, choices = [], error }) => {
  console.log('DestinoSelect render:', { value, choicesLength: choices.length });
  
  return (
    <>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`transition-all duration-200 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}>
          <SelectValue placeholder="Seleccionar destino" />
        </SelectTrigger>
        <SelectContent>
          {choices.length === 0 ? (
            <div className="p-2 text-center text-gray-500 text-sm">Cargando opciones...</div>
          ) : (
            choices.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <span className="capitalize">{option.label}</span>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {error && (
        <p className="flex items-center gap-1 text-sm text-red-600 mt-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </>
  );
};