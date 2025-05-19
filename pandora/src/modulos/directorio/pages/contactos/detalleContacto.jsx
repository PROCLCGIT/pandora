// /pandora/src/modulos/directorio/pages/contactos/detalleContacto.jsx

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  UserCircle, 
  ArrowLeft, 
  Edit, 
  Trash, 
  ExternalLink, 
  MapPin, 
  Phone, 
  Mail, 
  Info, 
  CalendarClock,
  FileText,
  Briefcase,
  Building
} from 'lucide-react';

// Servicios para contactos
import { useContactoById, useDeleteContacto, useClientesByContacto } from '../../api/contactoService';

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

export default function DetalleContacto() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Cargar datos del contacto
  const { 
    data: contacto, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useContactoById(id, {
    onError: (error) => {
      toast({
        title: "Error al cargar el contacto",
        description: error.message || "No se pudo cargar la información del contacto",
        variant: "destructive"
      });
    }
  });
  
  // Cargar clientes asociados al contacto
  const {
    data: clientesAsociados,
    isLoading: loadingClientes
  } = useClientesByContacto(id, {
    enabled: !!id,
    onError: (error) => {
      console.error("Error al cargar clientes asociados", error);
    }
  });
  
  // Mutación para eliminar contacto
  const deleteContactoMutation = useDeleteContacto({
    onSuccess: () => {
      toast({
        title: "Contacto eliminado",
        description: "El contacto ha sido eliminado correctamente",
      });
      navigate('/directorio/contactos');
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar",
        description: error.message || "No se pudo eliminar el contacto",
        variant: "destructive"
      });
    }
  });
  
  // Confirmar eliminación
  const confirmDelete = () => {
    deleteContactoMutation.mutate(id);
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
        icon={<UserCircle size={40} strokeWidth={1.5} />}
        title="Detalle del Contacto"
        description="Información completa y datos de contacto"
        action={{
          label: "Volver a Contactos",
          icon: <ArrowLeft className="h-4 w-4" />,
          onClick: () => navigate('/directorio/contactos')
        }}
      />
      
      {isLoading ? (
        <div className="p-8 bg-white border rounded-md flex justify-center items-center my-4">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-gray-500">Cargando información del contacto...</p>
          </div>
        </div>
      ) : isError ? (
        <div className="p-8 bg-red-50 border border-red-200 rounded-md flex justify-center items-center my-4">
          <div className="flex flex-col items-center text-red-700">
            <Info className="h-12 w-12 text-red-500 mb-3" />
            <p className="font-medium">Error al cargar los datos del contacto</p>
            <p className="text-sm mt-1 mb-3">{error?.message || "No se pudo obtener la información solicitada"}</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/directorio/contactos')}>
                Volver a Contactos
              </Button>
              <Button onClick={() => refetch()}>Reintentar</Button>
            </div>
          </div>
        </div>
      ) : contacto ? (
        <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden my-4">
          {/* Encabezado con información principal y acciones */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6">
            <div className="flex flex-col md:flex-row justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-1 gap-2">
                  <h1 className="text-2xl font-semibold text-gray-900">{contacto.nombre}</h1>
                  {contacto.alias && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {contacto.alias}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 mt-2 text-gray-600">
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-1.5 text-gray-500 flex-shrink-0" />
                    <span className="font-medium">{contacto.ingerencia}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex gap-2 md:flex-col lg:flex-row">
                <Button 
                  variant="outline" 
                  className="bg-white hover:bg-gray-50" 
                  onClick={() => navigate(`/directorio/contactos/edit/${id}`)}
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
                      <dt className="text-gray-500 mb-1">Nombre Completo</dt>
                      <dd className="font-medium text-gray-900">{contacto.nombre}</dd>
                    </div>
                    {contacto.alias && (
                      <div>
                        <dt className="text-gray-500 mb-1">Alias</dt>
                        <dd className="font-medium text-gray-900">{contacto.alias}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-gray-500 mb-1">Ingerencia/Cargo</dt>
                      <dd className="font-medium text-gray-900">
                        {contacto.ingerencia}
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
                        <a href={`mailto:${contacto.email}`} className="flex items-center">
                          {contacto.email}
                          <ExternalLink className="h-3.5 w-3.5 ml-1 text-gray-400" />
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 mb-1">Teléfono Principal</dt>
                      <dd className="font-medium text-gray-900 flex items-center">
                        <a href={`tel:${contacto.telefono}`} className="flex items-center hover:text-blue-600 hover:underline">
                          {contacto.telefono}
                          <Phone className="h-3.5 w-3.5 ml-1 text-gray-400" />
                        </a>
                      </dd>
                    </div>
                    {contacto.telefono2 && (
                      <div>
                        <dt className="text-gray-500 mb-1">Teléfono Secundario</dt>
                        <dd className="font-medium text-gray-900 flex items-center">
                          <a href={`tel:${contacto.telefono2}`} className="flex items-center hover:text-blue-600 hover:underline">
                            {contacto.telefono2}
                            <Phone className="h-3.5 w-3.5 ml-1 text-gray-400" />
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
                
                {contacto.direccion && (
                  <>
                    <Separator />
                    
                    <div>
                      <h2 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                        Ubicación
                      </h2>
                      <dl className="space-y-3 text-sm">
                        <div>
                          <dt className="text-gray-500 mb-1">Dirección</dt>
                          <dd className="font-medium text-gray-900">{contacto.direccion}</dd>
                        </div>
                      </dl>
                    </div>
                  </>
                )}
                
                {contacto.obserbacion && (
                  <>
                    <Separator />
                    <div>
                      <h2 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-600" />
                        Observaciones
                      </h2>
                      <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-gray-700">
                        {contacto.obserbacion}
                      </div>
                    </div>
                  </>
                )}
                
                {clientesAsociados && clientesAsociados.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h2 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                        <Building className="h-5 w-5 mr-2 text-blue-600" />
                        Clientes Asociados
                      </h2>
                      <div className="space-y-2">
                        {clientesAsociados.map(cliente => (
                          <div key={cliente.id} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{cliente.nombre}</h3>
                                <p className="text-sm text-gray-600">{cliente.razon_social}</p>
                                <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                  <Phone className="h-3 w-3" />
                                  <span>{cliente.telefono}</span>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => navigate(`/directorio/clientes/${cliente.id}`)}
                                className="text-blue-600"
                              >
                                Ver
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
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
                    <dt className="text-gray-500 mb-1">Fecha de Registro</dt>
                    <dd className="font-medium text-gray-900">{formatDate(contacto.created_at)}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 mb-1">Última Actualización</dt>
                    <dd className="font-medium text-gray-900">{formatDate(contacto.updated_at)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
          
          {/* Botones en la parte inferior */}
          <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate('/directorio/contactos')}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Volver a Contactos</span>
            </Button>
            <Button 
              onClick={() => navigate(`/directorio/contactos/edit/${id}`)}
            >
              <Edit className="h-4 w-4 mr-1" />
              <span>Editar Contacto</span>
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
              ¿Estás seguro de que deseas eliminar el contacto "{contacto?.nombre}"?
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
              disabled={deleteContactoMutation.isPending}
            >
              {deleteContactoMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}