// /pandora/src/modulos/basic/components/marcas/MarcasList.jsx

import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileEdit, Trash2, Eye, Globe, ExternalLink } from 'lucide-react';

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
 * Componente para mostrar una lista de marcas con soporte para paginación infinita
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.marcas - Array de marcas a mostrar
 * @param {Function} props.onLoadMore - Función para cargar más marcas
 * @param {boolean} props.hasNextPage - Indica si hay más páginas para cargar
 * @param {boolean} props.isFetchingNextPage - Indica si se está cargando la siguiente página
 * @param {Function} props.onDelete - Función para eliminar una marca
 * @param {boolean} props.isDeletePending - Indica si hay una eliminación en proceso
 */
export default function MarcasList({
  marcas = [],
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
  onDelete,
  isDeletePending = false
}) {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [marcaToDelete, setMarcaToDelete] = useState(null);

  // Configuración de Intersection Observer para infinite scroll
  const observer = useRef();
  const lastMarcaRef = useCallback(
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

  // Función para formatear la URL
  const formatUrl = (url) => {
    if (!url) return null;
    return url.replace(/^https?:\/\//i, '');
  };

  // Manejadores de eventos
  const handleDeleteClick = (marca) => {
    setMarcaToDelete(marca);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (onDelete && marcaToDelete) {
      onDelete(marcaToDelete.id, {
        onSettled: () => {
          setDeleteDialogOpen(false);
          setMarcaToDelete(null);
        }
      });
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {marcas.map((marca, index) => {
          const isLastItem = index === marcas.length - 1;
          
          return (
            <Card 
              key={`${marca.id}-${index}`} 
              className="overflow-hidden"
              ref={isLastItem ? lastMarcaRef : null}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg truncate" title={marca.nombre}>
                    {marca.nombre}
                  </CardTitle>
                  {marca.is_active ? (
                    <Badge className="bg-green-500">Activo</Badge>
                  ) : (
                    <Badge variant="secondary">Inactivo</Badge>
                  )}
                </div>
                {marca.country_origin && (
                  <CardDescription>
                    <span>{marca.country_origin}</span>
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Código:</span>
                    <span className="ml-2 text-sm font-mono">{marca.code}</span>
                  </div>
                  {marca.website && (
                    <div>
                      <a
                        href={marca.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-blue-600 hover:underline"
                      >
                        <Globe className="mr-1 h-3 w-3" />
                        {formatUrl(marca.website)}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {marca.description && (
                    <div className="text-sm text-muted-foreground line-clamp-2" title={marca.description}>
                      {marca.description}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/50 flex justify-between">
                <div>
                  {marca.proveedores && (
                    <span className="text-xs text-muted-foreground">
                      Prov: {marca.proveedores.length > 15 
                        ? marca.proveedores.substring(0, 15) + "..." 
                        : marca.proveedores}
                    </span>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/basic/marcas/${marca.id}`)}
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/basic/marcas/edit/${marca.id}`)}
                    title="Editar"
                  >
                    <FileEdit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(marca)}
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
              ¿Estás seguro de que deseas eliminar la marca "{marcaToDelete?.nombre}"?
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