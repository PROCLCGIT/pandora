import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  FileText,
  ArrowRightLeft,
  Clock,
  User,
  Package,
  Warehouse,
  XCircle,
  Download,
  Activity
} from 'lucide-react';
import { movimientosService, almacenesService } from '../api/inventarioService';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const MovimientosPage = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    almacen: '',
    tipoMovimiento: 'all', // all, entrada, salida, transferencia
    fechaInicio: '',
    fechaFin: ''
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
    loadMovimientos();
  }, [pagination.page, filters]);

  const loadAlmacenes = async () => {
    try {
      const response = await almacenesService.getAll({ page_size: 100 });
      setAlmacenes(response.data.results || []);
    } catch (error) {
      console.error('Error loading almacenes:', error);
    }
  };

  const loadMovimientos = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        page_size: pagination.pageSize,
        search: filters.search,
        ...(filters.almacen && { almacen: filters.almacen }),
        ...(filters.tipoMovimiento !== 'all' && { tipo_movimiento: filters.tipoMovimiento.toUpperCase() }),
        ...(filters.fechaInicio && { fecha_inicio: filters.fechaInicio }),
        ...(filters.fechaFin && { fecha_fin: filters.fechaFin })
      };

      const response = await movimientosService.getAll(params);
      
      setMovimientos(response.data.results || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.count || 0
      }));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los movimientos"
      });
    } finally {
      setLoading(false);
    }
  };

  const getMovimientoIcon = (tipo) => {
    switch (tipo) {
      case 'ENTRADA':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'SALIDA':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'TRANSFERENCIA':
        return <ArrowRightLeft className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getMovimientoBadge = (tipo) => {
    switch (tipo) {
      case 'ENTRADA':
        return <Badge variant="success">Entrada</Badge>;
      case 'SALIDA':
        return <Badge variant="destructive">Salida</Badge>;
      case 'TRANSFERENCIA':
        return <Badge variant="default">Transferencia</Badge>;
      default:
        return <Badge>{tipo}</Badge>;
    }
  };

  if (loading && movimientos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <Activity className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-600" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Cargando movimientos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Movimientos de Inventario
            </h1>
            <p className="text-gray-600 mt-1">Historial de entradas, salidas y transferencias</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="shadow-sm hover:shadow-md transition-all">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all">
              <Link to="/inventario/movimientos/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Movimiento
              </Link>
            </Button>
          </div>
        </div>

        {/* Movement Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Entradas Hoy</p>
                  <p className="text-3xl font-bold text-green-800 mt-1">
                    {movimientos.filter(m => m.tipo_movimiento === 'ENTRADA' && 
                      new Date(m.fecha_movimiento).toDateString() === new Date().toDateString()).length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-200 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">Salidas Hoy</p>
                  <p className="text-3xl font-bold text-red-800 mt-1">
                    {movimientos.filter(m => m.tipo_movimiento === 'SALIDA' && 
                      new Date(m.fecha_movimiento).toDateString() === new Date().toDateString()).length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-200 flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Transferencias Hoy</p>
                  <p className="text-3xl font-bold text-blue-800 mt-1">
                    {movimientos.filter(m => m.tipo_movimiento === 'TRANSFERENCIA' && 
                      new Date(m.fecha_movimiento).toDateString() === new Date().toDateString()).length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center">
                  <ArrowRightLeft className="h-6 w-6 text-blue-600" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar por producto o referencia..."
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

              <Select value={filters.tipoMovimiento} onValueChange={(value) => setFilters(prev => ({ ...prev, tipoMovimiento: value }))}>
                <SelectTrigger className="h-11 border-2">
                  <SelectValue placeholder="Tipo de movimiento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Todos
                    </div>
                  </SelectItem>
                  <SelectItem value="entrada">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      Entradas
                    </div>
                  </SelectItem>
                  <SelectItem value="salida">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      Salidas
                    </div>
                  </SelectItem>
                  <SelectItem value="transferencia">
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft className="h-4 w-4 text-blue-600" />
                      Transferencias
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                <Input
                  type="date"
                  placeholder="Fecha inicio"
                  value={filters.fechaInicio}
                  onChange={(e) => setFilters(prev => ({ ...prev, fechaInicio: e.target.value }))}
                  className="pl-10 h-11 border-2"
                />
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                <Input
                  type="date"
                  placeholder="Fecha fin"
                  value={filters.fechaFin}
                  onChange={(e) => setFilters(prev => ({ ...prev, fechaFin: e.target.value }))}
                  className="pl-10 h-11 border-2"
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                onClick={() => setFilters({ search: '', almacen: '', tipoMovimiento: 'all', fechaInicio: '', fechaFin: '' })}
                className="hover:bg-gray-100"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Movements Timeline - Enhanced */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-600" />
                Historial de Movimientos
              </div>
              <Badge variant="secondary" className="text-sm">
                {movimientos.length} registros
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Timeline Layout */}
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              <div className="divide-y divide-gray-100">
                {movimientos.map((movimiento, index) => (
                  <div key={movimiento.id} className="relative group hover:bg-gray-50 transition-colors">
                    <div className="flex items-start p-6">
                      {/* Timeline dot */}
                      <div className={`absolute left-6 w-4 h-4 rounded-full border-4 border-white z-10
                        ${movimiento.tipo_movimiento === 'ENTRADA' 
                          ? 'bg-green-500' 
                          : movimiento.tipo_movimiento === 'SALIDA'
                          ? 'bg-red-500'
                          : 'bg-blue-500'} 
                        ${index === 0 ? 'animate-pulse' : ''}`} 
                      />
                      
                      {/* Movement Icon */}
                      <div className={`ml-8 mr-4 h-12 w-12 rounded-lg flex items-center justify-center
                        ${movimiento.tipo_movimiento === 'ENTRADA' 
                          ? 'bg-green-100' 
                          : movimiento.tipo_movimiento === 'SALIDA'
                          ? 'bg-red-100'
                          : 'bg-blue-100'}`}>
                        {getMovimientoIcon(movimiento.tipo_movimiento)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {movimiento.producto_nombre}
                              </h4>
                              <Badge 
                                variant={
                                  movimiento.tipo_movimiento === 'ENTRADA' ? 'success' : 
                                  movimiento.tipo_movimiento === 'SALIDA' ? 'destructive' : 
                                  'default'
                                }
                                className="font-medium"
                              >
                                {movimiento.tipo_movimiento === 'ENTRADA' ? 'Entrada' :
                                 movimiento.tipo_movimiento === 'SALIDA' ? 'Salida' :
                                 'Transferencia'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Package className="h-4 w-4" />
                                <span className="font-mono">{movimiento.producto_codigo}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-gray-600">
                                <Warehouse className="h-4 w-4" />
                                <span>
                                  {movimiento.almacen_nombre}
                                  {movimiento.tipo_movimiento === 'TRANSFERENCIA' && movimiento.almacen_destino_nombre && (
                                    <span className="text-blue-600"> → {movimiento.almacen_destino_nombre}</span>
                                  )}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-gray-600">
                                <User className="h-4 w-4" />
                                <span>{movimiento.usuario_nombre}</span>
                              </div>
                            </div>
                            
                            {movimiento.referencia && (
                              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                <FileText className="h-4 w-4" />
                                <span>Ref: {movimiento.referencia}</span>
                              </div>
                            )}
                            
                            {movimiento.observaciones && (
                              <p className="mt-2 text-sm text-gray-600 bg-gray-100 rounded-lg p-2">
                                {movimiento.observaciones}
                              </p>
                            )}
                          </div>
                          
                          <div className="ml-4 text-right">
                            <div className={`text-2xl font-bold ${
                              movimiento.tipo_movimiento === 'ENTRADA' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {movimiento.tipo_movimiento === 'ENTRADA' ? '+' : '-'}{movimiento.cantidad}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              <div className="flex items-center gap-1 justify-end">
                                <Calendar className="h-3 w-3" />
                                {new Date(movimiento.fecha_movimiento).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1 justify-end mt-0.5">
                                <Clock className="h-3 w-3" />
                                {new Date(movimiento.fecha_movimiento).toLocaleTimeString('es-ES', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {movimientos.length === 0 && (
              <div className="text-center py-16">
                <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron movimientos</h3>
                <p className="text-gray-500">Ajusta los filtros o registra un nuevo movimiento</p>
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
                  Mostrando {((pagination.page - 1) * pagination.pageSize) + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total} movimientos
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

export default MovimientosPage;