// pandora/src/modulos/basic/pages/marcas/detalleMarca.jsx

import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Globe, ExternalLink } from 'lucide-react';

// Importar servicios
import { useMarcaById, useDeleteMarca } from '../../api/marcaService';

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

export default function DetalleMarca() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Consulta de datos de la marca
  const { data: marca, isLoading, isError, error } = useMarcaById(id, {
    onError: (error) => {
      toast({
        title: "Error al cargar detalles",
        description: `No se pudieron cargar los detalles de la marca: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutación para eliminar marca
  const deleteMarcaMutation = useDeleteMarca({
    onSuccess: () => {
      toast({
        title: "Marca eliminada",
        description: "La marca ha sido eliminada correctamente.",
      });
      navigate('/basic/marcas');
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar",
        description: `No se pudo eliminar la marca: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Manejador para confirmar eliminación
  const handleDeleteConfirm = () => {
    deleteMarcaMutation.mutate(id, {
      onSettled: () => {
        setDeleteDialogOpen(false);
      }
    });
  };

  // Función para formatear la URL
  const formatUrl = (url) => {
    if (!url) return null;
    return url.replace(/^https?:\/\//i, '');
  };

  return (
    <div className="container mx-auto py-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/basic/marcas')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a marcas
      </Button>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : isError ? (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Error al cargar datos</CardTitle>
            <CardDescription>No se pudieron cargar los detalles de la marca</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error?.message || 'Error desconocido'}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold">{marca.nombre}</h1>
              {marca.is_active ? (
                <Badge className="ml-4 bg-green-500">Activo</Badge>
              ) : (
                <Badge variant="secondary" className="ml-4">Inactivo</Badge>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/basic/marcas/edit/${id}`)}
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
                <CardTitle>Detalles de la Marca</CardTitle>
                <CardDescription>Información completa de la marca</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Nombre</h3>
                    <p className="text-lg">{marca.nombre}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Código</h3>
                    <p className="text-lg font-mono">{marca.code}</p>
                  </div>
                </div>

                {marca.description && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Descripción</h3>
                    <p className="text-base whitespace-pre-line">{marca.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {marca.proveedores && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Proveedores</h3>
                      <p className="text-base">{marca.proveedores}</p>
                    </div>
                  )}
                  {marca.country_origin && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">País de origen</h3>
                      <p className="text-base">{marca.country_origin}</p>
                    </div>
                  )}
                </div>

                {marca.website && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Sitio web</h3>
                    <a
                      href={marca.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:underline"
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      {formatUrl(marca.website)}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                )}

                {marca.contact_info && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Información de contacto</h3>
                    <p className="text-base whitespace-pre-line">{marca.contact_info}</p>
                  </div>
                )}

                {/* Sección de metadatos */}
                <div className="border-t pt-4 mt-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Metadatos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">ID: </span>
                      <span className="font-mono">{marca.id}</span>
                    </div>
                    {marca.created_at && (
                      <div>
                        <span className="text-muted-foreground">Creado: </span>
                        <span>{new Date(marca.created_at).toLocaleString()}</span>
                      </div>
                    )}
                    {marca.updated_at && (
                      <div>
                        <span className="text-muted-foreground">Actualizado: </span>
                        <span>{new Date(marca.updated_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Código:</span>
                      <div className="font-mono bg-muted p-2 rounded mt-1">{marca.code}</div>
                    </div>
                    {marca.country_origin && (
                      <div>
                        <span className="text-sm text-muted-foreground">País:</span>
                        <div className="font-medium mt-1">{marca.country_origin}</div>
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-muted-foreground">Estado:</span>
                      <div className="mt-1">
                        {marca.is_active ? (
                          <Badge className="bg-green-500">Activo</Badge>
                        ) : (
                          <Badge variant="secondary">Inactivo</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Aquí podrían ir otras tarjetas con información relacionada */}
            </div>
          </div>

          {/* Diálogo de confirmación para eliminar */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar eliminación</DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que deseas eliminar la marca "{marca.nombre}"?
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
                  disabled={deleteMarcaMutation.isPending}
                >
                  {deleteMarcaMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}