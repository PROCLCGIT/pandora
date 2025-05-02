// pandora/src/modulos/basic/pages/marcas/MarcasInfinitePage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, ArrowLeft } from 'lucide-react';

// Importaciones del servicio de marca
import { useInfiniteMarcas, useDeleteMarca } from '../../api/marcaService';

// Componente de lista con paginación infinita
import MarcasList from '../../components/marcas/MarcasList';

// Importar hook de búsqueda personalizado para debounce
import { useSearch } from '@/hooks/custom/useSearch';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function MarcasInfinitePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filters, setFilters] = useState({});

  // Utilizar hook personalizado para la búsqueda con debounce
  const { inputValue: searchValue, setInputValue: setSearchValue, debouncedValue: debouncedSearch } = useSearch({
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
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/basic/marcas')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Marcas</h1>
          </div>
          <p className="text-muted-foreground">Vista con paginación infinita</p>
        </div>
        <Button onClick={() => navigate('/basic/marcas/add')} className="bg-primary">
          <Plus className="mr-2 h-4 w-4" /> Agregar Marca
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Filtros</CardTitle>
          <CardDescription>Filtra las marcas por diversos criterios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="search" className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Input
                  id="search"
                  placeholder="Buscar por nombre o código..."
                  value={searchValue}
                  onChange={handleSearchChange}
                />
                {searchValue && debouncedSearch !== searchValue && (
                  <div className="absolute right-2 top-2 text-xs text-muted-foreground">
                    Buscando...
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="status" className="text-sm font-medium">Estado</label>
              <Select onValueChange={handleStatusChange} defaultValue="all">
                <SelectTrigger id="status">
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
                <SelectTrigger id="country">
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
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" onClick={() => {
            // Resetear tanto el valor del input como los filtros
            setSearchValue('');
            setFilters({});
          }} className="mr-2">
            Limpiar Filtros
          </Button>
          <Button onClick={() => refetch()}>
            <Filter className="mr-2 h-4 w-4" /> Filtrar
          </Button>
        </CardFooter>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : isError ? (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Error al cargar datos</CardTitle>
            <CardDescription>No se pudieron cargar las marcas</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error?.message || 'Error desconocido'}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => refetch()} variant="outline">
              Intentar nuevamente
            </Button>
          </CardFooter>
        </Card>
      ) : marcas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-lg text-muted-foreground">No se encontraron marcas con los filtros seleccionados</p>
            <Button variant="outline" onClick={() => {
              setSearchValue('');
              setFilters({});
            }}>
              Limpiar filtros
            </Button>
          </CardContent>
        </Card>
      ) : (
        <MarcasList
          marcas={marcas}
          onLoadMore={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onDelete={(id, options) => deleteMarcaMutation.mutate(id, options)}
          isDeletePending={deleteMarcaMutation.isPending}
        />
      )}
    </div>
  );
}