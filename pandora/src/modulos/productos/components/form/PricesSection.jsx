// /pandora/src/modulos/productos/components/form/PricesSection.jsx

import { Controller } from 'react-hook-form';
import { DollarSign, Tag } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

/**
 * Componente para la sección de precios y tarifas del producto
 */
export function PricesSection({
  control,
  showOptionalFields,
  setShowOptionalFields
}) {
  return (
    <div className="lg:col-span-3 space-y-4">
      <div className="flex items-center mb-4">
        <div className="h-6 w-1 bg-emerald-500 rounded-full mr-2"></div>
        <h3 className="text-md font-semibold text-gray-800 flex items-center">
          <DollarSign className="h-4 w-4 mr-1 text-emerald-600" />
          Precios y Tarifas
        </h3>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700">Mostrar campos opcionales</span>
          <div 
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${showOptionalFields ? 'bg-emerald-500 justify-end' : 'bg-gray-300 justify-start'}`}
            onClick={() => setShowOptionalFields(!showOptionalFields)}
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-md transform duration-300"></div>
          </div>
        </div>
        
        {!showOptionalFields && (
          <div 
            className="bg-gray-50 text-gray-500 text-sm p-4 rounded-lg border border-gray-200 text-center cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setShowOptionalFields(true)}
          >
            <p>Los campos de precios y tarifas son opcionales</p>
            <p className="text-indigo-600 font-medium mt-2">Haz clic para mostrar</p>
          </div>
        )}
      </div>
      
      {showOptionalFields && (
        <>
          {/* Precios */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1">
              Precios
            </h4>
            
            {/* Costo Referencial */}
            <div className="space-y-2">
              <Label htmlFor="costo_referencial" className="text-xs font-medium text-gray-600">Costo Referencial</Label>
              <Controller
                name="costo_referencial"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      $
                    </span>
                    <Input 
                      id="costo_referencial" 
                      type="number"
                      step="0.01"
                      placeholder="0.00" 
                      {...field} 
                      className="pl-7"
                    />
                  </div>
                )}
              />
            </div>
            
            {/* Precio SIE Referencial */}
            <div className="space-y-2">
              <Label htmlFor="precio_sie_referencial" className="text-xs font-medium text-gray-600">Precio SIE Referencial</Label>
              <Controller
                name="precio_sie_referencial"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      $
                    </span>
                    <Input 
                      id="precio_sie_referencial" 
                      type="number"
                      step="0.01"
                      placeholder="0.00" 
                      {...field} 
                      className="pl-7"
                    />
                  </div>
                )}
              />
            </div>
            
            {/* Precio SIE Tipo B */}
            <div className="space-y-2">
              <Label htmlFor="precio_sie_tipob" className="text-xs font-medium text-gray-600">Precio SIE Tipo B</Label>
              <Controller
                name="precio_sie_tipob"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      $
                    </span>
                    <Input 
                      id="precio_sie_tipob" 
                      type="number"
                      step="0.01"
                      placeholder="0.00" 
                      {...field} 
                      className="pl-7"
                    />
                  </div>
                )}
              />
            </div>
            
            {/* Precio Venta Privado */}
            <div className="space-y-2">
              <Label htmlFor="precio_venta_privado" className="text-xs font-medium text-gray-600">Precio Venta Privado</Label>
              <Controller
                name="precio_venta_privado"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      $
                    </span>
                    <Input 
                      id="precio_venta_privado" 
                      type="number"
                      step="0.01"
                      placeholder="0.00" 
                      {...field} 
                      className="pl-7"
                    />
                  </div>
                )}
              />
            </div>
          </div>
          
          {/* TZ */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1 flex items-center">
              <Tag className="h-4 w-4 mr-1 text-purple-600" />
              TZ (%)
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              {/* TZ Oferta */}
              <div className="space-y-1">
                <Label htmlFor="tz_oferta" className="text-xs font-medium text-gray-600">TZ Oferta</Label>
                <Controller
                  name="tz_oferta"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                        %
                      </span>
                      <Input 
                        id="tz_oferta" 
                        type="number"
                        placeholder="0" 
                        {...field} 
                        className="pr-7"
                      />
                    </div>
                  )}
                />
              </div>
              
              {/* TZ Demanda */}
              <div className="space-y-1">
                <Label htmlFor="tz_demanda" className="text-xs font-medium text-gray-600">TZ Demanda</Label>
                <Controller
                  name="tz_demanda"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                        %
                      </span>
                      <Input 
                        id="tz_demanda" 
                        type="number"
                        placeholder="0" 
                        {...field} 
                        className="pr-7"
                      />
                    </div>
                  )}
                />
              </div>
              
              {/* TZ Inflación */}
              <div className="space-y-1">
                <Label htmlFor="tz_inflacion" className="text-xs font-medium text-gray-600">TZ Inflación</Label>
                <Controller
                  name="tz_inflacion"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                        %
                      </span>
                      <Input 
                        id="tz_inflacion" 
                        type="number"
                        placeholder="0" 
                        {...field} 
                        className="pr-7"
                      />
                    </div>
                  )}
                />
              </div>
              
              {/* TZ Calidad */}
              <div className="space-y-1">
                <Label htmlFor="tz_calidad" className="text-xs font-medium text-gray-600">TZ Calidad</Label>
                <Controller
                  name="tz_calidad"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                        %
                      </span>
                      <Input 
                        id="tz_calidad" 
                        type="number"
                        placeholder="0" 
                        {...field} 
                        className="pr-7"
                      />
                    </div>
                  )}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {/* TZ Eficiencia */}
              <div className="space-y-1">
                <Label htmlFor="tz_eficiencia" className="text-xs font-medium text-gray-600">TZ Eficiencia</Label>
                <Controller
                  name="tz_eficiencia"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                        %
                      </span>
                      <Input 
                        id="tz_eficiencia" 
                        type="number"
                        placeholder="0" 
                        {...field} 
                        className="pr-7"
                      />
                    </div>
                  )}
                />
              </div>
              
              {/* TZ Referencial */}
              <div className="space-y-1">
                <Label htmlFor="tz_referencial" className="text-xs font-medium text-gray-600">TZ Referencial</Label>
                <Controller
                  name="tz_referencial"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                        %
                      </span>
                      <Input 
                        id="tz_referencial" 
                        type="number"
                        placeholder="0" 
                        {...field} 
                        className="pr-7"
                      />
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Estado */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer">Estado</Label>
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${field.value ? 'text-emerald-600' : 'text-gray-500'}`}>
                  {field.value ? 'Activo' : 'Inactivo'}
                </span>
                <div 
                  className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer ${field.value ? 'bg-emerald-500 justify-end' : 'bg-gray-300 justify-start'}`}
                  onClick={() => field.onChange(!field.value)}
                >
                  <div className="bg-white w-3 h-3 rounded-full shadow-md"></div>
                </div>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}