// /pandora/src/modulos/directorio/components/contactos/ContactosList.jsx

import { useNavigate } from 'react-router-dom';
import { 
  UserCircle, 
  ExternalLink, 
  RefreshCw, 
  Mail, 
  Phone,
  Building,
  Info,
  BadgeCheck,
  BadgeX
} from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { ActionButtons } from '@/modulos/basic/components/ui/ActionButtons';

export function ContactosList({ 
  data, 
  isLoading,
  isError,
  error,
  refetch,
  onDeleteClick,
  pagination = null 
}) {
  const navigate = useNavigate();

  // No hay datos disponibles
  if (isLoading) {
    return (
      <div className="border rounded-md shadow-sm overflow-hidden">
        <div className="p-8 flex justify-center items-center bg-white">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-gray-500">Cargando contactos...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="border border-red-200 rounded-md shadow-sm overflow-hidden bg-red-50">
        <div className="p-8 flex flex-col items-center">
          <Info className="h-12 w-12 text-red-500 mb-3" />
          <h3 className="font-semibold text-red-800 mb-2">Error al cargar los datos</h3>
          <p className="text-red-600 mb-4">{error?.message || 'No se pudieron obtener los contactos'}</p>
          <Button onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>Reintentar</span>
          </Button>
        </div>
      </div>
    );
  }
  
  if (!data || !data.results || data.results.length === 0) {
    return (
      <div className="border rounded-md shadow-sm overflow-hidden bg-gray-50">
        <div className="p-8 flex flex-col items-center">
          <UserCircle className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="font-semibold text-gray-700 mb-2">No hay contactos</h3>
          <p className="text-gray-500 mb-4">No se encontraron contactos que coincidan con los criterios de búsqueda.</p>
          <Button 
            onClick={() => navigate('/directorio/contactos/add')}
            variant="outline"
            className="gap-2"
          >
            <span>Agregar Nuevo Contacto</span>
          </Button>
        </div>
      </div>
    );
  }
  
  // Renderizado de la paginación
  const renderPagination = () => {
    if (!pagination) return null;
    
    const { currentPage, totalPages, onPageChange } = pagination;
    
    return (
      <div className="py-4 px-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Mostrando página {currentPage} de {totalPages || 1}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Anterior
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="border rounded-md shadow-sm overflow-hidden">
      <div className="overflow-x-auto bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Nombre</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Ingerencia</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.results.map((contacto) => (
              <TableRow key={contacto.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold">{contacto.nombre}</span>
                    </div>
                    {contacto.alias && (
                      <Badge variant="outline" className="mt-1 w-fit">
                        {contacto.alias}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-blue-600" />
                      <a 
                        href={`mailto:${contacto.email}`}
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        {contacto.email}
                        <ExternalLink className="h-3 w-3 ml-1 text-gray-400" />
                      </a>
                    </div>
                    <div className="flex items-center text-sm gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-blue-600" />
                      <a 
                        href={`tel:${contacto.telefono}`}
                        className="hover:underline flex items-center"
                      >
                        {contacto.telefono}
                      </a>
                    </div>
                    {contacto.telefono2 && (
                      <div className="flex items-center text-sm gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                        <a 
                          href={`tel:${contacto.telefono2}`}
                          className="text-gray-600 hover:underline flex items-center"
                        >
                          {contacto.telefono2}
                        </a>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline" 
                    className="bg-indigo-50 text-indigo-700 border-indigo-200"
                  >
                    {contacto.ingerencia}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <ActionButtons
                    onView={() => navigate(`/directorio/contactos/${contacto.id}`)}
                    onEdit={() => navigate(`/directorio/contactos/edit/${contacto.id}`)}
                    onDelete={() => onDeleteClick(contacto)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {renderPagination()}
    </div>
  );
}