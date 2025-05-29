import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  User,
  Search,
  PlusSquare,
  Edit3,
  Clock,
  Replace,
} from 'lucide-react';
import ClientSelectionModal from '../modals/ClientSelectionModal';
import AddClientModal from '../modals/AddClientModal';

const ClienteSection = ({ cliente = {}, onClienteChange, hasError = false, onErrorClear }) => {
  const [showClientModal, setShowClientModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  const handleSelectClient = (selectedClient) => {
    // Map the client data to the expected format
    const clienteData = {
      id: selectedClient.id,
      empresa: selectedClient.nombre,
      ruc: selectedClient.ruc,
      email: selectedClient.email,
      telefono: selectedClient.telefono,
      direccion: selectedClient.direccion,
      // Additional fields that might be needed
      alias: selectedClient.alias,
      ciudad: selectedClient.ciudad,
      ciudad_nombre: selectedClient.ciudad?.nombre,
      tipo_cliente: selectedClient.tipo_cliente,
      tipo_cliente_nombre: selectedClient.tipo_cliente?.nombre,
      razon_social: selectedClient.razon_social,
      zona: selectedClient.zona,
      zona_nombre: selectedClient.zona?.nombre
    };
    
    // Call the parent's callback to update the form
    if (onClienteChange) {
      onClienteChange(clienteData);
    }
    
    // Clear error if exists
    if (onErrorClear) {
      onErrorClear();
    }
  };
  
  const handleClientCreated = (newClient) => {
    // Close the add modal and automatically select the new client
    setShowAddClientModal(false);
    handleSelectClient(newClient);
  };
  
  return (
    <Card className={hasError ? 'border-red-500' : ''}>
      <CardHeader className="py-3 px-4 bg-blue-300/20">
        <div className="flex justify-between items-center min-h-[32px]">
          <CardTitle className="flex items-center text-base font-bold">
            <User className="mr-2 h-4 w-4 text-blue-600" />
            Cliente <span className="text-red-500">*</span>
          </CardTitle>
          <div className="flex space-x-1">
            <Button 
              size="sm" 
              variant={!cliente.id ? "default" : "ghost"}
              className={`h-7 w-7 p-0 ${!cliente.id ? 'animate-pulse bg-blue-500 hover:bg-blue-600' : ''}`}
              onClick={() => setShowClientModal(true)}
              title="Buscar cliente"
            >
              <Search className={`h-3.5 w-3.5 ${!cliente.id ? 'text-white' : 'text-gray-500'}`} />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 w-7 p-0"
              onClick={() => setShowAddClientModal(true)}
              title="Agregar nuevo cliente"
            >
              <PlusSquare className="h-3.5 w-3.5 text-green-500" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
              <Edit3 className="h-3.5 w-3.5 text-blue-500" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
              <Replace className="h-3.5 w-3.5 text-orange-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 pb-4 px-4">
        <div className="space-y-4">
          <div className="grid grid-cols-[140px,1fr,24px] items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">Empresa:</span>
            <span className={`text-sm ${cliente.empresa ? 'text-gray-900' : (hasError ? 'text-red-600 font-medium' : 'text-red-500 font-medium')}`}>
              {cliente.empresa || (hasError ? '⚠️ Cliente requerido - Haga clic en 🔍' : 'Por favor seleccione un cliente →')}
            </span>
          </div>
          <div className="grid grid-cols-[140px,1fr,24px] items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">RUC:</span>
            <span className="text-sm text-gray-900">{cliente.ruc || 'No especificado'}</span>
          </div>
          <div className="grid grid-cols-[140px,1fr,24px] items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">Email:</span>
            <span className="text-sm text-gray-900">{cliente.email || 'No especificado'}</span>
          </div>
          <div className="grid grid-cols-[140px,1fr,24px] items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">Teléfono:</span>
            <span className="text-sm text-gray-900">{cliente.telefono || 'No especificado'}</span>
          </div>
          <div className="grid grid-cols-[140px,1fr,24px] items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">Dirección:</span>
            <span className="text-sm text-gray-900">{cliente.direccion || 'No especificado'}</span>
          </div>
        </div>
      </CardContent>
      
      {/* Client Selection Modal */}
      <ClientSelectionModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        onSelectClient={handleSelectClient}
      />
      
      {/* Add Client Modal */}
      <AddClientModal
        isOpen={showAddClientModal}
        onClose={() => setShowAddClientModal(false)}
        onClientCreated={handleClientCreated}
      />
    </Card>
  );
};

export default ClienteSection;