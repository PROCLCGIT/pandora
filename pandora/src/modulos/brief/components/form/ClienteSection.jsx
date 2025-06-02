import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  User,
  Search,
  PlusSquare,
} from 'lucide-react';
import Filter1Icon from '@mui/icons-material/Filter1';
import Filter2Icon from '@mui/icons-material/Filter2';
import ClientSelectionModal from '@/modulos/proformas/v1/components/modals/ClientSelectionModal';
import AddClientModal from '@/modulos/proformas/v1/components/modals/AddClientModal';
import { clienteService } from '@/modulos/proformas/v1/api/clienteService';
import { useToast } from '@/hooks/use-toast';

const ClienteSection = ({ 
  cliente = null, 
  clientes = [],
  onClienteChange,
  hasError = false,
  watch,
  setValue
}) => {
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const { toast } = useToast();

  const handleSelectClient = (cliente) => {
    setValue('client', cliente.id.toString());
    setIsClientModalOpen(false);
    toast({
      title: 'Cliente seleccionado',
      description: `Se ha seleccionado a ${cliente.nombre}`,
      variant: 'default'
    });
  };

  const handleLoadClienteUno = async () => {
    try {
      const clienteData = await clienteService.getCliente(1);
      setValue('client', '1');
      toast({
        title: 'Cliente cargado',
        description: `Cliente ID 1: ${clienteData.nombre}`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Error al cargar cliente ID 1:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el cliente ID 1',
        variant: 'destructive'
      });
    }
  };

  const handleLoadDefaultClient = async () => {
    try {
      const clienteData = await clienteService.getCliente(4);
      setValue('client', '4');
      toast({
        title: 'Cliente cargado',
        description: `Cliente ID 4: ${clienteData.nombre}`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Error al cargar cliente ID 4:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el cliente ID 4',
        variant: 'destructive'
      });
    }
  };

  const handleClientCreated = (newClient) => {
    setValue('client', newClient.id.toString());
    setShowAddClientModal(false);
    toast({
      title: 'Cliente creado',
      description: `Se ha creado y seleccionado: ${newClient.nombre}`,
      variant: 'default'
    });
  };

  // Encontrar el cliente seleccionado
  const selectedClient = clientes.find(c => c.id.toString() === watch('client'));

  return (
    <>
      <Card className={hasError ? 'border-red-500' : ''}>
        <CardHeader className="py-3 px-4 bg-blue-300/20">
          <div className="flex justify-between items-center min-h-[32px]">
            <CardTitle className="flex items-center text-base font-bold">
              <User className="mr-2 h-4 w-4 text-blue-600" />
              Cliente <span className="text-red-500">*</span>
            </CardTitle>
            <div className="flex space-x-1">
              <Button 
                type="button"
                size="sm" 
                variant={!watch('client') ? "default" : "ghost"}
                className={`h-7 w-7 p-0 ${!watch('client') ? 'animate-pulse bg-blue-500 hover:bg-blue-600' : ''}`}
                onClick={() => setIsClientModalOpen(true)}
                title="Buscar cliente"
              >
                <Search className={`h-3.5 w-3.5 ${!watch('client') ? 'text-white' : 'text-gray-500'}`} />
              </Button>
              <Button 
                type="button"
                size="sm" 
                variant="ghost" 
                className="h-7 w-7 p-0"
                onClick={() => setShowAddClientModal(true)}
                title="Agregar nuevo cliente"
              >
                <PlusSquare className="h-3.5 w-3.5 text-green-500" />
              </Button>
              <Button 
                type="button"
                size="sm" 
                variant="ghost" 
                className="h-7 w-7 p-0"
                onClick={handleLoadClienteUno}
                title="Cargar cliente ID: 1"
              >
                <Filter1Icon className="h-3.5 w-3.5 text-blue-500" />
              </Button>
              <Button 
                type="button"
                size="sm" 
                variant="ghost" 
                className="h-7 w-7 p-0"
                onClick={handleLoadDefaultClient}
                title="Cargar cliente por defecto (ID: 4)"
              >
                <Filter2Icon className="h-3.5 w-3.5 text-orange-500" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 pb-4 px-4">
          <div className="space-y-4">
            <div className="grid grid-cols-[140px,1fr,24px] items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">Empresa:</span>
              <span className={`text-sm ${selectedClient?.nombre ? 'text-gray-900' : (hasError ? 'text-red-600 font-medium' : 'text-red-500 font-medium')}`}>
                {selectedClient?.nombre || (hasError ? '⚠️ Cliente requerido - Haga clic en 🔍' : 'Por favor seleccione un cliente →')}
              </span>
            </div>
            <div className="grid grid-cols-[140px,1fr,24px] items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">RUC:</span>
              <span className="text-sm text-gray-900">
                {selectedClient?.ruc || 'No especificado'}
              </span>
            </div>
            <div className="grid grid-cols-[140px,1fr,24px] items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">Email:</span>
              <span className="text-sm text-gray-900">
                {selectedClient?.email || 'No especificado'}
              </span>
            </div>
            <div className="grid grid-cols-[140px,1fr,24px] items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">Teléfono:</span>
              <span className="text-sm text-gray-900">
                {selectedClient?.telefono || 'No especificado'}
              </span>
            </div>
            <div className="grid grid-cols-[140px,1fr,24px] items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">Dirección:</span>
              <span className="text-sm text-gray-900">
                {selectedClient?.direccion || 'No especificado'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de selección de cliente */}
      <ClientSelectionModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSelectClient={handleSelectClient}
      />

      {/* Modal para agregar nuevo cliente */}
      <AddClientModal
        isOpen={showAddClientModal}
        onClose={() => setShowAddClientModal(false)}
        onClientCreated={handleClientCreated}
      />
    </>
  );
};

export default ClienteSection;