// /pandora/src/modulos/basic/pages/marcas/marcaPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Globe, Award } from 'lucide-react';

// Importaciones del servicio de marca
import { useMarcas, useDeleteMarca } from '../../api/marcaService';

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
import { PageHeader } from '../../components/layout/PageHeader';
import { FilterCard } from '../../components/layout/FilterCard';
import { DataTable } from '../../components/data/DataTable';
import { ActionButtons } from '../../components/ui/ActionButtons';
import { SearchInput } from '../../components/ui/SearchInput';

export default function MarcaPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    is_active: undefined,
    country_origin: undefined,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [marcaToDelete, setMarcaToDelete] = useState(null);
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
  
  // Efecto para resetear página cuando cambian otros filtros
  useEffect(() => {
    const hasNonSearchFilters = Object.entries(filters).some(
      ([key, value]) => key !== 'search' && value !== undefined
    );
    
    if (hasNonSearchFilters) {
      setCurrentPage(1);
    }
  }, [filters]);

  // Consulta de datos con useMarcas
  const { data, isLoading, isError, error, refetch } = useMarcas({
    ...filters,
    search: debouncedSearch,
    page: currentPage,
    page_size: pageSize
  }, {
    keepPreviousData: true,
    onError: (error) => {
      toast({
        title: "Error al cargar datos",
        description: `No se pudieron cargar las marcas: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutación para eliminar
  const deleteMarcaMutation = useDeleteMarca({
    onSuccess: () => {
      toast({
        title: "Marca eliminada",
        description: marcaToDelete 
          ? `La marca "${marcaToDelete.nombre}" ha sido eliminada correctamente.`
          : "La marca ha sido eliminada correctamente.",
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
    setFilters({ ...filters, is_active: value === 'all' ? undefined : value === 'true' });
  };

  const handleCountryChange = (value) => {
    setFilters({ ...filters, country_origin: value === 'all' ? undefined : value });
  };

  const handleDeleteClick = (marca) => {
    setMarcaToDelete(marca);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteMarcaMutation.mutate(marcaToDelete.id, {
      onSettled: () => {
        setDeleteDialogOpen(false);
        setMarcaToDelete(null);
        refetch();
      }
    });
  };

  // Obtener lista única de países para el filtro
  const countries = data?.results 
    ? Array.from(new Set(data.results.filter(marca => marca.country_origin).map(marca => marca.country_origin))).sort() 
    : [];

  // Definición de columnas para la tabla
  const columns = [
    {
      header: 'Nombre',
      accessor: 'nombre',
      cell: (marca) => (
        <div className="font-medium flex items-center text-gray-800">
          <Award className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
          <span className="truncate" title={marca.nombre}>{marca.nombre}</span>
        </div>
      )
    },
    {
      header: 'Código',
      accessor: 'code',
      cell: (marca) => (
        <Badge variant="outline" className="font-mono bg-blue-50 text-blue-800 border-blue-200">
          {marca.code || 'N/A'}
        </Badge>
      )
    },
    {
      header: 'País',
      accessor: 'country_origin',
      cell: (marca) => (
        <span className="text-gray-700">
          {marca.country_origin || '—'}
        </span>
      )
    },
    {
      header: 'Sitio web',
      accessor: 'website',
      cell: (marca) => (
        marca.website ? (
          <a 
            href={marca.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:underline"
          >
            <Globe className="h-3 w-3 mr-1" />
            {marca.website.replace(/^https?:\/\//, '')}
          </a>
        ) : (
          <span className="text-muted-foreground text-sm italic">Sin sitio web</span>
        )
      )
    },
    {
      header: 'Estado',
      accessor: 'is_active',
      cell: (marca) => (
        marca.is_active ? (
          <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>
        ) : (
          <Badge variant="secondary">Inactivo</Badge>
        )
      )
    },
    {
      header: 'Acciones',
      accessor: 'id',
      style: { textAlign: 'center', width: '7rem' },
      cell: (marca) => (
        <ActionButtons 
          onView={() => navigate(`/basic/marcas/${marca.id}`)}
          onEdit={() => navigate(`/basic/marcas/edit/${marca.id}`)}
          onDelete={() => handleDeleteClick(marca)}
        />
      )
    }
  ];

  // Renderizado de la página
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Cabecera de la página */}
      <PageHeader 
        icon={<Award size={40} strokeWidth={1.5} />}
        title="Gestión de Marcas"
        description="Administra las marcas de productos y equipos médicos."
        action={{
          label: "Agregar Marca",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => navigate('/basic/marcas/add')
        }}
      />

      {/* Tarjeta de filtros */}
      <FilterCard
        title="Filtros de Búsqueda"
        description="Busca marcas por nombre, código, país o estado."
        icon={<Filter className="mr-2 h-5 w-5 text-blue-600" />}
        onClear={() => {
          setSearchValue('');
          setFilters({
            is_active: undefined,
            country_origin: undefined,
          });
        }}
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
              <SelectTrigger id="status" className="h-9 border-blue-200 focus:border-blue-400">
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
              <SelectTrigger id="country" className="h-9 border-blue-200 focus:border-blue-400">
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
      
      <div className="mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/basic/marcas/infinite')}
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          Ver con paginación infinita
        </Button>
      </div>

      {/* Tabla de datos */}
      <DataTable 
        columns={columns}
        data={data?.results}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        onRetry={refetch}
        emptyMessage="No se encontraron marcas que coincidan con la búsqueda."
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
              ¿Estás seguro de que deseas eliminar la marca "{marcaToDelete?.nombre}"?
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
              disabled={deleteMarcaMutation.isPending}
            >
              {deleteMarcaMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}