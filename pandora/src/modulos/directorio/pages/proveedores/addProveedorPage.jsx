// /pandora/src/modulos/directorio/pages/proveedores/addProveedorPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Building, Save, ArrowLeft, Info, MapPin, Check, X, Plus } from 'lucide-react';

// Servicios para proveedores y datos relacionados
import { useProveedorById, useCreateProveedor, useUpdateProveedor } from '../../api/proveedorService';
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

// Dialogos
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

import { Label } from '@/components/ui/label'

import { useCreateCiudad } from '@/modulos/basic/api/ciudadService'

import { useQueryClient } from '@tanstack/react-query'

export default function AddProveedorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const queryClient = useQueryClient()

  // estado para dialogo ciudad
  const [openCiudadDialog, setOpenCiudadDialog] = useState(false)
  const [newCiudad, setNewCiudad] = useState({ nombre: '', provincia: '', code: '' })

  // Cargar datos relacionados para los selectores
  const { data: ciudadesData, isLoading: loadingCiudades } = useCiudades({ page_size: 100 });
  
  // Si estamos en modo edición, cargar los datos del proveedor
  const { 
    data: proveedor, 
    isLoading: loadingProveedor, 
    isError: proveedorError 
  } = useProveedorById(id, {
    enabled: isEditMode,
    onError: (error) => {
      toast({
        title: "Error al cargar el proveedor",
        description: error.message || "No se pudo cargar la información del proveedor",
        variant: "destructive"
      });
      navigate('/directorio/proveedores');
    }
  });
  
  // Configurar el formulario con react-hook-form
  const form = useForm({
    defaultValues: {
      nombre: '',
      razon_social: '',
      ruc: '',
      correo: '',
      telefono: '',
      direccion1: '',
      direccion2: '',
      ciudad: '',
      activo: true,
      tipo_primario: false
    }
  });
  
  // Cargar los datos del proveedor en el formulario cuando se reciben
  useEffect(() => {
    if (isEditMode && proveedor && proveedor.id) {
      form.reset({
        nombre: proveedor.nombre || '',
        razon_social: proveedor.razon_social || '',
        ruc: proveedor.ruc || '',
        correo: proveedor.correo || '',
        telefono: proveedor.telefono || '',
        direccion1: proveedor.direccion1 || '',
        direccion2: proveedor.direccion2 || '',
        activo: proveedor.activo !== undefined ? proveedor.activo : true,
        tipo_primario: proveedor.tipo_primario !== undefined ? proveedor.tipo_primario : false,
        ciudad: proveedor.ciudad && proveedor.ciudad.id ? proveedor.ciudad.id.toString() : ''
      });
    }
  }, [proveedor, form, isEditMode]);
  
  // Mutaciones para crear o actualizar proveedores
  const createProveedorMutation = useCreateProveedor({
    onSuccess: (data) => {
      toast({
        title: "Proveedor creado",
        description: "El proveedor ha sido creado correctamente",
      });
      navigate(`/directorio/proveedores/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error al crear el proveedor",
        description: error.response?.data?.detail || error.message || "No se pudo crear el proveedor",
        variant: "destructive"
      });
      setSaving(false);
    }
  });
  
  const updateProveedorMutation = useUpdateProveedor({
    onSuccess: (data) => {
      toast({
        title: "Proveedor actualizado",
        description: "El proveedor ha sido actualizado correctamente",
      });
      navigate(`/directorio/proveedores/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar el proveedor",
        description: error.response?.data?.detail || error.message || "No se pudo actualizar el proveedor",
        variant: "destructive"
      });
      setSaving(false);
    }
  });
  
  // Manejar envío del formulario
  const onSubmit = (data) => {
    setSaving(true);
    
    const formattedData = {
      ...data,
      ciudad: data.ciudad ? parseInt(data.ciudad) : null
    };
    
    if (isEditMode) {
      updateProveedorMutation.mutate({ id, data: formattedData });
    } else {
      createProveedorMutation.mutate(formattedData);
    }
  };
  
  // Verificar si estamos cargando datos
  const isLoading = loadingCiudades || (isEditMode && loadingProveedor);
  
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
  
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <PageHeader 
        icon={<Building size={40} strokeWidth={1.5} />}
        title={isEditMode ? "Editar Proveedor" : "Nuevo Proveedor"}
        description={isEditMode 
          ? "Actualiza la información del proveedor" 
          : "Completa el formulario para registrar un nuevo proveedor"}
        action={{
          label: "Volver a Proveedores",
          icon: <ArrowLeft className="h-4 w-4" />,
          onClick: () => navigate('/directorio/proveedores')
        }}
      />
      
      {isLoading ? (
        <div className="p-8 bg-white border rounded-md flex justify-center items-center my-4">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-gray-500">Cargando datos...</p>
          </div>
        </div>
      ) : proveedorError ? (
        <div className="p-8 bg-red-50 border border-red-200 rounded-md flex justify-center items-center my-4">
          <div className="flex flex-col items-center text-red-700">
            <Info className="h-12 w-12 text-red-500 mb-3" />
            <p className="font-medium">Error al cargar los datos del proveedor</p>
            <p className="text-sm mt-1 mb-3">No se pudo obtener la información solicitada</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/directorio/proveedores')}>
                Volver a Proveedores
              </Button>
              <Button onClick={() => window.location.reload()}>Reintentar</Button>
            </div>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormCard 
              title="Información General" 
              description="Datos básicos del proveedor"
              icon={<Building className="h-5 w-5 text-white-600" />}
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
                        <Input placeholder="Nombre del proveedor" {...field} />
                      </FormControl>
                      <FormDescription>Nombre comercial</FormDescription>
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
                      <FormDescription>Denominación legal del proveedor</FormDescription>
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
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RUC</FormLabel>
                      <FormControl>
                        <Input placeholder="9999999999999" {...field} />
                      </FormControl>
                      <FormDescription>Registro Único de Contribuyentes</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipo_primario"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-6">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Proveedor Primario</FormLabel>
                        <FormDescription>
                          Marcar si es un proveedor principal
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="correo"
                  rules={{ 
                    required: "El correo electrónico es requerido",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "El correo electrónico no es válido"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input placeholder="correo@empresa.com" {...field} />
                      </FormControl>
                      <FormDescription>Correo principal de contacto</FormDescription>
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
                      value: /^[0-9]{7,10}$/,
                      message: "El teléfono debe tener entre 7 y 10 dígitos"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="0999999999" {...field} />
                      </FormControl>
                      <FormDescription>Número de teléfono principal</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="direccion1"
                  rules={{ required: "La dirección principal es requerida" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección Principal</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Dirección principal del proveedor" 
                          {...field} 
                          rows={2}
                        />
                      </FormControl>
                      <FormDescription>Dirección física principal</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="direccion2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección Secundaria</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Dirección secundaria o adicional (opcional)" 
                          {...field} 
                          rows={2}
                        />
                      </FormControl>
                      <FormDescription>Dirección alternativa (opcional)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                        value={field.value} 
                      >
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
                          <SelectItem value="add_new_ciudad" className="text-primary flex items-center gap-1">
                            <Plus className="h-3 w-3" /> Añadir nueva ciudad
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Ciudad donde se ubica el proveedor</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          Indica si el proveedor está activo actualmente
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
                onClick={() => navigate('/directorio/proveedores')}
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
                    <span>{isEditMode ? 'Actualizar Proveedor' : 'Guardar Proveedor'}</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* Dialogo nueva ciudad */}
      <Dialog open={openCiudadDialog} onOpenChange={setOpenCiudadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir nueva ciudad</DialogTitle>
            <DialogDescription>Ingresa los datos y guarda para seleccionarla automáticamente.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="nombreCiudadProv">Nombre</Label>
              <Input id="nombreCiudadProv" value={newCiudad.nombre} onChange={e => setNewCiudad({ ...newCiudad, nombre: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provinciaCiudadProv">Provincia</Label>
              <Input id="provinciaCiudadProv" value={newCiudad.provincia} onChange={e => setNewCiudad({ ...newCiudad, provincia: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codeCiudadProv">Código</Label>
              <Input id="codeCiudadProv" value={newCiudad.code} onChange={e => setNewCiudad({ ...newCiudad, code: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpenCiudadDialog(false)}>Cancelar</Button>
            <Button type="button" onClick={() => createCiudadMutation.mutate(newCiudad)} disabled={createCiudadMutation.isPending}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}