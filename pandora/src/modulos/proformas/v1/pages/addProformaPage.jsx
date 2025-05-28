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
  Eye,
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

// Clave para guardar el borrador en localStorage
const DRAFT_KEY = 'proformaDraft';

export default function AddProformaPage() {
  const navigate = useNavigate();
  const [cliente, setCliente] = useState({});
  const [detallesProforma, setDetallesProforma] = useState({});
  const [productos, setProductos] = useState([]);
  const [totales, setTotales] = useState({ subtotal: 0, iva: 0, total: 0 });
  const [showProductosDisponibles, setShowProductosDisponibles] = useState(false);
  const [showProductosModal, setShowProductosModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [tiposContratacion, setTiposContratacion] = useState([]);

  // Cargar borrador desde localStorage al iniciar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.cliente) setCliente(draft.cliente);
        if (draft.detallesProforma) setDetallesProforma(draft.detallesProforma);
        if (draft.productos) setProductos(draft.productos);
      }
    } catch (err) {
      console.warn('No se pudo cargar el borrador de proforma', err);
    }
  }, []);

  // Guardar borrador en localStorage cuando cambie el formulario
  useEffect(() => {
    const draft = {
      cliente,
      detallesProforma,
      productos
    };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (err) {
      console.warn('No se pudo guardar el borrador de proforma', err);
    }
  }, [cliente, detallesProforma, productos]);

  const [notas, setNotas] = useState('Precios incluyen IVA. Entrega en sus oficinas sin costo adicional dentro del perímetro urbano.');

  // Fetch empresas and tipos contratacion on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [empresasData, tiposData] = await Promise.all([
          proformaService.getEmpresas(),
          proformaService.getTiposContratacion()
        ]);
        setEmpresas(empresasData.results || []);
        setTiposContratacion(tiposData.results || []);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchInitialData();
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
        notas: notas,
        estado: 'borrador'
      };

      console.log('Saving proforma:', proformaData);

      // Create proforma
      const response = await proformaService.createProforma(proformaData);
      
      // Save proforma items if any
      if (productos.length > 0) {
        const itemPromises = productos.map((producto, index) => {
          const itemData = {
            proforma: response.id,
            tipo_item: producto.tipo_item || 'producto_disponible',
            producto_disponible: producto.producto_disponible_id || null,
            producto_ofertado: producto.producto_ofertado_id || null,
            codigo: producto.codigo || '',
            descripcion: producto.descripcion || producto.nombre || '',
            unidad: producto.unidad_id || 1, // Default unit if not specified
            cantidad: producto.cantidad || 1,
            precio_unitario: producto.precio_unitario || producto.precio || 0,
            porcentaje_descuento: producto.porcentaje_descuento || 0,
            total: producto.total || 0,
            orden: index + 1
          };
          
          return proformaService.createProformaItem(itemData);
        });
        
        try {
          await Promise.all(itemPromises);
          console.log(`${productos.length} items guardados correctamente`);
        } catch (itemError) {
          console.error('Error saving proforma items:', itemError);
          // Don't fail the entire operation if items fail
        }
      }
      
      toast({
        title: 'Éxito',
        description: `Proforma ${response.numero} creada correctamente con ${productos.length} productos`,
      });

      // Clear localStorage draft after successful save
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch (err) {
        console.warn('No se pudo limpiar el borrador', err);
      }

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
            variant="outline"
            onClick={() => navigate('/proformas')}
          >
            <Eye className="mr-2 h-4 w-4" />
            Guardadas
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
        <span className="text-gray-600"># Se generará automáticamente</span>
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
        
        {/* Empresa, Tipo Contrato y Nombre de Proforma con layout alineado */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Empresa */}
            <div className="grid grid-cols-[140px,1fr] items-center gap-3">
              <label className="text-sm font-medium text-blue-800">
                Empresa:
              </label>
              <Select 
                value={detallesProforma.empresa?.toString() || ''}
                onValueChange={(value) => setDetallesProforma({...detallesProforma, empresa: value})}
              >
                <SelectTrigger className="w-full bg-white border-blue-300 h-8 text-sm">
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
            
            {/* Tipo de Contrato */}
            <div className="grid grid-cols-[140px,1fr] items-center gap-3">
              <label className="text-sm font-medium text-blue-800">
                Tipo de Contrato:
              </label>
              <Select 
                value={detallesProforma.tipoContratacion?.toString() || ''}
                onValueChange={(value) => setDetallesProforma({...detallesProforma, tipoContratacion: parseInt(value)})}
              >
                <SelectTrigger className="w-full bg-white border-blue-300 h-8 text-sm">
                  <SelectValue placeholder="Seleccione tipo de contrato" />
                </SelectTrigger>
                <SelectContent>
                  {tiposContratacion.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id.toString()}>
                      {tipo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Nombre de Proforma */}
          <div className="grid grid-cols-[140px,1fr] items-center gap-3">
            <label className="text-sm font-medium text-blue-800">
              Nombre de Proforma:
            </label>
            <Input
              value={detallesProforma.nombre || ''}
              onChange={(e) => setDetallesProforma({...detallesProforma, nombre: e.target.value})}
              placeholder="Ingrese un nombre descriptivo para la proforma"
              className="bg-white border-blue-300 h-8 text-sm"
            />
          </div>
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
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full min-h-[80px] h-20"
              placeholder="Ingrese notas adicionales para la proforma"
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
