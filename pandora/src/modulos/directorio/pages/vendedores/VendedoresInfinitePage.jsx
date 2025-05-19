// /pandora/src/modulos/directorio/pages/vendedores/VendedoresInfinitePage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteVendedores, useDeleteVendedor } from '../../api/vendedorService';
import { useProveedores } from '../../api/proveedorService';
import { useSearch } from '@/hooks/custom/useSearch';
import { useToast } from '@/hooks/use-toast';
import { useInView } from 'react-intersection-observer';

import { 
  Users, 
  Filter, 
  Plus, 
  ChevronLeft, 
  Info, 
  Phone, 
  Mail,
  BadgeCheck,
  BadgeX,
  Building
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

export default function VendedoresInfinitePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filters, setFilters] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vendedorToDelete, setVendedorToDelete] = useState(null);
  
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
  const { data: proveedoresData } = useProveedores({ page_size: 100 });
  
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
  } = useInfiniteVendedores({
    ...filters,
    search: debouncedSearch,
    page_size: 15
  }, {
    onError: (error) => {
      toast({
        title: "Error al cargar datos",
        description: `No se pudieron cargar los vendedores: ${error.message}`,
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
  const deleteVendedorMutation = useDeleteVendedor({
    onSuccess: () => {
      toast({
        title: "Vendedor eliminado",
        description: vendedorToDelete 
          ? `El vendedor "${vendedorToDelete.nombre}" ha sido eliminado correctamente.`
          : "El vendedor ha sido eliminado correctamente.",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar",
        description: `No se pudo eliminar el vendedor: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Manejadores de eventos
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };
  
  const handleProveedorChange = (value) => {
    setFilters({ ...filters, proveedor: value === 'all' ? undefined : value });
  };
  
  const handleActivoChange = (value) => {
    if (value === 'all') {
      const { activo, ...restFilters } = filters;
      setFilters(restFilters);
    } else {
      setFilters({ ...filters, activo: value === 'true' });
    }
  };
  
  const handleDeleteClick = (vendedor) => {
    setVendedorToDelete(vendedor);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    deleteVendedorMutation.mutate(vendedorToDelete.id, {
      onSettled: () => {
        setDeleteDialogOpen(false);
        setVendedorToDelete(null);
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
        icon={<Users size={40} strokeWidth={1.5} />}
        title="Vendedores - Vista Infinita"
        description="Visualiza todos los vendedores con paginación infinita."
        action={{
          label: "Nuevo Vendedor",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => navigate('/directorio/vendedores/add')
        }}
      />
      
      <div className="mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/directorio/vendedores')}
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver a vista normal
        </Button>
      </div>
      
      {/* Tarjeta de filtros */}
      <FilterCard
        title="Filtros de Búsqueda"
        description="Busca vendedores por nombre, proveedor o estado."
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
              placeholder="Buscar por nombre o contacto..."
              debouncedValue={debouncedSearch}
              inputProps={{ id: "search" }}
            />
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="proveedor" className="text-sm font-medium">Proveedor</label>
            <Select onValueChange={handleProveedorChange} defaultValue="all">
              <SelectTrigger id="proveedor" className="h-9 border-blue-200 focus:border-blue-400">
                <SelectValue placeholder="Todos los proveedores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {proveedoresData?.results?.map(proveedor => (
                  <SelectItem key={proveedor.id} value={proveedor.id.toString()}>
                    {proveedor.nombre}
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

      {/* Grid de tarjetas de vendedores */}
      <div className="mt-6">
        {isLoading && flattenedData.length === 0 ? (
          <div className="flex justify-center items-center min-h-60 w-full bg-gray-50 rounded-md border border-gray-200">
            <div className="flex flex-col items-center text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
              <p>Cargando vendedores...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="p-6 text-center min-h-60 bg-red-50 rounded-md border border-red-200">
            <div className="flex flex-col items-center text-red-700">
              <Info className="h-10 w-10 mb-2 text-red-500" />
              <h3 className="font-semibold text-lg mb-1">Error al cargar datos</h3>
              <p className="mb-3">{error?.message || 'No se pudieron obtener los vendedores'}</p>
              <Button variant="outline" onClick={() => refetch()}>Reintentar</Button>
            </div>
          </div>
        ) : flattenedData.length === 0 ? (
          <div className="p-6 text-center min-h-60 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex flex-col items-center text-gray-500">
              <Users className="h-10 w-10 mb-2 text-gray-400" />
              <h3 className="font-semibold text-lg mb-1">No se encontraron vendedores</h3>
              <p className="mb-3">No hay vendedores que coincidan con los criterios de búsqueda.</p>
              <Button variant="outline" onClick={() => navigate('/directorio/vendedores/add')}>
                <Plus className="h-4 w-4 mr-1" />
                Agregar Nuevo Vendedor
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flattenedData.map(vendedor => (
              <div 
                key={vendedor.id} 
                className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-4 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 truncate flex items-center" title={vendedor.nombre}>
                        <Users className="h-4 w-4 mr-1.5 text-indigo-500 flex-shrink-0" />
                        <span>{vendedor.nombre}</span>
                      </h3>
                    </div>
                    {vendedor.activo ? (
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
                  
                  <div className="flex items-center mt-2 text-sm">
                    <Building className="h-4 w-4 mr-1.5 text-blue-500 flex-shrink-0" />
                    <a 
                      className="hover:underline cursor-pointer text-indigo-600" 
                      onClick={() => {
                        if (vendedor.proveedor) {
                          navigate(`/directorio/proveedores/${vendedor.proveedor}`);
                        }
                      }}
                    >
                      {vendedor.proveedor_nombre || 'Sin proveedor'}
                    </a>
                  </div>
                </div>
                
                <div className="px-4 py-2 bg-gray-50 text-sm">
                  <div className="flex items-center text-gray-600 mb-1">
                    <Mail className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-blue-600" />
                    <a href={`mailto:${vendedor.correo}`} className="truncate hover:text-blue-600 hover:underline">
                      {vendedor.correo}
                    </a>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-blue-600" />
                    <a href={`tel:${vendedor.telefono}`} className="hover:text-blue-600 hover:underline">
                      {vendedor.telefono}
                    </a>
                  </div>
                </div>
                
                <div className="px-4 py-2 border-t border-gray-100 flex justify-end items-center">
                  <div className="flex">
                    <ActionButtons 
                      onView={() => navigate(`/directorio/vendedores/${vendedor.id}`)}
                      onEdit={() => navigate(`/directorio/vendedores/edit/${vendedor.id}`)}
                      onDelete={() => handleDeleteClick(vendedor)}
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
                Cargando más vendedores...
              </>
            ) : (
              "Scroll para cargar más vendedores"
            )}
          </div>
        )}
        
        {!isLoading && !isError && !hasNextPage && flattenedData.length > 0 && (
          <div className="my-6 py-4 text-center text-sm text-gray-500">
            --- No hay más vendedores para mostrar ---
          </div>
        )}
      </div>
      
      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el vendedor "{vendedorToDelete?.nombre}"?
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
              disabled={deleteVendedorMutation.isPending}
            >
              {deleteVendedorMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}