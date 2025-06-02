import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Building2 } from 'lucide-react';


// Import services
import { useCreateCliente } from '@/modulos/directorio/api/clienteService';
import { useZonas } from '@/modulos/basic/api/zonaService';
import { useTiposCliente } from '@/modulos/basic/api/tipoClienteService';
import { useCiudades } from '@/modulos/basic/api/ciudadService';
import { useTags } from '@/modulos/directorio/api/tagService';
import TagInput from '@/modulos/directorio/components/TagInput';

const AddClientModal = ({ isOpen, onClose, onClientCreated }) => {
  const [saving, setSaving] = useState(false);
  
  // Load related data
  const { data: zonasData } = useZonas({ page_size: 100 });
  const { data: tiposClienteData } = useTiposCliente({ page_size: 100 });
  const { data: ciudadesData } = useCiudades({ page_size: 100 });
  
  // Form setup
  const form = useForm({
    defaultValues: {
      nombre: '',
      alias: '',
      razon_social: '',
      ruc: '',
      email: '',
      telefono: '',
      direccion: '',
      ciudad: '',
      zona: '',
      tipo_cliente: '',
      nota: '',
      activo: true,
      tags: [],
    }
  });
  
  // Create client mutation
  const createClienteMutation = useCreateCliente({
    onSuccess: (data) => {
      toast({
        title: "Cliente creado",
        description: "El cliente ha sido creado correctamente",
      });
      
      // Call the callback with the new client data
      if (onClientCreated) {
        onClientCreated(data);
      }
      
      // Close modal and reset form
      onClose();
      form.reset();
      setSaving(false);
    },
    onError: (error) => {
      setSaving(false);
      const backendErrors = error.response?.data;
      
      if (backendErrors && typeof backendErrors === 'object' && !backendErrors.detail) {
        // Set form errors
        Object.entries(backendErrors).forEach(([field, messages]) => {
          const message = Array.isArray(messages) ? messages.join(', ') : messages.toString();
          form.setError(field, { type: 'manual', message });
        });
        toast({
          title: "Error de validación",
          description: "Por favor, corrige los errores en el formulario.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error al crear el cliente",
          description: backendErrors?.detail || error.message || "No se pudo crear el cliente.",
          variant: "destructive"
        });
      }
    }
  });
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      form.reset();
    }
  }, [isOpen, form]);
  
  const onSubmit = (data) => {
    setSaving(true);
    
    // Format phone number
    let telefono = data.telefono;
    if (telefono && !telefono.startsWith('+') && !telefono.startsWith('0')) {
      telefono = `0${telefono}`;
    }
    
    const formattedData = {
      ...data,
      telefono: telefono || null,
      alias: data.alias || null,
      razon_social: data.razon_social || data.nombre, // Use nombre if razon_social is empty
      ruc: data.ruc || null,
      email: data.email || null,
      direccion: data.direccion || null,
      zona: data.zona ? parseInt(data.zona) : null,
      ciudad: data.ciudad ? parseInt(data.ciudad) : null,
      tipo_cliente: data.tipo_cliente ? parseInt(data.tipo_cliente) : null,
      nota: data.nota || null,
      activo: data.activo,
      tags: data.tags || [],
    };
    
    // Remove null telefono to avoid backend validation issues
    if (formattedData.telefono === null) {
      delete formattedData.telefono;
    }
    
    createClienteMutation.mutate(formattedData);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Crear Nuevo Cliente
          </DialogTitle>
          <DialogDescription>
            Complete el formulario para registrar un nuevo cliente en el sistema.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nombre"
                rules={{ required: "El nombre es requerido" }}
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Nombre del Cliente *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre o razón comercial" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="alias"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alias</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre corto (opcional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="razon_social"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razón Social</FormLabel>
                    <FormControl>
                      <Input placeholder="Razón social legal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="ruc"
                rules={{ 
                  required: "El RUC es requerido",
                  pattern: {
                    value: /^[0-9]{13}$/,
                    message: "El RUC debe tener 13 dígitos"
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RUC *</FormLabel>
                    <FormControl>
                      <Input placeholder="9999999999999" maxLength={13} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tipo_cliente"
                rules={{ required: "El tipo de cliente es requerido" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Cliente *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tiposClienteData?.results?.map(tipo => (
                          <SelectItem key={tipo.id} value={tipo.id.toString()}>
                            {tipo.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                rules={{ 
                  required: "El email es requerido",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email inválido"
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input placeholder="correo@empresa.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="telefono"
                rules={{ 
                  required: "El teléfono es requerido",
                  pattern: {
                    value: /^(\+593|0)?[2-9]\d{7,8}$/,
                    message: "Formato: 0999999999 o 022999999"
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono *</FormLabel>
                    <FormControl>
                      <Input placeholder="0999999999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ciudad"
                rules={{ required: "La ciudad es requerida" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudad *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una ciudad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ciudadesData?.results?.map(ciudad => (
                          <SelectItem key={ciudad.id} value={ciudad.id.toString()}>
                            {ciudad.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="zona"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zona</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una zona (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {zonasData?.results?.map(zona => (
                          <SelectItem key={zona.id} value={zona.id.toString()}>
                            {zona.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Address */}
            <FormField
              control={form.control}
              name="direccion"
              rules={{ required: "La dirección es requerida" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Dirección completa del cliente" 
                      rows={2}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Notes */}
            <FormField
              control={form.control}
              name="nota"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notas adicionales sobre el cliente (opcional)" 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etiquetas</FormLabel>
                  <FormControl>
                    <TagInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Selecciona etiquetas para clasificar el cliente"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Active checkbox */}
            <FormField
              control={form.control}
              name="activo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Cliente Activo</FormLabel>
                    <FormDescription>
                      Marcar si el cliente está activo y puede ser utilizado en proformas
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <div className="text-sm text-gray-500">
              Los campos marcados con * son obligatorios
            </div>
          </form>
        </Form>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Crear Cliente
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddClientModal;