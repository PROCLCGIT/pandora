// /pandora/src/modulos/directorio/pages/contactos/addContactoPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { UserCircle, Save, ArrowLeft, Info, MapPin } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

// Servicios para contactos
import { useContactoById, useCreateContacto, useUpdateContacto } from '../../api/contactoService';

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

// Componentes personalizados
import { PageHeader } from '@/modulos/basic/components/layout/PageHeader';
import { FormCard } from '@/modulos/basic/components/form/FormCard';

export default function AddContactoPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  
  // Si estamos en modo edición, cargar los datos del contacto
  const { 
    data: contacto, 
    isLoading: loadingContacto, 
    isError: contactoError 
  } = useContactoById(id, {
    enabled: isEditMode,
    onError: (error) => {
      toast({
        title: "Error al cargar el contacto",
        description: error.message || "No se pudo cargar la información del contacto",
        variant: "destructive"
      });
      navigate('/directorio/contactos');
    }
  });
  
  // Configurar el formulario con react-hook-form
  const form = useForm({
    defaultValues: {
      nombre: '',
      alias: '',
      telefono: '',
      telefono2: '',
      email: '',
      direccion: '',
      obserbacion: '',
      ingerencia: ''
    }
  });
  
  // Cargar los datos del contacto en el formulario cuando se reciben
  useEffect(() => {
    if (isEditMode && contacto && contacto.id) {
      form.reset({
        nombre: contacto.nombre || '',
        alias: contacto.alias || '',
        telefono: contacto.telefono || '',
        telefono2: contacto.telefono2 || '',
        email: contacto.email || '',
        direccion: contacto.direccion || '',
        obserbacion: contacto.obserbacion || '',
        ingerencia: contacto.ingerencia || ''
      });
    }
  }, [contacto, form, isEditMode]);
  
  // Mutaciones para crear o actualizar contactos
  const createContactoMutation = useCreateContacto({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactos'] });
      toast({
        title: "Contacto creado",
        description: "El contacto ha sido creado correctamente",
      });
      navigate('/directorio/contactos');
    },
    onError: (error) => {
      toast({
        title: "Error al crear el contacto",
        description: JSON.stringify(error.response?.data) || error.message || "No se pudo crear el contacto",
        variant: "destructive"
      });
      setSaving(false);
    }
  });
  
  const updateContactoMutation = useUpdateContacto({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactos'] });
      toast({
        title: "Contacto actualizado",
        description: "El contacto ha sido actualizado correctamente",
      });
      navigate('/directorio/contactos');
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar el contacto",
        description: JSON.stringify(error.response?.data) || error.message || "No se pudo actualizar el contacto",
        variant: "destructive"
      });
      setSaving(false);
    }
  });
  
  // Manejar envío del formulario
  const onSubmit = (data) => {
    setSaving(true);
    
    if (isEditMode) {
      updateContactoMutation.mutate({ id, data });
    } else {
      createContactoMutation.mutate(data);
    }
  };
  
  // Verificar si estamos cargando datos
  const isLoading = (isEditMode && loadingContacto);
  
  const freeEmailDomains = ['gmail.com','hotmail.com','yahoo.com','outlook.com','live.com','aol.com']
  
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <PageHeader 
        icon={<UserCircle size={40} strokeWidth={1.5} />}
        title={isEditMode ? "Editar Contacto" : "Nuevo Contacto"}
        description={isEditMode 
          ? "Actualiza la información del contacto" 
          : "Completa el formulario para registrar un nuevo contacto"}
        action={{
          label: "Volver a Contactos",
          icon: <ArrowLeft className="h-4 w-4" />,
          onClick: () => navigate('/directorio/contactos')
        }}
      />
      
      {isLoading ? (
        <div className="p-8 bg-white border rounded-md flex justify-center items-center my-4">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-gray-500">Cargando datos...</p>
          </div>
        </div>
      ) : contactoError ? (
        <div className="p-8 bg-red-50 border border-red-200 rounded-md flex justify-center items-center my-4">
          <div className="flex flex-col items-center text-red-700">
            <Info className="h-12 w-12 text-red-500 mb-3" />
            <p className="font-medium">Error al cargar los datos del contacto</p>
            <p className="text-sm mt-1 mb-3">No se pudo obtener la información solicitada</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/directorio/contactos')}>
                Volver a Contactos
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
              description="Datos básicos del contacto"
              icon={<UserCircle className="h-5 w-5 text-blue-600" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Row 1: Nombre (spans 2 cols) */}
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="nombre"
                    rules={{ 
                      required: "El nombre es requerido", 
                      maxLength: { value: 255, message: "El nombre no puede exceder los 255 caracteres" } 
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre completo" {...field} />
                        </FormControl>
                        <FormDescription>Nombre completo del contacto</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Row 2: Alias (spans 2 cols) */}
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="alias"
                    rules={{ 
                      required: "El alias es requerido",
                      maxLength: { value: 100, message: "El alias no puede exceder los 100 caracteres" } 
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alias</FormLabel>
                        <FormControl>
                          <Input placeholder="Alias o apodo" {...field} />
                        </FormControl>
                        <FormDescription>Nombre corto o alias para identificación rápida</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Row 3: Ingerencia/Cargo (spans 2 cols) */}
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="ingerencia"
                    rules={{ 
                      required: "La ingerencia es requerida", 
                      maxLength: { value: 255, message: "La ingerencia no puede exceder los 255 caracteres" } 
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ingerencia/Cargo <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Textarea placeholder="Cargo o posición" {...field} rows={2} />
                        </FormControl>
                        <FormDescription>Cargo o ingerencia en la organización</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              
                {/* Row 4: Correo Electrónico (spans 2 cols) */}
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="email"
                    rules={{ 
                      required: "El correo electrónico es requerido",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "El correo electrónico no es válido"
                      },
                      validate: value => {
                        const domain = value.split('@').pop().toLowerCase()
                        return !freeEmailDomains.includes(domain) || 'Debe ingresar un correo corporativo'
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="correo@empresa.com" {...field} />
                        </FormControl>
                        <FormDescription>Correo electrónico principal</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 5: Telefonos */}
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
                      <FormLabel>Teléfono Principal <span className="text-red-500">*</span></FormLabel>
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
                  name="telefono2"
                  rules={{ 
                    pattern: {
                      value: /^(\+5939\d{8}|\+593[24]\d{7}|\+593[2-7]\d{7}|09\d{8}|0[2-7]\d{7})$/,
                      message: "Formato de teléfono ecuatoriano no válido"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono Secundario</FormLabel>
                      <FormControl>
                        <Input placeholder="0999999999 (opcional)" {...field} />
                      </FormControl>
                      <FormDescription>Número de teléfono alternativo</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Row 6: Dirección (spans 2 cols) */}
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="direccion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Dirección del contacto (opcional)" 
                            {...field} 
                            rows={2}
                          />
                        </FormControl>
                        <FormDescription>Dirección física o de oficina</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Row 7: Observaciones (spans 2 cols) */}
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="obserbacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observaciones</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Notas adicionales sobre el contacto (opcional)" 
                            {...field} 
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>Información adicional o notas importantes</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </FormCard>
            
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/directorio/contactos')}
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
                    <span>{isEditMode ? 'Actualizar Contacto' : 'Guardar Contacto'}</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}