import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Loader2, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Building2,
  CheckCircle2,
  Users,
  ChevronLeft,
  ChevronRight,
  Info as InfoIcon
} from 'lucide-react';
import { clienteService } from '../../api/clienteService';
import { useDebounce } from '@/hooks/custom/useDebounce';
import { toast } from '@/hooks/use-toast';

const ClientSelectionModal = ({ isOpen, onClose, onSelectClient }) => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalPages: 1,
    totalItems: 0
  });

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Fetch clients
  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await clienteService.getClientes({
        page: pagination.page,
        page_size: pagination.pageSize,
        search: debouncedSearch
      });
      
      console.log('Response from server:', response);
      setClientes(response.results || []);
      setPagination({
        ...pagination,
        totalPages: Math.ceil(response.count / pagination.pageSize),
        totalItems: response.count
      });
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'No se pudieron cargar los clientes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, pagination.page, pagination.pageSize]);

  useEffect(() => {
    if (isOpen) {
      fetchClientes();
    }
  }, [isOpen, debouncedSearch, pagination.page]);

  const handleSelectClient = () => {
    if (selectedClient) {
      onSelectClient(selectedClient);
      onClose();
      setSearchTerm('');
      setSelectedClient(null);
    }
  };

  const handleRowClick = (cliente) => {
    setSelectedClient(cliente);
  };

  const handleRowDoubleClick = (cliente) => {
    // Seleccionar directamente con doble clic
    onSelectClient(cliente);
    onClose();
    setSearchTerm('');
    setSelectedClient(null);
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Seleccionar Cliente
          </DialogTitle>
        </DialogHeader>
        
        {/* Search Bar */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Buscar por nombre, alias, RUC o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 text-base bg-white border-gray-200 focus:border-blue-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <InfoIcon className="h-3 w-3" />
            Tip: Haz doble clic en un cliente para seleccionarlo rápidamente
          </p>
        </div>

        {/* Client List Container */}
        <ScrollArea className="flex-1 px-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              <p className="text-gray-500">Cargando clientes...</p>
            </div>
          ) : clientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Users className="h-16 w-16 text-gray-300" />
              <p className="text-gray-500 text-lg">No se encontraron clientes</p>
              <p className="text-gray-400 text-sm">Intenta con otros términos de búsqueda</p>
            </div>
          ) : (
            <div className="grid gap-3 py-4">
              {clientes.map((cliente) => (
                <Card
                  key={cliente.id}
                  className={`
                    p-4 cursor-pointer transition-all duration-200 border-2
                    ${selectedClient?.id === cliente.id 
                      ? 'border-blue-500 bg-blue-50 shadow-md transform scale-[1.02]' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }
                  `}
                  onClick={() => handleRowClick(cliente)}
                  onDoubleClick={() => handleRowDoubleClick(cliente)}
                  title="Haz doble clic para seleccionar"
                >
                  <div className="flex items-start justify-between">
                    {/* Left Section - Main Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {cliente.nombre}
                        </h3>
                        {selectedClient?.id === cliente.id && (
                          <CheckCircle2 className="h-5 w-5 text-blue-600 ml-auto" />
                        )}
                      </div>
                      
                      {cliente.alias && (
                        <p className="text-sm text-gray-600 mb-2 italic">
                          "{cliente.alias}"
                        </p>
                      )}
                      
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">RUC:</span>
                          <span className="font-medium text-gray-900">{cliente.ruc}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Tel:</span>
                          <span className="font-medium text-gray-900">
                            {cliente.telefono || 'No registrado'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium text-gray-900 truncate max-w-[200px]">
                            {cliente.email || 'No registrado'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Ciudad:</span>
                          <span className="font-medium text-gray-900">
                            {cliente.ciudad?.nombre || 'No especificada'}
                          </span>
                        </div>
                      </div>
                      
                      {cliente.direccion && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Dirección:</span> {cliente.direccion}
                        </div>
                      )}
                    </div>
                    
                    {/* Right Section - Type Badge */}
                    <div className="ml-4">
                      <Badge 
                        variant={selectedClient?.id === cliente.id ? "default" : "outline"} 
                        className="whitespace-nowrap"
                      >
                        {cliente.tipo_cliente?.nombre || 'Sin tipo'}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer Section */}
        <div className="border-t bg-gray-50">
          {/* Pagination */}
          {!loading && clientes.length > 0 && (
            <div className="flex items-center justify-between px-6 py-3 border-b">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-normal">
                  {pagination.totalItems} clientes encontrados
                </Badge>
                {searchTerm && (
                  <span className="text-sm text-gray-500">
                    para "{searchTerm}"
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="h-8"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, pagination.totalPages))].map((_, idx) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = idx + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = idx + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + idx;
                    } else {
                      pageNum = pagination.page - 2 + idx;
                    }
                    
                    return (
                      <Button
                        key={idx}
                        variant={pageNum === pagination.page ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="h-8 w-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="h-8"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center px-6 py-4">
            <div className="text-sm text-gray-600">
              {selectedClient && (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Cliente seleccionado: <strong>{selectedClient.nombre}</strong>
                </span>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="min-w-[100px]"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSelectClient} 
                disabled={!selectedClient}
                className="min-w-[150px] bg-blue-600 hover:bg-blue-700"
              >
                Seleccionar Cliente
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientSelectionModal;