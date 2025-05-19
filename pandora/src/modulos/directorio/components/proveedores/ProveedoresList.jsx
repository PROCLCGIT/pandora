// /pandora/src/modulos/directorio/components/proveedores/ProveedoresList.jsx

import { useNavigate } from 'react-router-dom';
import { Building, MapPin, Mail, Phone, BadgeCheck, BadgeX, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/modulos/basic/components/data/DataTable';
import { ActionButtons } from '@/modulos/basic/components/ui/ActionButtons';

export const ProveedoresList = ({ 
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
      cell: (proveedor) => (
        <div className="font-medium flex items-center text-gray-800">
          <Building className="h-4 w-4 mr-2 text-indigo-500 flex-shrink-0" />
          <span className="truncate" title={proveedor.nombre}>{proveedor.nombre}</span>
        </div>
      )
    },
    {
      header: 'RUC',
      accessor: 'ruc',
      cell: (proveedor) => (
        <span className="font-mono text-sm text-gray-600" title={proveedor.razon_social}>
          {proveedor.ruc}
        </span>
      )
    },
    {
      header: 'Contacto',
      accessor: 'correo',
      cell: (proveedor) => (
        <div className="flex flex-col text-sm">
          <div className="flex items-center text-gray-700">
            <Mail className="h-3.5 w-3.5 mr-1 text-gray-400 flex-shrink-0" />
            <span className="truncate">{proveedor.correo}</span>
          </div>
          <div className="flex items-center text-gray-500">
            <Phone className="h-3.5 w-3.5 mr-1 text-gray-400 flex-shrink-0" />
            <span>{proveedor.telefono}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Ciudad',
      accessor: 'ciudad',
      cell: (proveedor) => (
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400 flex-shrink-0" />
          <span>
            {proveedor.ciudad?.nombre || 'N/A'}
          </span>
        </div>
      )
    },
    {
      header: 'Estado',
      accessor: 'activo',
      cell: (proveedor) => (
        <div className="flex items-center">
          {proveedor.activo ? (
            <Badge variant="outline" className="font-semibold bg-green-50 text-green-700 border-green-200">
              <BadgeCheck className="h-3.5 w-3.5 mr-1" />
              <span>Activo</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="font-semibold bg-gray-100 text-gray-700 border-gray-200">
              <BadgeX className="h-3.5 w-3.5 mr-1" />
              <span>Inactivo</span>
            </Badge>
          )}
        </div>
      )
    },
    {
      header: 'Tipo',
      accessor: 'tipo_primario',
      cell: (proveedor) => (
        proveedor.tipo_primario ? (
          <Badge variant="outline" className="font-semibold bg-purple-50 text-purple-700 border-purple-200">
            <Globe className="h-3.5 w-3.5 mr-1" />
            <span>Primario</span>
          </Badge>
        ) : (
          <Badge variant="outline" className="font-semibold bg-blue-50 text-blue-700 border-blue-200">
            <span>Secundario</span>
          </Badge>
        )
      )
    },
    {
      header: 'Acciones',
      accessor: 'id',
      style: { textAlign: 'center', width: '8rem' },
      cell: (proveedor) => (
        <ActionButtons 
          onView={() => navigate(`/directorio/proveedores/${proveedor.id}`)}
          onEdit={() => navigate(`/directorio/proveedores/edit/${proveedor.id}`)}
          onDelete={() => onDeleteClick(proveedor)}
          viewTooltip="Ver detalles del proveedor"
          editTooltip="Editar datos del proveedor"
          deleteTooltip="Eliminar proveedor"
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
      emptyMessage="No se encontraron proveedores que coincidan con la búsqueda."
      pagination={pagination}
    />
  );
};

export default ProveedoresList;