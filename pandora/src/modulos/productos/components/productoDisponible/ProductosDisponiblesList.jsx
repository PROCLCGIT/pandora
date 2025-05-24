// /pandora/src/modulos/productos/components/productoDisponible/ProductosDisponiblesList.jsx

import { useNavigate } from 'react-router-dom';
import { Package, DollarSign, PiggyBank, Activity, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/modulos/basic/components/data/DataTable';
import { ActionButtons } from '@/modulos/basic/components/ui/ActionButtons';

/**
 * Componente que muestra una lista de productos disponibles con acciones
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.data - Datos paginados de productos disponibles
 * @param {boolean} props.isLoading - Indica si los datos están cargando
 * @param {boolean} props.isError - Indica si hubo un error en la carga
 * @param {Object} props.error - Objeto de error si hubo alguno
 * @param {Function} props.refetch - Función para recargar los datos
 * @param {Function} props.onDeleteClick - Función para manejar el clic en eliminar
 * @param {Object} props.pagination - Configuración de paginación
 * @returns {JSX.Element} Tabla de productos disponibles
 */
export default function ProductosDisponiblesList({ 
  data, 
  isLoading, 
  isError, 
  error, 
  refetch, 
  onDeleteClick,
  pagination,
  categoriasList = [],
  marcasList = [],
  unidadesList = [],
  procedenciasList = []
}) {
  const navigate = useNavigate();

  const columns = [
    {
      header: 'Imagen',
      accessor: 'imagenes',
      cell: (producto) => {
        // Obtener la primera imagen o la imagen principal
        const imagen = producto.imagenes?.find(img => img.is_primary) || producto.imagenes?.[0];
        
        // Intentar obtener la URL de la imagen en este orden de prioridad:
        // 1. thumbnail_url
        // 2. webp_url
        // 3. imagen_url
        // 4. original_url
        // 5. imagen (campo directo)
        // Usar las URLs enviadas desde el backend, que incluyen el timestamp
        const imageUrl = imagen?.urls?.thumbnail || 
                      imagen?.urls?.webp || 
                      imagen?.urls?.original || 
                      imagen?.thumbnail_url || 
                      imagen?.webp_url || 
                      imagen?.imagen_url || 
                      imagen?.original_url || 
                      (imagen?.imagen ? `/media/${imagen.imagen}` : null);
        
        if (imageUrl) {
          return (
            <div className="flex items-center justify-center">
              <img 
                src={imageUrl} 
                alt={imagen.alt_text || `Miniatura de ${producto.nombre}`}
                className="w-12 h-12 object-cover rounded border border-gray-200"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center"><svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                }}
              />
            </div>
          );
        }
        
        return (
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Código',
      accessor: 'code',
      cell: (producto) => (
        <Badge variant="outline" className="font-mono bg-blue-50 text-blue-800 border-blue-200">
          {producto.code}
        </Badge>
      )
    },
    {
      header: 'Nombre',
      accessor: 'nombre',
      cell: (producto) => (
        <div className="font-medium flex items-center text-gray-800">
          <Package className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
          <span className="truncate" title={producto.nombre}>{producto.nombre}</span>
        </div>
      )
    },
    {
      header: 'Marca/Modelo',
      accessor: 'id_marca.nombre',
      cell: (producto) => {
        const marcaId = producto.id_marca;
        const marcaNombre = marcasList?.find(m => m.id === marcaId)?.nombre || 
                          producto.id_marca?.nombre || 
                          producto.marca_nombre || 
                          'Sin marca';
                          
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{marcaNombre}</span>
            <span className="text-xs text-gray-500">{producto.modelo || 'Sin modelo'}</span>
          </div>
        );
      }
    },
    {
      header: 'Categoría',
      accessor: 'id_categoria.nombre',
      cell: (producto) => {
        const categoriaId = producto.id_categoria;
        const categoriaNombre = categoriasList?.find(cat => cat.id === categoriaId)?.nombre || 
                                producto.id_categoria?.nombre || 
                                producto.categoria_nombre || 
                                'Sin categoría';
                                
        return (
          <div className="flex items-center">
            <Tag className="h-4 w-4 mr-1 text-indigo-500" />
            <span className="text-sm">{categoriaNombre}</span>
          </div>
        );
      }
    },
    {
      header: 'Procedencia',
      accessor: 'procedencia.nombre',
      cell: (producto) => {
        const procedenciaId = producto.procedencia;
        const procedenciaNombre = procedenciasList?.find(proc => proc.id === procedenciaId)?.nombre || 
                                  producto.procedencia?.nombre || 
                                  producto.procedencia_nombre || 
                                  'No especificada';
                                  
        return <span className="text-sm">{procedenciaNombre}</span>;
      }
    },
    {
      header: 'Precios',
      accessor: 'precio_venta_privado',
      cell: (producto) => (
        <div className="flex flex-col">
          <div className="flex items-center text-sm text-green-700">
            <DollarSign className="h-3 w-3 mr-1" />
            <span>{new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(producto.precio_venta_privado)}</span>
          </div>
          <div className="flex items-center text-xs text-blue-700 mt-1">
            <PiggyBank className="h-3 w-3 mr-1" />
            <span>SIE: {new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(producto.precio_sie_referencial)}</span>
          </div>
        </div>
      )
    },
    {
      header: 'TZ',
      accessor: 'tz_referencial',
      cell: (producto) => (
        <div className="flex items-center">
          <Activity className="h-4 w-4 mr-1 text-purple-500" />
          <span className="font-semibold">{producto.tz_referencial}%</span>
        </div>
      )
    },
    {
      header: 'Estado',
      accessor: 'is_active',
      cell: (producto) => (
        producto.is_active ? (
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
      cell: (producto) => (
        <ActionButtons 
          onView={() => {
            console.log(`[DEBUG] Navigating to detail view for producto disponible ID: ${producto.id}`);
            console.log(`[DEBUG] Full producto object:`, producto);
            console.log(`[DEBUG] Target URL: /productos/productos-disponibles/${producto.id}`);
            navigate(`/productos/productos-disponibles/${producto.id}`);
          }}
          onEdit={() => navigate(`/productos/productos-disponibles/edit/${producto.id}`)}
          onDelete={() => onDeleteClick(producto)}
        />
      )
    }
  ];

  return (
    <DataTable 
      columns={columns}
      data={data?.results}
      isLoading={isLoading}
      isError={isError}
      errorMessage={error?.message}
      onRetry={refetch}
      emptyMessage="No se encontraron productos disponibles que coincidan con la búsqueda."
      pagination={pagination}
    />
  );
}