// /pandora/src/modulos/basic/components/zonas/ZonasList.jsx

import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileEdit, Trash2, Eye, MapPin } from 'lucide-react';

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
 * Componente para mostrar una lista de zonas con soporte para paginación infinita
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.zonas - Array de zonas a mostrar
 * @param {Function} props.onLoadMore - Función para cargar más zonas
 * @param {boolean} props.hasNextPage - Indica si hay más páginas para cargar
 * @param {boolean} props.isFetchingNextPage - Indica si se está cargando la siguiente página
 * @param {Function} props.onDelete - Función para eliminar una zona
 * @param {boolean} props.isDeletePending - Indica si hay una eliminación en proceso
 */
export default function ZonasList({
  zonas = [],
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
  onDelete,
  isDeletePending = false
}) {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [zonaToDelete, setZonaToDelete] = useState(null);

  // Configuración de Intersection Observer para infinite scroll
  const observer = useRef();
  const lastZonaRef = useCallback(
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

  // Función para truncar texto largo
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Manejadores de eventos
  const handleDeleteClick = (zona) => {
    setZonaToDelete(zona);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (onDelete && zonaToDelete) {
      onDelete(zonaToDelete.id, {
        onSettled: () => {
          setDeleteDialogOpen(false);
          setZonaToDelete(null);
        }
      });
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zonas.map((zona, index) => {
          const isLastItem = index === zonas.length - 1;
          
          return (
            <Card 
              key={`${zona.id}-${index}`} 
              className="overflow-hidden"
              ref={isLastItem ? lastZonaRef : null}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg truncate flex items-center" title={zona.nombre}>
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    {zona.nombre}
                  </CardTitle>
                  <Badge variant="outline">{zona.code}</Badge>
                </div>
                {zona.ciudades && zona.ciudades.length > 0 && (
                  <CardDescription>
                    {zona.ciudades.length} {zona.ciudades.length === 1 ? 'ciudad' : 'ciudades'}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-2">
                  {zona.cobertura ? (
                    <div className="text-sm text-muted-foreground line-clamp-3" title={zona.cobertura}>
                      {truncateText(zona.cobertura, 150)}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">
                      Sin descripción de cobertura
                    </div>
                  )}
                  
                  {/* Mostrar algunas ciudades si están disponibles */}
                  {zona.ciudades && zona.ciudades.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {zona.ciudades.slice(0, 3).map(ciudad => (
                        <Badge key={ciudad.id} variant="secondary" className="text-xs">
                          {ciudad.nombre}
                        </Badge>
                      ))}
                      {zona.ciudades.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{zona.ciudades.length - 3} más
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/50 flex justify-end">
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/basic/zonas/${zona.id}`)}
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/basic/zonas/edit/${zona.id}`)}
                    title="Editar"
                  >
                    <FileEdit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(zona)}
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
              ¿Estás seguro de que deseas eliminar la zona "{zonaToDelete?.nombre}"?
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