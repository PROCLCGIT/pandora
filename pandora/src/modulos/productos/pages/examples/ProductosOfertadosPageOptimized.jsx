/**
 * Ejemplo optimizado de ProductosOfertadosPage usando el nuevo sistema centralizado
 * Muestra cómo migrar de la API antigua a la nueva con prefetch y skeletons
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../../hooks/use-toast';
import { productosOfertadosQuery } from '../../api/productosQueryService.js';
import { ProductosListSkeleton } from '../../components/skeletons/ProductosSkeleton.jsx';
import { usePrefetchProductos } from '../../components/prefetch/ProductosPrefetchWrapper.jsx';

// Componentes de UI (usando los existentes como ejemplo)
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';

/**
 * Hook customizado para manejar filtros y paginación
 */
const useProductosFilters = () => {
  const [filters, setFilters] = useState({
    search: '',
    categoria: '',
    proveedor: '',
    page: 1,
    page_size: 12
  });

  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1 // Reset page cuando cambian otros filtros
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      categoria: '',
      proveedor: '',
      page: 1,
      page_size: 12
    });
  };

  return {
    filters,
    updateFilters,
    resetFilters
  };
};

/**
 * Componente de tarjeta de producto optimizado
 */
const ProductoCard = ({ producto, onEdit, onDelete, onView }) => {
  const prefetch = usePrefetchProductos();

  // Prefetch del detalle cuando se hace hover
  const handleMouseEnter = () => {
    prefetch.prefetchDetalleOfertado(producto.id);
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onMouseEnter={handleMouseEnter}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold truncate">
            {producto.nombre}
          </CardTitle>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {producto.code}
          </span>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Imagen del producto */}
        {producto.imagen_principal && (
          <div className="mb-3">
            <img
              src={producto.imagen_principal}
              alt={producto.nombre}
              className="w-full h-32 object-cover rounded-md"
              loading="lazy"
            />
          </div>
        )}

        {/* Información básica */}
        <div className="space-y-2 mb-4">
          <p className="text-sm text-gray-600 line-clamp-2">
            {producto.descripcion}
          </p>
          
          {producto.categoria_nombre && (
            <span className="inline-block text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {producto.categoria_nombre}
            </span>
          )}
          
          {producto.proveedor_nombre && (
            <span className="inline-block text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              {producto.proveedor_nombre}
            </span>
          )}
        </div>

        {/* Precios */}
        {(producto.precio_venta || producto.precio_costo) && (
          <div className="border-t pt-2 mb-4">
            {producto.precio_venta && (
              <p className="text-lg font-bold text-green-600">
                ${Number(producto.precio_venta).toLocaleString()}
              </p>
            )}
            {producto.precio_costo && (
              <p className="text-sm text-gray-500">
                Costo: ${Number(producto.precio_costo).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Acciones */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(producto.id)}
            className="flex-1"
          >
            Ver
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(producto.id)}
            className="flex-1"
          >
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(producto.id)}
            className="flex-1"
          >
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Componente principal optimizado
 */
const ProductosOfertadosPageOptimized = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { filters, updateFilters, resetFilters } = useProductosFilters();

  // Usar el nuevo servicio centralizado
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    isPlaceholderData
  } = productosOfertadosQuery.useList(filters, {
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // Mutation para eliminar
  const deleteMutation = productosOfertadosQuery.useDelete({
    toast,
    onSuccess: () => {
      toast({
        title: "Producto eliminado",
        description: "El producto se ha eliminado exitosamente",
      });
    }
  });

  // Memoizar cálculos pesados
  const paginationInfo = useMemo(() => {
    if (!data) return { totalPages: 0, currentPage: 1, totalItems: 0 };
    
    return {
      totalPages: Math.ceil(data.count / filters.page_size),
      currentPage: filters.page,
      totalItems: data.count
    };
  }, [data, filters.page, filters.page_size]);

  // Handlers
  const handleSearch = (searchTerm) => {
    updateFilters({ search: searchTerm, page: 1 });
  };

  const handlePageChange = (newPage) => {
    updateFilters({ page: newPage });
  };

  const handleEdit = (id) => {
    navigate(`/productos/productos-ofertados/edit/${id}`);
  };

  const handleView = (id) => {
    navigate(`/productos/productos-ofertados/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    navigate('/productos/productos-ofertados/add');
  };

  // Estados de error
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="text-center space-y-4">
          <div className="text-6xl">😔</div>
          <h2 className="text-2xl font-bold text-gray-900">
            Error al cargar productos
          </h2>
          <p className="text-gray-600 max-w-md">
            {error?.response?.data?.message || error?.message || 'Error desconocido'}
          </p>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Productos Ofertados</h1>
          <p className="text-gray-600 mt-1">
            Gestiona tu catálogo de productos ofertados
          </p>
        </div>
        <Button onClick={handleAddNew}>
          Agregar Producto
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Input
              placeholder="Buscar productos..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" onClick={resetFilters}>
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Indicador de carga */}
      {isFetching && (
        <div className="text-center py-2">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
            <span className="text-sm text-gray-600">Actualizando...</span>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      {isLoading ? (
        <ProductosListSkeleton count={6} />
      ) : (
        <>
          {/* Información de resultados */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Mostrando {data?.results?.length || 0} de {paginationInfo.totalItems} productos
            </p>
            
            {/* Indicador de datos obsoletos */}
            {isPlaceholderData && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                Datos anteriores
              </span>
            )}
          </div>

          {/* Grid de productos */}
          {data?.results?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.results.map((producto) => (
                <ProductoCard
                  key={producto.id}
                  producto={producto}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron productos
              </h3>
              <p className="text-gray-600 mb-4">
                {filters.search ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer producto'}
              </p>
              <Button onClick={handleAddNew}>
                Agregar Primer Producto
              </Button>
            </div>
          )}

          {/* Paginación */}
          {paginationInfo.totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(Math.max(1, filters.page - 1))}
                disabled={filters.page <= 1}
              >
                Anterior
              </Button>
              
              <span className="flex items-center px-4 py-2 text-sm">
                Página {paginationInfo.currentPage} de {paginationInfo.totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => handlePageChange(Math.min(paginationInfo.totalPages, filters.page + 1))}
                disabled={filters.page >= paginationInfo.totalPages}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductosOfertadosPageOptimized;