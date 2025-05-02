// pandora/src/modulos/basic/pages/zonas/addZonaPage.jsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Save, ArrowLeft, Plus, X, MapPin } from 'lucide-react';

// Importar servicios
import { 
  useZonaById, 
  useCreateZona, 
  useUpdateZona,
  useZonaConCiudades,
  useAsignarCiudadesAZona
} from '../../api/zonaService';

import { useCiudades } from '../../api/ciudadService';

import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// Esquema de validación con Yup
const zonaSchema = yup.object({
  nombre: yup.string().required('El nombre es obligatorio').max(50, 'El nombre no debe exceder los 50 caracteres'),
  code: yup.string().required('El código es obligatorio').max(20, 'El código no debe exceder los 20 caracteres'),
  cobertura: yup.string().max(500, 'La descripción de cobertura no debe exceder los 500 caracteres'),
});

export default function AddZonaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);
  
  // Estado para manejar las ciudades seleccionadas
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState('');

  // Formulario con React Hook Form y Yup
  const form = useForm({
    resolver: yupResolver(zonaSchema),
    defaultValues: {
      nombre: '',
      code: '',
      cobertura: '',
    },
  });

  // Consulta de datos para edición
  const { data: zonaData, isLoading: isLoadingZona } = useZonaById(id);
  
  // Consulta de datos de zona con ciudades relacionadas
  const { data: zonaConCiudades, isLoading: isLoadingCiudadesZona } = useZonaConCiudades(id, {
    enabled: isEditing,
  });
  
  // Consulta para obtener todas las ciudades para el selector
  const { data: ciudadesData, isLoading: isLoadingCiudades } = useCiudades({
    page_size: 100 // Obtener suficientes ciudades para el selector
  });

  // Actualizar formulario cuando se carga la zona
  useEffect(() => {
    if (isEditing && zonaData) {
      form.reset({
        nombre: zonaData.nombre,
        code: zonaData.code,
        cobertura: zonaData.cobertura || '',
      });
    }
  }, [zonaData, form, isEditing]);

  // Establecer las ciudades seleccionadas cuando se cargan las ciudades de la zona
  useEffect(() => {
    if (isEditing && zonaConCiudades && zonaConCiudades.ciudades) {
      setSelectedCities(zonaConCiudades.ciudades);
    }
  }, [zonaConCiudades, isEditing]);

  // Usar hooks de mutación del servicio
  const createMutation = useCreateZona();
  const updateMutation = useUpdateZona();
  const asignarCiudadesMutation = useAsignarCiudadesAZona();
  
  // Añadir notificaciones a las mutaciones
  const onCreateSuccess = (data) => {
    // Asignar ciudades seleccionadas a la zona recién creada
    if (selectedCities.length > 0) {
      const ciudad_ids = selectedCities.map(city => city.id);
      asignarCiudadesMutation.mutate({
        zona_id: data.id,
        ciudad_ids
      }, {
        onSuccess: () => {
          toast({
            title: 'Zona creada',
            description: 'La zona y sus ciudades asociadas han sido creadas exitosamente.',
          });
          navigate('/basic/zonas');
        },
        onError: (error) => {
          toast({
            title: 'Zona creada, pero hubo errores al asignar ciudades',
            description: `Se creó la zona pero: ${error.message || 'Error al asignar ciudades'}`,
            variant: 'destructive',
          });
          navigate('/basic/zonas');
        }
      });
    } else {
      toast({
        title: 'Zona creada',
        description: 'La zona ha sido creada exitosamente.',
      });
      navigate('/basic/zonas');
    }
  };
  
  const onCreateError = (error) => {
    toast({
      title: 'Error al crear',
      description: `No se pudo crear la zona: ${error.message || 'Error desconocido'}`,
      variant: 'destructive',
    });
  };
  
  const onUpdateSuccess = (data) => {
    // Asignar ciudades seleccionadas a la zona actualizada
    if (selectedCities.length > 0) {
      const ciudad_ids = selectedCities.map(city => city.id);
      asignarCiudadesMutation.mutate({
        zona_id: data.id,
        ciudad_ids
      }, {
        onSuccess: () => {
          toast({
            title: 'Zona actualizada',
            description: 'La zona y sus ciudades asociadas han sido actualizadas exitosamente.',
          });
          navigate('/basic/zonas');
        },
        onError: (error) => {
          toast({
            title: 'Zona actualizada, pero hubo errores al asignar ciudades',
            description: `Se actualizó la zona pero: ${error.message || 'Error al asignar ciudades'}`,
            variant: 'destructive',
          });
          navigate('/basic/zonas');
        }
      });
    } else {
      toast({
        title: 'Zona actualizada',
        description: 'La zona ha sido actualizada exitosamente.',
      });
      navigate('/basic/zonas');
    }
  };
  
  const onUpdateError = (error) => {
    toast({
      title: 'Error al actualizar',
      description: `No se pudo actualizar la zona: ${error.message || 'Error desconocido'}`,
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

  // Función para manejar la adición de una ciudad
  const handleAddCity = () => {
    if (!selectedCityId) return;
    
    // Buscar la ciudad seleccionada en la lista completa
    const selectedCity = ciudadesData?.results?.find(city => city.id === parseInt(selectedCityId));
    
    if (selectedCity) {
      // Verificar si la ciudad ya está en la lista de seleccionadas
      if (!selectedCities.some(city => city.id === selectedCity.id)) {
        setSelectedCities([...selectedCities, selectedCity]);
      }
    }
    
    // Resetear el selector
    setSelectedCityId('');
  };

  // Función para eliminar una ciudad de la selección
  const handleRemoveCity = (cityId) => {
    setSelectedCities(selectedCities.filter(city => city.id !== cityId));
  };

  return (
    <div className="container mx-auto py-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/basic/zonas')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a zonas
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Editar Zona' : 'Nueva Zona'}</CardTitle>
          <CardDescription>
            {isEditing
              ? 'Actualiza la información de la zona existente'
              : 'Completa el formulario para crear una nueva zona'}
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
                        <Input placeholder="Nombre de la zona" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nombre descriptivo para la zona
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
                        Código único para identificar la zona
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="cobertura"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción de cobertura</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descripción detallada de la cobertura..." 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Describe el área o alcance de cobertura de esta zona
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sección para asignar ciudades a la zona */}
              <div className="border rounded-md p-4">
                <FormLabel className="text-base">Ciudades en esta zona</FormLabel>
                <FormDescription className="mb-4">
                  Selecciona las ciudades que pertenecen a esta zona geográfica
                </FormDescription>

                <div className="flex gap-2 mb-4">
                  <div className="flex-1">
                    <Select value={selectedCityId} onValueChange={setSelectedCityId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar ciudad" />
                      </SelectTrigger>
                      <SelectContent>
                        {ciudadesData?.results?.map(ciudad => (
                          <SelectItem key={ciudad.id} value={ciudad.id.toString()}>
                            {ciudad.nombre}, {ciudad.provincia}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleAddCity}
                    disabled={!selectedCityId}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Añadir
                  </Button>
                </div>

                {/* Lista de ciudades seleccionadas */}
                <div className="border rounded-md p-3 min-h-[100px] bg-muted/30">
                  {selectedCities.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      No hay ciudades seleccionadas
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedCities.map(city => (
                        <Badge 
                          key={city.id} 
                          variant="secondary"
                          className="flex items-center gap-1 py-1.5 pr-1.5"
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          {city.nombre}, {city.provincia}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 rounded-full ml-1 hover:bg-muted"
                            onClick={() => handleRemoveCity(city.id)}
                          >
                            <X className="h-2.5 w-2.5" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/basic/zonas')}
          >
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={
              createMutation.isPending || 
              updateMutation.isPending || 
              asignarCiudadesMutation.isPending
            }
          >
            <Save className="mr-2 h-4 w-4" />
            {createMutation.isPending || updateMutation.isPending || asignarCiudadesMutation.isPending ? (
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