// /pandora/src/modulos/basic/components/ciudades/CiudadesList.jsx

import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileEdit, Trash2, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

/**
 * Componente para mostrar una lista de ciudades con soporte para paginación infinita
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.ciudades - Array de ciudades a mostrar
 * @param {Function} props.onLoadMore - Función para cargar más ciudades
 * @param {boolean} props.hasNextPage - Indica si hay más páginas para cargar
 * @param {boolean} props.isFetchingNextPage - Indica si se está cargando la siguiente página
 * @param {Function} props.onDelete - Función para eliminar una ciudad
 * @param {boolean} props.isDeletePending - Indica si hay una eliminación en proceso
 */
export default function CiudadesList({
  ciudades = [],
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
  onDelete,
  isDeletePending = false
}) {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ciudadToDelete, setCiudadToDelete] = useState(null);

  // Configuración de Intersection Observer para infinite scroll
  const observer = useRef();
  const lastCiudadRef = useCallback(
    (node) => {
      if (isFetchingNextPage) return;
      
      if (observer.current) observer.current.disconnect();
      
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          onLoadMore();
        }
      });
      
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, onLoadMore]
  );

  // Manejadores de eventos
  const handleDeleteClick = (ciudad) => {
    setCiudadToDelete(ciudad);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (onDelete && ciudadToDelete) {
      onDelete(ciudadToDelete.id, {
        onSettled: () => {
          setDeleteDialogOpen(false);
          setCiudadToDelete(null);
        }
      });
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ciudades.map((ciudad, index) => {
          const isLastItem = index === ciudades.length - 1;
          
          return (
            <Card 
              key={`${ciudad.id}-${index}`} 
              className="overflow-hidden"
              ref={isLastItem ? lastCiudadRef : null}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg truncate" title={ciudad.nombre}>
                    {ciudad.nombre}
                  </CardTitle>
                </div>
                <CardDescription>
                  <span>{ciudad.provincia}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Código:</span>
                    <span className="ml-2 text-sm font-mono">{ciudad.code}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/50 flex justify-between">
                <div></div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/basic/ciudades/${ciudad.id}`)}
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/basic/ciudades/edit/${ciudad.id}`)}
                    title="Editar"
                  >
                    <FileEdit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(ciudad)}
                    title="Eliminar"
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {isFetchingNextPage && (
        <div className="w-full flex justify-center py-6">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la ciudad "{ciudadToDelete?.nombre}, {ciudadToDelete?.provincia}"?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={isDeletePending}
            >
              {isDeletePending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}