import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  Warehouse, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  FileBarChart,
  Eye,
  Plus
} from 'lucide-react';
import { dashboardService } from '../api/inventarioService';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const DashboardInventario = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [recentMovements, setRecentMovements] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, lowStockRes, movementsRes] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getLowStock({ limit: 5 }),
        dashboardService.getRecentMovements({ limit: 10 })
      ]);

      setSummary(summaryRes.data);
      setLowStock(lowStockRes.data.results || []);
      setRecentMovements(movementsRes.data.results || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar la información del dashboard"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <Package className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-600" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header with gradient */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard de Inventario
            </h1>
            <p className="text-gray-600 mt-1">Resumen general del estado de inventario</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild className="shadow-sm hover:shadow-md transition-all">
              <Link to="/inventario/stock">
                <Eye className="mr-2 h-4 w-4" />
                Ver Stock
              </Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all">
              <Link to="/inventario/movimientos/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Registrar Movimiento
              </Link>
            </Button>
          </div>
        </div>

        {/* Summary Cards with gradients and animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-90"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">
                Total Almacenes
              </CardTitle>
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <Warehouse className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-white">{summary?.total_almacenes || 0}</div>
              <p className="text-xs text-white/80 mt-1">
                Almacenes activos
              </p>
              <ArrowUpRight className="absolute bottom-4 right-4 h-4 w-4 text-white/40" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 opacity-90"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">
                Productos en Stock
              </CardTitle>
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-white">{summary?.total_productos || 0}</div>
              <p className="text-xs text-white/80 mt-1">
                Productos únicos
              </p>
              <BarChart3 className="absolute bottom-4 right-4 h-4 w-4 text-white/40" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 opacity-90"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">
                Alertas Activas
              </CardTitle>
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-white">{summary?.alertas_activas || 0}</div>
              <p className="text-xs text-white/80 mt-1">
                Requieren atención
              </p>
              {(summary?.alertas_activas || 0) > 0 && (
                <Badge variant="destructive" className="absolute bottom-4 right-4 bg-white/20 border-0">
                  Urgente
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 opacity-90"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">
                Movimientos Hoy
              </CardTitle>
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-white">{summary?.movimientos_hoy || 0}</div>
              <p className="text-xs text-white/80 mt-1">
                Entradas y salidas
              </p>
              <FileBarChart className="absolute bottom-4 right-4 h-4 w-4 text-white/40" />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Análisis Rápido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Ocupación de Almacenes</span>
                  <span className="text-sm text-gray-600">75%</span>
                </div>
                <Progress value={75} className="h-2 bg-gray-200">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{ width: '75%' }} />
                </Progress>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Productos en Stock Crítico</span>
                  <span className="text-sm text-gray-600">15%</span>
                </div>
                <Progress value={15} className="h-2 bg-gray-200">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" style={{ width: '15%' }} />
                </Progress>
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to="/inventario/reportes">
                  Ver Análisis Completo
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Low Stock Alerts - Modern Card */}
          {lowStock.length > 0 && (
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 lg:col-span-2">
              <CardHeader className="pb-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center animate-pulse">
                      <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-semibold">Productos con Stock Bajo</span>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    {lowStock.length} alertas
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {lowStock.slice(0, 5).map((item, index) => (
                    <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-2 w-2 rounded-full ${index === 0 ? 'bg-red-500 animate-pulse' : 'bg-orange-500'}`} />
                          <div>
                            <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {item.producto_nombre}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                              <Warehouse className="h-3 w-3" />
                              {item.almacen_nombre}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <div className="text-sm">
                              <span className="font-bold text-red-600">{item.cantidad_actual}</span>
                              <span className="text-gray-400 mx-1">/</span>
                              <span className="text-gray-600">{item.stock_minimo}</span>
                            </div>
                            <Progress value={(item.cantidad_actual / item.stock_minimo) * 100} className="w-20 h-2">
                              <div 
                                className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full" 
                                style={{ width: `${Math.min((item.cantidad_actual / item.stock_minimo) * 100, 100)}%` }} 
                              />
                            </Progress>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Min. requerido</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-gray-50 rounded-b-lg">
                  <Button variant="outline" asChild className="w-full hover:bg-white">
                    <Link to="/inventario/alertas">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Ver todas las alertas
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Movements - Timeline Style */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                <span>Movimientos Recientes</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                Últimas 24 horas
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              <div className="divide-y divide-gray-100">
                {recentMovements.map((movement, index) => (
                  <div key={movement.id} className="relative p-6 hover:bg-gray-50 transition-colors">
                    {/* Timeline dot */}
                    <div className={`absolute left-6 w-4 h-4 rounded-full border-4 border-white 
                      ${movement.tipo_movimiento === 'ENTRADA' 
                        ? 'bg-green-500' 
                        : 'bg-red-500'} 
                      ${index === 0 ? 'animate-pulse' : ''}`} 
                    />
                    
                    <div className="ml-12 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center
                          ${movement.tipo_movimiento === 'ENTRADA' 
                            ? 'bg-green-100' 
                            : 'bg-red-100'}`}>
                          {movement.tipo_movimiento === 'ENTRADA' ? (
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{movement.producto_nombre}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Warehouse className="h-3 w-3" />
                              {movement.almacen_nombre}
                            </span>
                            <span>•</span>
                            <span>{new Date(movement.fecha_movimiento).toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={movement.tipo_movimiento === 'ENTRADA' ? 'success' : 'destructive'}
                          className="font-bold text-sm"
                        >
                          {movement.tipo_movimiento === 'ENTRADA' ? '+' : '-'}{movement.cantidad}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{movement.usuario_nombre}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-b-lg">
              <Button variant="outline" asChild className="w-full hover:bg-white">
                <Link to="/inventario/movimientos">
                  <Activity className="mr-2 h-4 w-4" />
                  Ver historial completo
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardInventario;