// /pandora/src/modulos/basic/pages/categorias/addcategoriaPage.jsx

import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { BookOpen } from 'lucide-react';

// Importar servicios de categoría
import { 
  useCategoriaById, 
  useCreateCategoria, 
  useUpdateCategoria, 
  useCategories 
} from '../../api/categoriaService';

import { useToast } from '@/hooks/use-toast';

import { Input } from '@/components/ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Importar componente personalizado para formularios
import { FormCard } from '../../components/form/FormCard';

// Esquema de validación con Yup
const categoriaSchema = yup.object({
  nombre: yup.string().required('El nombre es obligatorio').max(255, 'El nombre no debe exceder los 255 caracteres'),
  code: yup.string().required('El código es obligatorio').max(20, 'El código no debe exceder los 20 caracteres'),
  parent: yup.number().nullable().transform(value => (isNaN(value) ? null : value)),
  is_active: yup.boolean().default(true),
});

export default function AddCategoriaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  // Formulario con React Hook Form y Yup
  const form = useForm({
    resolver: yupResolver(categoriaSchema),
    defaultValues: {
      nombre: '',
      code: '',
      parent: 'root',
      is_active: true,
    },
  });

  // Consulta de datos para edición
  const { data: categoriaData, isLoading: isLoadingCategoria } = useCategoriaById(id);
  
  // Consulta de categorías padre para el select
  const { data: categoriasData, isLoading: isLoadingCategoriasPadre, isError: isErrorCategorias } = useCategories({
    page_size: 100, // Obtener suficientes categorías para mostrar en el select
  });
  
  // Lista de categorías para mostrar en el select
  // El servicio ya garantiza que categoriasData.results siempre será un array
  const categoriasPadre = categoriasData?.results || [];
  
  // Efecto para mostrar errores de carga de categorías
  useEffect(() => {
    if (isErrorCategorias) {
      toast({
        title: 'Error al cargar categorías',
        description: 'No se pudieron cargar las categorías padre. Por favor, intenta nuevamente.',
        variant: 'destructive',
      });
    }
  }, [isErrorCategorias, toast]);
  
  // Actualizar formulario cuando se carga la categoría
  useEffect(() => {
    if (isEditing && categoriaData) {
      form.reset({
        nombre: categoriaData.nombre,
        code: categoriaData.code,
        parent: categoriaData.parent || 'root',
        is_active: categoriaData.is_active,
      });
    }
  }, [categoriaData, form, isEditing]);

  // Verificar si hay un parent preseleccionado desde la ubicación
  useEffect(() => {
    // Solo intenta acceder a location.state si existe
    if (location.state && location.state.parentId && !isEditing) {
      form.setValue('parent', location.state.parentId);
    }
  }, [location.state, form, isEditing]);

  // Usar hooks de mutación del servicio
  const createMutation = useCreateCategoria();
  const updateMutation = useUpdateCategoria();
  
  // Añadir notificaciones a las mutaciones
  const onCreateSuccess = () => {
    toast({
      title: 'Categoría creada',
      description: 'La categoría ha sido creada exitosamente.',
      variant: 'success',
    });
    navigate('/basic/categorias');
  };
  
  const onCreateError = (error) => {
    toast({
      title: 'Error al crear',
      description: `No se pudo crear la categoría: ${error.message || 'Error desconocido'}`,
      variant: 'destructive',
    });
  };
  
  const onUpdateSuccess = () => {
    toast({
      title: 'Categoría actualizada',
      description: 'La categoría ha sido actualizada exitosamente.',
      variant: 'success',
    });
    navigate('/basic/categorias');
  };
  
  const onUpdateError = (error) => {
    toast({
      title: 'Error al actualizar',
      description: `No se pudo actualizar la categoría: ${error.message || 'Error desconocido'}`,
      variant: 'destructive',
    });
  };

  // Manejar envío del formulario
  const onSubmit = (data) => {
    try {
      const formData = {
        ...data,
        parent: data.parent === 'root' || data.parent === '' ? null : data.parent,
      };

      if (isEditing) {
        updateMutation.mutate(
          { id, data: formData },
          { 
            onSuccess: onUpdateSuccess,
            onError: onUpdateError
          }
        );
      } else {
        createMutation.mutate(
          formData,
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
      title={isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
      description={isEditing
        ? 'Actualiza la información de la categoría existente'
        : 'Completa el formulario para crear una nueva categoría'}
      onSubmit={form.handleSubmit(onSubmit)}
      onCancel={() => navigate('/basic/categorias')}
      backLink="Volver a categorías"
      isSubmitting={isSubmitting}
      icon={<BookOpen size={24} strokeWidth={1.5} />}
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
                    <Input placeholder="Nombre de la categoría" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nombre descriptivo para la categoría
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
                    <Input placeholder="Código" {...field} />
                  </FormControl>
                  <FormDescription>
                    Código único para identificar la categoría
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="parent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría Padre</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    value={field.value ? field.value.toString() : 'root'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría padre (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="root">Ninguna (Categoría Raíz)</SelectItem>
                      {Array.isArray(categoriasPadre) && categoriasPadre.length > 0 ? (
                        categoriasPadre
                          .filter(cat => cat && typeof cat === 'object' && cat.id)
                          .filter(cat => !(isEditing && cat.id === parseInt(id)))
                          .map((cat) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>
                              {cat.nombre || "Sin nombre"} {cat.path ? `(${cat.path})` : ''}
                            </SelectItem>
                          ))
                      ) : null}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  Selecciona una categoría padre o deja en blanco para una categoría raíz
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
                    Las categorías inactivas no se mostrarán en listados públicos
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormItem>
                <FormLabel>Nivel</FormLabel>
                <FormControl>
                  <Input
                    value={categoriaData?.level || 0}
                    disabled
                    className="bg-muted"
                  />
                </FormControl>
                <FormDescription>
                  Nivel jerárquico (calculado automáticamente)
                </FormDescription>
              </FormItem>
              <FormItem>
                <FormLabel>Ruta</FormLabel>
                <FormControl>
                  <Input
                    value={categoriaData?.path || ''}
                    disabled
                    className="bg-muted font-mono text-sm"
                  />
                </FormControl>
                <FormDescription>
                  Ruta jerárquica completa (calculada automáticamente)
                </FormDescription>
              </FormItem>
            </div>
          )}
        </form>
      </Form>
    </FormCard>
  );
}