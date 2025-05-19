// /pandora/src/modulos/basic/pages/empresas/addEmpresaPage.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useToast } from '@/hooks/use-toast';
import { useCreateEmpresa } from '../../api/empresaClcService';
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
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Esquema de validación con Zod
const empresaSchema = z.object({
  nombre: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres' }).max(150),
  razon_social: z.string().min(3, { message: 'La razón social debe tener al menos 3 caracteres' }).max(150),
  code: z.string().min(2, { message: 'El código debe tener al menos 2 caracteres' }).max(50),
  ruc: z.string().regex(/^\d{13}$/, { message: 'El RUC debe contener 13 dígitos numéricos' }),
  direccion: z.string().min(5, { message: 'La dirección debe tener al menos 5 caracteres' }).max(255),
  telefono: z.string().max(20).optional().or(z.literal('')),
  correo: z.string().email({ message: 'Debe ingresar un correo electrónico válido' }).max(100),
  representante_legal: z.string().min(3, { message: 'El nombre del representante debe tener al menos 3 caracteres' }).max(150),
});

/**
 * Componente para agregar una nueva empresa CLC
 */
export default function AddEmpresaPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  
  // Hook de React Query para creación
  const createEmpresaMutation = useCreateEmpresa({
    onSuccess: (data) => {
      setIsSubmitting(false);
      toast({
        title: 'Empresa creada',
        description: `La empresa "${data.nombre}" se ha creado correctamente.`,
      });
      // Invalidar la caché para forzar una recarga de los datos cuando vuelva a la lista
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
      navigate('/basic/empresas');
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast({
        title: 'Error al crear la empresa',
        description: error.message || 'Ha ocurrido un error al crear la empresa.',
        variant: 'destructive',
      });
    }
  });
  
  // Inicializar React Hook Form con Zod
  const form = useForm({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      nombre: '',
      razon_social: '',
      code: '',
      ruc: '',
      direccion: '',
      telefono: '',
      correo: '',
      representante_legal: '',
    },
  });
  
  // Función para manejar el envío del formulario
  const onSubmit = (values) => {
    setIsSubmitting(true);
    createEmpresaMutation.mutate(values);
  };
  
  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Agregar Nueva Empresa CLC</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/basic/empresas')}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
      </div>
      
      <Card className="border-blue-100 shadow-md">
        <CardHeader>
          <CardTitle>Datos de la Empresa</CardTitle>
          <CardDescription>
            Ingrese la información de la nueva empresa del grupo CLC.
          </CardDescription>
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Código interno */}
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código Interno *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: CLC-01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* RUC */}
                <FormField
                  control={form.control}
                  name="ruc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RUC *</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567890123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Nombre comercial */}
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Comercial *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre comercial de la empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Razón social */}
              <FormField
                control={form.control}
                name="razon_social"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razón Social *</FormLabel>
                    <FormControl>
                      <Input placeholder="Razón social completa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Separator className="my-4" />
              
              {/* Dirección */}
              <FormField
                control={form.control}
                name="direccion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Dirección completa de la empresa" 
                        {...field} 
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Teléfono */}
                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: +593 999999999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Correo */}
                <FormField
                  control={form.control}
                  name="correo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico *</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="ejemplo@empresa.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Representante legal */}
              <FormField
                control={form.control}
                name="representante_legal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Representante Legal *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nombre completo del representante legal" 
                        {...field} 
                      />
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
                onClick={() => navigate('/basic/empresas')}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="gap-1"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Guardando...' : 'Guardar Empresa'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}