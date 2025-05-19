// /pandora/src/modulos/basic/pages/unidades/addUnidadPage.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ruler, ArrowLeft, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useToast } from '@/hooks/use-toast';
import { useCreateUnidad } from '../../api/unidadService';
import { useQueryClient } from '@tanstack/react-query';

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
const unidadSchema = z.object({
  nombre: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }).max(50),
  code: z.string().min(1, { message: 'El código debe tener al menos 1 caracter' }).max(50),
});

/**
 * Componente para agregar una nueva unidad de medida
 */
export default function AddUnidadPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  
  // Hook de React Query para creación
  const createUnidadMutation = useCreateUnidad({
    onSuccess: (data) => {
      setIsSubmitting(false);
      toast({
        title: 'Unidad creada',
        description: `La unidad "${data.nombre}" se ha creado correctamente.`,
        variant: 'success',
      });
      // Invalidar la caché para forzar una recarga de los datos cuando vuelva a la lista
      queryClient.invalidateQueries({ queryKey: ['unidades'] });
      navigate('/basic/unidades');
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast({
        title: 'Error al crear la unidad',
        description: error.message || 'Ha ocurrido un error al crear la unidad.',
        variant: 'destructive',
      });
    }
  });
  
  // Inicializar React Hook Form con Zod
  const form = useForm({
    resolver: zodResolver(unidadSchema),
    defaultValues: {
      nombre: '',
      code: '',
    },
  });
  
  // Función para manejar el envío del formulario
  const onSubmit = (values) => {
    setIsSubmitting(true);
    createUnidadMutation.mutate(values);
  };
  
  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Ruler className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Agregar Nueva Unidad de Medida</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/basic/unidades')}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
      </div>
      
      <Card className="border-blue-100 shadow-md">
        <CardHeader>
          <CardTitle>Datos de la Unidad</CardTitle>
          <CardDescription>
            Ingrese la información para la nueva unidad de medida.
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
                      <Input placeholder="Ej: KG, LT, UND" {...field} />
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
                      <Input placeholder="Nombre de la unidad de medida" {...field} />
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
                onClick={() => navigate('/basic/unidades')}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="gap-1"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Guardando...' : 'Guardar Unidad'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}