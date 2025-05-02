// /pandora/src/modulos/basic/pages/ciudades/ciudadPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileEdit, Trash2, Eye, Filter } from 'lucide-react';

// Importaciones del servicio de ciudad
import { useCiudades, useDeleteCiudad } from '../../api/ciudadService';

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

export default function CiudadPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filters, setFilters] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ciudadToDelete, setCiudadToDelete] = useState(null);
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

  // Consulta de datos con useCiudades
  const { data, isLoading, isError, error, refetch } = useCiudades({
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
        description: `No se pudieron cargar las ciudades: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutación para eliminar
  const deleteCiudadMutation = useDeleteCiudad({
    onSuccess: (id) => {
      // Mostrar notificación de éxito
      toast({
        title: "Ciudad eliminada",
        description: ciudadToDelete 
          ? `La ciudad "${ciudadToDelete.nombre}" ha sido eliminada correctamente.`
          : "La ciudad ha sido eliminada correctamente.",
      });
    },
    onError: (error) => {
      // Mostrar notificación de error
      toast({
        title: "Error al eliminar",
        description: `No se pudo eliminar la ciudad: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Manejadores de eventos
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleProvinciaChange = (value) => {
    setFilters({ ...filters, provincia: value === 'all' ? undefined : value });
  };

  const handleDeleteClick = (ciudad) => {
    setCiudadToDelete(ciudad);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteCiudadMutation.mutate(ciudadToDelete.id, {
      onSettled: () => {
        // Independientemente del resultado, cerramos el diálogo y limpiamos
        setDeleteDialogOpen(false);
        setCiudadToDelete(null);
      }
    });
  };

  // Obtener lista única de provincias para el filtro
  const provincias = data?.results ? Array.from(new Set(data.results.map(ciudad => ciudad.provincia))).sort() : [];

  // Renderizado de la tabla de ciudades
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Ciudades</h1>
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/basic/ciudades/infinite')}
            >
              Ver con paginación infinita
            </Button>
          </div>
        </div>
        <Button onClick={() => navigate('/basic/ciudades/add')} className="bg-primary">
          <Plus className="mr-2 h-4 w-4" /> Agregar Ciudad
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Filtros</CardTitle>
          <CardDescription>Filtra las ciudades por diversos criterios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="search" className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Input
                  id="search"
                  placeholder="Buscar por nombre o código..."
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
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="provincia" className="text-sm font-medium">Provincia</label>
              <Select onValueChange={handleProvinciaChange} defaultValue="all">
                <SelectTrigger id="provincia">
                  <SelectValue placeholder="Todas las provincias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {provincias.map(provincia => (
                    <SelectItem key={provincia} value={provincia}>
                      {provincia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <CardDescription>No se pudieron cargar las ciudades</CardDescription>
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
                    <TableHead>Provincia</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.results?.length ? (
                    data.results.map((ciudad) => (
                      <TableRow key={ciudad.id}>
                        <TableCell className="font-medium">{ciudad.nombre}</TableCell>
                        <TableCell>{ciudad.provincia}</TableCell>
                        <TableCell>{ciudad.code}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
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
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6">
                        No se encontraron ciudades
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