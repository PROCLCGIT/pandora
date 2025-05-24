// /pandora/src/modulos/productos/components/form/GeneralInfoSection.jsx

import { Controller } from 'react-hook-form';
import { CheckCircle, AlertCircle, Edit3, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

/**
 * Componente para la sección de información general del producto
 * Incluye tanto información básica como especificaciones
 */
export function GeneralInfoSection({
  control,
  errors,
  formValues,
  isEditing,
  isManualCodeMode,
  enableManualMode,
  enableAutoMode,
  categoriasData,
  productosOfertadosData,
  marcasData,
  unidadesData,
  procedenciasData,
  especialidadesData
}) {
  return (
    <>
      {/* Title */}
      <div className="col-span-full mb-4">
        <div className="flex items-center">
          <div className="h-6 w-1 bg-indigo-600 rounded-full mr-2"></div>
          <h3 className="text-md font-semibold text-gray-800">Identificación</h3>
        </div>
      </div>

      {/* Producto Ofertado - Full width */}
      <div className="col-span-full space-y-2">
        <Label htmlFor="id_producto_ofertado" className="text-sm font-medium flex items-center justify-between">
          <span>Producto Ofertado <span className="text-red-500">*</span></span>
          {formValues.id_producto_ofertado && <CheckCircle className="h-4 w-4 text-green-500" />}
        </Label>
        <Controller
          name="id_producto_ofertado"
          control={control}
          render={({ field }) => (
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
              value={field.value}
            >
              <SelectTrigger 
                id="id_producto_ofertado"
                className={errors.id_producto_ofertado ? "border-red-300 focus:ring-red-500" : ""}
              >
                <SelectValue placeholder="Selecciona un producto ofertado" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {productosOfertadosData?.results?.map(producto => (
                  <SelectItem key={producto.id} value={producto.id.toString()}>
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2 text-xs">
                        {producto.code}
                      </Badge>
                      {producto.nombre}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.id_producto_ofertado && (
          <p className="text-sm text-red-500 flex items-center mt-1">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.id_producto_ofertado.message}
          </p>
        )}
      </div>

      {/* Código and Categoría side by side */}
      <div className="col-span-full grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* Código */}
        <div className="space-y-2">
          <div className="flex items-center justify-between min-h-[32px]">
            <Label htmlFor="code" className="text-sm font-medium">
              <span>Código <span className="text-red-500">*</span></span>
            </Label>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className={`h-7 px-3 text-xs font-medium ${isManualCodeMode ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100' : 'bg-indigo-50 border-indigo-300 text-indigo-700 hover:bg-indigo-100'}`}
                  onClick={isManualCodeMode ? enableAutoMode : enableManualMode}
                  title={isManualCodeMode ? "Cambiar a modo automático" : "Cambiar a modo manual"}
                >
                  {isManualCodeMode ? (
                    <>
                      <Lock className="h-3 w-3 mr-1" />
                      Manual
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-3 w-3 mr-1" />
                      Auto
                    </>
                  )}
                </Button>
              )}
              {formValues.code && <CheckCircle className="h-4 w-4 text-green-500" />}
            </div>
          </div>
          <div className="relative">
            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <Input 
                  key={`code-${formValues.code || 'empty'}`}
                  id="code" 
                  placeholder={
                    !isEditing && isManualCodeMode 
                      ? "Escribe tu código personalizado" 
                      : !isEditing && !formValues.id_categoria 
                        ? "Selecciona una categoría para generar el código" 
                        : "Código del producto"
                  } 
                  value={field.value || ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  className={`${errors.code ? "border-red-300 focus:ring-red-500" : ""} ${isManualCodeMode && !isEditing ? "border-amber-300 focus:ring-amber-500" : ""}`}
                  readOnly={!isEditing && !isManualCodeMode}
                  title={
                    isManualCodeMode && !isEditing
                      ? "Modo manual: puedes editar el código libremente" 
                      : !isEditing 
                        ? "El código se genera automáticamente después de seleccionar una categoría" 
                        : ""
                  }
                />
              )}
            />
            {!isEditing && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <div className={`w-2 h-2 rounded-full ${isManualCodeMode ? 'bg-amber-500' : 'bg-indigo-500'}`} title={isManualCodeMode ? 'Modo manual' : 'Modo automático'}></div>
              </div>
            )}
          </div>
          {errors.code && (
            <p className="text-sm text-red-500 flex items-center mt-1">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.code.message}
            </p>
          )}
        </div>

        {/* Categoría */}
        <div className="space-y-2">
          <div className="flex items-center justify-between min-h-[32px]">
            <Label htmlFor="id_categoria" className="text-sm font-medium">
              <span>Categoría <span className="text-red-500">*</span></span>
            </Label>
            {formValues.id_categoria && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
          <Controller
            name="id_categoria"
            control={control}
            render={({ field }) => (
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                value={field.value}
              >
                <SelectTrigger 
                  id="id_categoria"
                  className={errors.id_categoria ? "border-red-300 focus:ring-red-500" : ""}
                >
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {categoriasData?.results?.map(categoria => (
                    <SelectItem key={categoria.id} value={categoria.id.toString()}>
                      {categoria.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.id_categoria && (
            <p className="text-sm text-red-500 flex items-center mt-1">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.id_categoria.message}
            </p>
          )}
        </div>
      </div>

      {/* Nombre - Full width */}
      <div className="col-span-full space-y-2 mt-4">
        <Label htmlFor="nombre" className="text-sm font-medium flex items-center justify-between">
          <span>Nombre <span className="text-red-500">*</span></span>
          {formValues.nombre && <CheckCircle className="h-4 w-4 text-green-500" />}
        </Label>
        <Controller
          name="nombre"
          control={control}
          render={({ field }) => (
            <Input 
              id="nombre" 
              placeholder="Nombre del producto" 
              {...field} 
              className={errors.nombre ? "border-red-300 focus:ring-red-500" : ""}
            />
          )}
        />
        {errors.nombre && (
          <p className="text-sm text-red-500 flex items-center mt-1">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.nombre.message}
          </p>
        )}
      </div>

      {/* Especificaciones - Debajo del nombre */}
      <div className="col-span-full mt-6">
        {/* Primera fila: Marca, Especialidad, Modelo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
        </div>

        {/* Segunda fila: Unidad de Presentación, Procedencia, Referencia */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
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
      </div>
    </>
  );
}