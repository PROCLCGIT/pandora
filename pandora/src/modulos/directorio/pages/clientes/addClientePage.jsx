// /pandora/src/modulos/directorio/pages/clientes/addClientePage.jsx

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { Building2, Save, ArrowLeft, Info, MapPin, Check, X, Plus } from 'lucide-react';

// Servicios para clientes y datos relacionados
import { useClienteById, useCreateCliente, useUpdateCliente } from '../../api/clienteService';
import { useZonas } from '@/modulos/basic/api/zonaService';
import { useTiposCliente } from '@/modulos/basic/api/tipoClienteService';
import { useCiudades } from '@/modulos/basic/api/ciudadService';

// Componentes UI
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Componentes personalizados
import { PageHeader } from '@/modulos/basic/components/layout/PageHeader';
import { FormCard } from '@/modulos/basic/components/form/FormCard';
import TagInput from '../../components/TagInput';

// Radix UI Dialog
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

// Extra UI
import { Label } from '@/components/ui/label'

// Hooks para creación rápida
import { useCreateCiudad } from '@/modulos/basic/api/ciudadService'
import { useCreateZona } from '@/modulos/basic/api/zonaService'
import { useCreateTipoCliente } from '@/modulos/basic/api/tipoClienteService'

export default function AddClientePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  
  // Cargar datos relacionados para los selectores
  const { data: zonasData, isLoading: loadingZonas } = useZonas({ page_size: 100 });
  const { data: tiposClienteData, isLoading: loadingTipos } = useTiposCliente({ page_size: 100 });
  const { data: ciudadesData, isLoading: loadingCiudades } = useCiudades({ page_size: 100 });
  
  // Si estamos en modo edición, cargar los datos del cliente
  const { 
    data: cliente, 
    isLoading: loadingCliente, 
    isError: clienteError 
  } = useClienteById(id, {
    enabled: isEditMode,
    onError: (error) => {
      toast({
        title: "Error al cargar el cliente",
        description: error.message || "No se pudo cargar la información del cliente",
        variant: "destructive"
      });
      navigate('/directorio/clientes');
    }
  });
  
  // Configurar el formulario con react-hook-form
  const form = useForm({
    defaultValues: {
      nombre: '',
      alias: '',
      razon_social: '',
      ruc: '',
      email: '',
      telefono: '',
      direccion: '',
      nota: '',
      activo: true,
      zona: '',
      ciudad: '',
      tipo_cliente: '',
      tags: []
    }
  });
  
  // Cuando usamos modo edición necesitamos rellenar el formulario **después** de
  // haber recibido tanto el cliente como los catálogos para que los `<Select>`
  // puedan reconocer el `value` (si las opciones aún no existen, Radix Select
  // no mostrará la etiqueta seleccionada).
  useEffect(() => {
    if (!isEditMode) return

    if (!cliente || !cliente.id) return

    // Esperar a que todos los catálogos estén listos (evita el problema de que
    // el `value` llegue antes de que existan las opciones).
    if (loadingZonas || loadingCiudades || loadingTipos) return

    form.reset({
      nombre: cliente.nombre || '',
      alias: cliente.alias || '',
      razon_social: cliente.razon_social || '',
      ruc: cliente.ruc || '',
      email: cliente.email || '',
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || '',
      nota: cliente.nota || '',
      activo: cliente.activo !== undefined ? cliente.activo : true,
      zona: cliente.zona?.id?.toString() || '',
      ciudad: cliente.ciudad?.id?.toString() || '',
      tipo_cliente: cliente.tipo_cliente?.id?.toString() || '',
      tags: cliente.tags?.map(tag => tag.id) || []
    })
  }, [isEditMode, cliente, loadingZonas, loadingCiudades, loadingTipos, form])
  
  // Derivar las opciones asegurando que incluyan el valor actual (por si el catálogo está paginado)
  const ciudadesOptions = useMemo(() => {
    let opts = ciudadesData?.results ?? []
    if (isEditMode && cliente?.ciudad && !opts.some(o => o.id === cliente.ciudad.id)) {
      opts = [...opts, cliente.ciudad]
    }
    return opts
  }, [ciudadesData, isEditMode, cliente])

  const zonasOptions = useMemo(() => {
    let opts = zonasData?.results ?? []
    if (isEditMode && cliente?.zona && !opts.some(o => o.id === cliente.zona.id)) {
      opts = [...opts, cliente.zona]
    }
    return opts
  }, [zonasData, isEditMode, cliente])

  const tiposClienteOptions = useMemo(() => {
    let opts = tiposClienteData?.results ?? []
    if (isEditMode && cliente?.tipo_cliente && !opts.some(o => o.id === cliente.tipo_cliente.id)) {
      opts = [...opts, cliente.tipo_cliente]
    }
    return opts
  }, [tiposClienteData, isEditMode, cliente])
  
  // Mutaciones para crear o actualizar clientes
  const createClienteMutation = useCreateCliente({
    onSuccess: (data) => {
      console.log("Respuesta del servidor tras CREACIÓN exitosa:", data);
      toast({
        title: "Cliente creado",
        description: "El cliente ha sido creado correctamente",
      });
      queryClient.invalidateQueries('clientes');
      navigate('/directorio/clientes');
    },
    onError: (error) => {
      console.error("Error detallado al crear:", error.response?.data);
      console.error("Full error object al crear:", error);
      setSaving(false);
      const backendErrors = error.response?.data;

      if (backendErrors && typeof backendErrors === 'object' && !backendErrors.detail) {
        Object.entries(backendErrors).forEach(([field, messages]) => {
          // Asegurarse de que messages sea un array y luego unirlo
          const message = Array.isArray(messages) ? messages.join(', ') : messages.toString();
          form.setError(field, { type: 'manual', message });
        });
        toast({
          title: "Error de validación",
          description: "Por favor, corrige los errores en el formulario.",
          variant: "destructive"
        });
      } else {
        // Error general o error con 'detail'
        let errorMessage = "No se pudo crear el cliente.";
        if (typeof backendErrors === 'string') {
          errorMessage = backendErrors;
        } else if (backendErrors?.detail) {
          errorMessage = backendErrors.detail;
        } else if (error.message) {
          errorMessage = error.message;
        }
        toast({
          title: "Error al crear el cliente",
          description: errorMessage,
          variant: "destructive"
        });
      }
    }
  });
  
  const updateClienteMutation = useUpdateCliente({
    onSuccess: (data) => {
      console.log("Respuesta del servidor tras ACTUALIZACIÓN exitosa:", data);
      toast({
        title: "Cliente actualizado",
        description: "El cliente ha sido actualizado correctamente",
      });
      queryClient.invalidateQueries('clientes');
      navigate('/directorio/clientes');
    },
    onError: (error) => {
      console.error("Error detallado al actualizar:", error.response?.data);
      console.error("Full error object al actualizar:", error);
      setSaving(false);
      const backendErrors = error.response?.data;

      if (backendErrors && typeof backendErrors === 'object' && !backendErrors.detail) {
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
        let errorMessage = "No se pudo actualizar el cliente.";
        if (typeof backendErrors === 'string') {
          errorMessage = backendErrors;
        } else if (backendErrors?.detail) {
          errorMessage = backendErrors.detail;
        } else if (error.message) {
          errorMessage = error.message;
        }
        toast({
          title: "Error al actualizar el cliente",
          description: errorMessage,
          variant: "destructive"
        });
      }
    }
  });
  
  // Estados para diálogos de creación rápida
  const [openCiudadDialog, setOpenCiudadDialog] = useState(false)
  const [openZonaDialog, setOpenZonaDialog] = useState(false)
  const [openTipoDialog, setOpenTipoDialog] = useState(false)

  // Estados simples para formularios rápidos
  const [newCiudad, setNewCiudad] = useState({ nombre: '', provincia: '', code: '' })
  const [newZona, setNewZona] = useState({ nombre: '', code: '', cobertura: '' })
  const [newTipo, setNewTipo] = useState({ nombre: '', code: '' })

  // Mutaciones de creación rápida
  const createCiudadMutation = useCreateCiudad({
    onSuccess: (data) => {
      toast({ title: 'Ciudad creada', description: 'Se añadió la ciudad correctamente' })
      queryClient.invalidateQueries('ciudades')
      form.setValue('ciudad', data.id.toString())
      setOpenCiudadDialog(false)
      setNewCiudad({ nombre: '', provincia: '', code: '' })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message || 'No se pudo crear la ciudad', variant: 'destructive' })
    }
  })

  const createZonaMutation = useCreateZona({
    onSuccess: (data) => {
      toast({ title: 'Zona creada', description: 'Se añadió la zona correctamente' })
      queryClient.invalidateQueries('zonas')
      form.setValue('zona', data.id.toString())
      setOpenZonaDialog(false)
      setNewZona({ nombre: '', code: '', cobertura: '' })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message || 'No se pudo crear la zona', variant: 'destructive' })
    }
  })

  const createTipoMutation = useCreateTipoCliente({
    onSuccess: (data) => {
      toast({ title: 'Tipo de cliente creado', description: 'Se añadió correctamente' })
      queryClient.invalidateQueries('tipoclientes')
      form.setValue('tipo_cliente', data.id.toString())
      setOpenTipoDialog(false)
      setNewTipo({ nombre: '', code: '' })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message || 'No se pudo crear', variant: 'destructive' })
    }
  })
  
  // Manejar envío del formulario
  const onSubmit = (data) => {
    setSaving(true);
    
    // Formatear teléfono
    let telefono = data.telefono;
    if (telefono && !telefono.startsWith('+') && !telefono.startsWith('0')) {
      telefono = `0${telefono}`;
    }
    // Si el teléfono queda vacío después del formateo (o era vacío), convertir a null
    if (telefono === '') {
      telefono = null;
    }

    const formattedData = {
      ...data,
      telefono, // ya es null si estaba vacío o se asignó null
      // Convertir strings vacíos a null para campos opcionales
      alias: data.alias || null,
      razon_social: data.razon_social || null,
      ruc: data.ruc || null, 
      email: data.email || null, 
      direccion: data.direccion || null,
      nota: data.nota || null,
      // Estos ya se manejan correctamente
      zona: data.zona ? parseInt(data.zona) : null,
      ciudad: data.ciudad ? parseInt(data.ciudad) : null,
      tipo_cliente: data.tipo_cliente ? parseInt(data.tipo_cliente) : null,
      // Tags como array de IDs
      tags: data.tags || []
    };

    // Si el campo telefono es null (porque estaba vacío), se elimina del payload
    // ya que el backend lo rechazó.
    if (formattedData.telefono === null) {
      delete formattedData.telefono;
    }

    // Para depuración: muestra el payload final que se enviará
    console.log("Payload a enviar:", formattedData);
    
    if (isEditMode) {
      updateClienteMutation.mutate({ id, data: formattedData });
    } else {
      createClienteMutation.mutate(formattedData);
    }
  };
  
  // Verificar si estamos cargando datos
  const isLoading = loadingZonas || loadingTipos || loadingCiudades || (isEditMode && loadingCliente);
  
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <PageHeader 
        icon={<Building2 size={40} strokeWidth={1.5} />}
        title={isEditMode ? "Editar Cliente" : "Nuevo Cliente"}
        description={isEditMode 
          ? "Actualiza la información del cliente" 
          : "Completa el formulario para registrar un nuevo cliente"}
        action={{
          label: "Volver a Clientes",
          icon: <ArrowLeft className="h-4 w-4" />,
          onClick: () => navigate('/directorio/clientes')
        }}
      />
      
      {isLoading ? (
        <div className="p-8 bg-white border rounded-md flex justify-center items-center my-4">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-gray-500">Cargando datos...</p>
          </div>
        </div>
      ) : clienteError ? (
        <div className="p-8 bg-red-50 border border-red-200 rounded-md flex justify-center items-center my-4">
          <div className="flex flex-col items-center text-red-700">
            <Info className="h-12 w-12 text-red-500 mb-3" />
            <p className="font-medium">Error al cargar los datos del cliente</p>
            <p className="text-sm mt-1 mb-3">No se pudo obtener la información solicitada</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/directorio/clientes')}>
                Volver a Clientes
              </Button>
              <Button onClick={() => window.location.reload()}>Reintentar</Button>
            </div>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormCard 
              title="Información del Cliente" 
              description="Completa todos los datos del cliente"
              icon={<Building2 className="h-5 w-5 text-white-600" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  rules={{ 
                    required: "El nombre es requerido", 
                    maxLength: { value: 255, message: "El nombre no puede exceder los 255 caracteres" } 
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del cliente" {...field} />
                      </FormControl>
                      <FormDescription>Nombre completo o razón comercial</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="alias"
                  rules={{ 
                    maxLength: { value: 100, message: "El alias no puede exceder los 100 caracteres" } 
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alias (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Alias o nombre corto" {...field} />
                      </FormControl>
                      <FormDescription>Nombre corto o comercial del cliente</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="razon_social"
                  rules={{ 
                    required: "La razón social es requerida", 
                    maxLength: { value: 255, message: "La razón social no puede exceder los 255 caracteres" } 
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razón Social</FormLabel>
                      <FormControl>
                        <Input placeholder="Razón social" {...field} />
                      </FormControl>
                      <FormDescription>Denominación legal del cliente</FormDescription>
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
                      message: "El RUC debe tener 13 dígitos numéricos"
                    },
                    validate: {
                      validRUC: (value) => {
                        // Validación básica de RUC ecuatoriano
                        if (value.length !== 13) return "El RUC debe tener 13 dígitos";
                        if (!/^\d+$/.test(value)) return "El RUC debe contener solo dígitos";
                        return true;
                      }
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RUC</FormLabel>
                      <FormControl>
                        <Input placeholder="9999999999999" {...field} />
                      </FormControl>
                      <FormDescription>Registro Único de Contribuyentes (13 dígitos)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="email"
                  rules={{ 
                    required: "El correo electrónico es requerido",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "El correo electrónico no es válido"
                    },
                    validate: {
                      corporateEmail: (value) => {
                        const freeDomains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com', 'live.com', 'aol.com'];
                        const domain = value.split('@')[1]?.toLowerCase();
                        return !freeDomains.includes(domain) || "Por favor utilice un correo corporativo en lugar de un servicio gratuito";
                      }
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input placeholder="correo@empresa.com" {...field} />
                      </FormControl>
                      <FormDescription>Correo principal de contacto (debe ser corporativo)</FormDescription>
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
                      value: /^(\+593|0)[2-9]\d{7,8}$/,
                      message: "Formato válido: 0999999999, 022999999 o +593999999999"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="0999999999" {...field} />
                      </FormControl>
                      <FormDescription>Número de teléfono principal (formato ecuatoriano)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="direccion"
                  rules={{ required: "La dirección es requerida" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Dirección completa del cliente" 
                          {...field} 
                          rows={2}
                        />
                      </FormControl>
                      <FormDescription>Dirección física principal</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="nota"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Información adicional sobre el cliente" 
                          {...field} 
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>Observaciones o detalles adicionales</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="ciudad"
                  rules={{ required: "La ciudad es requerida" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          if (value === 'add_new_ciudad') {
                            field.onChange('')
                            setOpenCiudadDialog(true)
                            return
                          }
                          field.onChange(value)
                        }} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una ciudad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ciudadesOptions
                            .filter(opt => opt && opt.id !== undefined)
                            .map(ciudad => (
                              <SelectItem
                                key={ciudad.id}
                                value={ciudad.id.toString()}
                              >
                                {ciudad.nombre ?? `#${ciudad.id}`}
                              </SelectItem>
                          ))}
                          {/* Opción para añadir nueva ciudad */}
                          <SelectItem value="add_new_ciudad" className="text-primary flex items-center gap-1">
                            <Plus className="h-3 w-3" /> Añadir nueva ciudad
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Ciudad donde se ubica el cliente</FormDescription>
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
                      <Select 
                        onValueChange={(value) => {
                          if (value === 'add_new_zona') {
                            field.onChange('')
                            setOpenZonaDialog(true)
                            return
                          }
                          field.onChange(value)
                        }} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una zona" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {zonasOptions
                            .filter(opt => opt && opt.id !== undefined)
                            .map(zona => (
                              <SelectItem
                                key={zona.id}
                                value={zona.id.toString()}
                              >
                                {zona.nombre ?? `#${zona.id}`}
                              </SelectItem>
                          ))}
                          {/* Opción para añadir nueva zona */}
                          <SelectItem value="add_new_zona" className="text-primary flex items-center gap-1">
                            <Plus className="h-3 w-3" /> Añadir nueva zona
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Zona geográfica (opcional)</FormDescription>
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
                      <FormLabel>Tipo de Cliente</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          if (value === 'add_new_tipo_cliente') {
                            field.onChange('')
                            setOpenTipoDialog(true)
                            return
                          }
                          field.onChange(value)
                        }} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tiposClienteOptions
                            .filter(opt => opt && opt.id !== undefined)
                            .map(tipo => (
                              <SelectItem
                                key={tipo.id}
                                value={tipo.id.toString()}
                              >
                                {tipo.nombre ?? `#${tipo.id}`}
                              </SelectItem>
                          ))}
                          {/* Opción para añadir nuevo tipo de cliente */}
                          <SelectItem value="add_new_tipo_cliente" className="text-primary flex items-center gap-1">
                            <Plus className="h-3 w-3" /> Añadir nuevo tipo de cliente
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Categoría del cliente</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Etiquetas</FormLabel>
                      <TagInput 
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Selecciona etiquetas para identificar este cliente"
                      />
                      <FormDescription>
                        Las etiquetas te ayudan a categorizar y filtrar clientes fácilmente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="activo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Estado Activo</FormLabel>
                        <FormDescription>
                          Indica si el cliente está activo en el sistema.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </FormCard>
            
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/directorio/clientes')}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={saving}
                className="gap-1"
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>{isEditMode ? 'Actualizando...' : 'Guardando...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{isEditMode ? 'Actualizar Cliente' : 'Guardar Cliente'}</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* Diálogo para nueva ciudad */}
      <Dialog open={openCiudadDialog} onOpenChange={setOpenCiudadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir nueva ciudad</DialogTitle>
            <DialogDescription>Completa los datos mínimos y guarda para seleccionarla.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="nombreCiudad">Nombre</Label>
              <Input id="nombreCiudad" value={newCiudad.nombre} onChange={e => setNewCiudad({ ...newCiudad, nombre: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provinciaCiudad">Provincia</Label>
              <Input id="provinciaCiudad" value={newCiudad.provincia} onChange={e => setNewCiudad({ ...newCiudad, provincia: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codeCiudad">Código</Label>
              <Input id="codeCiudad" value={newCiudad.code} onChange={e => setNewCiudad({ ...newCiudad, code: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpenCiudadDialog(false)}>Cancelar</Button>
            <Button type="button" onClick={() => createCiudadMutation.mutate(newCiudad)} disabled={createCiudadMutation.isPending}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para nueva zona */}
      <Dialog open={openZonaDialog} onOpenChange={setOpenZonaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir nueva zona</DialogTitle>
            <DialogDescription>Completa los datos mínimos y guarda para seleccionarla.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="nombreZona">Nombre</Label>
              <Input id="nombreZona" value={newZona.nombre} onChange={e => setNewZona({ ...newZona, nombre: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codeZona">Código</Label>
              <Input id="codeZona" value={newZona.code} onChange={e => setNewZona({ ...newZona, code: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coberturaZona">Cobertura (opcional)</Label>
              <Textarea id="coberturaZona" rows={3} value={newZona.cobertura} onChange={e => setNewZona({ ...newZona, cobertura: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpenZonaDialog(false)}>Cancelar</Button>
            <Button type="button" onClick={() => createZonaMutation.mutate(newZona)} disabled={createZonaMutation.isPending}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para nuevo tipo de cliente */}
      <Dialog open={openTipoDialog} onOpenChange={setOpenTipoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir tipo de cliente</DialogTitle>
            <DialogDescription>Introduce el nombre y guarda para seleccionarlo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="codeTipo">Código</Label>
              <Input id="codeTipo" value={newTipo.code} onChange={e => setNewTipo({ ...newTipo, code: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nombreTipo">Nombre</Label>
              <Input id="nombreTipo" value={newTipo.nombre} onChange={e => setNewTipo({ ...newTipo, nombre: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpenTipoDialog(false)}>Cancelar</Button>
            <Button type="button" onClick={() => createTipoMutation.mutate(newTipo)} disabled={createTipoMutation.isPending}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}