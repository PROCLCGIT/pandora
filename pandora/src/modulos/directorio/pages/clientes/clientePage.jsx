// /pandora/src/modulos/directorio/pages/clientes/clientePage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Building2, Users, MapPin, SlidersHorizontal, Layers } from 'lucide-react';

// Importaciones del servicio de cliente
import { useClientes, useDeleteCliente } from '../../api/clienteService';

// Servicios adicionales para obtener datos relacionados
import { useZonas } from '@/modulos/basic/api/zonaService';
import { useTiposCliente } from '@/modulos/basic/api/tipoClienteService';
import { useCiudades } from '@/modulos/basic/api/ciudadService';
import { useTags } from '../../api/tagService';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Importar componentes personalizados
import { PageHeader } from '@/modulos/basic/components/layout/PageHeader';
import { CollapsibleFilterCard } from '@/modulos/basic/components/layout/CollapsibleFilterCard';
import { SearchInput } from '@/modulos/basic/components/ui/SearchInput';
import { ClientesList } from '../../components/clientes/ClientesList';

// Nuevos componentes de filtros
import TagsFilter from '../../components/filters/TagsFilter';
import ActiveFilters from '../../components/filters/ActiveFilters';
import QuickFilters from '../../components/filters/QuickFilters';

export default function ClientePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filters, setFilters] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
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

  // Efecto para actualizar los filtros cuando cambian las tags seleccionadas
  useEffect(() => {
    setCurrentPage(1);
    setFilters(prevFilters => ({ 
      ...prevFilters, 
      tags: selectedTags.length > 0 ? selectedTags.join(',') : undefined 
    }));
  }, [selectedTags]);

  // Cargar datos relacionados para los filtros
  const { data: zonasData } = useZonas({ page_size: 100 });
  const { data: tiposClienteData } = useTiposCliente({ page_size: 100 });
  const { data: ciudadesData } = useCiudades({ page_size: 100 });
  const { data: tagsData } = useTags({ page_size: 100 });

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

  const handleTagsChange = (tags) => {
    setSelectedTags(tags);
  };

  const handleQuickFilter = (quickFilters) => {
    // Aplicar filtros rápidos
    const newFilters = { ...filters };
    
    Object.entries(quickFilters).forEach(([key, value]) => {
      if (key === 'tag_name') {
        // Buscar tag por nombre y seleccionarla
        const tag = tagsData?.results?.find(t => t.name.toLowerCase() === value.toLowerCase());
        if (tag) {
          setSelectedTags([tag.id]);
        }
      } else if (key === 'tipo_cliente_name') {
        // Buscar tipo de cliente por nombre
        const tipo = tiposClienteData?.results?.find(t => t.nombre.toLowerCase() === value.toLowerCase());
        if (tipo) {
          newFilters.tipo_cliente = tipo.id.toString();
        }
      } else {
        newFilters[key] = value;
      }
    });
    
    setFilters(newFilters);
  };

  const handleRemoveFilter = (filterKey, tagId) => {
    if (filterKey === 'search') {
      setSearchValue('');
    } else if (filterKey === 'tag' && tagId) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      const newFilters = { ...filters };
      delete newFilters[filterKey];
      setFilters(newFilters);
    }
  };

  const handleClearAllFilters = () => {
    setSearchValue('');
    setFilters({});
    setSelectedTags([]);
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
        actions={[
          {
            label: "Nuevo Cliente",
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate('/directorio/clientes/add')
          },
          {
            label: "",
            icon: <Layers className="h-4 w-4" />,
            onClick: () => navigate('/directorio/clientes/infinite'),
            variant: "outline",
            title: "Ver con paginación infinita"
          }
        ]}
      />

      {/* Filtros rápidos */}
      <QuickFilters
        onQuickFilter={handleQuickFilter}
        activeQuickFilter={null}
      />

      {/* Filtros activos */}
      <ActiveFilters
        filters={{ ...filters, search: searchValue, tags: selectedTags }}
        tiposCliente={tiposClienteData?.results || []}
        ciudades={ciudadesData?.results || []}
        zonas={zonasData?.results || []}
        tags={tagsData?.results || []}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
      />

      {/* Tarjeta de filtros mejorada */}
      <CollapsibleFilterCard
        title="Filtros de Búsqueda"
        icon={<SlidersHorizontal className="mr-2 h-4 w-4 text-blue-600" />}
        onClear={handleClearAllFilters}
        defaultExpanded={false}
      >
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="basic">Filtros Básicos</TabsTrigger>
            <TabsTrigger value="advanced">Filtros Avanzados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Búsqueda principal */}
              <div className="md:col-span-2">
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="search" className="text-sm font-medium">Búsqueda General</label>
                  <SearchInput 
                    value={searchValue}
                    onChange={handleSearchChange}
                    placeholder="Buscar por nombre, RUC, alias, dirección..."
                    debouncedValue={debouncedSearch}
                    inputProps={{ 
                      id: "search",
                      className: "h-10" 
                    }}
                  />
                </div>
              </div>
              
              {/* Tipo de Cliente y Estado en la misma fila */}
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="tipoCliente" className="text-sm font-medium">Tipo de Cliente</label>
                <Select onValueChange={handleTipoClienteChange} defaultValue="all">
                  <SelectTrigger id="tipoCliente" className="h-9 border-blue-200 focus:border-blue-400">
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {tiposClienteData?.results?.map(tipo => (
                      <SelectItem key={tipo.id} value={tipo.id.toString()}>
                        {tipo.nombre}
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
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="true">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        Activos
                      </div>
                    </SelectItem>
                    <SelectItem value="false">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        Inactivos
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Ubicación */}
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="ciudad" className="text-sm font-medium flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Ciudad
                </label>
                <Select onValueChange={handleCiudadChange} defaultValue="all">
                  <SelectTrigger id="ciudad" className="h-9 border-blue-200 focus:border-blue-400">
                    <SelectValue placeholder="Todas las ciudades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las ciudades</SelectItem>
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
                    <SelectItem value="all">Todas las zonas</SelectItem>
                    {zonasData?.results?.map(zona => (
                      <SelectItem key={zona.id} value={zona.id.toString()}>
                        {zona.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags Filter */}
              <TagsFilter
                value={selectedTags}
                onChange={handleTagsChange}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CollapsibleFilterCard>

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