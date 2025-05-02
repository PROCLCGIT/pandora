// pandora/src/modulos/basic/pages/ciudades/addCiudadPage.jsx

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Save, ArrowLeft } from 'lucide-react';

// Importar servicios
import { 
  useCiudadById, 
  useCreateCiudad, 
  useUpdateCiudad
} from '../../api/ciudadService';

import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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

  return (
    <div className="container mx-auto py-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/basic/ciudades')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a ciudades
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Editar Ciudad' : 'Nueva Ciudad'}</CardTitle>
          <CardDescription>
            {isEditing
              ? 'Actualiza la información de la ciudad existente'
              : 'Completa el formulario para crear una nueva ciudad'}
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/basic/ciudades')}
          >
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {createMutation.isPending || updateMutation.isPending ? (
              <span>Guardando...</span>
            ) : (
              <span>Guardar</span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}