import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  User,
  Search,
  PlusSquare,
  Edit3,
  Clock,
} from 'lucide-react';
import ClientSelectionModal from '../modals/ClientSelectionModal';

const ClienteSection = ({ cliente = {}, onClienteChange }) => {
  const [showClientModal, setShowClientModal] = useState(false);

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
  };
  return (
    <Card>
      <CardHeader className="py-3 px-4 bg-blue-300/20">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-base font-bold">
            <User className="mr-2 h-4 w-4 text-blue-600" />
            Cliente
          </CardTitle>
          <div className="flex space-x-1">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 w-7 p-0"
              onClick={() => setShowClientModal(true)}
              title="Buscar cliente"
            >
              <Search className="h-3.5 w-3.5 text-gray-500" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
              <PlusSquare className="h-3.5 w-3.5 text-green-500" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
              <Edit3 className="h-3.5 w-3.5 text-blue-500" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
              <Clock className="h-3.5 w-3.5 text-orange-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 pb-4 px-4">
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="text-sm text-gray-600 font-medium w-24">Empresa:</span>
            <span className="text-sm text-gray-900">{cliente.empresa || ''}</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 font-medium w-24">RUC:</span>
            <span className="text-sm text-gray-900">{cliente.ruc || ''}</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 font-medium w-24">Email:</span>
            <span className="text-sm text-gray-900">{cliente.email || ''}</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 font-medium w-24">Teléfono:</span>
            <span className="text-sm text-gray-900">{cliente.telefono || ''}</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 font-medium w-24">Dirección:</span>
            <span className="text-sm text-gray-900">{cliente.direccion || ''}</span>
          </div>
        </div>
      </CardContent>
      
      {/* Client Selection Modal */}
      <ClientSelectionModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        onSelectClient={handleSelectClient}
      />
    </Card>
  );
};

export default ClienteSection;