// /pandora/src/modulos/basic/pages/zonas/zonaPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileEdit, Trash2, Eye, Filter, MapPin } from 'lucide-react';

// Importaciones del servicio de zona
import { useZonas, useDeleteZona } from '../../api/zonaService';

// Importar hook de búsqueda personalizado para debounce
import { useSearch } from '@/hooks/custom/useSearch';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

// Componente de paginación básico
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center mt-4 space-x-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Anterior
      </Button>
      <span className="flex items-center px-3 py-1">
        Página {currentPage} de {totalPages}
      </span>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Siguiente
      </Button>
    </div>
  );
};

export default function ZonaPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filters, setFilters] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [zonaToDelete, setZonaToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Utilizar hook personalizado para la búsqueda con debounce
  const { inputValue: searchValue, setInputValue: setSearchValue, debouncedValue: debouncedSearch } = useSearch({
    initialValue: '',
    delay: 500,
  });
  
  // Efecto para actualizar los filtros cuando cambia el valor de búsqueda con debounce
  useEffect(() => {
    setFilters(prevFilters => ({ ...prevFilters, search: debouncedSearch }));
  }, [debouncedSearch]);

  // Consulta de datos con useZonas
  const { data, isLoading, isError, error, refetch } = useZonas({
    ...filters,
    search: debouncedSearch,
    page: currentPage,
    page_size: pageSize
  }, {
    // Opciones adicionales para React Query
    onError: (error) => {
      // Mostrar notificación de error
      toast({
        title: "Error al cargar datos",
        description: `No se pudieron cargar las zonas: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutación para eliminar
  const deleteZonaMutation = useDeleteZona({
    onSuccess: (id) => {
      // Mostrar notificación de éxito
      toast({
        title: "Zona eliminada",
        description: zonaToDelete 
          ? `La zona "${zonaToDelete.nombre}" ha sido eliminada correctamente.`
          : "La zona ha sido eliminada correctamente.",
      });
    },
    onError: (error) => {
      // Mostrar notificación de error
      toast({
        title: "Error al eliminar",
        description: `No se pudo eliminar la zona: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Manejadores de eventos
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleDeleteClick = (zona) => {
    setZonaToDelete(zona);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteZonaMutation.mutate(zonaToDelete.id, {
      onSettled: () => {
        // Independientemente del resultado, cerramos el diálogo y limpiamos
        setDeleteDialogOpen(false);
        setZonaToDelete(null);
      }
    });
  };

  // Función para truncar texto largo
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Renderizado de la tabla de zonas
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Zonas</h1>
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/basic/zonas/infinite')}
            >
              Ver con paginación infinita
            </Button>
          </div>
        </div>
        <Button onClick={() => navigate('/basic/zonas/add')} className="bg-primary">
          <Plus className="mr-2 h-4 w-4" /> Agregar Zona
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Filtros</CardTitle>
          <CardDescription>Filtra las zonas por diversos criterios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="search" className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Input
                  id="search"
                  placeholder="Buscar por nombre, código o cobertura..."
                  value={searchValue}
                  onChange={handleSearchChange}
                />
                {searchValue && debouncedSearch !== searchValue && (
                  <div className="absolute right-2 top-2 text-xs text-muted-foreground">
                    Buscando...
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" onClick={() => {
            // Resetear tanto el valor del input como los filtros
            setSearchValue('');
            setFilters({});
          }} className="mr-2">
            Limpiar Filtros
          </Button>
          <Button onClick={() => refetch()}>
            <Filter className="mr-2 h-4 w-4" /> Filtrar
          </Button>
        </CardFooter>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : isError ? (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Error al cargar datos</CardTitle>
            <CardDescription>No se pudieron cargar las zonas</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error?.message || 'Error desconocido'}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => refetch()} variant="outline">
              Intentar nuevamente
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Cobertura</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.results?.length ? (
                    data.results.map((zona) => (
                      <TableRow key={zona.id}>
                        <TableCell className="font-medium flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          {zona.nombre}
                        </TableCell>
                        <TableCell>{zona.code}</TableCell>
                        <TableCell>
                          {zona.cobertura ? (
                            <span title={zona.cobertura}>
                              {truncateText(zona.cobertura, 60)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm italic">
                              Sin descripción de cobertura
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
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
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6">
                        No se encontraron zonas
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            {data?.count > pageSize && (
              <CardFooter className="flex justify-center py-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(data.count / pageSize)}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </CardFooter>
            )}
          </Card>

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