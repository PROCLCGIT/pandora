// /pandora/src/modulos/productos/components/form/GeneralInfoSection.jsx

import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { CheckCircle, AlertCircle, Edit3, Lock, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AddUnidadModal } from '../modals/AddUnidadModal';
import { AddMarcaModal } from '../modals/AddMarcaModal';
import { AddProcedenciaModal } from '../modals/AddProcedenciaModal';
import { AddEspecialidadModal } from '../modals/AddEspecialidadModal';
import { useQueryClient } from '@tanstack/react-query';

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
  especialidadesData,
  setValue
}) {
  const [showAddUnidadModal, setShowAddUnidadModal] = useState(false);
  const [showAddMarcaModal, setShowAddMarcaModal] = useState(false);
  const [showAddProcedenciaModal, setShowAddProcedenciaModal] = useState(false);
  const [showAddEspecialidadModal, setShowAddEspecialidadModal] = useState(false);
  const queryClient = useQueryClient();

  const handleUnidadCreated = (newUnidad) => {
    // Invalidar la cache de unidades para forzar recarga
    queryClient.invalidateQueries(['unidades']);
    
    // Seleccionar automáticamente la nueva unidad
    if (setValue) {
      setValue('unidad_presentacion', newUnidad.id.toString());
    }
  };

  const handleMarcaCreated = (newMarca) => {
    // Invalidar la cache de marcas para forzar recarga
    queryClient.invalidateQueries(['marcas']);
    
    // Seleccionar automáticamente la nueva marca
    if (setValue) {
      setValue('id_marca', newMarca.id.toString());
    }
  };

  const handleProcedenciaCreated = (newProcedencia) => {
    // Invalidar la cache de procedencias para forzar recarga
    queryClient.invalidateQueries(['procedencias']);
    
    // Seleccionar automáticamente la nueva procedencia
    if (setValue) {
      setValue('procedencia', newProcedencia.id.toString());
    }
  };

  const handleEspecialidadCreated = (newEspecialidad) => {
    // Invalidar la cache de especialidades para forzar recarga
    queryClient.invalidateQueries(['especialidades']);
    
    // Seleccionar automáticamente la nueva especialidad
    if (setValue) {
      setValue('id_especialidad', newEspecialidad.id.toString());
    }
  };
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
          <span>Relación con Producto Ofertado</span>
          {formValues.id_producto_ofertado && <CheckCircle className="h-4 w-4 text-green-500" />}
        </Label>
        <Controller
          name="id_producto_ofertado"
          control={control}
          render={({ field }) => (
            <Select 
              onValueChange={(value) => {
                // Si el valor es vacío, establecer null
                field.onChange(value === '' ? null : value);
              }} 
              defaultValue={field.value || ''}
              value={field.value || ''}
            >
              <SelectTrigger 
                id="id_producto_ofertado"
                className={errors.id_producto_ofertado ? "border-red-300 focus:ring-red-500" : ""}
              >
                <SelectValue placeholder="Selecciona un producto ofertado" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="none">
                  <span className="text-gray-500">Sin relación</span>
                </SelectItem>
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
        {/* Primera fila: Unidad de Presentación, Marca, Modelo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Unidad de Presentación */}
          <div className="space-y-2">
            <Label htmlFor="unidad_presentacion" className="text-sm font-medium flex items-center justify-between">
              <span>Unidad de Presentación</span>
              {formValues.unidad_presentacion && <CheckCircle className="h-4 w-4 text-green-500" />}
            </Label>
            <Controller
              name="unidad_presentacion"
              control={control}
              render={({ field }) => (
                <Select 
                  onValueChange={(value) => {
                    if (value === 'add-new') {
                      // Abrir el modal para agregar nueva unidad
                      setShowAddUnidadModal(true);
                    } else {
                      // Si el valor es vacío, establecer null
                      field.onChange(value === '' ? null : value);
                    }
                  }} 
                  defaultValue={field.value || ''}
                  value={field.value || ''}
                >
                  <SelectTrigger 
                    id="unidad_presentacion"
                    className={errors.unidad_presentacion ? "border-red-300 focus:ring-red-500" : ""}
                  >
                    <SelectValue placeholder="Selecciona una unidad" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="none">
                      <span className="text-gray-500">Unidad no definida</span>
                    </SelectItem>
                    {unidadesData?.results?.map(unidad => (
                      <SelectItem key={unidad.id} value={unidad.id.toString()}>
                        {unidad.nombre} ({unidad.code})
                      </SelectItem>
                    ))}
                    <div className="border-t mt-1 pt-1">
                      <SelectItem value="add-new" className="text-blue-600 font-medium">
                        <div className="flex items-center">
                          <Plus className="h-4 w-4 mr-1" />
                          Agregar unidad
                        </div>
                      </SelectItem>
                    </div>
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

          {/* Marca */}
          <div className="space-y-2">
            <Label htmlFor="id_marca" className="text-sm font-medium flex items-center justify-between">
              <span>Marca</span>
              {formValues.id_marca && <CheckCircle className="h-4 w-4 text-green-500" />}
            </Label>
            <Controller
              name="id_marca"
              control={control}
              render={({ field }) => (
                <Select 
                  onValueChange={(value) => {
                    if (value === 'add-new') {
                      // Abrir el modal para agregar nueva marca
                      setShowAddMarcaModal(true);
                    } else {
                      // Si el valor es vacío, establecer null
                      field.onChange(value === '' ? null : value);
                    }
                  }} 
                  defaultValue={field.value || ''}
                  value={field.value || ''}
                >
                  <SelectTrigger 
                    id="id_marca"
                    className={errors.id_marca ? "border-red-300 focus:ring-red-500" : ""}
                  >
                    <SelectValue placeholder="Selecciona una marca" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="none">
                      <span className="text-gray-500">Marca no definida</span>
                    </SelectItem>
                    {marcasData?.results?.map(marca => (
                      <SelectItem key={marca.id} value={marca.id.toString()}>
                        {marca.nombre}
                      </SelectItem>
                    ))}
                    <div className="border-t mt-1 pt-1">
                      <SelectItem value="add-new" className="text-blue-600 font-medium">
                        <div className="flex items-center">
                          <Plus className="h-4 w-4 mr-1" />
                          Agregar marca
                        </div>
                      </SelectItem>
                    </div>
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

        {/* Segunda fila: Procedencia, Especialidad */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Procedencia */}
          <div className="space-y-2">
            <Label htmlFor="procedencia" className="text-sm font-medium flex items-center justify-between">
              <span>Procedencia</span>
              {formValues.procedencia && <CheckCircle className="h-4 w-4 text-green-500" />}
            </Label>
            <Controller
              name="procedencia"
              control={control}
              render={({ field }) => (
                <Select 
                  onValueChange={(value) => {
                    if (value === 'add-new') {
                      // Abrir el modal para agregar nueva procedencia
                      setShowAddProcedenciaModal(true);
                    } else {
                      // Si el valor es vacío, establecer null
                      field.onChange(value === '' ? null : value);
                    }
                  }} 
                  defaultValue={field.value || ''}
                  value={field.value || ''}
                >
                  <SelectTrigger 
                    id="procedencia"
                    className={errors.procedencia ? "border-red-300 focus:ring-red-500" : ""}
                  >
                    <SelectValue placeholder="Selecciona la procedencia" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="none">
                      <span className="text-gray-500">Procedencia no definida</span>
                    </SelectItem>
                    {procedenciasData?.results?.map(procedencia => (
                      <SelectItem key={procedencia.id} value={procedencia.id.toString()}>
                        {procedencia.nombre}
                      </SelectItem>
                    ))}
                    <div className="border-t mt-1 pt-1">
                      <SelectItem value="add-new" className="text-blue-600 font-medium">
                        <div className="flex items-center">
                          <Plus className="h-4 w-4 mr-1" />
                          Agregar procedencia
                        </div>
                      </SelectItem>
                    </div>
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
                  onValueChange={(value) => {
                    if (value === 'add-new') {
                      // Abrir el modal para agregar nueva especialidad
                      setShowAddEspecialidadModal(true);
                    } else {
                      // Si el valor es vacío, establecer null
                      field.onChange(value === '' ? null : value);
                    }
                  }} 
                  defaultValue={field.value || ''}
                  value={field.value || ''}
                >
                  <SelectTrigger 
                    id="id_especialidad"
                    className={errors.id_especialidad ? "border-red-300 focus:ring-red-500" : ""}
                  >
                    <SelectValue placeholder="Selecciona una especialidad" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="none">
                      <span className="text-gray-500">Especialidad no definida</span>
                    </SelectItem>
                    {especialidadesData?.results?.map(especialidad => (
                      <SelectItem key={especialidad.id} value={especialidad.id.toString()}>
                        {especialidad.nombre}
                      </SelectItem>
                    ))}
                    <div className="border-t mt-1 pt-1">
                      <SelectItem value="add-new" className="text-blue-600 font-medium">
                        <div className="flex items-center">
                          <Plus className="h-4 w-4 mr-1" />
                          Agregar especialidad
                        </div>
                      </SelectItem>
                    </div>
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
        
        {/* Referencia - Full width con textarea multiline */}
        <div className="col-span-full mt-6 space-y-2">
          <Label htmlFor="referencia" className="text-sm font-medium flex items-center justify-between">
            <span>Referencia</span>
            {formValues.referencia && <CheckCircle className="h-4 w-4 text-green-500" />}
          </Label>
          <Controller
            name="referencia"
            control={control}
            render={({ field }) => (
              <Textarea 
                id="referencia" 
                placeholder="Ingrese referencias adicionales del producto (opcional)" 
                className="min-h-[100px] resize-y"
                {...field} 
              />
            )}
          />
        </div>
      </div>

      {/* Modal para agregar nueva unidad */}
      <AddUnidadModal 
        open={showAddUnidadModal}
        onOpenChange={setShowAddUnidadModal}
        onUnidadCreated={handleUnidadCreated}
      />
      
      {/* Modal para agregar nueva marca */}
      <AddMarcaModal 
        open={showAddMarcaModal}
        onOpenChange={setShowAddMarcaModal}
        onMarcaCreated={handleMarcaCreated}
      />
      
      {/* Modal para agregar nueva procedencia */}
      <AddProcedenciaModal 
        open={showAddProcedenciaModal}
        onOpenChange={setShowAddProcedenciaModal}
        onProcedenciaCreated={handleProcedenciaCreated}
      />
      
      {/* Modal para agregar nueva especialidad */}
      <AddEspecialidadModal 
        open={showAddEspecialidadModal}
        onOpenChange={setShowAddEspecialidadModal}
        onEspecialidadCreated={handleEspecialidadCreated}
      />
    </>
  );
}