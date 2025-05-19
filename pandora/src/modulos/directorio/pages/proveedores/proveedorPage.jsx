// /pandora/src/modulos/directorio/pages/proveedores/proveedorPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Building, Globe } from 'lucide-react';

// Importaciones del servicio de proveedor
import { useProveedores, useDeleteProveedor } from '../../api/proveedorService';

// Servicios adicionales para obtener datos relacionados
import { useCiudades } from '@/modulos/basic/api/ciudadService';

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
import { PageHeader } from '@/modulos/basic/components/layout/PageHeader';
import { FilterCard } from '@/modulos/basic/components/layout/FilterCard';
import { SearchInput } from '@/modulos/basic/components/ui/SearchInput';
import { ProveedoresList } from '../../components/proveedores/ProveedoresList';

export default function ProveedorPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filters, setFilters] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [proveedorToDelete, setProveedorToDelete] = useState(null);
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

  // Cargar datos relacionados para los filtros
  const { data: ciudadesData } = useCiudades({ page_size: 100 });

  // Consulta de datos con useProveedores
  const { data, isLoading, isError, error, refetch } = useProveedores({
    ...filters,
    search: debouncedSearch,
    page: currentPage,
    page_size: pageSize
  }, {
    keepPreviousData: true,
    onError: (error) => {
      toast({
        title: "Error al cargar datos",
        description: `No se pudieron cargar los proveedores: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutación para eliminar
  const deleteProveedorMutation = useDeleteProveedor({
    onSuccess: () => {
      toast({
        title: "Proveedor eliminado",
        description: proveedorToDelete 
          ? `El proveedor "${proveedorToDelete.nombre}" ha sido eliminado correctamente.`
          : "El proveedor ha sido eliminado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar",
        description: `No se pudo eliminar el proveedor: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Manejadores de eventos
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleFilterChange = (filterName, value) => {
    setCurrentPage(1);
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters };
      if (value === 'all') {
        delete newFilters[filterName];
      } else {
        newFilters[filterName] = value;
      }
      // For boolean filters that come as strings 'true'/'false'
      if (value === 'true' || value === 'false') {
        newFilters[filterName] = value === 'true';
      }
      return newFilters;
    });
  };

  const handleCiudadChange = (value) => {
    handleFilterChange('ciudad', value === 'all' ? 'all' : value);
  };

  const handleTipoPrimarioChange = (value) => {
    handleFilterChange('tipo_primario', value);
  };

  const handleActivoChange = (value) => {
    handleFilterChange('activo', value);
  };

  const handleDeleteClick = (proveedor) => {
    setProveedorToDelete(proveedor);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteProveedorMutation.mutate(proveedorToDelete.id, {
      onSettled: () => {
        setDeleteDialogOpen(false);
        setProveedorToDelete(null);
        refetch();
      }
    });
  };

  // Renderizado de la página
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Cabecera de la página */}
      <PageHeader 
        icon={<Building size={40} strokeWidth={1.5} />}
        title="Gestión de Proveedores"
        description="Administra los proveedores de la empresa y su información de contacto."
        action={{
          label: "Nuevo Proveedor",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => navigate('/directorio/proveedores/add')
        }}
      />

      {/* Tarjeta de filtros */}
      <FilterCard
        title="Filtros de Búsqueda"
        description="Busca proveedores por nombre, RUC o ubicación."
        icon={<Filter className="mr-2 h-5 w-5 text-blue-600" />}
        onClear={() => {
          setSearchValue('');
          setFilters({});
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="search" className="text-sm font-medium">Buscar</label>
            <SearchInput 
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Buscar por nombre o RUC..."
              debouncedValue={debouncedSearch}
              inputProps={{ id: "search" }}
            />
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="ciudad" className="text-sm font-medium">Ciudad</label>
            <Select onValueChange={handleCiudadChange} defaultValue="all">
              <SelectTrigger id="ciudad" className="h-9 border-blue-200 focus:border-blue-400">
                <SelectValue placeholder="Todas las ciudades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {ciudadesData?.results?.map(ciudad => (
                  <SelectItem key={ciudad.id} value={ciudad.id.toString()}>
                    {ciudad.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label htmlFor="tipo" className="text-sm font-medium">Tipo</label>
            <Select onValueChange={handleTipoPrimarioChange} defaultValue="all">
              <SelectTrigger id="tipo" className="h-9 border-blue-200 focus:border-blue-400">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Primarios</SelectItem>
                <SelectItem value="false">Secundarios</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label htmlFor="activo" className="text-sm font-medium">Estado</label>
            <Select onValueChange={handleActivoChange} defaultValue="all">
              <SelectTrigger id="activo" className="h-9 border-blue-200 focus:border-blue-400">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Activos</SelectItem>
                <SelectItem value="false">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FilterCard>
      
      <div className="mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/directorio/proveedores/infinite')}
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          Ver con paginación infinita
        </Button>
      </div>

      {/* Tabla de datos */}
      <ProveedoresList 
        data={data}
        isLoading={isLoading}
        isError={isError}
        error={error}
        refetch={refetch}
        onDeleteClick={handleDeleteClick}
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
              ¿Estás seguro de que deseas eliminar el proveedor "{proveedorToDelete?.nombre}"?
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
              disabled={deleteProveedorMutation.isPending}
            >
              {deleteProveedorMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}