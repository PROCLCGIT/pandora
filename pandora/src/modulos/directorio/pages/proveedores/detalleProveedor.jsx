// /pandora/src/modulos/directorio/pages/proveedores/detalleProveedor.jsx

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Building, 
  ArrowLeft, 
  Edit, 
  Trash, 
  ExternalLink, 
  MapPin, 
  Phone, 
  Mail, 
  Info, 
  CalendarClock,
  BadgeCheck,
  BadgeX,
  Landmark,
  Star,
  Award
} from 'lucide-react';

// Servicios para proveedores
import { useProveedorById, useDeleteProveedor } from '../../api/proveedorService';

// Componentes UI
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Componentes personalizados
import { PageHeader } from '@/modulos/basic/components/layout/PageHeader';

export default function DetalleProveedor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Cargar datos del proveedor
  const { 
    data: proveedor, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useProveedorById(id, {
    onError: (error) => {
      toast({
        title: "Error al cargar el proveedor",
        description: error.message || "No se pudo cargar la información del proveedor",
        variant: "destructive"
      });
    }
  });
  
  // Mutación para eliminar proveedor
  const deleteProveedorMutation = useDeleteProveedor({
    onSuccess: () => {
      toast({
        title: "Proveedor eliminado",
        description: "El proveedor ha sido eliminado correctamente",
      });
      navigate('/directorio/proveedores');
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar",
        description: error.message || "No se pudo eliminar el proveedor",
        variant: "destructive"
      });
    }
  });
  
  // Confirmar eliminación
  const confirmDelete = () => {
    deleteProveedorMutation.mutate(id);
  };
  
  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Renderizado de la página
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <PageHeader 
        icon={<Building size={40} strokeWidth={1.5} />}
        title="Detalle del Proveedor"
        description="Información completa y datos de contacto"
        action={{
          label: "Volver a Proveedores",
          icon: <ArrowLeft className="h-4 w-4" />,
          onClick: () => navigate('/directorio/proveedores')
        }}
      />
      
      {isLoading ? (
        <div className="p-8 bg-white border rounded-md flex justify-center items-center my-4">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-gray-500">Cargando información del proveedor...</p>
          </div>
        </div>
      ) : isError ? (
        <div className="p-8 bg-red-50 border border-red-200 rounded-md flex justify-center items-center my-4">
          <div className="flex flex-col items-center text-red-700">
            <Info className="h-12 w-12 text-red-500 mb-3" />
            <p className="font-medium">Error al cargar los datos del proveedor</p>
            <p className="text-sm mt-1 mb-3">{error?.message || "No se pudo obtener la información solicitada"}</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/directorio/proveedores')}>
                Volver a Proveedores
              </Button>
              <Button onClick={() => refetch()}>Reintentar</Button>
            </div>
          </div>
        </div>
      ) : proveedor ? (
        <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden my-4">
          {/* Encabezado con información principal y acciones */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6">
            <div className="flex flex-col md:flex-row justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-1 gap-2">
                  <h1 className="text-2xl font-semibold text-gray-900">{proveedor.nombre}</h1>
                  {proveedor.tipo_primario && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      <Star className="h-3.5 w-3.5 mr-1" />
                      Primario
                    </Badge>
                  )}
                  {proveedor.activo ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <BadgeCheck className="h-3.5 w-3.5 mr-1" />
                      Activo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                      <BadgeX className="h-3.5 w-3.5 mr-1" />
                      Inactivo
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 mt-2 text-gray-600">
                  <div className="flex items-center">
                    <Landmark className="h-4 w-4 mr-1.5 text-gray-500 flex-shrink-0" />
                    <span className="font-medium">RUC: {proveedor.ruc}</span>
                  </div>
                </div>
                <p className="text-gray-500 mt-2 italic">{proveedor.razon_social}</p>
              </div>
              <div className="mt-4 md:mt-0 flex gap-2 md:flex-col lg:flex-row">
                <Button 
                  variant="outline" 
                  className="bg-white hover:bg-gray-50" 
                  onClick={() => navigate(`/directorio/proveedores/edit/${id}`)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  <span>Editar</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash className="h-4 w-4 mr-1" />
                  <span>Eliminar</span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Cuerpo con información detallada */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-6 p-6">
            <div className="md:col-span-2">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                    <Info className="h-5 w-5 mr-2 text-blue-600" />
                    Información básica
                  </h2>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div>
                      <dt className="text-gray-500 mb-1">Razón Social</dt>
                      <dd className="font-medium text-gray-900">{proveedor.razon_social}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 mb-1">RUC</dt>
                      <dd className="font-medium text-gray-900 font-mono">{proveedor.ruc}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 mb-1">Tipo</dt>
                      <dd className="font-medium text-gray-900">
                        {proveedor.tipo_primario ? (
                          <span className="flex items-center text-amber-600">
                            <Award className="h-4 w-4 mr-1" />
                            Proveedor Primario
                          </span>
                        ) : (
                          "Proveedor Secundario"
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <Separator />
                
                <div>
                  <h2 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-blue-600" />
                    Contacto
                  </h2>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div>
                      <dt className="text-gray-500 mb-1">Correo Electrónico</dt>
                      <dd className="font-medium text-blue-600 hover:underline">
                        <a href={`mailto:${proveedor.correo}`} className="flex items-center">
                          {proveedor.correo}
                          <ExternalLink className="h-3.5 w-3.5 ml-1 text-gray-400" />
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 mb-1">Teléfono</dt>
                      <dd className="font-medium text-gray-900 flex items-center">
                        <a href={`tel:${proveedor.telefono}`} className="flex items-center hover:text-blue-600 hover:underline">
                          {proveedor.telefono}
                          <Phone className="h-3.5 w-3.5 ml-1 text-gray-400" />
                        </a>
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <Separator />
                
                <div>
                  <h2 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                    Ubicación
                  </h2>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-gray-500 mb-1">Dirección Principal</dt>
                      <dd className="font-medium text-gray-900">{proveedor.direccion1}</dd>
                    </div>
                    {proveedor.direccion2 && (
                      <div>
                        <dt className="text-gray-500 mb-1">Dirección Secundaria</dt>
                        <dd className="font-medium text-gray-900">{proveedor.direccion2}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-gray-500 mb-1">Ciudad</dt>
                      <dd className="font-medium text-gray-900">
                        {proveedor.ciudad?.nombre || 'No especificada'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
            
            <div className="mt-6 md:mt-0">
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h2 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                  <CalendarClock className="h-5 w-5 mr-2 text-blue-600" />
                  Información del Registro
                </h2>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-gray-500 mb-1">Estado</dt>
                    <dd>
                      {proveedor.activo ? (
                        <div className="font-medium text-green-600 flex items-center">
                          <BadgeCheck className="h-4 w-4 mr-1" />
                          Proveedor Activo
                        </div>
                      ) : (
                        <div className="font-medium text-gray-600 flex items-center">
                          <BadgeX className="h-4 w-4 mr-1" />
                          Proveedor Inactivo
                        </div>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 mb-1">Fecha de Registro</dt>
                    <dd className="font-medium text-gray-900">{formatDate(proveedor.created_at)}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 mb-1">Última Actualización</dt>
                    <dd className="font-medium text-gray-900">{formatDate(proveedor.updated_at)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
          
          {/* Botones en la parte inferior */}
          <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate('/directorio/proveedores')}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Volver a Proveedores</span>
            </Button>
            <Button 
              onClick={() => navigate(`/directorio/proveedores/edit/${id}`)}
            >
              <Edit className="h-4 w-4 mr-1" />
              <span>Editar Proveedor</span>
            </Button>
          </div>
        </div>
      ) : null}
      
      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el proveedor "{proveedor?.nombre}"?
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
              disabled={deleteProveedorMutation.isPending}
            >
              {deleteProveedorMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}