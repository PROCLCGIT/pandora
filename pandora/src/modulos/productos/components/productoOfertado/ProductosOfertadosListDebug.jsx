// Debug version of ProductosOfertadosList

import { Package, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/modulos/basic/components/data/DataTable';
import { useNavigate } from 'react-router-dom';
import { ActionButtons } from '@/modulos/basic/components/ui/ActionButtons';

export default function ProductosOfertadosList({ 
  data, 
  isLoading, 
  isError, 
  error, 
  refetch, 
  onDeleteClick,
  pagination,
  categoriasList = [],
  especialidadesList = [],
  isLoadingEspecialidades
}) {
  const navigate = useNavigate();
  
  // DEBUG: Log data
  console.log('ProductosOfertadosList - data:', data);
  console.log('ProductosOfertadosList - results:', data?.results);

  const columns = [
    {
      header: 'DEBUG Imagen',
      accessor: 'imagenes',
      style: { width: '200px', textAlign: 'center' },
      cell: (producto) => {
        console.log('Producto:', producto.nombre, 'Imagenes:', producto.imagenes);
        
        const primeraImagen = producto.imagenes?.find(img => img.is_primary) || producto.imagenes?.[0];
        
        if (primeraImagen) {
          console.log('Primera imagen:', primeraImagen);
          console.log('Thumbnail URL:', primeraImagen.thumbnail_url);
          
          const thumbnailUrl = primeraImagen.thumbnail_url || primeraImagen.imagen_url;
          
          return (
            <div className="flex flex-col items-center">
              <div className="mb-2 text-xs text-gray-600">
                <div>URL: {thumbnailUrl}</div>
                <div>Tipo: {typeof thumbnailUrl}</div>
              </div>
              {thumbnailUrl && (
                <img
                  src={thumbnailUrl}
                  alt={producto.nombre}
                  className="w-24 h-24 object-cover rounded border-2 border-gray-300"
                  onError={(e) => {
                    console.error('Error loading image:', thumbnailUrl);
                    e.target.style.border = '2px solid red';
                  }}
                  onLoad={(e) => {
                    console.log('Image loaded successfully:', thumbnailUrl);
                    e.target.style.border = '2px solid green';
                  }}
                />
              )}
            </div>
          );
        }
        
        return (
          <div className="text-center text-gray-500">
            <Package className="h-6 w-6 mx-auto" />
            <div className="text-xs">Sin imagen</div>
          </div>
        );
      }
    },
    {
      header: 'Código',
      accessor: 'code',
      style: { width: '120px' }
    },
    {
      header: 'Nombre',
      accessor: 'nombre',
      cell: (row) => (
        <div className="font-medium">{row.nombre}</div>
      )
    },
    {
      header: 'Categoría',
      accessor: 'categoria_nombre',
      style: { width: '150px' }
    },
    {
      header: 'Especialidad',
      accessor: 'especialidad_nombre',
      style: { width: '150px' },
      cell: (row) => {
        return row.especialidad_nombre || '-';
      }
    },
    {
      header: 'Estado',
      accessor: 'is_active',
      style: { width: '100px', textAlign: 'center' },
      cell: (row) => (
        <Badge variant={row.is_active ? "success" : "secondary"}>
          {row.is_active ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    },
    {
      header: 'Acciones',
      accessor: 'id',
      style: { width: '150px', textAlign: 'center' },
      cell: (row) => (
        <ActionButtons
          onView={() => navigate(`/productos/ofertados/${row.id}`)}
          onEdit={() => navigate(`/productos/ofertados/${row.id}/editar`)}
          onDelete={() => onDeleteClick?.(row)}
          viewTooltip="Ver detalles del producto"
          editTooltip="Editar producto"
          deleteTooltip="Eliminar producto"
        />
      )
    },
  ];

  return (
    <DataTable 
      columns={columns}
      data={data?.results}
      isLoading={isLoading}
      isError={isError}
      errorMessage={error?.message}
      onRetry={refetch}
      emptyMessage="No se encontraron productos ofertados que coincidan con la búsqueda."
      pagination={pagination}
    />
  );
}