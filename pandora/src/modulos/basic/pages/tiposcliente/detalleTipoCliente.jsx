// /pandora/src/modulos/basic/pages/tiposcliente/detalleTipoCliente.jsx

import { useParams, useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Edit, RefreshCw, FileText, User } from 'lucide-react';

import { useTipoClienteById } from '../../api/tipoClienteService';

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
 * Componente para mostrar el detalle de un tipo de cliente
 */
export default function DetalleTipoCliente() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Obtener datos del tipo de cliente con React Query
  const { data: tipoCliente, isLoading, error, refetch } = useTipoClienteById(id);
  
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
        <span className="ml-2">Cargando información del tipo de cliente...</span>
      </div>
    );
  }
  
  // Mostrar mensaje de error
  if (error) {
    return (
      <div className="container mx-auto py-6 max-w-3xl">
        <div className="bg-red-50 p-4 rounded-md text-red-600 mb-4">
          Error al cargar los datos del tipo de cliente: {error.message}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/basic/tiposcliente')}
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
          <Users className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Detalle de Tipo de Cliente</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/basic/tiposcliente')}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate(`/basic/tiposcliente/edit/${id}`)}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" /> Editar
          </Button>
        </div>
      </div>
      
      <Card className="border-blue-100 shadow-md">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
              {tipoCliente?.code}
            </Badge>
          </div>
          <CardTitle className="text-xl text-blue-800 mt-2">{tipoCliente?.nombre}</CardTitle>
          <CardDescription className="text-gray-600 text-base">
            Clasificación para diferentes tipos de clientes
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-2 pb-0">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Características</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-100 hover:bg-blue-200 text-blue-800 border-none">
                    Hospital
                  </Badge>
                  <Badge className="bg-purple-100 hover:bg-purple-200 text-purple-800 border-none">
                    Privado
                  </Badge>
                  <Badge className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-none">
                    Grande
                  </Badge>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Clientes Asociados</h3>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <p className="text-gray-600">
                    Este tipo de cliente tiene 8 clientes asociados en el sistema.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <Separator className="my-4" />
        
        <CardFooter className="pt-0 pb-4 flex justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Creado: {formatFecha(tipoCliente?.created_at)}
          </div>
          <div>
            Actualizado: {formatFecha(tipoCliente?.updated_at)}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}