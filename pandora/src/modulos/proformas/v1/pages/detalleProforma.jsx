import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  ArrowLeft,
  FileText, 
  Calendar, 
  User, 
  Building2, 
  Loader2,
  Edit,
  Download,
  Copy,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { proformaService } from '../api/proformaService';
import { toast } from '@/hooks/use-toast';

const DetalleProforma = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proforma, setProforma] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchProformaDetails();
    }
  }, [id]);

  const fetchProformaDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('=== LOADING PROFORMA DETAILS ===');
      console.log('Proforma ID:', id);
      
      const [proformaData, itemsData] = await Promise.all([
        proformaService.getProforma(id),
        proformaService.getProformaItems(id)
      ]);
      
      console.log('Proforma data received:', proformaData);
      console.log('Items data received:', itemsData);
      
      setProforma(proformaData);
      setItems(itemsData.results || []);
      
      toast({
        title: 'Éxito',
        description: `Proforma ${proformaData.numero} cargada correctamente`,
        variant: 'default'
      });
      
    } catch (error) {
      console.error('Error fetching proforma details:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      let errorMessage = 'No se pudo cargar la información de la proforma';
      
      if (error.response?.status === 404) {
        errorMessage = 'La proforma no fue encontrada';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Error del servidor. Contacte al administrador';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    try {
      const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
      return new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency: 'USD'
      }).format(numValue);
    } catch (error) {
      return '$0.00';
    }
  };

  const formatDate = (dateValue) => {
    try {
      if (!dateValue) return 'N/A';
      const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
      if (isNaN(date.getTime())) return 'Fecha inv�lida';
      return format(date, 'dd/MM/yyyy', { locale: es });
    } catch (error) {
      return 'N/A';
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

  const handleEdit = () => {
    navigate(`/proformas/edit/${id}`);
  };

  const handleDuplicate = async () => {
    try {
      const newProforma = await proformaService.duplicateProforma(id);
      toast({
        title: 'Éxito',
        description: 'Proforma duplicada correctamente'
      });
      navigate(`/proformas/${newProforma.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo duplicar la proforma',
        variant: 'destructive'
      });
    }
  };

  const handleGeneratePDF = async () => {
    try {
      await proformaService.generatePDF(id);
      toast({
        title: 'Éxito',
        description: 'PDF generado y descargado correctamente'
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar el PDF',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-gray-500">Cargando detalle de la proforma...</p>
      </div>
    );
  }

  if (error || !proforma) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <FileText className="h-16 w-16 text-gray-300" />
        <p className="text-gray-500 text-lg">No se pudo cargar la proforma</p>
        <Button onClick={() => navigate('/proformas')} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a proformas
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/proformas')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Detalle de Proforma</h1>
            <p className="text-gray-600">{proforma.numero}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicar
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleGeneratePDF()}
            title="Generar PDF de la proforma"
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Informaci�n General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informaci�n General
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600">Nombre</label>
              <p className="mt-1 text-sm">{proforma.nombre}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Estado</label>
              <div className="mt-1">
                <Badge variant={getEstadoBadgeVariant(proforma.estado)}>
                  {proforma.estado_display || proforma.estado}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Fecha de Emisi�n</label>
              <p className="mt-1 text-sm">{formatDate(proforma.fecha_emision)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Fecha de Vencimiento</label>
              <p className="mt-1 text-sm">{formatDate(proforma.fecha_vencimiento)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Cliente</label>
              <p className="mt-1 text-sm">{proforma.cliente_nombre || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Empresa</label>
              <p className="mt-1 text-sm">{proforma.empresa_nombre || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* �tems de la Proforma */}
      <Card>
        <CardHeader>
          <CardTitle>�tems de la Proforma</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No hay �tems en esta proforma
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>C�digo</TableHead>
                  <TableHead>Descripci�n</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Precio Unit.</TableHead>
                  <TableHead className="text-right">Descuento</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.codigo}</TableCell>
                    <TableCell>{item.descripcion}</TableCell>
                    <TableCell>{item.unidad_nombre || 'N/A'}</TableCell>
                    <TableCell className="text-right">{item.cantidad}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.precio_unitario)}</TableCell>
                    <TableCell className="text-right">{item.porcentaje_descuento}%</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Totales */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Totales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-md ml-auto">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(proforma.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA ({proforma.porcentaje_impuesto}%):</span>
              <span>{formatCurrency(proforma.impuesto)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>{formatCurrency(proforma.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DetalleProforma;