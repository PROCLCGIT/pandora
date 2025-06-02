import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Edit2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const InformacionGeneralSection = ({
  watch,
  setValue,
  register,
  errors,
  choices,
  usuarios
}) => {
  const { toast } = useToast();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFieldType, setEditFieldType] = useState('');
  const [editFieldOptions, setEditFieldOptions] = useState([]);

  const openEditModal = (fieldType, options) => {
    setEditFieldType(fieldType);
    setEditFieldOptions(options);
    setEditModalOpen(true);
  };

  const handleFieldEdit = (value) => {
    setValue(editFieldType, value);
    setEditModalOpen(false);
    toast({
      title: 'Campo actualizado',
      description: `${editFieldType} ha sido actualizado exitosamente`,
      variant: 'default'
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="py-3 px-4 bg-blue-300/20">
          <div className="flex justify-between items-center min-h-[32px]">
            <CardTitle className="flex items-center text-base font-bold">
              <FileText className="mr-2 h-4 w-4 text-blue-600" />
              Información General
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4 pb-4 px-4">
          <div className="space-y-4">
            <div className="grid grid-cols-[140px,1fr,24px] items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">Título:</span>
              <span className={`text-sm ${watch('title') ? 'text-gray-900' : (errors.title ? 'text-red-600 font-medium' : 'text-red-500 font-medium')}`}>
                {watch('title') || (errors.title ? '⚠️ Título requerido' : 'Ingrese título del brief')}
              </span>
              <Button 
                type="button"
                size="sm" 
                variant="ghost" 
                className="h-6 w-6 p-0"
                onClick={() => {
                  const newTitle = prompt('Ingrese el título del brief:', watch('title') || '');
                  if (newTitle !== null) {
                    setValue('title', newTitle);
                  }
                }}
              >
                <Edit2 className="h-3 w-3 text-gray-500 hover:text-gray-700" />
              </Button>
            </div>
            <div className="grid grid-cols-[140px,1fr,24px] items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">Origen:</span>
              <span className="text-sm text-gray-900">
                {choices.origin.find(o => o.value === watch('origin'))?.label || 'No especificado'}
              </span>
              <Button 
                type="button"
                size="sm" 
                variant="ghost" 
                className="h-6 w-6 p-0"
                onClick={() => openEditModal('origin', choices.origin)}
              >
                <Edit2 className="h-3 w-3 text-gray-500 hover:text-gray-700" />
              </Button>
            </div>
            <div className="grid grid-cols-[140px,1fr,24px] items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">Prioridad:</span>
              <span className="text-sm text-gray-900">
                {choices.priority.find(p => p.value === watch('priority'))?.label || 'No especificada'}
              </span>
              <Button 
                type="button"
                size="sm" 
                variant="ghost" 
                className="h-6 w-6 p-0"
                onClick={() => openEditModal('priority', choices.priority)}
              >
                <Edit2 className="h-3 w-3 text-gray-500 hover:text-gray-700" />
              </Button>
            </div>
            <div className="grid grid-cols-[140px,1fr,24px] items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">Tiempo entrega:</span>
              <span className="text-sm text-gray-900">
                {watch('tiempo_entrega') ? `${watch('tiempo_entrega')} días` : 'No especificado'}
              </span>
              <Button 
                type="button"
                size="sm" 
                variant="ghost" 
                className="h-6 w-6 p-0"
                onClick={() => {
                  const newDays = prompt('Ingrese el tiempo de entrega en días:', watch('tiempo_entrega') || '30');
                  if (newDays !== null && !isNaN(newDays)) {
                    setValue('tiempo_entrega', parseInt(newDays));
                  }
                }}
              >
                <Edit2 className="h-3 w-3 text-gray-500 hover:text-gray-700" />
              </Button>
            </div>
            <div className="grid grid-cols-[140px,1fr,24px] items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">Forma de pago:</span>
              <span className="text-sm text-gray-900">
                {choices.forma_pago.find(fp => fp.value === watch('forma_pago'))?.label || 'No especificada'}
              </span>
              <Button 
                type="button"
                size="sm" 
                variant="ghost" 
                className="h-6 w-6 p-0"
                onClick={() => openEditModal('forma_pago', choices.forma_pago)}
              >
                <Edit2 className="h-3 w-3 text-gray-500 hover:text-gray-700" />
              </Button>
            </div>
            <div className="grid grid-cols-[140px,1fr,24px] items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">Presupuesto:</span>
              <span className="text-sm text-gray-900">
                {watch('presupuesto') ? `$${parseFloat(watch('presupuesto')).toLocaleString('es-EC', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : 'No especificado'}
              </span>
              <Button 
                type="button"
                size="sm" 
                variant="ghost" 
                className="h-6 w-6 p-0"
                onClick={() => {
                  const newPresupuesto = prompt('Ingrese el presupuesto:', watch('presupuesto') || '');
                  if (newPresupuesto !== null && !isNaN(newPresupuesto)) {
                    setValue('presupuesto', parseFloat(newPresupuesto));
                  }
                }}
              >
                <Edit2 className="h-3 w-3 text-gray-500 hover:text-gray-700" />
              </Button>
            </div>
            <div className="grid grid-cols-[140px,1fr,24px] items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">Destino:</span>
              <span className="text-sm text-gray-900">
                {choices.destino.find(d => d.value === watch('destino'))?.label || 'No especificado'}
              </span>
              <Button 
                type="button"
                size="sm" 
                variant="ghost" 
                className="h-6 w-6 p-0"
                onClick={() => openEditModal('destino', choices.destino)}
              >
                <Edit2 className="h-3 w-3 text-gray-500 hover:text-gray-700" />
              </Button>
            </div>
            <div className="grid grid-cols-[140px,1fr,24px] items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">Operador:</span>
              <span className="text-sm text-gray-900">
                {usuarios.find(u => u.id.toString() === watch('operador'))?.first_name || 'No asignado'}
              </span>
              <Button 
                type="button"
                size="sm" 
                variant="ghost" 
                className="h-6 w-6 p-0"
                onClick={() => openEditModal('operador', usuarios.map(u => ({value: u.id.toString(), label: u.first_name})))}
              >
                <Edit2 className="h-3 w-3 text-gray-500 hover:text-gray-700" />
              </Button>
            </div>
            <div className="grid grid-cols-[140px,1fr,24px] items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">Descripción:</span>
              <span className="text-sm text-gray-900">
                {watch('description') ? `${watch('description').substring(0, 50)}${watch('description').length > 50 ? '...' : ''}` : 'No especificada'}
              </span>
              <Button 
                type="button"
                size="sm" 
                variant="ghost" 
                className="h-6 w-6 p-0"
                onClick={() => {
                  const newDesc = prompt('Ingrese la descripción:', watch('description') || '');
                  if (newDesc !== null) {
                    setValue('description', newDesc);
                  }
                }}
              >
                <Edit2 className="h-3 w-3 text-gray-500 hover:text-gray-700" />
              </Button>
            </div>
          </div>
          
          {/* Hidden inputs to maintain form functionality */}
          <div className="hidden">
            <Input {...register('title')} />
            <Select value={watch('origin')} onValueChange={(value) => setValue('origin', value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {choices.origin.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea {...register('description')} />
            <Select value={watch('priority')} onValueChange={(value) => setValue('priority', value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {choices.priority.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="number" {...register('tiempo_entrega')} />
            <Select value={watch('forma_pago')} onValueChange={(value) => setValue('forma_pago', value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {choices.forma_pago.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="number" step="0.01" {...register('presupuesto')} />
            <Select value={watch('destino')} onValueChange={(value) => setValue('destino', value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {choices.destino.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={watch('operador')} onValueChange={(value) => setValue('operador', value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {usuarios.map((usuario) => (
                  <SelectItem key={usuario.id} value={usuario.id.toString()}>{usuario.first_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Field Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-indigo-600" />
              Editar {editFieldType === 'origin' ? 'Origen' : 
                       editFieldType === 'priority' ? 'Prioridad' : 
                       editFieldType === 'forma_pago' ? 'Forma de Pago' : 
                       editFieldType}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="max-h-[60vh] overflow-y-auto space-y-2">
              {editFieldOptions.map((option) => (
                <div
                  key={option.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                    watch(editFieldType) === option.value 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleFieldEdit(option.value)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.label}</span>
                    {watch(editFieldType) === option.value && (
                      <CheckCircle className="h-5 w-5 text-indigo-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InformacionGeneralSection;