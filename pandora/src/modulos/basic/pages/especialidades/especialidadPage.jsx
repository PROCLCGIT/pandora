// /pandora/src/modulos/basic/pages/especialidades/especialidadPage.jsx

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Stethoscope, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useToast } from '@/hooks/use-toast';
import { useEspecialidadById, useUpdateEspecialidad } from '../../api/especialidadService';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Esquema de validación con Zod
const especialidadSchema = z.object({
  nombre: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres' }).max(50),
  code: z.string().min(2, { message: 'El código debe tener al menos 2 caracteres' }).max(50),
});

/**
 * Componente para editar una especialidad médica existente
 */
export default function EspecialidadPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Obtener datos de la especialidad con React Query
  const { data: especialidad, isLoading, error } = useEspecialidadById(id);
  
  // Hook de React Query para actualización
  const updateEspecialidadMutation = useUpdateEspecialidad({
    onSuccess: (data) => {
      setIsSubmitting(false);
      toast({
        title: 'Especialidad actualizada',
        description: `La especialidad "${data.nombre}" se ha actualizado correctamente.`,
      });
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast({
        title: 'Error al actualizar',
        description: error.message || 'Ha ocurrido un error al actualizar la especialidad.',
        variant: 'destructive',
      });
    }
  });
  
  // Inicializar React Hook Form con los datos de la especialidad
  const form = useForm({
    resolver: zodResolver(especialidadSchema),
    defaultValues: {
      nombre: especialidad?.nombre || '',
      code: especialidad?.code || '',
    },
    values: especialidad, // Esto actualizará los valores cuando se cargue la especialidad
  });
  
  // Función para manejar el envío del formulario
  const onSubmit = (values) => {
    setIsSubmitting(true);
    updateEspecialidadMutation.mutate({ id, data: values });
  };
  
  // Mostrar mensaje de carga
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Cargando información de la especialidad...</span>
      </div>
    );
  }
  
  // Mostrar mensaje de error
  if (error) {
    return (
      <div className="container mx-auto py-6 max-w-3xl">
        <div className="bg-red-50 p-4 rounded-md text-red-600 mb-4">
          Error al cargar los datos de la especialidad: {error.message}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/basic/especialidades')}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a la lista
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Editar Especialidad</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/basic/especialidades')}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
      </div>
      
      <Card className="border-blue-100 shadow-md">
        <CardHeader>
          <CardTitle>{especialidad?.nombre}</CardTitle>
          <CardDescription>
            Actualice la información de la especialidad. Los campos marcados con * son obligatorios.
          </CardDescription>
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {/* Código */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: ESP-01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Nombre */}
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de la especialidad" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/basic/especialidades')}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="gap-1"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}