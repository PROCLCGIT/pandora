// /pandora/src/modulos/basic/pages/tiposcliente/addTipoClientePage.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useToast } from '@/hooks/use-toast';
import { useCreateTipoCliente } from '../../api/tipoClienteService';
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
const tipoClienteSchema = z.object({
  nombre: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres' }).max(50),
  code: z.string().min(2, { message: 'El código debe tener al menos 2 caracteres' }).max(50),
});

/**
 * Componente para agregar un nuevo tipo de cliente
 */
export default function AddTipoClientePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  
  // Hook de React Query para creación
  const createTipoClienteMutation = useCreateTipoCliente({
    onSuccess: (data) => {
      setIsSubmitting(false);
      toast({
        title: 'Tipo de cliente creado',
        description: `El tipo de cliente "${data.nombre}" se ha creado correctamente.`,
        variant: 'success',
      });
      // Invalidar la caché para forzar una recarga de los datos cuando vuelva a la lista
      queryClient.invalidateQueries({ queryKey: ['tipoclientes'] });
      navigate('/basic/tiposcliente');
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast({
        title: 'Error al crear el tipo de cliente',
        description: error.message || 'Ha ocurrido un error al crear el tipo de cliente.',
        variant: 'destructive',
      });
    }
  });
  
  // Inicializar React Hook Form con Zod
  const form = useForm({
    resolver: zodResolver(tipoClienteSchema),
    defaultValues: {
      nombre: '',
      code: '',
    },
  });
  
  // Función para manejar el envío del formulario
  const onSubmit = (values) => {
    setIsSubmitting(true);
    createTipoClienteMutation.mutate(values);
  };
  
  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Agregar Nuevo Tipo de Cliente</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/basic/tiposcliente')}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
      </div>
      
      <Card className="border-blue-100 shadow-md">
        <CardHeader>
          <CardTitle>Datos del Tipo de Cliente</CardTitle>
          <CardDescription>
            Ingrese la información para el nuevo tipo de cliente.
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
                      <Input placeholder="Ej: TC-01" {...field} />
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
                      <Input placeholder="Nombre del tipo de cliente" {...field} />
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
                onClick={() => navigate('/basic/tiposcliente')}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="gap-1"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Guardando...' : 'Guardar Tipo de Cliente'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}