// pandora/src/modulos/basic/pages/zonas/ZonasInfinitePage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, ArrowLeft } from 'lucide-react';

// Importaciones del servicio de zona
import { useInfiniteZonas, useDeleteZona } from '../../api/zonaService';

// Componente de lista con paginación infinita
import ZonasList from '../../components/zonas/ZonasList';

// Importar hook de búsqueda personalizado para debounce
import { useSearch } from '@/hooks/custom/useSearch';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function ZonasInfinitePage() {
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
  } = useInfiniteZonas({
    ...filters,
    search: debouncedSearch,
    page_size: 12
  }, {
    onError: (error) => {
      toast({
        title: "Error al cargar datos",
        description: `No se pudieron cargar las zonas: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutación para eliminar zona
  const deleteZonaMutation = useDeleteZona({
    onSuccess: (id) => {
      toast({
        title: "Zona eliminada",
        description: "La zona ha sido eliminada correctamente.",
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

  // Procesar los datos de paginación infinita para obtener una lista plana de zonas
  const zonas = data?.pages?.flatMap(page => {
    // Asegurarnos de que se puedan mostrar las ciudades si están disponibles
    return page.results.map(zona => {
      if (zona.ciudades) {
        return zona;
      }
      return { ...zona, ciudades: [] };
    });
  }) || [];

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/basic/zonas')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Zonas</h1>
          </div>
          <p className="text-muted-foreground">Vista con paginación infinita</p>
        </div>
        <Button onClick={() => navigate('/basic/zonas/add')} className="bg-primary">
          <Plus className="mr-2 h-4 w-4" /> Agregar Zona
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Filtros</CardTitle>
          <CardDescription>Filtra las zonas por diversos criterios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="search" className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Input
                  id="search"
                  placeholder="Buscar por nombre, código o cobertura..."
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
            <CardDescription>No se pudieron cargar las zonas</CardDescription>
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
      ) : zonas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-lg text-muted-foreground">No se encontraron zonas con los filtros seleccionados</p>
            <Button variant="outline" onClick={() => {
              setSearchValue('');
              setFilters({});
            }}>
              Limpiar filtros
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ZonasList
          zonas={zonas}
          onLoadMore={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onDelete={(id, options) => deleteZonaMutation.mutate(id, options)}
          isDeletePending={deleteZonaMutation.isPending}
        />
      )}
    </div>
  );
}