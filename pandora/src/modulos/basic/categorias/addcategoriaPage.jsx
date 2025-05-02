// pandora/src/modulos/basic/categorias/addcategoriaPage.jsx

import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Save, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
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
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Esquema de validación con Yup
const categoriaSchema = yup.object({
  nombre: yup.string().required('El nombre es obligatorio').max(255, 'El nombre no debe exceder los 255 caracteres'),
  code: yup.string().required('El código es obligatorio').max(20, 'El código no debe exceder los 20 caracteres'),
  parent: yup.number().nullable().transform(value => (isNaN(value) ? null : value)),
  is_active: yup.boolean().default(true),
});

// Función para obtener categoría por ID
const fetchCategoria = async (id) => {
  try {
    const response = await axios.get(`/api/basic/categorias/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    throw error.response?.data?.detail || error.message || 'Error al cargar la categoría';
  }
};

// Función para obtener la lista de categorías padres
const fetchCategoriasPadre = async () => {
  try {
    const response = await axios.get('/api/basic/categorias/');
    // Asegurar que siempre devolvemos un array incluso si results no existe
    return response.data.results || [];
  } catch (error) {
    console.error('Error al obtener categorías padre:', error);
    throw error.response?.data?.detail || error.message || 'Error al cargar las categorías';
  }
};

export default function AddCategoriaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  // Formulario con React Hook Form y Yup
  const form = useForm({
    resolver: yupResolver(categoriaSchema),
    defaultValues: {
      nombre: '',
      code: '',
      parent: null,
      is_active: true,
    },
  });

  // Consultas de datos - Actualizado a React Query v5
  const { data: categoriaData, isLoading: isLoadingCategoria } = useQuery({
    queryKey: ['categoria', id],
    queryFn: () => fetchCategoria(id),
    enabled: isEditing,
    onSuccess: (data) => {
      form.reset({
        nombre: data.nombre,
        code: data.code,
        parent: data.parent,
        is_active: data.is_active,
      });
    },
  });

  const { data: categoriasPadre, isLoading: isLoadingCategoriasPadre } = useQuery({
    queryKey: ['categoriasPadre'],
    queryFn: fetchCategoriasPadre
  });

  // Verificar si hay un parent preseleccionado desde la ubicación
  useEffect(() => {
    if (location.state?.parentId && !isEditing) {
      form.setValue('parent', location.state.parentId);
    }
  }, [location.state, form, isEditing]);

  // Mutaciones para guardar datos - Actualizado a React Query v5
  const createCategoria = useMutation({
    mutationFn: (data) => axios.post('/api/basic/categorias/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      toast({
        title: 'Categoría creada',
        description: 'La categoría ha sido creada exitosamente.',
      });
      navigate('/basic/categorias');
    },
    onError: (error) => {
      toast({
        title: 'Error al crear',
        description: `No se pudo crear la categoría: ${error.response?.data?.detail || error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateCategoria = useMutation({
    mutationFn: (data) => axios.put(`/api/basic/categorias/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['categoria', id] });
      toast({
        title: 'Categoría actualizada',
        description: 'La categoría ha sido actualizada exitosamente.',
      });
      navigate('/basic/categorias');
    },
    onError: (error) => {
      toast({
        title: 'Error al actualizar',
        description: `No se pudo actualizar la categoría: ${error.response?.data?.detail || error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Manejar envío del formulario
  const onSubmit = (data) => {
    const formData = {
      ...data,
      parent: data.parent === '' ? null : data.parent,
    };

    if (isEditing) {
      updateCategoria.mutate(formData);
    } else {
      createCategoria.mutate(formData);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/basic/categorias')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a categorías
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Editar Categoría' : 'Nueva Categoría'}</CardTitle>
          <CardDescription>
            {isEditing
              ? 'Actualiza la información de la categoría existente'
              : 'Completa el formulario para crear una nueva categoría'}
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
                        value={field.value?.toString() || ''}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría padre (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Ninguna (Categoría Raíz)</SelectItem>
                          {Array.isArray(categoriasPadre) && categoriasPadre.map((cat) => (
                            // Evitar ciclos: no mostrar la categoría actual como posible padre
                            isEditing && cat.id === parseInt(id) ? null : (
                              <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.nombre} ({cat.path || ''})
                              </SelectItem>
                            )
                          ))}
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
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
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
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/basic/categorias')}
          >
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={createCategoria.isPending || updateCategoria.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {createCategoria.isPending || updateCategoria.isPending ? (
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