// /src/modulos/basic/components/categorias/CategoriasList.jsx

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileEdit, Eye, Trash2 } from 'lucide-react';

import { useInfiniteCategories, useDeleteCategoria } from '../../api/categoriaService';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * Componente para mostrar una lista de categorías con paginación infinita
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.filters - Filtros a aplicar a la consulta
 * @param {Function} props.onDelete - Función a ejecutar cuando se elimina una categoría
 */
export default function CategoriasList({ filters = {}, onDelete }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const loadMoreRef = useRef(null); // Referencia para el observador de intersección
  
  // Consulta de datos con paginación infinita
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteCategories(filters);
  
  // Mutación para eliminar categoría
  const deleteCategoriaMutation = useDeleteCategoria({
    onSuccess: (id) => {
      toast({
        title: "Categoría eliminada",
        description: "La categoría ha sido eliminada correctamente.",
      });
      
      // Ejecutar callback si existe
      if (onDelete) onDelete(id);
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar",
        description: `No se pudo eliminar la categoría: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Configurar observador para detectar cuando el usuario llega al final de la lista
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        // Si el elemento es visible y hay más páginas para cargar
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 } // Se dispara cuando al menos el 50% del elemento es visible
    );
    
    // Observar el elemento
    observer.observe(loadMoreRef.current);
    
    // Limpiar observador
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [loadMoreRef, hasNextPage, fetchNextPage, isFetchingNextPage]);
  
  // Manejador para eliminar categoría
  const handleDeleteClick = (categoria) => {
    if (window.confirm(`¿Estás seguro de eliminar la categoría "${categoria.nombre}"?`)) {
      deleteCategoriaMutation.mutate(categoria.id);
    }
  };
  
  // Mensaje de carga
  if (isLoading && !data) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Mensaje de error
  if (isError) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Error al cargar datos</CardTitle>
          <CardDescription>No se pudieron cargar las categorías</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{error?.message || 'Error desconocido'}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()} variant="outline">
            Intentar nuevamente
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // No hay datos
  if (!data || !data.pages || data.pages.length === 0 || !data.pages[0].results.length) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-center text-muted-foreground">
            No se encontraron categorías con los filtros aplicados
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Aplanar resultados de todas las páginas cargadas
  const allCategorias = data.pages.flatMap(page => page.results);
  
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Nivel</TableHead>
              <TableHead>Ruta</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allCategorias.map((categoria) => (
              <TableRow key={categoria.id}>
                <TableCell className="font-medium">{categoria.nombre}</TableCell>
                <TableCell>{categoria.code}</TableCell>
                <TableCell>{categoria.level}</TableCell>
                <TableCell>
                  <span className="text-xs font-mono bg-muted p-1 rounded">{categoria.path}</span>
                </TableCell>
                <TableCell>
                  {categoria.is_active ? (
                    <Badge className="bg-green-500">Activo</Badge>
                  ) : (
                    <Badge variant="secondary">Inactivo</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/basic/categorias/${categoria.id}`)}
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/basic/categorias/edit/${categoria.id}`)}
                      title="Editar"
                    >
                      <FileEdit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(categoria)}
                      title="Eliminar"
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Elemento de referencia para la carga infinita */}
        {hasNextPage && (
          <div 
            ref={loadMoreRef} 
            className="py-4 text-center"
          >
            {isFetchingNextPage ? (
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
            ) : (
              <Button 
                variant="ghost" 
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                Cargar más
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}