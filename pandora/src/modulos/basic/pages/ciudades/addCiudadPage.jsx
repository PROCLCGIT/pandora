// /pandora/src/modulos/basic/pages/ciudades/addCiudadPage.jsx

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Building } from 'lucide-react';

// Importar servicios
import { 
  useCiudadById, 
  useCreateCiudad, 
  useUpdateCiudad
} from '../../api/ciudadService';

import { useToast } from '@/hooks/use-toast';

import { Input } from '@/components/ui/input';
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
const ciudadSchema = yup.object({
  nombre: yup.string().required('El nombre es obligatorio').max(50, 'El nombre no debe exceder los 50 caracteres'),
  provincia: yup.string().required('La provincia es obligatoria').max(50, 'La provincia no debe exceder los 50 caracteres'),
  code: yup.string().required('El código es obligatorio').max(50, 'El código no debe exceder los 50 caracteres'),
});

export default function AddCiudadPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  // Formulario con React Hook Form y Yup
  const form = useForm({
    resolver: yupResolver(ciudadSchema),
    defaultValues: {
      nombre: '',
      provincia: '',
      code: '',
    },
  });

  // Consulta de datos para edición
  const { data: ciudadData, isLoading: isLoadingCiudad } = useCiudadById(id);
  
  // Actualizar formulario cuando se carga la ciudad
  useEffect(() => {
    if (isEditing && ciudadData) {
      form.reset({
        nombre: ciudadData.nombre,
        provincia: ciudadData.provincia,
        code: ciudadData.code,
      });
    }
  }, [ciudadData, form, isEditing]);

  // Usar hooks de mutación del servicio
  const createMutation = useCreateCiudad();
  const updateMutation = useUpdateCiudad();
  
  // Añadir notificaciones a las mutaciones
  const onCreateSuccess = () => {
    toast({
      title: 'Ciudad creada',
      description: 'La ciudad ha sido creada exitosamente.',
    });
    navigate('/basic/ciudades');
  };
  
  const onCreateError = (error) => {
    toast({
      title: 'Error al crear',
      description: `No se pudo crear la ciudad: ${error.message || 'Error desconocido'}`,
      variant: 'destructive',
    });
  };
  
  const onUpdateSuccess = () => {
    toast({
      title: 'Ciudad actualizada',
      description: 'La ciudad ha sido actualizada exitosamente.',
    });
    navigate('/basic/ciudades');
  };
  
  const onUpdateError = (error) => {
    toast({
      title: 'Error al actualizar',
      description: `No se pudo actualizar la ciudad: ${error.message || 'Error desconocido'}`,
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
      title={isEditing ? 'Editar Ciudad' : 'Nueva Ciudad'}
      description={isEditing
        ? 'Actualiza la información de la ciudad existente'
        : 'Completa el formulario para crear una nueva ciudad'}
      onSubmit={form.handleSubmit(onSubmit)}
      onCancel={() => navigate('/basic/ciudades')}
      backLink="Volver a ciudades"
      isSubmitting={isSubmitting}
      icon={<Building size={24} strokeWidth={1.5} />}
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
                    <Input placeholder="Nombre de la ciudad" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nombre completo de la ciudad
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="provincia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provincia</FormLabel>
                  <FormControl>
                    <Input placeholder="Provincia" {...field} />
                  </FormControl>
                  <FormDescription>
                    Provincia a la que pertenece la ciudad
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input placeholder="Código" {...field} />
                </FormControl>
                <FormDescription>
                  Código único para identificar la ciudad
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </FormCard>
  );
}