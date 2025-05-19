// /pandora/src/modulos/basic/pages/categorias/categoriaPage.jsx

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, BookOpen } from 'lucide-react';

// Importaciones del servicio de categoría
import { useCategories, useDeleteCategoria } from '../../api/categoriaService';

// Importar hook de búsqueda personalizado para debounce
import { useSearch } from '@/hooks/custom/useSearch';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Importar componentes personalizados
import { PageHeader } from '../../components/layout/PageHeader';
import { FilterCard } from '../../components/layout/FilterCard';
import { DataTable } from '../../components/data/DataTable';
import { ActionButtons } from '../../components/ui/ActionButtons';
import { SearchInput } from '../../components/ui/SearchInput';

export default function CategoriaPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    is_active: undefined,
    level: undefined,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Utilizar hook personalizado para la búsqueda con debounce
  const { 
    inputValue: searchValue, 
    setInputValue: setSearchValue, 
    debouncedValue: debouncedSearch 
  } = useSearch({
    initialValue: '',
    delay: 500,
  });
  
  // Efecto para actualizar los filtros cuando cambia el valor de búsqueda con debounce
  useEffect(() => {
    setCurrentPage(1);
    setFilters(prevFilters => ({ ...prevFilters, search: debouncedSearch }));
  }, [debouncedSearch]);
  
  // Efecto para resetear página cuando cambian otros filtros
  useEffect(() => {
    const hasNonSearchFilters = Object.entries(filters).some(
      ([key, value]) => key !== 'search' && value !== undefined
    );
    
    if (hasNonSearchFilters) {
      setCurrentPage(1);
    }
  }, [filters]);

  // Consulta de datos con useCategories
  const queryParams = useMemo(() => ({
    ...filters,
    search: debouncedSearch,
    page: currentPage,
    page_size: pageSize
  }), [filters, debouncedSearch, currentPage, pageSize]);

  const { data, isLoading, isError, error, refetch } = useCategories(
    queryParams, // Use the memoized params
    {
      keepPreviousData: true,
      onError: (error) => {
        toast({
          title: "Error al cargar datos",
          description: `No se pudieron cargar las categorías: ${error.message}`,
          variant: "destructive",
        });
      }
    }
  );

  // Mutación para eliminar
  const deleteCategoriaMutation = useDeleteCategoria({
    onSuccess: () => {
      toast({
        title: "Categoría eliminada",
        description: categoriaToDelete 
          ? `La categoría "${categoriaToDelete.nombre}" ha sido eliminada correctamente.`
          : "La categoría ha sido eliminada correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar",
        description: `No se pudo eliminar la categoría: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Manejadores de eventos
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleStatusChange = (value) => {
    setFilters({ ...filters, is_active: value === 'all' ? undefined : value === 'true' });
  };

  const handleLevelChange = (value) => {
    setFilters({ ...filters, level: value === 'all' ? undefined : parseInt(value) });
  };

  const handleDeleteClick = (categoria) => {
    setCategoriaToDelete(categoria);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteCategoriaMutation.mutate(categoriaToDelete.id, {
      onSettled: () => {
        setDeleteDialogOpen(false);
        setCategoriaToDelete(null);
        refetch();
      }
    });
  };

  // Definición de columnas para la tabla
  const columns = [
    {
      header: 'Nombre',
      accessor: 'nombre',
      cell: (categoria) => (
        <div className="font-medium flex items-center text-gray-800">
          <BookOpen className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
          <span className="truncate" title={categoria.nombre}>{categoria.nombre}</span>
        </div>
      )
    },
    {
      header: 'Código',
      accessor: 'code',
      cell: (categoria) => (
        <Badge variant="outline" className="font-mono bg-blue-50 text-blue-800 border-blue-200">
          {categoria.code || 'N/A'}
        </Badge>
      )
    },
    {
      header: 'Nivel',
      accessor: 'level',
      cell: (categoria) => (
        <span className="text-gray-700">
          {categoria.level}
        </span>
      )
    },
    {
      header: 'Ruta',
      accessor: 'path',
      cell: (categoria) => (
        <span className="text-xs font-mono bg-muted p-1 rounded">
          {categoria.path}
        </span>
      )
    },
    {
      header: 'Estado',
      accessor: 'is_active',
      cell: (categoria) => (
        categoria.is_active ? (
          <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>
        ) : (
          <Badge variant="secondary">Inactivo</Badge>
        )
      )
    },
    {
      header: 'Acciones',
      accessor: 'id',
      style: { textAlign: 'center', width: '7rem' },
      cell: (categoria) => (
        <ActionButtons 
          onView={() => navigate(`/basic/categorias/${categoria.id}`)}
          onEdit={() => navigate(`/basic/categorias/edit/${categoria.id}`)}
          onDelete={() => handleDeleteClick(categoria)}
        />
      )
    }
  ];

  // Renderizado de la página
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Cabecera de la página */}
      <PageHeader 
        icon={<BookOpen size={40} strokeWidth={1.5} />}
        title="Gestión de Categorías"
        description="Administra las categorías para clasificar productos y servicios."
        action={{
          label: "Agregar Categoría",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => navigate('/basic/categorias/add')
        }}
      />

      {/* Tarjeta de filtros */}
      <FilterCard
        title="Filtros de Búsqueda"
        description="Busca categorías por nombre, código, nivel o estado."
        icon={<Filter className="mr-2 h-5 w-5 text-blue-600" />}
        onClear={() => {
          setSearchValue('');
          setFilters({
            is_active: undefined,
            level: undefined,
          });
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="search" className="text-sm font-medium">Buscar</label>
            <SearchInput 
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Buscar por nombre o código..."
              debouncedValue={debouncedSearch}
              inputProps={{ id: "search" }}
            />
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="status" className="text-sm font-medium">Estado</label>
            <Select onValueChange={handleStatusChange} defaultValue="all">
              <SelectTrigger id="status" className="h-9 border-blue-200 focus:border-blue-400">
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
              <SelectTrigger id="level" className="h-9 border-blue-200 focus:border-blue-400">
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
      </FilterCard>
      
      <div className="mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/basic/categorias/infinite')}
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          Ver con paginación infinita
        </Button>
      </div>

      {/* Tabla de datos */}
      <DataTable 
        columns={columns}
        data={data?.results}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        onRetry={refetch}
        emptyMessage="No se encontraron categorías que coincidan con la búsqueda."
        pagination={{
          currentPage,
          totalPages: Math.ceil((data?.count || 0) / pageSize),
          totalItems: data?.count || 0,
          pageSize,
          onPageChange: setCurrentPage
        }}
      />

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
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteCategoriaMutation.isPending}
            >
              {deleteCategoriaMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}