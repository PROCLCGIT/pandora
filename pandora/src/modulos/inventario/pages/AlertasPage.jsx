import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Package,
  Search,
  Warehouse,
  Filter,
  X,
  Info,
  Zap,
  TrendingDown,
  ShieldAlert,
  XCircle,
  Activity
} from 'lucide-react';
import { alertasService, almacenesService } from '../api/inventarioService';
import { useToast } from '@/hooks/use-toast';

const AlertasPage = () => {
  const [alertas, setAlertas] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    almacen: '',
    tipoAlerta: 'all', // all, stock_bajo, stock_maximo, vencimiento
    estado: 'activas' // all, activas, resueltas
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
    loadAlertas();
  }, [pagination.page, filters]);

  const loadAlmacenes = async () => {
    try {
      const response = await almacenesService.getAll({ page_size: 100 });
      setAlmacenes(response.data.results || []);
    } catch (error) {
      console.error('Error loading almacenes:', error);
    }
  };

  const loadAlertas = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        page_size: pagination.pageSize,
        search: filters.search,
        ...(filters.almacen && { almacen: filters.almacen }),
        ...(filters.tipoAlerta !== 'all' && { tipo_alerta: filters.tipoAlerta.toUpperCase() }),
        ...(filters.estado !== 'all' && { estado: filters.estado })
      };

      const service = filters.estado === 'activas' ? alertasService.getActive : alertasService.getAll;
      const response = await service(params);
      
      setAlertas(response.data.results || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.count || 0
      }));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las alertas"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertaId) => {
    try {
      await alertasService.resolve(alertaId);
      toast({
        title: "Éxito",
        description: "Alerta marcada como resuelta"
      });
      loadAlertas();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo resolver la alerta"
      });
    }
  };

  const getAlertConfig = (tipo) => {
    switch (tipo) {
      case 'STOCK_BAJO':
        return {
          icon: <TrendingDown className="h-5 w-5" />,
          bgColor: 'from-yellow-50 to-orange-50',
          borderColor: 'border-l-yellow-500',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          variant: 'warning',
          title: 'Stock Bajo',
          priority: 'media'
        };
      case 'STOCK_MAXIMO':
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          bgColor: 'from-orange-50 to-red-50',
          borderColor: 'border-l-orange-500',
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600',
          variant: 'default',
          title: 'Stock Máximo Excedido',
          priority: 'baja'
        };
      case 'VENCIMIENTO':
        return {
          icon: <Clock className="h-5 w-5" />,
          bgColor: 'from-red-50 to-red-100',
          borderColor: 'border-l-red-500',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          variant: 'destructive',
          title: 'Producto Próximo a Vencer',
          priority: 'alta'
        };
      default:
        return {
          icon: <Info className="h-5 w-5" />,
          bgColor: 'from-gray-50 to-gray-100',
          borderColor: 'border-l-gray-500',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          variant: 'default',
          title: 'Alerta',
          priority: 'baja'
        };
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'alta':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Urgente</Badge>;
      case 'media':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Media</Badge>;
      case 'baja':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Baja</Badge>;
      default:
        return null;
    }
  };

  if (loading && alertas.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600 mx-auto"></div>
            <AlertTriangle className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-red-600 animate-pulse" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Cargando alertas...</p>
        </div>
      </div>
    );
  }

  // Group alerts by priority
  const alertsByPriority = {
    alta: alertas.filter(a => getAlertConfig(a.tipo_alerta).priority === 'alta'),
    media: alertas.filter(a => getAlertConfig(a.tipo_alerta).priority === 'media'),
    baja: alertas.filter(a => getAlertConfig(a.tipo_alerta).priority === 'baja')
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Alertas de Inventario
            </h1>
            <p className="text-gray-600 mt-1">Monitorea situaciones que requieren atención</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Badge className="bg-red-100 text-red-700 text-sm px-3 py-1 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                {alertsByPriority.alta.filter(a => !a.fecha_resolucion).length} Urgentes
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-700 text-sm px-3 py-1">
                {alertsByPriority.media.filter(a => !a.fecha_resolucion).length} Media
              </Badge>
              <Badge className="bg-gray-100 text-gray-700 text-sm px-3 py-1">
                {alertsByPriority.baja.filter(a => !a.fecha_resolucion).length} Baja
              </Badge>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">Total Alertas</p>
                  <p className="text-3xl font-bold text-red-800 mt-1">{alertas.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-200 flex items-center justify-center">
                  <ShieldAlert className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Activas</p>
                  <p className="text-3xl font-bold text-orange-800 mt-1">
                    {alertas.filter(a => !a.fecha_resolucion).length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-200 flex items-center justify-center animate-pulse">
                  <Bell className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Resueltas</p>
                  <p className="text-3xl font-bold text-green-800 mt-1">
                    {alertas.filter(a => a.fecha_resolucion).length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-200 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">Stock Bajo</p>
                  <p className="text-3xl font-bold text-yellow-800 mt-1">
                    {alertas.filter(a => a.tipo_alerta === 'STOCK_BAJO').length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-200 flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-yellow-600" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar alertas..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-12 h-11 border-2 focus:border-red-500 transition-colors"
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

              <Select value={filters.tipoAlerta} onValueChange={(value) => setFilters(prev => ({ ...prev, tipoAlerta: value }))}>
                <SelectTrigger className="h-11 border-2">
                  <SelectValue placeholder="Tipo de alerta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Todas
                    </div>
                  </SelectItem>
                  <SelectItem value="stock_bajo">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-yellow-600" />
                      Stock Bajo
                    </div>
                  </SelectItem>
                  <SelectItem value="stock_maximo">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      Stock Máximo
                    </div>
                  </SelectItem>
                  <SelectItem value="vencimiento">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-red-600" />
                      Vencimiento
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.estado} onValueChange={(value) => setFilters(prev => ({ ...prev, estado: value }))}>
                <SelectTrigger className="h-11 border-2">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="activas">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-orange-600" />
                      Activas
                    </div>
                  </SelectItem>
                  <SelectItem value="resueltas">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Resueltas
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                onClick={() => setFilters({ search: '', almacen: '', tipoAlerta: 'all', estado: 'activas' })}
                className="hover:bg-gray-100"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List - Enhanced with groups */}
        <div className="space-y-6">
          {/* Priority Groups */}
          {['alta', 'media', 'baja'].map((priority) => {
            const priorityAlerts = alertas.filter(a => getAlertConfig(a.tipo_alerta).priority === priority);
            if (priorityAlerts.length === 0) return null;

            return (
              <div key={priority} className="space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Prioridad {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </h3>
                  {getPriorityBadge(priority)}
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                <div className="space-y-3">
                  {priorityAlerts.map((alerta) => {
                    const config = getAlertConfig(alerta.tipo_alerta);
                    
                    return (
                      <Card 
                        key={alerta.id} 
                        className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${config.borderColor} overflow-hidden`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${config.bgColor} opacity-50`}></div>
                        <CardContent className="relative p-6">
                          <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className={`h-14 w-14 rounded-full ${config.iconBg} flex items-center justify-center flex-shrink-0 ${
                              !alerta.fecha_resolucion && priority === 'alta' ? 'animate-pulse' : ''
                            }`}>
                              <div className={config.iconColor}>
                                {config.icon}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    {config.title}
                                    {!alerta.fecha_resolucion && priority === 'alta' && (
                                      <Zap className="h-5 w-5 text-red-600 animate-pulse" />
                                    )}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1">{alerta.descripcion}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {alerta.fecha_resolucion ? (
                                    <Badge className="bg-green-100 text-green-700 border-green-200 font-medium">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Resuelta
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-red-100 text-red-700 border-red-200 font-medium animate-pulse">
                                      <Bell className="h-3 w-3 mr-1" />
                                      Activa
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="flex items-center gap-2 text-sm">
                                  <Package className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium text-gray-700">{alerta.producto_nombre}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="font-mono text-gray-600">COD: {alerta.producto_codigo}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Warehouse className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-600">{alerta.almacen_nombre}</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Creada: {new Date(alerta.fecha_creacion).toLocaleDateString()}
                                  </div>
                                  {alerta.fecha_resolucion && (
                                    <div className="flex items-center gap-1">
                                      <CheckCircle className="h-3 w-3" />
                                      Resuelta: {new Date(alerta.fecha_resolucion).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                                {!alerta.fecha_resolucion && (
                                  <Button 
                                    size="sm"
                                    onClick={() => handleResolveAlert(alerta.id)}
                                    className={`${
                                      priority === 'alta' 
                                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                                    } transition-colors`}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Marcar como resuelta
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {alertas.length === 0 && (
            <Card className="border-0 shadow-lg">
              <CardContent className="text-center py-16">
                <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron alertas</h3>
                <p className="text-gray-500">El sistema no ha detectado situaciones que requieran atención</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pagination - Enhanced */}
        {pagination.total > pagination.pageSize && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Mostrando {((pagination.page - 1) * pagination.pageSize) + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total} alertas
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

export default AlertasPage;