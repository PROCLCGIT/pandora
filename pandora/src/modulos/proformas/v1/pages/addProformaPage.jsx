// /pandora/src/modulos/proformas/pages/v1/addProformaPage.jsx
import React, { useState } from 'react';
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
  ShoppingCart,
  ChevronDown,
  Filter,
  ArrowLeftRight,
  Download,
  Printer,
  Share2,
  Settings2,
  CheckSquare,
} from 'lucide-react';

// Importar componentes factorizados
import ClienteSection from '../components/form/ClienteSection';
import DetallesProformaSection from '../components/form/DetallesProformaSection';
import ProductosServiciosTable from '../components/form/ProductosServiciosTable';
import ResumenSection from '../components/form/ResumenSection';

export default function AddProformaPage() {
  const [cliente, setCliente] = useState({});
  const [detallesProforma, setDetallesProforma] = useState({});
  const [productos, setProductos] = useState([]);
  const [totales, setTotales] = useState({ subtotal: 0, iva: 0, total: 0 });
  const [showProductosDisponibles, setShowProductosDisponibles] = useState(false);

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
          <Button>
            <PlusSquare className="mr-2 h-4 w-4" />
            Guardar
          </Button>
        </div>
      </div>

      {/* Sub-header */}
      <div className="flex items-center justify-between">
        <span className="text-gray-600">#PRO-2025-3766</span>
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
          Válida hasta: 5/4/2025
        </span>
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

      {/* Agregar ítem desplegable */}
      <Card className="bg-purple-300/20 border-purple-200 cursor-pointer hover:bg-purple-300/30 transition-colors">
        <CardContent 
          className="py-3"
          onClick={() => setShowProductosDisponibles(!showProductosDisponibles)}
        >
          <div className="flex items-center text-purple-700 font-medium">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Agregar ítem desde productos disponibles:
            <ChevronDown className={`ml-auto h-5 w-5 transition-transform ${showProductosDisponibles ? 'rotate-180' : ''}`} />
          </div>
        </CardContent>
      </Card>

      {/* Panel de productos disponibles (placeholder por ahora) */}
      {showProductosDisponibles && (
        <Card className="border-purple-200">
          <CardContent className="p-4">
            <p className="text-gray-600 text-center">
              Aquí se mostrarán los productos disponibles para agregar
            </p>
          </CardContent>
        </Card>
      )}

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
    </div>
  );
}
