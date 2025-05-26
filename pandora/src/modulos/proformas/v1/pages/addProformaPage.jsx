// /pandora/src/modulos/proformas/pages/v1/addProformaPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Search,
  PlusSquare,
  Edit3,
  Clock,
  FileText,
  ChevronDown,
  Filter,
  ArrowLeftRight,
  Download,
  Printer,
  Share2,
  Settings2,
  CheckSquare,
  Save,
  Loader2,
} from 'lucide-react';

// Importar componentes factorizados
import ClienteSection from '../components/form/ClienteSection';
import DetallesProformaSection from '../components/form/DetallesProformaSection';
import ProductosServiciosTable from '../components/form/ProductosServiciosTable';
import ResumenSection from '../components/form/ResumenSection';
import ProductosDisponiblesSelectionModal from '../components/modals/ProductosDisponiblesSelectionModal';
import ToolBarSection from '../components/form/ToolBarSection';
import { proformaService } from '../api/proformaService';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function AddProformaPage() {
  const navigate = useNavigate();
  const [cliente, setCliente] = useState({});
  const [detallesProforma, setDetallesProforma] = useState({});
  const [productos, setProductos] = useState([]);
  const [totales, setTotales] = useState({ subtotal: 0, iva: 0, total: 0 });
  const [showProductosDisponibles, setShowProductosDisponibles] = useState(false);
  const [showProductosModal, setShowProductosModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [proformaNumero, setProformaNumero] = useState('');
  const [empresas, setEmpresas] = useState([]);

  // Generate proforma number on mount
  useEffect(() => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9000) + 1000;
    setProformaNumero(`PRO-${year}-${random}`);
  }, []);

  // Fetch empresas on mount
  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const data = await proformaService.getEmpresas();
        setEmpresas(data.results || []);
      } catch (error) {
        console.error('Error fetching empresas:', error);
      }
    };
    fetchEmpresas();
  }, []);

  // Calculate totals when products change
  useEffect(() => {
    const subtotal = productos.reduce((sum, item) => sum + (item.total || 0), 0);
    const porcentajeImpuesto = detallesProforma.porcentajeImpuesto || 12;
    const impuesto = subtotal * (porcentajeImpuesto / 100);
    const total = subtotal + impuesto;
    
    setTotales({
      subtotal,
      iva: impuesto,
      total
    });
  }, [productos, detallesProforma.porcentajeImpuesto]);

  // Handle products selected from productos disponibles modal
  const handleProductosSelected = (selectedProducts) => {
    // Add selected products to existing productos array
    setProductos(prevProductos => [...prevProductos, ...selectedProducts]);
  };

  const handleSaveProforma = async () => {
    try {
      // Validate required fields
      if (!cliente.id) {
        toast({
          title: 'Error',
          description: 'Por favor seleccione un cliente',
          variant: 'destructive'
        });
        return;
      }

      if (!detallesProforma.nombre) {
        toast({
          title: 'Error',
          description: 'Por favor ingrese un nombre descriptivo para la proforma',
          variant: 'destructive'
        });
        return;
      }

      if (!detallesProforma.empresa) {
        toast({
          title: 'Error',
          description: 'Por favor seleccione una empresa',
          variant: 'destructive'
        });
        return;
      }

      if (!detallesProforma.tipoContratacion) {
        toast({
          title: 'Error',
          description: 'Por favor seleccione un tipo de contratación',
          variant: 'destructive'
        });
        return;
      }

      setLoading(true);

      // Format dates for backend
      const formatDateForBackend = (date) => {
        if (!date) return null;
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return format(dateObj, 'yyyy-MM-dd');
      };

      // Prepare proforma data
      const proformaData = {
        nombre: detallesProforma.nombre,
        fecha_emision: formatDateForBackend(detallesProforma.fechaEmision) || format(new Date(), 'yyyy-MM-dd'),
        fecha_vencimiento: formatDateForBackend(detallesProforma.fechaVencimiento) || format(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        cliente: cliente.id,
        empresa: detallesProforma.empresa,
        tipo_contratacion: detallesProforma.tipoContratacion,
        atencion_a: detallesProforma.atencion || '',
        condiciones_pago: detallesProforma.formaPago || '50% anticipo, 50% contra entrega',
        tiempo_entrega: detallesProforma.tiempoEntrega || '5 días hábiles',
        porcentaje_impuesto: detallesProforma.porcentajeImpuesto || 12,
        subtotal: totales.subtotal,
        impuesto: totales.iva,
        total: totales.total,
        notas: detallesProforma.notas || '',
        estado: 'borrador'
      };

      console.log('Saving proforma:', proformaData);

      // Create proforma
      const response = await proformaService.createProforma(proformaData);
      
      toast({
        title: 'Éxito',
        description: `Proforma ${response.numero} creada correctamente`,
      });

      // TODO: Save proforma items if any

      // Redirect to proforma detail or list
      navigate('/proformas');
      
    } catch (error) {
      console.error('Error saving proforma:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'No se pudo guardar la proforma',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Proforma</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Compartir
          </Button>
          <Button variant="outline">
            <Settings2 className="mr-2 h-4 w-4" />
            Configurar
          </Button>
          <Button variant="outline">
            <CheckSquare className="mr-2 h-4 w-4" />
            Generar
          </Button>
          <Button 
            onClick={handleSaveProforma}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Sub-header */}
      <div className="flex items-center justify-between">
        <span className="text-gray-600">#{proformaNumero}</span>
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
          Válida hasta: {detallesProforma.fechaVencimiento ? format(detallesProforma.fechaVencimiento, 'd/M/yyyy') : 'No establecida'}
        </span>
      </div>

      {/* Información Base */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-blue-700" />
          <h2 className="text-lg font-semibold text-blue-900">Información Base</h2>
        </div>
        
        {/* Empresa y Nombre de Proforma */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Empresa:
            </label>
            <Select 
              value={detallesProforma.empresa?.toString() || ''}
              onValueChange={(value) => setDetallesProforma({...detallesProforma, empresa: value})}
            >
              <SelectTrigger className="w-full bg-white border-blue-300">
                <SelectValue placeholder="Seleccione una empresa" />
              </SelectTrigger>
              <SelectContent>
                {empresas.map((empresa) => (
                  <SelectItem key={empresa.id} value={empresa.id.toString()}>
                    {empresa.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Nombre de Proforma:
            </label>
            <Input
              value={detallesProforma.nombre || ''}
              onChange={(e) => setDetallesProforma({...detallesProforma, nombre: e.target.value})}
              placeholder="Ingrese un nombre descriptivo para la proforma"
              className="bg-white border-blue-300"
            />
          </div>
        </div>
        
        {/* Cliente + Detalles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Cliente Section */}
          <ClienteSection 
            cliente={cliente} 
            onClienteChange={setCliente}
          />

          {/* Detalles de Proforma Section */}
          <DetallesProformaSection 
            detalles={detallesProforma}
            onDetallesChange={setDetallesProforma}
          />
        </div>
      </div>

      {/* Herramientas */}
      <ToolBarSection 
        onSelectProducts={() => setShowProductosModal(true)}
      />

      {/* Tabla de Productos y Servicios */}
      <ProductosServiciosTable 
        productos={productos}
        onProductosChange={setProductos}
        onTotalesChange={setTotales}
      />

      {/* Notas & Resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader className="py-3 px-4 bg-blue-300/20">
            <CardTitle className="flex items-center text-base font-bold">
              <Edit3 className="mr-2 h-4 w-4 text-blue-600" />
              Notas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Textarea
              defaultValue="Precios incluyen IVA. Entrega en sus oficinas sin costo adicional dentro del perímetro urbano."
              className="w-full min-h-[80px] h-20"
            />
          </CardContent>
        </Card>

        <ResumenSection totales={totales} />
      </div>

      <p className="text-center text-sm text-gray-500">
        Gracias por su preferencia. Esta proforma no constituye una factura.
      </p>

      {/* Modal for selecting productos disponibles */}
      <ProductosDisponiblesSelectionModal
        isOpen={showProductosModal}
        onClose={() => setShowProductosModal(false)}
        onProductosSelected={handleProductosSelected}
      />
    </div>
  );
}
