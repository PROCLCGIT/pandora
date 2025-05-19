// /pandora/src/modulos/productos/pages/productosOfertados/ProductosOfertadosPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Package } from 'lucide-react';

// Importaciones del servicio de productos ofertados
import { useProductosOfertados, useDeleteProductoOfertado } from '../../api/productoOfertadoService';

// Importar servicios adicionales
import { useCategories } from '@/modulos/basic/api/categoriaService';
import { useEspecialidades } from '@/modulos/basic/api/especialidadService';

// Importar hook de búsqueda personalizado para debounce
import { useSearch } from '@/hooks/custom/useSearch';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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
import ProductosOfertadosList from '../../components/productoOfertado/ProductosOfertadosList';

export default function ProductosOfertadosPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filters, setFilters] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productoToDelete, setProductoToDelete] = useState(null);
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

  // Cargar datos de categorías para los filtros
  const { data: categoriasData } = useCategories({ page_size: 100 });

  // Cargar datos de especialidades para la tabla
  const { data: especialidadesData, isLoading: isLoadingEspecialidades } = useEspecialidades({ page_size: 100 });

  // Consulta de datos con useProductosOfertados
  const { data, isLoading, isError, error, refetch } = useProductosOfertados({
    ...filters,
    search: debouncedSearch,
    page: currentPage,
    page_size: pageSize
  }, {
    keepPreviousData: true,
    onError: (error) => {
      toast({
        title: "Error al cargar datos",
        description: `No se pudieron cargar los productos ofertados: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutación para eliminar
  const deleteProductoMutation = useDeleteProductoOfertado({
    onSuccess: () => {
      toast({
        title: "Producto eliminado",
        description: productoToDelete 
          ? `El producto "${productoToDelete.nombre}" ha sido eliminado correctamente.`
          : "El producto ha sido eliminado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar",
        description: `No se pudo eliminar el producto: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Manejadores de eventos
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleCategoriaChange = (value) => {
    setFilters({ ...filters, id_categoria: value === 'all' ? undefined : value });
  };

  const handleActivoChange = (value) => {
    setFilters({ ...filters, is_active: value === 'all' ? undefined : value === 'true' });
  };

  const handleDeleteClick = (producto) => {
    setProductoToDelete(producto);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteProductoMutation.mutate(productoToDelete.id, {
      onSettled: () => {
        setDeleteDialogOpen(false);
        setProductoToDelete(null);
        refetch();
      }
    });
  };

  // Renderizado de la página
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Cabecera de la página */}
      <PageHeader 
        icon={<Package size={40} strokeWidth={1.5} />}
        title="Productos Ofertados"
        description="Gestiona el catálogo de productos que la empresa ofrece a sus clientes."
        action={{
          label: "Nuevo Producto",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => navigate('/productos/productos-ofertados/add')
        }}
      />

      {/* Tarjeta de filtros */}
      <FilterCard
        title="Filtros de Búsqueda"
        description="Busca productos por nombre, código o categoría."
        icon={<Filter className="mr-2 h-5 w-5 text-blue-600" />}
        onClear={() => {
          setSearchValue('');
          setFilters({});
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="search" className="text-sm font-medium">Buscar</label>
            <SearchInput 
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Buscar por nombre, código o CUDIM..."
              debouncedValue={debouncedSearch}
              inputProps={{ id: "search" }}
            />
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="categoria" className="text-sm font-medium">Categoría</label>
            <Select onValueChange={handleCategoriaChange} defaultValue="all">
              <SelectTrigger id="categoria" className="h-9 border-blue-200 focus:border-blue-400">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categoriasData?.results?.map(categoria => (
                  <SelectItem key={categoria.id} value={categoria.id.toString()}>
                    {categoria.nombre}
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
          onClick={() => navigate('/productos/productos-ofertados/infinite')}
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          Ver con paginación infinita
        </Button>
      </div>

      {/* Tabla de datos */}
      <ProductosOfertadosList 
        data={data}
        isLoading={isLoading}
        isError={isError}
        error={error}
        refetch={refetch}
        onDeleteClick={handleDeleteClick}
        categoriasList={categoriasData?.results}
        especialidadesList={especialidadesData?.results}
        isLoadingEspecialidades={isLoadingEspecialidades}
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
              ¿Estás seguro de que deseas eliminar el producto "{productoToDelete?.nombre}"?
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
              disabled={deleteProductoMutation.isPending}
            >
              {deleteProductoMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}