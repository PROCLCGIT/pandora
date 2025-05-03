// /pandora/src/modulos/basic/pages/marcas/addMarcaPage.jsx

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Award } from 'lucide-react';

// Importar servicios
import { 
  useMarcaById, 
  useCreateMarca, 
  useUpdateMarca
} from '../../api/marcaService';

import { useToast } from '@/hooks/use-toast';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Importar componente personalizado para formularios
import { FormCard } from '../../components/form/FormCard';

// Esquema de validación con Yup
const marcaSchema = yup.object({
  nombre: yup.string().required('El nombre es obligatorio').max(50, 'El nombre no debe exceder los 50 caracteres'),
  code: yup.string().required('El código es obligatorio').max(20, 'El código no debe exceder los 20 caracteres'),
  description: yup.string().max(500, 'La descripción no debe exceder los 500 caracteres'),
  proveedores: yup.string().max(100, 'Los proveedores no deben exceder los 100 caracteres'),
  country_origin: yup.string().max(50, 'El país de origen no debe exceder los 50 caracteres'),
  website: yup.string().url('Debe ser una URL válida').max(200, 'El sitio web no debe exceder los 200 caracteres'),
  contact_info: yup.string().max(500, 'La información de contacto no debe exceder los 500 caracteres'),
  is_active: yup.boolean().default(true),
});

export default function AddMarcaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  // Formulario con React Hook Form y Yup
  const form = useForm({
    resolver: yupResolver(marcaSchema),
    defaultValues: {
      nombre: '',
      code: '',
      description: '',
      proveedores: '',
      country_origin: '',
      website: '',
      contact_info: '',
      is_active: true,
    },
  });

  // Consulta de datos para edición
  const { data: marcaData, isLoading: isLoadingMarca } = useMarcaById(id);
  
  // Actualizar formulario cuando se carga la marca
  useEffect(() => {
    if (isEditing && marcaData) {
      form.reset({
        nombre: marcaData.nombre,
        code: marcaData.code,
        description: marcaData.description || '',
        proveedores: marcaData.proveedores || '',
        country_origin: marcaData.country_origin || '',
        website: marcaData.website || '',
        contact_info: marcaData.contact_info || '',
        is_active: marcaData.is_active,
      });
    }
  }, [marcaData, form, isEditing]);

  // Usar hooks de mutación del servicio
  const createMutation = useCreateMarca();
  const updateMutation = useUpdateMarca();
  
  // Añadir notificaciones a las mutaciones
  const onCreateSuccess = () => {
    toast({
      title: 'Marca creada',
      description: 'La marca ha sido creada exitosamente.',
    });
    navigate('/basic/marcas');
  };
  
  const onCreateError = (error) => {
    toast({
      title: 'Error al crear',
      description: `No se pudo crear la marca: ${error.message || 'Error desconocido'}`,
      variant: 'destructive',
    });
  };
  
  const onUpdateSuccess = () => {
    toast({
      title: 'Marca actualizada',
      description: 'La marca ha sido actualizada exitosamente.',
    });
    navigate('/basic/marcas');
  };
  
  const onUpdateError = (error) => {
    toast({
      title: 'Error al actualizar',
      description: `No se pudo actualizar la marca: ${error.message || 'Error desconocido'}`,
      variant: 'destructive',
    });
  };

  // Manejar envío del formulario
  const onSubmit = (data) => {
    try {
      if (isEditing) {
        updateMutation.mutate(
          { id, data },
          { 
            onSuccess: onUpdateSuccess,
            onError: onUpdateError
          }
        );
      } else {
        createMutation.mutate(
          data,
          {
            onSuccess: onCreateSuccess,
            onError: onCreateError
          }
        );
      }
    } catch (error) {
      console.error('Error en formulario:', error);
      toast({
        title: 'Error en el formulario',
        description: 'Hubo un error al procesar el formulario. Por favor, revisa los datos ingresados.',
        variant: 'destructive',
      });
    }
  };
  
  // Determinar si el formulario está en estado de envío
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <FormCard
      title={isEditing ? 'Editar Marca' : 'Nueva Marca'}
      description={isEditing
        ? 'Actualiza la información de la marca existente'
        : 'Completa el formulario para crear una nueva marca'}
      onSubmit={form.handleSubmit(onSubmit)}
      onCancel={() => navigate('/basic/marcas')}
      backLink="Volver a marcas"
      isSubmitting={isSubmitting}
      icon={<Award size={24} strokeWidth={1.5} />}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre de la marca" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nombre de la marca (obligatorio)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input placeholder="Código único" {...field} />
                  </FormControl>
                  <FormDescription>
                    Código único para identificar la marca (obligatorio)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descripción de la marca..." 
                    className="min-h-[120px]" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Breve descripción de la marca y sus productos
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="proveedores"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proveedores</FormLabel>
                  <FormControl>
                    <Input placeholder="Proveedores principales" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nombres de proveedores principales para esta marca
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country_origin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>País de origen</FormLabel>
                  <FormControl>
                    <Input placeholder="País de origen" {...field} />
                  </FormControl>
                  <FormDescription>
                    País de origen de la marca
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sitio web</FormLabel>
                <FormControl>
                  <Input placeholder="https://www.ejemplo.com" {...field} />
                </FormControl>
                <FormDescription>
                  URL del sitio web oficial de la marca
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact_info"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Información de contacto</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Información de contacto..." 
                    className="min-h-[80px]" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Datos de contacto como correo, teléfono, dirección, etc.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 border-blue-100">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Activo</FormLabel>
                  <FormDescription>
                    Las marcas inactivas no se mostrarán en listados públicos
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </FormCard>
  );
}