// /pandora/src/modulos/productos/components/form/SpecsSection.jsx

import { Controller } from 'react-hook-form';
import { CheckCircle, AlertCircle } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Componente para la sección de especificaciones del producto
 */
export function SpecsSection({
  control,
  errors,
  formValues,
  marcasData,
  unidadesData,
  procedenciasData,
  especialidadesData
}) {
  return (
    <div className="lg:col-span-5 space-y-5 mt-2">
      {/* Marca y Especialidad en la misma fila */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Marca */}
        <div className="space-y-2">
          <Label htmlFor="id_marca" className="text-sm font-medium flex items-center justify-between">
            <span>Marca <span className="text-red-500">*</span></span>
            {formValues.id_marca && <CheckCircle className="h-4 w-4 text-green-500" />}
          </Label>
          <Controller
            name="id_marca"
            control={control}
            render={({ field }) => (
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                value={field.value}
              >
                <SelectTrigger 
                  id="id_marca"
                  className={errors.id_marca ? "border-red-300 focus:ring-red-500" : ""}
                >
                  <SelectValue placeholder="Selecciona una marca" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {marcasData?.results?.map(marca => (
                    <SelectItem key={marca.id} value={marca.id.toString()}>
                      {marca.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.id_marca && (
            <p className="text-sm text-red-500 flex items-center mt-1">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.id_marca.message}
            </p>
          )}
        </div>

        {/* Especialidad */}
        <div className="space-y-2">
          <Label htmlFor="id_especialidad" className="text-sm font-medium flex items-center justify-between">
            <span>Especialidad</span>
            {formValues.id_especialidad && <CheckCircle className="h-4 w-4 text-green-500" />}
          </Label>
          <Controller
            name="id_especialidad"
            control={control}
            render={({ field }) => (
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                value={field.value}
              >
                <SelectTrigger 
                  id="id_especialidad"
                  className={errors.id_especialidad ? "border-red-300 focus:ring-red-500" : ""}
                >
                  <SelectValue placeholder="Selecciona una especialidad" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {especialidadesData?.results?.map(especialidad => (
                    <SelectItem key={especialidad.id} value={especialidad.id.toString()}>
                      {especialidad.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
                </Select>
            )}
          />
          {errors.id_especialidad && (
            <p className="text-sm text-red-500 flex items-center mt-1">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.id_especialidad.message}
            </p>
          )}
        </div>
      </div>

      {/* Modelo */}
      <div className="space-y-2">
        <Label htmlFor="modelo" className="text-sm font-medium">Modelo</Label>
        <Controller
          name="modelo"
          control={control}
          render={({ field }) => (
            <Input 
              id="modelo" 
              placeholder="Modelo del producto" 
              {...field} 
            />
          )}
        />
      </div>

      {/* Unidad de Presentación */}
      <div className="space-y-2">
        <Label htmlFor="unidad_presentacion" className="text-sm font-medium flex items-center justify-between">
          <span>Unidad de Presentación <span className="text-red-500">*</span></span>
          {formValues.unidad_presentacion && <CheckCircle className="h-4 w-4 text-green-500" />}
        </Label>
        <Controller
          name="unidad_presentacion"
          control={control}
          render={({ field }) => (
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
              value={field.value}
            >
              <SelectTrigger 
                id="unidad_presentacion"
                className={errors.unidad_presentacion ? "border-red-300 focus:ring-red-500" : ""}
              >
                <SelectValue placeholder="Selecciona una unidad" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {unidadesData?.results?.map(unidad => (
                  <SelectItem key={unidad.id} value={unidad.id.toString()}>
                    {unidad.nombre} ({unidad.abreviatura})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.unidad_presentacion && (
          <p className="text-sm text-red-500 flex items-center mt-1">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.unidad_presentacion.message}
          </p>
        )}
      </div>

      {/* Procedencia */}
      <div className="space-y-2">
        <Label htmlFor="procedencia" className="text-sm font-medium flex items-center justify-between">
          <span>Procedencia <span className="text-red-500">*</span></span>
          {formValues.procedencia && <CheckCircle className="h-4 w-4 text-green-500" />}
        </Label>
        <Controller
          name="procedencia"
          control={control}
          render={({ field }) => (
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
              value={field.value}
            >
              <SelectTrigger 
                id="procedencia"
                className={errors.procedencia ? "border-red-300 focus:ring-red-500" : ""}
              >
                <SelectValue placeholder="Selecciona la procedencia" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {procedenciasData?.results?.map(procedencia => (
                  <SelectItem key={procedencia.id} value={procedencia.id.toString()}>
                    {procedencia.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.procedencia && (
          <p className="text-sm text-red-500 flex items-center mt-1">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.procedencia.message}
          </p>
        )}
      </div>
      
      {/* Referencia */}
      <div className="space-y-2">
        <Label htmlFor="referencia" className="text-sm font-medium">Referencia</Label>
        <Controller
          name="referencia"
          control={control}
          render={({ field }) => (
            <Input 
              id="referencia" 
              placeholder="Referencia del producto" 
              {...field} 
            />
          )}
        />
      </div>
    </div>
  );
}