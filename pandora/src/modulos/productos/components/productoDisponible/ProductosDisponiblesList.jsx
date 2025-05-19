// /pandora/src/modulos/productos/components/productoDisponible/ProductosDisponiblesList.jsx

import { useNavigate } from 'react-router-dom';
import { Package, DollarSign, PiggyBank, Activity } from 'lucide-react';
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
  pagination
}) {
  const navigate = useNavigate();

  const columns = [
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
      cell: (producto) => (
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{producto.id_marca?.nombre || 'Sin marca'}</span>
          <span className="text-xs text-gray-500">{producto.modelo || 'Sin modelo'}</span>
        </div>
      )
    },
    {
      header: 'Procedencia',
      accessor: 'procedencia.nombre',
      cell: (producto) => (
        <span className="text-sm">{producto.procedencia?.nombre || 'No especificada'}</span>
      )
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
          onView={() => navigate(`/productos/productos-disponibles/${producto.id}`)}
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