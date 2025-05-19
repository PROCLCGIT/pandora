// /pandora/src/modulos/directorio/components/clientes/ClientesList.jsx

import { useNavigate } from 'react-router-dom';
import { Building2, BadgeCheck, BadgeX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/modulos/basic/components/data/DataTable';
import { ActionButtons } from '@/modulos/basic/components/ui/ActionButtons';

export const ClientesList = ({ 
  data,
  isLoading,
  isError,
  error,
  refetch,
  pagination,
  onDeleteClick
}) => {
  const navigate = useNavigate();

  // Definición de columnas para la tabla
  const columns = [
    {
      header: 'Nombre',
      accessor: 'nombre',
      cell: (cliente) => (
        <div className="font-medium flex items-center text-gray-800">
          <Building2 className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
          <span className="truncate" title={cliente.nombre}>{cliente.nombre}</span>
          {cliente.alias && (
            <Badge variant="outline" className="ml-2 text-xs">
              {cliente.alias}
            </Badge>
          )}
        </div>
      )
    },
    {
      header: 'RUC',
      accessor: 'ruc',
      cell: (cliente) => (
        <span className="font-mono text-sm text-gray-600" title={cliente.razon_social}>
          {cliente.ruc}
        </span>
      )
    },
    {
      header: 'Contacto',
      accessor: 'email',
      cell: (cliente) => (
        <div className="flex flex-col text-sm">
          <span className="text-gray-700">{cliente.email}</span>
          <span className="text-gray-500">{cliente.telefono}</span>
        </div>
      )
    },
    {
      header: 'Tipo',
      accessor: 'tipo_cliente',
      cell: (cliente) => (
        <Badge variant="outline" className="font-semibold bg-blue-50 text-blue-700 border-blue-200">
          {cliente.tipo_cliente?.nombre || 'Sin clasificar'}
        </Badge>
      )
    },
    {
      header: 'Estado',
      accessor: 'activo',
      cell: (cliente) => (
        cliente.activo ? (
          <div className="flex items-center text-emerald-700 font-medium">
            <BadgeCheck className="h-4 w-4 mr-1" />
            <span>Activo</span>
          </div>
        ) : (
          <div className="flex items-center text-gray-500 font-medium">
            <BadgeX className="h-4 w-4 mr-1" />
            <span>Inactivo</span>
          </div>
        )
      )
    },
    {
      header: 'Acciones',
      accessor: 'id',
      style: { textAlign: 'center', width: '8rem' },
      cell: (cliente) => (
        <ActionButtons 
          onView={() => navigate(`/directorio/clientes/${cliente.id}`)}
          onEdit={() => navigate(`/directorio/clientes/edit/${cliente.id}`)}
          onDelete={() => onDeleteClick(cliente)}
          viewTooltip="Ver detalles del cliente"
          editTooltip="Editar datos del cliente"
          deleteTooltip="Eliminar cliente"
        />
      )
    }
  ];

  // Renderizado del componente
  return (
    <DataTable 
      columns={columns}
      data={data?.results}
      isLoading={isLoading}
      isError={isError}
      errorMessage={error?.message}
      onRetry={refetch}
      emptyMessage="No se encontraron clientes que coincidan con la búsqueda."
      pagination={pagination}
    />
  );
};

export default ClientesList;