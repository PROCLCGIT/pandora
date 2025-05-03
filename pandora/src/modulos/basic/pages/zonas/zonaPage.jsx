// /pandora/src/modulos/basic/pages/zonas/zonaPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Filter } from 'lucide-react';

// Importaciones del servicio de zona
import { useZonas, useDeleteZona } from '../../api/zonaService';

// Importar hook de búsqueda personalizado para debounce
import { useSearch } from '@/hooks/custom/useSearch';

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
import { Button } from '@/components/ui/button';

// Importar componentes personalizados
import { PageHeader } from '../../components/layout/PageHeader';
import { FilterCard } from '../../components/layout/FilterCard';
import { DataTable } from '../../components/data/DataTable';
import { ActionButtons } from '../../components/ui/ActionButtons';
import { SearchInput } from '../../components/ui/SearchInput';

export default function ZonaPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filters, setFilters] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [zonaToDelete, setZonaToDelete] = useState(null);
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
  
  // Effect to reset page when filters change (excluding search handled above)
  useEffect(() => {
    if (filters && Object.keys(filters).length > 1 || (Object.keys(filters).length === 1 && !filters.search)) {
        setCurrentPage(1);
    }
  }, [filters]);

  // Consulta de datos con useZonas
  const { data, isLoading, isError, error, refetch } = useZonas({
    ...filters,
    search: debouncedSearch,
    page: currentPage,
    page_size: pageSize
  }, {
    keepPreviousData: true,
    onError: (error) => {
      toast({
        title: "Error al cargar datos",
        description: `No se pudieron cargar las zonas: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutación para eliminar
  const deleteZonaMutation = useDeleteZona({
    onSuccess: () => {
      toast({
        title: "Zona eliminada",
        description: zonaToDelete 
          ? `La zona "${zonaToDelete.nombre}" ha sido eliminada correctamente.`
          : "La zona ha sido eliminada correctamente.",
      });
    },
    onError: (error) => {
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
        setDeleteDialogOpen(false);
        setZonaToDelete(null);
        refetch();
      }
    });
  };

  // Función para truncar texto largo
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Definición de columnas para la tabla
  const columns = [
    {
      header: 'Nombre',
      accessor: 'nombre',
      cell: (zona) => (
        <div className="font-medium flex items-center text-gray-800">
          <MapPin className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
          <span className="truncate" title={zona.nombre}>{zona.nombre}</span>
        </div>
      )
    },
    {
      header: 'Código',
      accessor: 'code',
      cell: (zona) => (
        <Badge variant="outline" className="font-mono bg-blue-50 text-blue-800 border-blue-200">
          {zona.code || 'N/A'}
        </Badge>
      )
    },
    {
      header: 'Cobertura',
      accessor: 'cobertura',
      cell: (zona) => (
        zona.cobertura ? (
          <span title={zona.cobertura}>
            {truncateText(zona.cobertura, 60)}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm italic">
            Sin descripción
          </span>
        )
      )
    },
    {
      header: 'Acciones',
      accessor: 'id',
      style: { textAlign: 'center', width: '7rem' },
      cell: (zona) => (
        <ActionButtons 
          onView={() => navigate(`/basic/zonas/${zona.id}`)}
          onEdit={() => navigate(`/basic/zonas/edit/${zona.id}`)}
          onDelete={() => handleDeleteClick(zona)}
        />
      )
    }
  ];

  // Renderizado de la página
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Cabecera de la página */}
      <PageHeader 
        icon={<MapPin size={40} strokeWidth={1.5} />}
        title="Gestión de Zonas"
        description="Administra las zonas geográficas de operación."
        action={{
          label: "Agregar Zona",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => navigate('/basic/zonas/add')
        }}
      />

      {/* Tarjeta de filtros */}
      <FilterCard
        title="Filtros de Búsqueda"
        description="Busca zonas por nombre, código o cobertura."
        icon={<Filter className="mr-2 h-5 w-5 text-blue-600" />}
        onClear={() => {
          setSearchValue('');
          setFilters({});
        }}
      >
        <div className="flex flex-col space-y-1.5">
          <label htmlFor="search" className="text-sm font-medium">Buscar</label>
          <SearchInput 
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Buscar por nombre, código o cobertura..."
            debouncedValue={debouncedSearch}
            inputProps={{ id: "search" }}
          />
        </div>
      </FilterCard>

      {/* Tabla de datos */}
      <DataTable 
        columns={columns}
        data={data?.results}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        onRetry={refetch}
        emptyMessage="No se encontraron zonas que coincidan con la búsqueda."
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
    </div>
  );
}