// /pandora/src/modulos/basic/pages/empresas/detalleEmpresa.jsx

import { useParams, useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Edit, Mail, Phone, MapPin, User, RefreshCw, FileText } from 'lucide-react';

import { useEmpresaById } from '../../api/empresaClcService';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

/**
 * Componente para mostrar el detalle de una empresa CLC
 */
export default function DetalleEmpresa() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Obtener datos de la empresa con React Query
  const { data: empresa, isLoading, error, refetch } = useEmpresaById(id);
  
  // Función para formatear la fecha
  const formatFecha = (fechaString) => {
    if (!fechaString) return 'No disponible';
    
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Mostrar mensaje de carga
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Cargando información de la empresa...</span>
      </div>
    );
  }
  
  // Mostrar mensaje de error
  if (error) {
    return (
      <div className="container mx-auto py-6 max-w-3xl">
        <div className="bg-red-50 p-4 rounded-md text-red-600 mb-4">
          Error al cargar los datos de la empresa: {error.message}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/basic/empresas')}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a la lista
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Detalle de Empresa CLC</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/basic/empresas')}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate(`/basic/empresas/edit/${id}`)}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" /> Editar
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta principal con datos básicos */}
        <Card className="md:col-span-2 border-blue-100 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                {empresa?.code}
              </Badge>
              <Badge variant="outline" className="bg-gray-50 border-gray-200 px-3 py-1">
                RUC: {empresa?.ruc}
              </Badge>
            </div>
            <CardTitle className="text-xl text-blue-800 mt-2">{empresa?.nombre}</CardTitle>
            <CardDescription className="text-gray-600 text-base">{empresa?.razon_social}</CardDescription>
          </CardHeader>
          
          <CardContent className="pt-2 pb-0">
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-700">Dirección</h3>
                  <p className="text-gray-600">{empresa?.direccion}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-700">Teléfono</h3>
                    <p className="text-gray-600">{empresa?.telefono || 'No especificado'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-700">Correo Electrónico</h3>
                    <p className="text-gray-600 break-all">{empresa?.correo}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <User className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-700">Representante Legal</h3>
                  <p className="text-gray-600">{empresa?.representante_legal}</p>
                </div>
              </div>
            </div>
          </CardContent>
          
          <Separator className="my-4" />
          
          <CardFooter className="pt-0 pb-4 flex justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Creado: {formatFecha(empresa?.created_at)}
            </div>
            <div>
              Actualizado: {formatFecha(empresa?.updated_at)}
            </div>
          </CardFooter>
        </Card>
        
        {/* Tarjeta lateral con información adicional */}
        <Card className="border-blue-100 shadow-md h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Información Adicional</CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-1">Sistema de Gestión</h3>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Activo
                </Badge>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-1">Documentos Legales</h3>
                <ul className="list-disc list-inside text-gray-600 pl-2 text-sm">
                  <li>Registro Mercantil</li>
                  <li>Registro Único de Contribuyentes</li>
                  <li>Nombramiento Representante Legal</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Servicios Asociados</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-100 hover:bg-blue-200 text-blue-800 border-none">
                    Venta
                  </Badge>
                  <Badge className="bg-purple-100 hover:bg-purple-200 text-purple-800 border-none">
                    Mantenimiento
                  </Badge>
                  <Badge className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-none">
                    Capacitación
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}