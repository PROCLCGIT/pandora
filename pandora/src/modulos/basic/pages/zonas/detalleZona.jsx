// pandora/src/modulos/basic/pages/zonas/detalleZona.jsx

import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, MapPin, Plus } from 'lucide-react';

// Importar servicios
import { useZonaConCiudades, useDeleteZona } from '../../api/zonaService';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function DetalleZona() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Consulta de datos de la zona con ciudades
  const { data: zona, isLoading, isError, error } = useZonaConCiudades(id, {
    onError: (error) => {
      toast({
        title: "Error al cargar detalles",
        description: `No se pudieron cargar los detalles de la zona: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutación para eliminar zona
  const deleteZonaMutation = useDeleteZona({
    onSuccess: () => {
      toast({
        title: "Zona eliminada",
        description: "La zona ha sido eliminada correctamente.",
      });
      navigate('/basic/zonas');
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar",
        description: `No se pudo eliminar la zona: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Manejador para confirmar eliminación
  const handleDeleteConfirm = () => {
    deleteZonaMutation.mutate(id, {
      onSettled: () => {
        setDeleteDialogOpen(false);
      }
    });
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

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : isError ? (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Error al cargar datos</CardTitle>
            <CardDescription>No se pudieron cargar los detalles de la zona</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error?.message || 'Error desconocido'}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <MapPin className="h-6 w-6 mr-2 text-primary" />
              <h1 className="text-3xl font-bold">{zona.nombre}</h1>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/basic/zonas/edit/${id}`)}
              >
                <Edit className="mr-2 h-4 w-4" /> Editar
              </Button>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Detalles de la Zona</CardTitle>
                <CardDescription>Información completa de la zona geográfica</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Nombre</h3>
                    <p className="text-lg">{zona.nombre}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Código</h3>
                    <p className="text-lg font-mono">{zona.code}</p>
                  </div>
                </div>

                {zona.cobertura && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Descripción de cobertura</h3>
                    <p className="text-base whitespace-pre-line">{zona.cobertura}</p>
                  </div>
                )}

                {/* Sección de metadatos */}
                <div className="border-t pt-4 mt-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Metadatos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">ID: </span>
                      <span className="font-mono">{zona.id}</span>
                    </div>
                    {zona.created_at && (
                      <div>
                        <span className="text-muted-foreground">Creado: </span>
                        <span>{new Date(zona.created_at).toLocaleString()}</span>
                      </div>
                    )}
                    {zona.updated_at && (
                      <div>
                        <span className="text-muted-foreground">Actualizado: </span>
                        <span>{new Date(zona.updated_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>Ciudades</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 gap-1"
                      onClick={() => navigate(`/basic/zonas/edit/${id}`)}
                    >
                      <Plus className="h-4 w-4" /> Añadir
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Ciudades incluidas en esta zona
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {zona.ciudades && zona.ciudades.length > 0 ? (
                    <div className="space-y-2">
                      {zona.ciudades.map(ciudad => (
                        <div 
                          key={ciudad.id} 
                          className="flex items-center p-2 rounded-md border hover:bg-muted transition-colors"
                          onClick={() => navigate(`/basic/ciudades/${ciudad.id}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                          <div>
                            <p className="font-medium">{ciudad.nombre}</p>
                            <p className="text-xs text-muted-foreground">{ciudad.provincia}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No hay ciudades asignadas a esta zona
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <div className="text-xs text-muted-foreground w-full text-center">
                    Total: {zona.ciudades?.length || 0} ciudades
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* Diálogo de confirmación para eliminar */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar eliminación</DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que deseas eliminar la zona "{zona.nombre}"?
                  Esta acción no se puede deshacer y también eliminará las relaciones con ciudades.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteConfirm}
                  disabled={deleteZonaMutation.isPending}
                >
                  {deleteZonaMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}