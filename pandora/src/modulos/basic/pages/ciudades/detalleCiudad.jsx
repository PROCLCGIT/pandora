// pandora/src/modulos/basic/pages/ciudades/detalleCiudad.jsx

import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

// Importar servicios
import { useCiudadById, useDeleteCiudad } from '../../api/ciudadService';

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
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function DetalleCiudad() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Consulta de datos de la ciudad
  const { data: ciudad, isLoading, isError, error } = useCiudadById(id, {
    onError: (error) => {
      toast({
        title: "Error al cargar detalles",
        description: `No se pudieron cargar los detalles de la ciudad: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutación para eliminar ciudad
  const deleteCiudadMutation = useDeleteCiudad({
    onSuccess: () => {
      toast({
        title: "Ciudad eliminada",
        description: "La ciudad ha sido eliminada correctamente.",
      });
      navigate('/basic/ciudades');
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar",
        description: `No se pudo eliminar la ciudad: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Manejador para confirmar eliminación
  const handleDeleteConfirm = () => {
    deleteCiudadMutation.mutate(id, {
      onSettled: () => {
        setDeleteDialogOpen(false);
      }
    });
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

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : isError ? (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Error al cargar datos</CardTitle>
            <CardDescription>No se pudieron cargar los detalles de la ciudad</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error?.message || 'Error desconocido'}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">
              {ciudad.nombre}, {ciudad.provincia}
            </h1>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/basic/ciudades/edit/${id}`)}
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

          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Ciudad</CardTitle>
              <CardDescription>Información completa de la ciudad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Nombre</h3>
                  <p className="text-lg">{ciudad.nombre}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Provincia</h3>
                  <p className="text-lg">{ciudad.provincia}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Código</h3>
                <p className="text-lg font-mono bg-muted p-2 rounded">{ciudad.code}</p>
              </div>

              {/* Sección de metadatos */}
              <div className="border-t pt-4 mt-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Metadatos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">ID: </span>
                    <span className="font-mono">{ciudad.id}</span>
                  </div>
                  {ciudad.created_at && (
                    <div>
                      <span className="text-muted-foreground">Creado: </span>
                      <span>{new Date(ciudad.created_at).toLocaleString()}</span>
                    </div>
                  )}
                  {ciudad.updated_at && (
                    <div>
                      <span className="text-muted-foreground">Actualizado: </span>
                      <span>{new Date(ciudad.updated_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Diálogo de confirmación para eliminar */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar eliminación</DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que deseas eliminar la ciudad "{ciudad.nombre}, {ciudad.provincia}"?
                  Esta acción no se puede deshacer.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteConfirm}
                  disabled={deleteCiudadMutation.isPending}
                >
                  {deleteCiudadMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}