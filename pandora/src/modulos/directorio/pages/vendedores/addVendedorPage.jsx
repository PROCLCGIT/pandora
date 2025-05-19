// /pandora/src/modulos/directorio/pages/vendedores/addVendedorPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Users, Save, ArrowLeft, Info, Building, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

// Servicios para vendedores y proveedores
import { useVendedorById, useCreateVendedor, useUpdateVendedor } from '../../api/vendedorService';
import { useProveedores, useCreateProveedor } from '../../api/proveedorService';
import { useCiudades, useCreateCiudad } from '@/modulos/basic/api/ciudadService';

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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

import { Label } from '@/components/ui/label'

// Componentes personalizados
import { PageHeader } from '@/modulos/basic/components/layout/PageHeader';
import { FormCard } from '@/modulos/basic/components/form/FormCard';

export default function AddVendedorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const freeEmailDomains = ['gmail.com','hotmail.com','yahoo.com','outlook.com','live.com','aol.com'];
  
  // Cargar datos relacionados para los selectores
  const { data: proveedoresData, isLoading: loadingProveedores } = useProveedores({ page_size: 100 });
  
  // Si estamos en modo edición, cargar los datos del vendedor
  const { 
    data: vendedor, 
    isLoading: loadingVendedor, 
    isError: vendedorError 
  } = useVendedorById(id, {
    enabled: isEditMode,
    onError: (error) => {
      toast({
        title: "Error al cargar el vendedor",
        description: error.message || "No se pudo cargar la información del vendedor",
        variant: "destructive"
      });
      navigate('/directorio/vendedores');
    }
  });
  
  // Configurar el formulario con react-hook-form
  const form = useForm({
    defaultValues: {
      nombre: '',
      correo: '',
      telefono: '',
      proveedor: '',
      observacion: '',
      activo: true
    }
  });
  
  // Cargar los datos del vendedor en el formulario cuando se reciben
  useEffect(() => {
    if (isEditMode && vendedor && vendedor.id) {
      form.reset({
        nombre: vendedor.nombre || '',
        correo: vendedor.correo || '',
        telefono: vendedor.telefono || '',
        proveedor: vendedor.proveedor ? vendedor.proveedor.toString() : '',
        observacion: vendedor.observacion || '',
        activo: vendedor.activo !== undefined ? vendedor.activo : true
      });
    }
  }, [vendedor, form, isEditMode]);
  
  // Mutaciones para crear o actualizar vendedores
  const createVendedorMutation = useCreateVendedor({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendedores'] });
      toast({
        title: "Vendedor creado",
        description: "El vendedor ha sido creado correctamente",
      });
      navigate('/directorio/vendedores');
    },
    onError: (error) => {
      toast({
        title: "Error al crear el vendedor",
        description: error.response?.data?.detail || error.message || "No se pudo crear el vendedor",
        variant: "destructive"
      });
      setSaving(false);
    }
  });
  
  const updateVendedorMutation = useUpdateVendedor({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendedores'] });
      toast({
        title: "Vendedor actualizado",
        description: "El vendedor ha sido actualizado correctamente",
      });
      navigate('/directorio/vendedores');
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar el vendedor",
        description: error.response?.data?.detail || error.message || "No se pudo actualizar el vendedor",
        variant: "destructive"
      });
      setSaving(false);
    }
  });
  
  // estado modal proveedor
  const [openProveedorDialog, setOpenProveedorDialog] = useState(false)
  const [newProveedor, setNewProveedor] = useState({
    nombre: '',
    razon_social: '',
    ruc: '',
    correo: '',
    telefono: '',
    direccion1: '',
    ciudad: ''
  })

  // ciudades para selector dentro del modal de proveedor
  const { data: ciudadesData } = useCiudades({ page_size: 100 })

  const [openCiudadDialogProv, setOpenCiudadDialogProv] = useState(false)
  const [newCiudad, setNewCiudad] = useState({ nombre: '', provincia: '', code: '' })

  const createCiudadMutationProv = useCreateCiudad({
    onSuccess: (data) => {
      toast({ title: 'Ciudad creada', description: 'Añadida correctamente' })
      queryClient.invalidateQueries('ciudades')
      setNewProveedor(prev => ({ ...prev, ciudad: data.id.toString() }))
      setOpenCiudadDialogProv(false)
      setNewCiudad({ nombre: '', provincia: '', code: '' })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message || 'No se pudo crear ciudad', variant: 'destructive' })
    }
  })

  const createProveedorMutation = useCreateProveedor({
    onSuccess: (data) => {
      toast({ title: 'Proveedor creado', description: 'Se añadió correctamente' })
      queryClient.invalidateQueries('proveedores')
      form.setValue('proveedor', data.id.toString())
      setOpenProveedorDialog(false)
      setNewProveedor({ nombre: '', razon_social: '', ruc: '', correo: '', telefono: '', direccion1: '', ciudad: '' })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message || 'No se pudo crear', variant: 'destructive' })
    }
  })
  
  // Manejar envío del formulario
  const onSubmit = (data) => {
    setSaving(true);
    
    const formattedData = {
      ...data,
      proveedor: data.proveedor ? parseInt(data.proveedor) : null
    };
    
    if (isEditMode) {
      updateVendedorMutation.mutate({ id, data: formattedData });
    } else {
      createVendedorMutation.mutate(formattedData);
    }
  };
  
  // Verificar si estamos cargando datos
  const isLoading = loadingProveedores || (isEditMode && loadingVendedor);
  
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <PageHeader 
        icon={<Users size={40} strokeWidth={1.5} />}
        title={isEditMode ? "Editar Vendedor" : "Nuevo Vendedor"}
        description={isEditMode 
          ? "Actualiza la información del vendedor" 
          : "Completa el formulario para registrar un nuevo vendedor"}
        action={{
          label: "Volver a Vendedores",
          icon: <ArrowLeft className="h-4 w-4" />,
          onClick: () => navigate('/directorio/vendedores')
        }}
      />
      
      {isLoading ? (
        <div className="p-8 bg-white border rounded-md flex justify-center items-center my-4">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-gray-500">Cargando datos...</p>
          </div>
        </div>
      ) : vendedorError ? (
        <div className="p-8 bg-red-50 border border-red-200 rounded-md flex justify-center items-center my-4">
          <div className="flex flex-col items-center text-red-700">
            <Info className="h-12 w-12 text-red-500 mb-3" />
            <p className="font-medium">Error al cargar los datos del vendedor</p>
            <p className="text-sm mt-1 mb-3">No se pudo obtener la información solicitada</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/directorio/vendedores')}>
                Volver a Vendedores
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
              description="Datos básicos del vendedor"
              icon={<Users className="h-5 w-5 text-blue-600" />}
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
                        <Input placeholder="Nombre completo" {...field} />
                      </FormControl>
                      <FormDescription>Nombre completo del vendedor</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="proveedor"
                  rules={{ required: "El proveedor es requerido" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proveedor</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          if (value === 'add_new_proveedor') {
                            field.onChange('')
                            setOpenProveedorDialog(true)
                            return
                          }
                          field.onChange(value)
                        }} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un proveedor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {proveedoresData?.results?.map(proveedor => (
                            <SelectItem key={proveedor.id} value={proveedor.id.toString()}>
                              {proveedor.nombre}
                            </SelectItem>
                          ))}
                          <SelectItem value="add_new_proveedor" className="text-primary flex items-center gap-1">
                            <Plus className="h-3 w-3" /> Añadir nuevo proveedor
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Proveedor al que pertenece el vendedor</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="correo"
                  rules={{ 
                    required: "El correo electrónico es requerido",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "El correo electrónico no es válido"
                    },
                    validate: value => {
                      const domain = value.split('@').pop().toLowerCase();
                      return !freeEmailDomains.includes(domain) || 'Debe ingresar un correo corporativo';
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input placeholder="correo@empresa.com" {...field} />
                      </FormControl>
                      <FormDescription>Correo electrónico de contacto</FormDescription>
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
                      value: /^(\+5939\d{8}|\+593[24]\d{7}|\+593[2-7]\d{7}|09\d{8}|0[2-7]\d{7})$/,
                      message: "Formato de teléfono ecuatoriano no válido"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="0999999999" {...field} />
                      </FormControl>
                      <FormDescription>Número de teléfono de contacto</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="observacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observaciones</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Observaciones o notas adicionales (opcional)" 
                          {...field} 
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>Información adicional sobre el vendedor</FormDescription>
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
                          Indica si el vendedor está activo actualmente
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
                onClick={() => navigate('/directorio/vendedores')}
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
                    <span>{isEditMode ? 'Actualizar Vendedor' : 'Guardar Vendedor'}</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* Dialogo nuevo proveedor */}
      <Dialog open={openProveedorDialog} onOpenChange={setOpenProveedorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir nuevo proveedor</DialogTitle>
            <DialogDescription>Ingresa datos básicos y guarda para seleccionarlo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="nombreProv">Nombre</Label>
              <Input id="nombreProv" value={newProveedor.nombre} onChange={e => setNewProveedor({ ...newProveedor, nombre: e.target.value, razon_social: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="razonProv">Razón Social</Label>
              <Input id="razonProv" value={newProveedor.razon_social} onChange={e => setNewProveedor({ ...newProveedor, razon_social: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rucProv">RUC</Label>
              <Input id="rucProv" value={newProveedor.ruc} onChange={e => setNewProveedor({ ...newProveedor, ruc: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="correoProv">Correo</Label>
              <Input id="correoProv" value={newProveedor.correo} onChange={e => setNewProveedor({ ...newProveedor, correo: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telProv">Teléfono</Label>
              <Input id="telProv" value={newProveedor.telefono} onChange={e => setNewProveedor({ ...newProveedor, telefono: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dirProv">Dirección</Label>
              <Input id="dirProv" value={newProveedor.direccion1} onChange={e => setNewProveedor({ ...newProveedor, direccion1: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Ciudad</Label>
              <Select
                value={newProveedor.ciudad}
                onValueChange={(value) => {
                  if (value === 'add_new_ciudad_modal') {
                    setOpenCiudadDialogProv(true)
                    return
                  }
                  setNewProveedor(prev => ({ ...prev, ciudad: value }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona ciudad" />
                </SelectTrigger>
                <SelectContent>
                  {ciudadesData?.results?.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                  ))}
                  <SelectItem value="add_new_ciudad_modal" className="text-primary flex items-center gap-1"><Plus className="h-3 w-3" /> Añadir ciudad</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpenProveedorDialog(false)}>Cancelar</Button>
            <Button type="button" onClick={() => {
              const payload = {
                ...newProveedor,
                ciudad: newProveedor.ciudad ? parseInt(newProveedor.ciudad) : null
              }
              createProveedorMutation.mutate(payload)
            }} disabled={createProveedorMutation.isPending}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* modal ciudad dentro de proveedor modal */}
      <Dialog open={openCiudadDialogProv} onOpenChange={setOpenCiudadDialogProv}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva ciudad</DialogTitle>
            <DialogDescription>Completa los campos y guarda.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Label>Nombre</Label>
            <Input value={newCiudad.nombre} onChange={e => setNewCiudad({ ...newCiudad, nombre: e.target.value })} />
            <Label>Provincia</Label>
            <Input value={newCiudad.provincia} onChange={e => setNewCiudad({ ...newCiudad, provincia: e.target.value })} />
            <Label>Código</Label>
            <Input value={newCiudad.code} onChange={e => setNewCiudad({ ...newCiudad, code: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpenCiudadDialogProv(false)}>Cancelar</Button>
            <Button type="button" onClick={() => createCiudadMutationProv.mutate(newCiudad)} disabled={createCiudadMutationProv.isPending}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}