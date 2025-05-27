import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Package,
  AlertTriangle,
  Filter,
  Download,
  ArrowUpDown,
  TrendingDown,
  CheckCircle,
  XCircle,
  BarChart3,
  Eye,
  Warehouse
} from 'lucide-react';
import { stockService, almacenesService } from '../api/inventarioService';
import { useToast } from '@/hooks/use-toast';

const StockPage = () => {
  const [stock, setStock] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    almacen: '',
    stockStatus: 'all' // all, low, normal, high
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadAlmacenes();
  }, []);

  useEffect(() => {
    loadStock();
  }, [pagination.page, filters]);

  const loadAlmacenes = async () => {
    try {
      const response = await almacenesService.getAll({ page_size: 100 });
      setAlmacenes(response.data.results || []);
    } catch (error) {
      console.error('Error loading almacenes:', error);
    }
  };

  const loadStock = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        page_size: pagination.pageSize,
        search: filters.search,
        ...(filters.almacen && { almacen: filters.almacen }),
        ...(filters.stockStatus !== 'all' && { stock_status: filters.stockStatus })
      };

      const response = await stockService.getAll(params);
      
      setStock(response.data.results || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.count || 0
      }));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar el inventario"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (item) => {
    const percentage = (item.cantidad_actual / item.stock_maximo) * 100;
    
    if (item.cantidad_actual <= item.stock_minimo) {
      return { label: 'Stock Bajo', variant: 'destructive', color: 'red' };
    } else if (percentage >= 80) {
      return { label: 'Stock Alto', variant: 'warning', color: 'orange' };
    } else {
      return { label: 'Normal', variant: 'success', color: 'green' };
    }
  };

  const getStockPercentage = (item) => {
    return Math.min((item.cantidad_actual / item.stock_maximo) * 100, 100);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast({
      title: "Exportar Stock",
      description: "Funcionalidad en desarrollo"
    });
  };

  if (loading && stock.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <Package className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-600" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Cargando inventario...</p>
        </div>
      </div>
    );
  }

  // Calculate stock statistics
  const stockStats = {
    low: stock.filter(item => item.cantidad_actual <= item.stock_minimo).length,
    normal: stock.filter(item => {
      const percentage = (item.cantidad_actual / item.stock_maximo) * 100;
      return item.cantidad_actual > item.stock_minimo && percentage < 80;
    }).length,
    high: stock.filter(item => (item.cantidad_actual / item.stock_maximo) * 100 >= 80).length,
    total: stock.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Control de Stock
            </h1>
            <p className="text-gray-600 mt-1">Monitorea y gestiona los niveles de inventario</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="shadow-sm hover:shadow-md transition-all">
              <BarChart3 className="mr-2 h-4 w-4" />
              Reportes
            </Button>
            <Button onClick={handleExport} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Stock Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Productos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stockStats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">Stock Bajo</p>
                  <p className="text-3xl font-bold text-red-800 mt-1">{stockStats.low}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-200 flex items-center justify-center animate-pulse">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Stock Normal</p>
                  <p className="text-3xl font-bold text-green-800 mt-1">{stockStats.normal}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-200 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Stock Alto</p>
                  <p className="text-3xl font-bold text-orange-800 mt-1">{stockStats.high}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-200 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters - Enhanced */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar productos..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-12 h-11 border-2 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <Select value={filters.almacen} onValueChange={(value) => setFilters(prev => ({ ...prev, almacen: value }))}>
                <SelectTrigger className="h-11 border-2">
                  <SelectValue placeholder="Todos los almacenes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los almacenes</SelectItem>
                  {almacenes.map(almacen => (
                    <SelectItem key={almacen.id} value={almacen.id.toString()}>
                      {almacen.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.stockStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, stockStatus: value }))}>
                <SelectTrigger className="h-11 border-2">
                  <SelectValue placeholder="Estado del stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-gray-400" />
                      Todos
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      Stock Bajo
                    </div>
                  </SelectItem>
                  <SelectItem value="normal">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      Stock Normal
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-orange-500" />
                      Stock Alto
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => setFilters({ search: '', almacen: '', stockStatus: 'all' })}
                className="h-11 hover:bg-gray-100"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stock Table - Enhanced */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-600" />
                Inventario Actual
              </div>
              <Badge variant="secondary" className="text-sm">
                {stock.length} productos
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-bold text-gray-700">Imagen</TableHead>
                    <TableHead className="font-bold text-gray-700">
                      <div className="flex items-center gap-1">
                        Código
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-gray-700">Producto</TableHead>
                    <TableHead className="font-bold text-gray-700">
                      <div className="flex items-center gap-1">
                        <Warehouse className="h-3 w-3" />
                        Almacén
                      </div>
                    </TableHead>
                    <TableHead className="text-center font-bold text-gray-700">Nivel de Stock</TableHead>
                    <TableHead className="text-center font-bold text-gray-700">Cantidad</TableHead>
                    <TableHead className="text-center font-bold text-gray-700">Estado</TableHead>
                    <TableHead className="text-center font-bold text-gray-700">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stock.map((item, index) => {
                    const status = getStockStatus(item);
                    const percentage = getStockPercentage(item);
                    
                    return (
                      <TableRow 
                        key={item.id} 
                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                      >
                        <TableCell>
                          <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm font-medium">
                          {item.producto_codigo}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-gray-900">{item.producto_nombre}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Última actualización: {new Date(item.ultima_actualizacion).toLocaleDateString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-medium">
                            {item.almacen_nombre}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="w-full max-w-[200px] mx-auto space-y-2">
                            <div className="flex justify-between text-xs font-medium">
                              <span>Min: {item.stock_minimo}</span>
                              <span>{item.cantidad_actual}</span>
                              <span>Max: {item.stock_maximo}</span>
                            </div>
                            <Progress value={percentage} className="h-3">
                              <div 
                                className={`h-full rounded-full transition-all ${
                                  status.color === 'red' 
                                    ? 'bg-gradient-to-r from-red-500 to-red-600' 
                                    : status.color === 'orange'
                                    ? 'bg-gradient-to-r from-orange-500 to-yellow-500'
                                    : 'bg-gradient-to-r from-green-500 to-green-600'
                                }`} 
                                style={{ width: `${percentage}%` }} 
                              />
                            </Progress>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {item.cantidad_actual}
                          </div>
                          <p className="text-xs text-gray-500">unidades</p>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={status.variant}
                            className={`${
                              status.color === 'red' 
                                ? 'bg-red-100 text-red-700 border-red-200' 
                                : status.color === 'orange'
                                ? 'bg-orange-100 text-orange-700 border-orange-200'
                                : 'bg-green-100 text-green-700 border-green-200'
                            } font-medium`}
                          >
                            <div className={`h-2 w-2 rounded-full mr-1.5 ${
                              status.color === 'red' ? 'bg-red-500' : 
                              status.color === 'orange' ? 'bg-orange-500' : 'bg-green-500'
                            } ${status.color === 'red' ? 'animate-pulse' : ''}`} />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1">
                            <Button variant="ghost" size="sm" className="hover:bg-blue-100 hover:text-blue-600">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                              <ArrowUpDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {stock.length === 0 && (
              <div className="text-center py-16">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron productos</h3>
                <p className="text-gray-500">Ajusta los filtros o agrega nuevos productos al inventario</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination - Enhanced */}
        {pagination.total > pagination.pageSize && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Mostrando {((pagination.page - 1) * pagination.pageSize) + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total} productos
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="hover:bg-gray-100"
                  >
                    Anterior
                  </Button>
                  <div className="flex items-center px-4 bg-gray-100 rounded-md">
                    <span className="font-medium">
                      {pagination.page} / {Math.ceil(pagination.total / pagination.pageSize)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                    className="hover:bg-gray-100"
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StockPage;