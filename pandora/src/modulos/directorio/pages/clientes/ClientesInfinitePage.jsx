// /pandora/src/modulos/directorio/pages/clientes/ClientesInfinitePage.jsx

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteClientes, useDeleteCliente } from '../../api/clienteService';
import { useZonas } from '@/modulos/basic/api/zonaService';
import { useTiposCliente } from '@/modulos/basic/api/tipoClienteService';
import { useCiudades } from '@/modulos/basic/api/ciudadService';
import { useSearch } from '@/hooks/custom/useSearch';
import { useToast } from '@/hooks/use-toast';
import { useInView } from 'react-intersection-observer';

import { 
  Building2, 
  Filter, 
  Plus, 
  ChevronLeft, 
  MapPin, 
  Info, 
  Phone, 
  Mail,
  BadgeCheck,
  BadgeX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

import { PageHeader } from '@/modulos/basic/components/layout/PageHeader';
import { FilterCard } from '@/modulos/basic/components/layout/FilterCard';
import { SearchInput } from '@/modulos/basic/components/ui/SearchInput';
import { ActionButtons } from '@/modulos/basic/components/ui/ActionButtons';

export default function ClientesInfinitePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filters, setFilters] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState(null);
  
  // Utilizar hook personalizado para la búsqueda con debounce
  const { 
    inputValue: searchValue, 
    setInputValue: setSearchValue, 
    debouncedValue: debouncedSearch 
  } = useSearch({
    initialValue: '',
    delay: 500,
  });
  
  // Hook para detectar cuándo el usuario llega al final de la lista
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  });
  
  // Cargar datos relacionados para los filtros
  const { data: zonasData } = useZonas({ page_size: 100 });
  const { data: tiposClienteData } = useTiposCliente({ page_size: 100 });
  const { data: ciudadesData } = useCiudades({ page_size: 100 });
  
  // Consulta de datos con paginación infinita
  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    refetch 
  } = useInfiniteClientes({
    ...filters,
    search: debouncedSearch,
    page_size: 15
  }, {
    onError: (error) => {
      toast({
        title: "Error al cargar datos",
        description: `No se pudieron cargar los clientes: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Efecto para cargar más datos cuando se llega al final de la lista
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);
  
  // Efecto para actualizar los filtros cuando cambia el valor de búsqueda con debounce
  useEffect(() => {
    setFilters(prevFilters => ({ ...prevFilters, search: debouncedSearch }));
  }, [debouncedSearch]);
  
  // Mutación para eliminar
  const deleteClienteMutation = useDeleteCliente({
    onSuccess: () => {
      toast({
        title: "Cliente eliminado",
        description: clienteToDelete 
          ? `El cliente "${clienteToDelete.nombre}" ha sido eliminado correctamente.`
          : "El cliente ha sido eliminado correctamente.",
      });
      refetch();
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
      }
    });
  };
  
  // Aplanar los datos de paginación infinita
  const flattenedData = data?.pages.flatMap(page => page.results) || [];
  
  // Renderizado de la página
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Cabecera de la página */}
      <PageHeader 
        icon={<Building2 size={40} strokeWidth={1.5} />}
        title="Clientes - Vista Infinita"
        description="Visualiza todos los clientes con paginación infinita."
        action={{
          label: "Nuevo Cliente",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => navigate('/directorio/clientes/add')
        }}
      />
      
      <div className="mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/directorio/clientes')}
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver a vista normal
        </Button>
      </div>
      
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

      {/* Grid de tarjetas de clientes */}
      <div className="mt-6">
        {isLoading && flattenedData.length === 0 ? (
          <div className="flex justify-center items-center min-h-60 w-full bg-gray-50 rounded-md border border-gray-200">
            <div className="flex flex-col items-center text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
              <p>Cargando clientes...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="p-6 text-center min-h-60 bg-red-50 rounded-md border border-red-200">
            <div className="flex flex-col items-center text-red-700">
              <Info className="h-10 w-10 mb-2 text-red-500" />
              <h3 className="font-semibold text-lg mb-1">Error al cargar datos</h3>
              <p className="mb-3">{error?.message || 'No se pudieron obtener los clientes'}</p>
              <Button variant="outline" onClick={() => refetch()}>Reintentar</Button>
            </div>
          </div>
        ) : flattenedData.length === 0 ? (
          <div className="p-6 text-center min-h-60 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex flex-col items-center text-gray-500">
              <Building2 className="h-10 w-10 mb-2 text-gray-400" />
              <h3 className="font-semibold text-lg mb-1">No se encontraron clientes</h3>
              <p className="mb-3">No hay clientes que coincidan con los criterios de búsqueda.</p>
              <Button variant="outline" onClick={() => navigate('/directorio/clientes/add')}>
                <Plus className="h-4 w-4 mr-1" />
                Agregar Nuevo Cliente
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flattenedData.map(cliente => (
              <div 
                key={cliente.id} 
                className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-4 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 truncate" title={cliente.nombre}>
                        {cliente.nombre}
                      </h3>
                      {cliente.alias && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {cliente.alias}
                        </Badge>
                      )}
                    </div>
                    {cliente.activo ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <BadgeCheck className="h-3.5 w-3.5 mr-1" />
                        Activo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                        <BadgeX className="h-3.5 w-3.5 mr-1" />
                        Inactivo
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-1">{cliente.razon_social}</p>
                  <p className="text-sm font-mono text-gray-600">{cliente.ruc}</p>
                  
                  <div className="flex items-center mt-3 text-xs text-gray-500">
                    <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                    <span className="truncate">
                      {cliente.ciudad?.nombre || 'N/A'}
                      {cliente.zona?.nombre && <span className="text-gray-400 ml-1">({cliente.zona.nombre})</span>}
                    </span>
                  </div>
                </div>
                
                <div className="px-4 py-2 bg-gray-50 text-sm">
                  <div className="flex items-center text-gray-600 mb-1">
                    <Mail className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-gray-400" />
                    <span className="truncate">{cliente.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-gray-400" />
                    <span>{cliente.telefono}</span>
                  </div>
                </div>
                
                <div className="px-4 py-2 border-t border-gray-100 flex justify-between items-center">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {cliente.tipo_cliente?.nombre || 'Sin clasificar'}
                  </Badge>
                  
                  <div className="flex">
                    <ActionButtons 
                      onView={() => navigate(`/directorio/clientes/${cliente.id}`)}
                      onEdit={() => navigate(`/directorio/clientes/edit/${cliente.id}`)}
                      onDelete={() => handleDeleteClick(cliente)}
                      compact={true}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Elemento de referencia para detección de scroll y carga infinita */}
        {!isLoading && !isError && hasNextPage && (
          <div 
            ref={loadMoreRef} 
            className="my-6 py-4 text-center text-sm text-gray-500 flex justify-center items-center"
          >
            {isFetchingNextPage ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
                Cargando más clientes...
              </>
            ) : (
              "Scroll para cargar más clientes"
            )}
          </div>
        )}
        
        {!isLoading && !isError && !hasNextPage && flattenedData.length > 0 && (
          <div className="my-6 py-4 text-center text-sm text-gray-500">
            --- No hay más clientes para mostrar ---
          </div>
        )}
      </div>
      
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