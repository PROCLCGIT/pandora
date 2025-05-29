import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  FileText, 
  Calendar, 
  User, 
  Building2, 
  Eye,
  Edit3,
  Loader2,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { proformaService } from '../../api/proformaService';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/custom/useDebounce';

const ProformasGuardadasModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [proformas, setProformas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalPages: 1,
    totalItems: 0
  });

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Fetch proformas when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProformas();
    }
  }, [isOpen, debouncedSearch, estadoFilter, pagination.page]);

  const fetchProformas = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        page_size: pagination.pageSize,
        search: debouncedSearch,
        ordering: '-fecha_emision'
      };
      
      if (estadoFilter !== 'todos') {
        params.estado = estadoFilter;
      }

      const response = await proformaService.getProformas(params);
      console.log('Proformas response:', response);
      
      // Validate and clean the response data
      const validProformas = (response.results || []).filter(proforma => {
        if (!proforma || typeof proforma !== 'object') {
          console.error('Invalid proforma in response:', proforma);
          return false;
        }
        return true;
      });
      
      setProformas(validProformas);
      setPagination({
        ...pagination,
        totalPages: Math.ceil((response.count || 0) / pagination.pageSize),
        totalItems: response.count || 0
      });
    } catch (error) {
      console.error('Error fetching proformas:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las proformas',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditProforma = (proforma) => {
    try {
      console.log('=== EDITING PROFORMA ===');
      console.log('Proforma data:', proforma);
      console.log('Proforma ID:', proforma.id);
      console.log('Current location:', window.location.href);
      
      // Validate proforma data
      if (!proforma || !proforma.id) {
        throw new Error('ID de proforma inválido');
      }

      // Close modal first
      onClose();
      
      // Navigate to edit page instead of detail page
      const path = `/proformas/edit/${proforma.id}`;
      console.log('Attempting to navigate to:', path);
      console.log('Full URL would be:', window.location.origin + path);
      
      // Add a small delay to ensure modal closes first
      setTimeout(() => {
        console.log('Executing navigation...');
        
        // Try both methods to ensure navigation works
        navigate(path);
        
        // As backup, also set window location
        const fullUrl = `${window.location.origin}${path}`;
        console.log('Also setting window.location to:', fullUrl);
        
        // Check if navigation worked after a short delay
        setTimeout(() => {
          if (window.location.pathname !== path) {
            console.warn('React Router navigation failed, using window.location');
            window.location.href = fullUrl;
          } else {
            console.log('React Router navigation succeeded');
          }
        }, 50);
        
        console.log('Navigation called, new location should be:', path);
      }, 100);
      
      // Show success message
      toast({
        title: 'Éxito',
        description: `Cargando proforma ${proforma.numero} para edición`,
        variant: 'default'
      });
      
    } catch (error) {
      console.error('Error handling edit proforma:', error);
      toast({
        title: 'Error',
        description: `No se pudo abrir la proforma: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const handleDuplicateProforma = async (proforma) => {
    try {
      console.log('=== DUPLICATING PROFORMA ===');
      console.log('Proforma data:', proforma);
      console.log('Proforma ID:', proforma.id);
      
      // Validate proforma data
      if (!proforma || !proforma.id) {
        throw new Error('ID de proforma inválido');
      }

      // Close modal first
      onClose();
      
      toast({
        title: 'Información',
        description: 'Duplicando proforma...',
        variant: 'default'
      });

      // Call duplicate service
      const newProforma = await proformaService.duplicateProforma(proforma.id);
      console.log('New proforma created:', newProforma);
      
      // Navigate to edit the new proforma
      navigate(`/proformas/edit/${newProforma.id}`);
      
      toast({
        title: 'Éxito',
        description: `Proforma duplicada como ${newProforma.numero}`,
        variant: 'default'
      });
      
    } catch (error) {
      console.error('Error duplicating proforma:', error);
      toast({
        title: 'Error',
        description: `No se pudo duplicar la proforma: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const getEstadoBadgeVariant = (estado) => {
    const variants = {
      'borrador': 'secondary',
      'enviada': 'default',
      'aprobada': 'success',
      'rechazada': 'destructive',
      'vencida': 'warning',
      'convertida': 'outline'
    };
    return variants[estado] || 'default';
  };

  const formatCurrency = (value) => {
    try {
      // Ensure value is a number
      const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
      return new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency: 'USD'
      }).format(numValue);
    } catch (error) {
      console.error('Error formatting currency:', error, 'value:', value);
      return '$0.00';
    }
  };

  const formatDate = (dateValue) => {
    try {
      if (!dateValue) return 'N/A';
      const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      console.error('Error formatting date:', error, 'dateValue:', dateValue);
      return 'N/A';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Proformas Guardadas
          </DialogTitle>
          <DialogDescription>
            Visualiza y gestiona todas las proformas creadas en el sistema
          </DialogDescription>
        </DialogHeader>
        
        {/* Filters Bar */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por número, nombre o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
            
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-48 h-9">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="borrador">Borrador</SelectItem>
                <SelectItem value="enviada">Enviada</SelectItem>
                <SelectItem value="aprobada">Aprobada</SelectItem>
                <SelectItem value="rechazada">Rechazada</SelectItem>
                <SelectItem value="vencida">Vencida</SelectItem>
                <SelectItem value="convertida">Convertida</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Proformas List */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              <p className="text-gray-500">Cargando proformas...</p>
            </div>
          ) : proformas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <FileText className="h-16 w-16 text-gray-300" />
              <p className="text-gray-500 text-lg">No se encontraron proformas</p>
              <p className="text-gray-400 text-sm">Intenta con otros términos de búsqueda</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Número</TableHead>
                  <TableHead className="font-semibold">Nombre</TableHead>
                  <TableHead className="font-semibold">Cliente</TableHead>
                  <TableHead className="font-semibold">Fecha</TableHead>
                  <TableHead className="font-semibold">Vencimiento</TableHead>
                  <TableHead className="font-semibold text-right">Total</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="font-semibold text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proformas.map((proforma) => {
                  // Validate proforma data
                  if (!proforma || typeof proforma !== 'object') {
                    console.error('Invalid proforma data:', proforma);
                    return null;
                  }
                  
                  return (
                  <TableRow key={proforma.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        {proforma.numero}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={proforma.nombre}>
                        {proforma.nombre}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="truncate max-w-[150px]">
                          {proforma.cliente_nombre || 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-sm">
                          {formatDate(proforma.fecha_emision)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {formatDate(proforma.fecha_vencimiento)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(proforma.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getEstadoBadgeVariant(proforma.estado)}>
                        {proforma.estado_display || proforma.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditProforma(proforma)}
                          title="Editar proforma"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDuplicateProforma(proforma)}
                          title="Duplicar"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                }).filter(Boolean)}
              </TableBody>
            </Table>
          )}
        </ScrollArea>

        {/* Footer with pagination */}
        <div className="border-t px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {proformas.length} de {pagination.totalItems} proformas
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
              >
                Anterior
              </Button>
              
              <div className="flex items-center gap-1">
                <span className="text-sm px-2">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
              </div>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.totalPages}
              >
                Siguiente
              </Button>
            </div>

            <Button onClick={onClose} variant="outline">
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProformasGuardadasModal;