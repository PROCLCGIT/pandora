// /pandora/src/modulos/directorio/pages/clientes/clientePage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Building2, Users, MapPin } from 'lucide-react';

// Importaciones del servicio de cliente
import { useClientes, useDeleteCliente } from '../../api/clienteService';

// Servicios adicionales para obtener datos relacionados
import { useZonas } from '@/modulos/basic/api/zonaService';
import { useTiposCliente } from '@/modulos/basic/api/tipoClienteService';
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
import { ClientesList } from '../../components/clientes/ClientesList';

export default function ClientePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filters, setFilters] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState(null);
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
  const { data: zonasData } = useZonas({ page_size: 100 });
  const { data: tiposClienteData } = useTiposCliente({ page_size: 100 });
  const { data: ciudadesData } = useCiudades({ page_size: 100 });

  // Consulta de datos con useClientes
  const { data, isLoading, isError, error, refetch } = useClientes({
    ...filters,
    search: debouncedSearch,
    page: currentPage,
    page_size: pageSize
  }, {
    keepPreviousData: true,
    onError: (error) => {
      toast({
        title: "Error al cargar datos",
        description: `No se pudieron cargar los clientes: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutación para eliminar
  const deleteClienteMutation = useDeleteCliente({
    onSuccess: () => {
      toast({
        title: "Cliente eliminado",
        description: clienteToDelete 
          ? `El cliente "${clienteToDelete.nombre}" ha sido eliminado correctamente.`
          : "El cliente ha sido eliminado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar",
        description: `No se pudo eliminar el cliente: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Manejadores de eventos
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleTipoClienteChange = (value) => {
    setFilters({ ...filters, tipo_cliente: value === 'all' ? undefined : value });
  };

  const handleZonaChange = (value) => {
    setFilters({ ...filters, zona: value === 'all' ? undefined : value });
  };

  const handleCiudadChange = (value) => {
    setFilters({ ...filters, ciudad: value === 'all' ? undefined : value });
  };

  const handleActivoChange = (value) => {
    setFilters({ ...filters, activo: value === 'all' ? undefined : value === 'true' });
  };

  const handleDeleteClick = (cliente) => {
    setClienteToDelete(cliente);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteClienteMutation.mutate(clienteToDelete.id, {
      onSettled: () => {
        setDeleteDialogOpen(false);
        setClienteToDelete(null);
        refetch();
      }
    });
  };

  // Renderizado de la página
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Cabecera de la página */}
      <PageHeader 
        icon={<Building2 size={40} strokeWidth={1.5} />}
        title="Gestión de Clientes"
        description="Administra los clientes de la empresa y su información de contacto."
        action={{
          label: "Nuevo Cliente",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => navigate('/directorio/clientes/add')
        }}
      />

      {/* Tarjeta de filtros */}
      <FilterCard
        title="Filtros de Búsqueda"
        description="Busca clientes por nombre, alias, RUC o ubicación."
        icon={<Filter className="mr-2 h-5 w-5 text-blue-600" />}
        onClear={() => {
          setSearchValue('');
          setFilters({});
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="search" className="text-sm font-medium">Buscar</label>
            <SearchInput 
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Buscar por nombre, RUC o alias..."
              debouncedValue={debouncedSearch}
              inputProps={{ id: "search" }}
            />
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="tipoCliente" className="text-sm font-medium">Tipo de Cliente</label>
            <Select onValueChange={handleTipoClienteChange} defaultValue="all">
              <SelectTrigger id="tipoCliente" className="h-9 border-blue-200 focus:border-blue-400">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {tiposClienteData?.results?.map(tipo => (
                  <SelectItem key={tipo.id} value={tipo.id.toString()}>
                    {tipo.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <label htmlFor="zona" className="text-sm font-medium">Zona</label>
            <Select onValueChange={handleZonaChange} defaultValue="all">
              <SelectTrigger id="zona" className="h-9 border-blue-200 focus:border-blue-400">
                <SelectValue placeholder="Todas las zonas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {zonasData?.results?.map(zona => (
                  <SelectItem key={zona.id} value={zona.id.toString()}>
                    {zona.nombre}
                  </SelectItem>
                ))}
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
          onClick={() => navigate('/directorio/clientes/infinite')}
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          Ver con paginación infinita
        </Button>
      </div>

      {/* Tabla de datos */}
      <ClientesList 
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
              ¿Estás seguro de que deseas eliminar el cliente "{clienteToDelete?.nombre}"?
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
              disabled={deleteClienteMutation.isPending}
            >
              {deleteClienteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}