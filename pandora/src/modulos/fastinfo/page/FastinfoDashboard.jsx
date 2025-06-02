import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Database, 
  Building2, 
  Users, 
  Activity,
  RefreshCw,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import fastinfoApi from '../api/fastinfoApi';

const FastinfoDashboard = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEstadisticas = async () => {
    setLoading(true);
    try {
      const data = await fastinfoApi.getEstadisticas();
      setEstadisticas(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching estadísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstadisticas();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Preparar datos para gráficos
  const datosBarChart = estadisticas ? 
    Object.entries(estadisticas.por_entidad).map(([entidad, cantidad]) => ({
      entidad: entidad.length > 15 ? `${entidad.substring(0, 15)}...` : entidad,
      cantidad
    })) : [];

  const datosPieChart = estadisticas ? [
    { name: 'Activos', value: estadisticas.activos },
    { name: 'Inactivos', value: estadisticas.inactivos }
  ] : [];

  const StatCard = ({ title, value, icon: Icon, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-500",
      green: "bg-green-500", 
      orange: "bg-orange-500",
      purple: "bg-purple-500"
    };

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? '-' : value}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard FastInfo</h1>
          <p className="text-gray-600">Estadísticas generales del sistema</p>
        </div>
        <Button 
          onClick={fetchEstadisticas}
          disabled={loading}
          variant="outline"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error al cargar estadísticas: {error}</AlertDescription>
        </Alert>
      )}

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Registros"
          value={estadisticas?.total || 0}
          icon={Database}
          color="blue"
        />
        <StatCard
          title="Registros Activos"
          value={estadisticas?.activos || 0}
          icon={Activity}
          color="green"
        />
        <StatCard
          title="Registros Inactivos"
          value={estadisticas?.inactivos || 0}
          icon={Users}
          color="orange"
        />
        <StatCard
          title="Tipos de Entidad"
          value={estadisticas ? Object.keys(estadisticas.por_entidad).length : 0}
          icon={Building2}
          color="purple"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras - Datos por entidad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Datos por Tipo de Entidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                Cargando...
              </div>
            ) : datosBarChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={datosBarChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="entidad" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No hay datos para mostrar
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de pastel - Estado activo/inactivo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Distribución por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                Cargando...
              </div>
            ) : datosPieChart.length > 0 && estadisticas?.total > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={datosPieChart}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {datosPieChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No hay datos para mostrar
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabla resumen por entidad */}
      {estadisticas && Object.keys(estadisticas.por_entidad).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen por Entidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Entidad</th>
                    <th className="text-right py-2">Cantidad de Registros</th>
                    <th className="text-right py-2">Porcentaje</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(estadisticas.por_entidad)
                    .sort(([,a], [,b]) => b - a)
                    .map(([entidad, cantidad]) => (
                    <tr key={entidad} className="border-b">
                      <td className="py-2">{entidad}</td>
                      <td className="text-right py-2">{cantidad}</td>
                      <td className="text-right py-2">
                        {((cantidad / estadisticas.total) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FastinfoDashboard;