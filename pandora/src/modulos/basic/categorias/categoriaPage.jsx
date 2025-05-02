// pandora/src/modulos/basic/categorias/categoriaPage.jsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, FileEdit, Trash2, Eye, Filter } from 'lucide-react';
import axios from 'axios';

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

// Función para obtener categorías
const fetchCategorias = async (filters) => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.isActive !== undefined) params.append('is_active', filters.isActive);
  if (filters.level !== undefined) params.append('level', filters.level);
  
  try {
    const response = await axios.get(`/api/basic/categorias/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    // Propaga el error para que React Query pueda manejarlo
    throw error.response?.data?.detail || error.message || 'Error al cargar las categorías';
  }
};

// Función para eliminar una categoría
const deleteCategoria = async (id) => {
  try {
    const response = await axios.delete(`/api/basic/categorias/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    throw error.response?.data?.detail || error.message || 'Error al eliminar la categoría';
  }
};

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

export default function CategoriaPage() {
  const navigate = useNavigate();
  const { toast } = useToast(); // Añadido: extraer la función toast del hook
  const [filters, setFilters] = useState({
    search: '',
    isActive: undefined,
    level: undefined,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Consulta de datos con React Query v5
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['categorias', filters, currentPage],
    queryFn: () => fetchCategorias(filters),
    staleTime: 5000,
    retry: 1,
    onError: (err) => {
      toast({
        title: "Error de conexión",
        description: `No se pudo conectar con el servidor: ${err.message}`,
        variant: "destructive",
      });
    },
    placeholderData: (previousData) => previousData, // Reemplazo de keepPreviousData
  });

  // Manejadores de eventos
  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const handleStatusChange = (value) => {
    setFilters({ ...filters, isActive: value === 'all' ? undefined : value === 'true' });
  };

  const handleLevelChange = (value) => {
    setFilters({ ...filters, level: value === 'all' ? undefined : parseInt(value) });
  };

  const handleDeleteClick = (categoria) => {
    setCategoriaToDelete(categoria);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteCategoria(categoriaToDelete.id);
      toast({
        title: "Categoría eliminada",
        description: `La categoría "${categoriaToDelete.nombre}" ha sido eliminada correctamente.`,
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error al eliminar",
        description: `No se pudo eliminar la categoría: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setCategoriaToDelete(null);
    }
  };

  // Renderizado de la tabla de categorías
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categorías</h1>
        <Button onClick={() => navigate('/basic/categorias/add')} className="bg-primary">
          <Plus className="mr-2 h-4 w-4" /> Agregar Categoría
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Filtros</CardTitle>
          <CardDescription>Filtra las categorías por diversos criterios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="search" className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Input
                  id="search"
                  placeholder="Buscar por nombre o código..."
                  value={filters.search}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="status" className="text-sm font-medium">Estado</label>
              <Select onValueChange={handleStatusChange} defaultValue="all">
                <SelectTrigger id="status">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Activo</SelectItem>
                  <SelectItem value="false">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="level" className="text-sm font-medium">Nivel</label>
              <Select onValueChange={handleLevelChange} defaultValue="all">
                <SelectTrigger id="level">
                  <SelectValue placeholder="Todos los niveles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="0">Nivel 0 (Raíz)</SelectItem>
                  <SelectItem value="1">Nivel 1</SelectItem>
                  <SelectItem value="2">Nivel 2</SelectItem>
                  <SelectItem value="3">Nivel 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" onClick={() => {
            setFilters({
              search: '',
              isActive: undefined,
              level: undefined,
            });
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
            <CardDescription>No se pudieron cargar las categorías</CardDescription>
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
                    <TableHead>Nivel</TableHead>
                    <TableHead>Ruta</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.results?.length ? (
                    data.results.map((categoria) => (
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
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        No se encontraron categorías
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
                  ¿Estás seguro de que deseas eliminar la categoría "{categoriaToDelete?.nombre}"?
                  Esta acción no se puede deshacer.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={confirmDelete}>
                  Eliminar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}