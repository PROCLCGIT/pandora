// /pandora/src/modulos/brief/components/BriefForm.jsx

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Building, 
  User, 
  Calendar, 
  DollarSign,
  Clock,
  Package,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useBriefChoices } from '../hooks/useBriefs';
import { getPriorityColor, getStatusColor } from '../utils/briefColors';

const BriefForm = ({ 
  brief = null, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) => {
  const isEditing = !!brief;
  
  // Hook para obtener opciones
  const { data: choices, isLoading: choicesLoading } = useBriefChoices();

  // Form setup
  const form = useForm({
    defaultValues: {
      client: brief?.client || '',
      title: brief?.title || '',
      origin: brief?.origin || 'telefono',
      description: brief?.description || '',
      priority: brief?.priority || 'media',
      presupuesto: brief?.presupuesto || '',
      tiempo_entrega: brief?.tiempo_entrega || 1,
      forma_pago: brief?.forma_pago || 'contado',
      destino: brief?.destino || 'cot_cliente',
      estado: brief?.estado || 'draft',
      operador: brief?.operador || '',
      due_date: brief?.due_date ? brief.due_date.split('T')[0] : '',
      observaciones_internas: brief?.observaciones_internas || '',
      items: brief?.items || [
        {
          product: '',
          quantity: 1,
          unit: '',
          specifications: '',
          notes: '',
          precio_estimado: ''
        }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const watchedPriority = form.watch("priority");
  const watchedEstado = form.watch("estado");
  
  const priorityColors = getPriorityColor(watchedPriority);
  const statusColors = getStatusColor(watchedEstado);

  const handleSubmit = (data) => {
    // Transformar datos antes de enviar
    const transformedData = {
      ...data,
      presupuesto: data.presupuesto ? parseFloat(data.presupuesto) : null,
      tiempo_entrega: parseInt(data.tiempo_entrega),
      due_date: data.due_date || null,
      items: data.items.filter(item => item.product.trim() !== '')
    };
    
    onSubmit(transformedData);
  };

  const addItem = () => {
    append({
      product: '',
      quantity: 1,
      unit: '',
      specifications: '',
      notes: '',
      precio_estimado: ''
    });
  };

  if (choicesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Cargando formulario...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <DialogHeader className="pb-6">
        <DialogTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          {isEditing ? `Editar Brief ${brief.code}` : 'Crear Nuevo Brief'}
        </DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Cliente */}
              <FormField
                control={form.control}
                name="client"
                rules={{ required: "El cliente es requerido" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente *</FormLabel>
                    <FormControl>
                      <Input placeholder="Seleccionar cliente..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Título */}
              <FormField
                control={form.control}
                name="title"
                rules={{ required: "El título es requerido" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título del Brief *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Equipos médicos para urgencias" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Origen */}
              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origen del Pedido</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar origen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {choices?.origins?.map((origin) => (
                          <SelectItem key={origin.value} value={origin.value}>
                            {origin.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Operador */}
              <FormField
                control={form.control}
                name="operador"
                rules={{ required: "El operador es requerido" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operador Asignado *</FormLabel>
                    <FormControl>
                      <Input placeholder="Seleccionar operador..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Descripción - ocupa toda la fila */}
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción del Pedido</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe detalladamente los requerimientos del cliente..."
                          className="min-h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Incluye todos los detalles relevantes sobre la solicitud del cliente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuración comercial */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Configuración Comercial
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Prioridad */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar prioridad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {choices?.priorities?.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getPriorityColor(priority.value).badge.includes('emerald') ? 'bg-emerald-500' : 
                                getPriorityColor(priority.value).badge.includes('amber') ? 'bg-amber-500' :
                                getPriorityColor(priority.value).badge.includes('orange') ? 'bg-orange-500' :
                                getPriorityColor(priority.value).badge.includes('red') ? 'bg-red-500' : 'bg-gray-500'}`} />
                              {priority.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estado */}
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {choices?.statuses?.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Destino */}
              <FormField
                control={form.control}
                name="destino"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destino del Brief</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar destino" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {choices?.destinations?.map((destination) => (
                          <SelectItem key={destination.value} value={destination.value}>
                            {destination.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Presupuesto */}
              <FormField
                control={form.control}
                name="presupuesto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Presupuesto Estimado</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tiempo de entrega */}
              <FormField
                control={form.control}
                name="tiempo_entrega"
                rules={{ 
                  required: "El tiempo de entrega es requerido",
                  min: { value: 1, message: "Mínimo 1 día" }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiempo de Entrega (días) *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="number"
                          min="1"
                          placeholder="7"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Forma de pago */}
              <FormField
                control={form.control}
                name="forma_pago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pago</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar forma de pago" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {choices?.payment_methods?.map((payment) => (
                          <SelectItem key={payment.value} value={payment.value}>
                            {payment.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fecha límite - ocupa toda la fila */}
              <div className="md:col-span-3">
                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha Límite</FormLabel>
                      <FormControl>
                        <div className="relative max-w-sm">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="date"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Fecha límite para completar el brief
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items del brief */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  Items del Brief
                  <Badge variant="outline">{fields.length}</Badge>
                </CardTitle>
                <Button type="button" onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      
                      {/* Producto */}
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.product`}
                          rules={{ required: "El producto es requerido" }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Producto *</FormLabel>
                              <FormControl>
                                <Input placeholder="Nombre del producto..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Cantidad */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        rules={{ 
                          required: "La cantidad es requerida",
                          min: { value: 0.01, message: "Cantidad debe ser mayor a 0" }
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cantidad *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="1"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Unidad */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.unit`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unidad</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: UND, KG..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Precio estimado */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.precio_estimado`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Precio Est.</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Botón eliminar */}
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Especificaciones - toda la fila */}
                      <div className="md:col-span-6">
                        <FormField
                          control={form.control}
                          name={`items.${index}.specifications`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Especificaciones</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Detalles técnicos, características específicas..."
                                  className="min-h-16"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Observaciones internas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Observaciones Internas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="observaciones_internas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas Internas</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notas internas, comentarios del equipo, consideraciones especiales..."
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Estas observaciones solo son visibles para el equipo interno
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Preview de estados */}
          <div className="flex gap-4">
            <Badge className={priorityColors.badge}>
              Prioridad: {choices?.priorities?.find(p => p.value === watchedPriority)?.label || watchedPriority}
            </Badge>
            <Badge className={statusColors.badge}>
              Estado: {choices?.statuses?.find(s => s.value === watchedEstado)?.label || watchedEstado}
            </Badge>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEditing ? 'Actualizar Brief' : 'Crear Brief'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default BriefForm;
