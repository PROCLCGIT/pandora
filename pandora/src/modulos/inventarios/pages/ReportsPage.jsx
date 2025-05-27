import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { 
  FileDown, 
  TrendingUp, 
  Package, 
  DollarSign,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { formatCurrency, formatNumber } from '../utils/formatters';

const ReportsPage = () => {
  const { stocks, almacenes, resumen, fetchStocks } = useInventory();
  const [selectedAlmacen, setSelectedAlmacen] = useState('');
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });

  useEffect(() => {
    fetchStocks({ almacen: selectedAlmacen });
  }, [selectedAlmacen, fetchStocks]);

  // Datos para gráficos
  const stockPorEstado = [
    { name: 'Normal', value: stocks.filter(s => s.estado_stock === 'normal').length, color: '#10b981' },
    { name: 'Bajo', value: stocks.filter(s => s.estado_stock === 'bajo').length, color: '#f59e0b' },
    { name: 'Crítico', value: stocks.filter(s => s.estado_stock === 'critico').length, color: '#ef4444' },
    { name: 'Agotado', value: stocks.filter(s => s.estado_stock === 'agotado').length, color: '#991b1b' },
  ];

  const top10ProductosPorValor = stocks
    .sort((a, b) => (b.cantidad * b.costo_promedio) - (a.cantidad * a.costo_promedio))
    .slice(0, 10)
    .map(stock => ({
      nombre: stock.producto_detalle?.nombre || 'N/A',
      valor: stock.cantidad * stock.costo_promedio
    }));

  const movimientosPorMes = [
    { mes: 'Ene', entradas: 45, salidas: 32 },
    { mes: 'Feb', entradas: 52, salidas: 38 },
    { mes: 'Mar', entradas: 48, salidas: 42 },
    { mes: 'Abr', entradas: 61, salidas: 45 },
    { mes: 'May', entradas: 55, salidas: 48 },
    { mes: 'Jun', entradas: 67, salidas: 52 },
  ];

  const handleExportReport = () => {
    // Aquí implementarías la lógica de exportación
    console.log('Exportando reporte...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes de Inventario</h1>
          <p className="text-muted-foreground">
            Análisis y estadísticas del inventario
          </p>
        </div>
        <Button onClick={handleExportReport}>
          <FileDown className="mr-2 h-4 w-4" />
          Exportar Reporte
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select
              value={selectedAlmacen}
              onValueChange={setSelectedAlmacen}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todos los almacenes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los almacenes</SelectItem>
                {almacenes.map((almacen) => (
                  <SelectItem key={almacen.id} value={almacen.id.toString()}>
                    {almacen.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Últimos 30 días
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Total del Inventario
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(resumen?.valor_total || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +12.5% respecto al mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total SKUs
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(resumen?.total_productos || 0, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(resumen?.alertas.criticos || 0, 0)} en estado crítico
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rotación de Inventario
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2x</div>
            <p className="text-xs text-muted-foreground">
              Promedio últimos 3 meses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Productos Agotados
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(resumen?.alertas.agotados || 0, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren reabastecimiento urgente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Estado del inventario */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado de Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stockPorEstado}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stockPorEstado.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Movimientos por mes */}
        <Card>
          <CardHeader>
            <CardTitle>Movimientos Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={movimientosPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="entradas" 
                  stroke="#10b981" 
                  name="Entradas"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="salidas" 
                  stroke="#ef4444" 
                  name="Salidas"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top 10 productos por valor */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Top 10 Productos por Valor en Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={top10ProductosPorValor}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="nombre" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="valor" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabla resumen */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-3">Categoría</th>
                  <th className="px-6 py-3 text-right">Productos</th>
                  <th className="px-6 py-3 text-right">Stock Total</th>
                  <th className="px-6 py-3 text-right">Valor</th>
                  <th className="px-6 py-3 text-right">% del Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-6 py-4 font-medium">Medicamentos</td>
                  <td className="px-6 py-4 text-right">156</td>
                  <td className="px-6 py-4 text-right">12,450</td>
                  <td className="px-6 py-4 text-right">{formatCurrency(125000)}</td>
                  <td className="px-6 py-4 text-right">45%</td>
                </tr>
                <tr className="border-b">
                  <td className="px-6 py-4 font-medium">Insumos Médicos</td>
                  <td className="px-6 py-4 text-right">89</td>
                  <td className="px-6 py-4 text-right">8,320</td>
                  <td className="px-6 py-4 text-right">{formatCurrency(78500)}</td>
                  <td className="px-6 py-4 text-right">28%</td>
                </tr>
                <tr className="border-b">
                  <td className="px-6 py-4 font-medium">Equipos</td>
                  <td className="px-6 py-4 text-right">34</td>
                  <td className="px-6 py-4 text-right">145</td>
                  <td className="px-6 py-4 text-right">{formatCurrency(67300)}</td>
                  <td className="px-6 py-4 text-right">24%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
