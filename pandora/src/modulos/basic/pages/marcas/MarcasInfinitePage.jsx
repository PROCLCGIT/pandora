// /pandora/src/modulos/basic/pages/marcas/MarcasInfinitePage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Award, ArrowLeft } from 'lucide-react';

// Importaciones del servicio de marca
import { useInfiniteMarcas, useDeleteMarca } from '../../api/marcaService';

// Componente de lista con paginación infinita
import MarcasList from '../../components/marcas/MarcasList';

// Importar hook de búsqueda personalizado para debounce
import { useSearch } from '@/hooks/custom/useSearch';

import { Button } from '@/components/ui/button';
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
import { useToast } from '@/hooks/use-toast';

// Importar componentes personalizados
import { PageHeader } from '../../components/layout/PageHeader';
import { FilterCard } from '../../components/layout/FilterCard';
import { SearchInput } from '../../components/ui/SearchInput';

export default function MarcasInfinitePage() {
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
  } = useInfiniteMarcas({
    ...filters,
    search: debouncedSearch,
    page_size: 12
  }, {
    onError: (error) => {
      toast({
        title: "Error al cargar datos",
        description: `No se pudieron cargar las marcas: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutación para eliminar marca
  const deleteMarcaMutation = useDeleteMarca({
    onSuccess: (id) => {
      toast({
        title: "Marca eliminada",
        description: "La marca ha sido eliminada correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar",
        description: `No se pudo eliminar la marca: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Manejadores de eventos
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleStatusChange = (value) => {
    setFilters(prev => ({ ...prev, is_active: value === 'all' ? undefined : value === 'true' }));
  };

  const handleCountryChange = (value) => {
    setFilters(prev => ({ ...prev, country_origin: value === 'all' ? undefined : value }));
  };
  
  // Limpiar filtros
  const clearFilters = () => {
    setSearchValue('');
    setFilters({});
  };

  // Procesar los datos de paginación infinita para obtener una lista plana de marcas
  const marcas = data?.pages.flatMap(page => page.results) || [];

  // Obtener lista única de países para el filtro (considerando solo la primera página)
  const countries = data?.pages[0]?.results 
    ? Array.from(new Set(data.pages[0].results
        .filter(marca => marca.country_origin)
        .map(marca => marca.country_origin)))
        .sort() 
    : [];

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Cabecera de la página */}
      <PageHeader 
        icon={<Award size={40} strokeWidth={1.5} />}
        title="Marcas con Scroll Infinito"
        description="Visualiza las marcas con paginación dinámica al hacer scroll."
        action={{
          label: "Agregar Marca",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => navigate('/basic/marcas/add')
        }}
      />
      
      <div className="mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/basic/marcas')}
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a vista estándar
        </Button>
      </div>

      {/* Tarjeta de filtros */}
      <FilterCard
        title="Filtros de Búsqueda"
        description="Busca marcas por nombre, código, país o estado."
        icon={<Filter className="mr-2 h-5 w-5 text-blue-600" />}
        onClear={clearFilters}
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
              <SelectTrigger id="status" className="border-blue-200 focus:border-blue-400">
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
            <label htmlFor="country" className="text-sm font-medium">País de origen</label>
            <Select onValueChange={handleCountryChange} defaultValue="all">
              <SelectTrigger id="country" className="border-blue-200 focus:border-blue-400">
                <SelectValue placeholder="Todos los países" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {countries.map(country => (
                  <SelectItem key={country} value={country}>
                    {country}
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
      ) : marcas.length === 0 ? (
        <Card className="border-blue-100 shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-lg text-blue-800">No se encontraron marcas con los filtros seleccionados</p>
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
            <MarcasList
              marcas={marcas}
              onLoadMore={fetchNextPage}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onDelete={(id, options) => deleteMarcaMutation.mutate(id, options)}
              isDeletePending={deleteMarcaMutation.isPending}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}