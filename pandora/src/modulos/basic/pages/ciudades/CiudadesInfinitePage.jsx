// /pandora/src/modulos/basic/pages/ciudades/CiudadesInfinitePage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Building, ArrowLeft } from 'lucide-react';

// Importaciones del servicio de ciudad
import { useInfiniteCiudades, useDeleteCiudad } from '../../api/ciudadService';

// Componente de lista con paginación infinita
import CiudadesList from '../../components/ciudades/CiudadesList';

// Importar hook de búsqueda personalizado para debounce
import { useSearch } from '@/hooks/custom/useSearch';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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
} from '@/components/ui/card';

// Importar componentes personalizados
import { PageHeader } from '../../components/layout/PageHeader';
import { FilterCard } from '../../components/layout/FilterCard';
import { SearchInput } from '../../components/ui/SearchInput';

export default function CiudadesInfinitePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filters, setFilters] = useState({});

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
    setFilters(prevFilters => ({ ...prevFilters, search: debouncedSearch }));
  }, [debouncedSearch]);

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
  } = useInfiniteCiudades({
    ...filters,
    search: debouncedSearch,
    page_size: 12
  }, {
    onError: (error) => {
      toast({
        title: "Error al cargar datos",
        description: `No se pudieron cargar las ciudades: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutación para eliminar ciudad
  const deleteCiudadMutation = useDeleteCiudad({
    onSuccess: (id) => {
      toast({
        title: "Ciudad eliminada",
        description: "La ciudad ha sido eliminada correctamente.",
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
    setFilters(prev => ({ ...prev, provincia: value === 'all' ? undefined : value }));
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSearchValue('');
    setFilters({});
  };

  // Procesar los datos de paginación infinita para obtener una lista plana de ciudades
  const ciudades = data?.pages.flatMap(page => page.results) || [];

  // Obtener lista única de provincias para el filtro (considerando solo la primera página)
  const provincias = data?.pages[0]?.results 
    ? Array.from(new Set(data.pages[0].results.map(ciudad => ciudad.provincia))).sort() 
    : [];

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Cabecera de la página */}
      <PageHeader 
        icon={<Building size={40} strokeWidth={1.5} />}
        title="Ciudades con Scroll Infinito"
        description="Visualiza las ciudades con paginación dinámica al hacer scroll."
        action={{
          label: "Agregar Ciudad",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => navigate('/basic/ciudades/add')
        }}
      />
      
      <div className="mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/basic/ciudades')}
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a vista estándar
        </Button>
      </div>

      {/* Tarjeta de filtros */}
      <FilterCard
        title="Filtros de Búsqueda"
        description="Busca ciudades por nombre, código o provincia."
        icon={<Filter className="mr-2 h-5 w-5 text-blue-600" />}
        onClear={clearFilters}
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
              <SelectTrigger id="provincia" className="border-blue-200 focus:border-blue-400">
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

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : isError ? (
        <Card className="border-destructive bg-red-50 shadow-md">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-red-800">Error al cargar datos</h3>
              <p className="text-red-600">{error?.message || 'Error desconocido'}</p>
              <Button 
                onClick={() => refetch()} 
                variant="outline" 
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                Intentar nuevamente
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : ciudades.length === 0 ? (
        <Card className="border-blue-100 shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-lg text-blue-800">No se encontraron ciudades con los filtros seleccionados</p>
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              Limpiar filtros
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-blue-100 shadow-md overflow-hidden">
          <CardContent className="p-0">
            <CiudadesList
              ciudades={ciudades}
              onLoadMore={fetchNextPage}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onDelete={(id, options) => deleteCiudadMutation.mutate(id, options)}
              isDeletePending={deleteCiudadMutation.isPending}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}