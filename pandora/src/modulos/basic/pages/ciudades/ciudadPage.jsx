// /pandora/src/modulos/basic/pages/ciudades/ciudadPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Building } from 'lucide-react';

// Importaciones del servicio de ciudad
import { useCiudades, useDeleteCiudad } from '../../api/ciudadService';

// Importar hook de búsqueda personalizado para debounce
import { useSearch } from '@/hooks/custom/useSearch';

import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
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

export default function CiudadPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filters, setFilters] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ciudadToDelete, setCiudadToDelete] = useState(null);
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

  // Consulta de datos con useCiudades
  const { data, isLoading, isError, error, refetch } = useCiudades({
    ...filters,
    search: debouncedSearch,
    page: currentPage,
    page_size: pageSize
  }, {
    keepPreviousData: true,
    onError: (error) => {
      toast({
        title: "Error al cargar datos",
        description: `No se pudieron cargar las ciudades: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutación para eliminar
  const deleteCiudadMutation = useDeleteCiudad({
    onSuccess: () => {
      toast({
        title: "Ciudad eliminada",
        description: ciudadToDelete 
          ? `La ciudad "${ciudadToDelete.nombre}" ha sido eliminada correctamente.`
          : "La ciudad ha sido eliminada correctamente.",
      });
    },
    onError: (error) => {
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
        setDeleteDialogOpen(false);
        setCiudadToDelete(null);
        refetch();
      }
    });
  };

  // Obtener lista única de provincias para el filtro
  const provincias = data?.results ? Array.from(new Set(data.results.map(ciudad => ciudad.provincia))).sort() : [];

  // Definición de columnas para la tabla
  const columns = [
    {
      header: 'Nombre',
      accessor: 'nombre',
      cell: (ciudad) => (
        <div className="font-medium flex items-center text-gray-800">
          <Building className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
          <span className="truncate" title={ciudad.nombre}>{ciudad.nombre}</span>
        </div>
      )
    },
    {
      header: 'Provincia',
      accessor: 'provincia',
      cell: (ciudad) => (
        <span className="text-gray-700">
          {ciudad.provincia}
        </span>
      )
    },
    {
      header: 'Código',
      accessor: 'code',
      cell: (ciudad) => (
        <Badge variant="outline" className="font-mono bg-blue-50 text-blue-800 border-blue-200">
          {ciudad.code || 'N/A'}
        </Badge>
      )
    },
    {
      header: 'Acciones',
      accessor: 'id',
      style: { textAlign: 'center', width: '7rem' },
      cell: (ciudad) => (
        <ActionButtons 
          onView={() => navigate(`/basic/ciudades/${ciudad.id}`)}
          onEdit={() => navigate(`/basic/ciudades/edit/${ciudad.id}`)}
          onDelete={() => handleDeleteClick(ciudad)}
        />
      )
    }
  ];

  // Renderizado de la página
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Cabecera de la página */}
      <PageHeader 
        icon={<Building size={40} strokeWidth={1.5} />}
        title="Gestión de Ciudades"
        description="Administra las ciudades donde se ofrecen servicios."
        action={{
          label: "Agregar Ciudad",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => navigate('/basic/ciudades/add')
        }}
      />

      {/* Tarjeta de filtros */}
      <FilterCard
        title="Filtros de Búsqueda"
        description="Busca ciudades por nombre, código o provincia."
        icon={<Filter className="mr-2 h-5 w-5 text-blue-600" />}
        onClear={() => {
          setSearchValue('');
          setFilters({});
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <label htmlFor="provincia" className="text-sm font-medium">Provincia</label>
            <Select onValueChange={handleProvinciaChange} defaultValue="all">
              <SelectTrigger id="provincia" className="h-9 border-blue-200 focus:border-blue-400">
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
      </FilterCard>
      
      <div className="mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/basic/ciudades/infinite')}
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
        emptyMessage="No se encontraron ciudades que coincidan con la búsqueda."
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
    </div>
  );
}