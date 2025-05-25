import React, { useState } from 'react';
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
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  ComposedChart,
  ReferenceLine
} from 'recharts';
import { 
  Calendar,
  DollarSign,
  FileText,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search,
  Download,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Settings,
  Trophy
} from 'lucide-react';

// Datos mejorados para las métricas
const metricsData = {
  totalProformas: 1247,
  ventasMes: 485750,
  tasaConversion: 74.8,
  proformasPendientes: 38,
  clientesActivos: 156,
  tiempoPromedio: '2.3'
};

// Datos para gráfico de ventas mensuales mejorado
const ventasMensuales = [
  { mes: 'Ene', ventas: 325000, proformas: 89, meta: 380000 },
  { mes: 'Feb', ventas: 452000, proformas: 124, meta: 400000 },
  { mes: 'Mar', ventas: 398000, proformas: 156, meta: 420000 },
  { mes: 'Abr', ventas: 521000, proformas: 178, meta: 450000 },
  { mes: 'May', ventas: 673000, proformas: 201, meta: 480000 },
  { mes: 'Jun', ventas: 485750, proformas: 167, meta: 500000 }
];

// Datos para gráfico de estado de proformas
const estadoProformas = [
  { estado: 'Aprobadas', cantidad: 623, color: '#10b981', percentage: 49.9 },
  { estado: 'Pendientes', cantidad: 287, color: '#f59e0b', percentage: 23.0 },
  { estado: 'En Revisión', cantidad: 198, color: '#3b82f6', percentage: 15.9 },
  { estado: 'Rechazadas', cantidad: 139, color: '#ef4444', percentage: 11.2 }
];

// Top vendedores - Solo top 3
const topVendedores = [
  { nombre: 'Carlos López', ventas: 125400, proformas: 45, avatar: 'CL', porcentaje: '+18.5%' },
  { nombre: 'María García', ventas: 98750, proformas: 38, avatar: 'MG', porcentaje: '+12.3%' },
  { nombre: 'Pedro Martínez', ventas: 87300, proformas: 32, avatar: 'PM', porcentaje: '+8.7%' }
];

// Datos para tabla de proformas recientes mejorada
const proformasRecientes = [
  {
    id: 'PF-2024-001',
    cliente: 'Corporación Tecnológica ABC',
    fecha: '2024-05-23',
    monto: 125400,
    estado: 'Aprobada',
    vendedor: 'Carlos López',
    prioridad: 'Alta',
    categoria: 'Software'
  },
  {
    id: 'PF-2024-002',
    cliente: 'Innovaciones Digitales S.A.',
    fecha: '2024-05-22',
    monto: 89500,
    estado: 'Pendiente',
    vendedor: 'María García',
    prioridad: 'Media',
    categoria: 'Consultoría'
  },
  {
    id: 'PF-2024-003',
    cliente: 'Constructora Moderna XYZ',
    fecha: '2024-05-21',
    monto: 234100,
    estado: 'En Revisión',
    vendedor: 'Pedro Martínez',
    prioridad: 'Alta',
    categoria: 'Hardware'
  },
  {
    id: 'PF-2024-004',
    cliente: 'Retail Solutions Group',
    fecha: '2024-05-20',
    monto: 67750,
    estado: 'Aprobada',
    vendedor: 'Ana Rodríguez',
    prioridad: 'Baja',
    categoria: 'Licencias'
  },
  {
    id: 'PF-2024-005',
    cliente: 'Servicios Empresariales Pro',
    fecha: '2024-05-19',
    monto: 156800,
    estado: 'Rechazada',
    vendedor: 'Luis Fernández',
    prioridad: 'Media',
    categoria: 'Servicios'
  }
];

// Componente Card de Métrica Mejorado
const MetricCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue", subtitle, gradient = false }) => {
  const colorClasses = {
    blue: "bg-gradient-to-br from-blue-50 to-blue-100",
    green: "bg-gradient-to-br from-emerald-50 to-emerald-100",
    yellow: "bg-gradient-to-br from-amber-50 to-amber-100",
    purple: "bg-gradient-to-br from-purple-50 to-purple-100",
    pink: "bg-gradient-to-br from-pink-50 to-pink-100",
    indigo: "bg-gradient-to-br from-indigo-50 to-indigo-100"
  };

  const iconColorClasses = {
    blue: "text-blue-600",
    green: "text-emerald-600",
    yellow: "text-amber-600",
    purple: "text-purple-600",
    pink: "text-pink-600",
    indigo: "text-indigo-600"
  };

  const borderColorClasses = {
    blue: "border-blue-200",
    green: "border-emerald-200",
    yellow: "border-amber-200",
    purple: "border-purple-200",
    pink: "border-pink-200",
    indigo: "border-indigo-200"
  };

  const TrendIcon = trend === 'up' ? ArrowUpRight : ArrowDownRight;

  return (
    <div className={`bg-white rounded-xl border ${borderColorClasses[color]} p-5 hover:shadow-lg transition-all duration-300 group relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className={`${colorClasses[color]} w-full h-full rounded-full transform translate-x-16 -translate-y-16`}></div>
      </div>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={`${colorClasses[color]} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-6 h-6 ${iconColorClasses[color]}`} />
          </div>
          {trend && (
            <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
              trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}>
              <TrendIcon className="w-3 h-3 mr-1" />
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

// Componente Badge de Estado Mejorado
const StatusBadge = ({ status }) => {
  const statusStyles = {
    'Aprobada': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Pendiente': 'bg-amber-100 text-amber-700 border-amber-200',
    'Rechazada': 'bg-red-100 text-red-700 border-red-200',
    'En Revisión': 'bg-blue-100 text-blue-700 border-blue-200'
  };

  const statusIcons = {
    'Aprobada': CheckCircle,
    'Pendiente': Clock,
    'Rechazada': XCircle,
    'En Revisión': AlertCircle
  };

  const Icon = statusIcons[status];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[status]} gap-1`}>
      <Icon className="w-3 h-3 flex-shrink-0" />
      {status}
    </span>
  );
};

// Componente Badge de Prioridad
const PriorityBadge = ({ priority }) => {
  const priorityStyles = {
    'Alta': 'bg-red-50 text-red-700 border-red-200',
    'Media': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Baja': 'bg-green-50 text-green-700 border-green-200'
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${priorityStyles[priority]}`}>
      {priority}
    </span>
  );
};

// Componente Avatar
const Avatar = ({ name, size = "sm" }) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base"
  };

  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold`}>
      {name}
    </div>
  );
};

// Componente Card de Vendedor
const VendedorCard = ({ vendedor, index }) => {
  const medalColors = {
    0: { bg: 'bg-gradient-to-br from-yellow-400 to-amber-500', icon: 'text-yellow-900', shadow: 'shadow-yellow-200' },
    1: { bg: 'bg-gradient-to-br from-gray-300 to-gray-400', icon: 'text-gray-700', shadow: 'shadow-gray-200' },
    2: { bg: 'bg-gradient-to-br from-orange-400 to-orange-500', icon: 'text-orange-900', shadow: 'shadow-orange-200' }
  };

  const medal = medalColors[index];

  return (
    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-300 group border border-gray-200">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar name={vendedor.avatar} size="md" />
          <div className={`absolute -top-2 -right-2 w-7 h-7 ${medal.bg} rounded-full flex items-center justify-center shadow-lg ${medal.shadow}`}>
            <span className={`text-sm font-bold ${medal.icon}`}>{index + 1}</span>
          </div>
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-base">{vendedor.nombre}</p>
          <p className="text-sm text-gray-500">{vendedor.proformas} proformas</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-gray-900 text-xl">${(vendedor.ventas / 1000).toFixed(0)}K</p>
        <p className={`text-sm font-medium ${vendedor.porcentaje.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
          {vendedor.porcentaje}
        </p>
      </div>
    </div>
  );
};

// Componente principal del Dashboard Mejorado
const ProformasDashPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('6m');
  const [searchTerm, setSearchTerm] = useState('');

  // Función para formatear valores
  const formatValue = (value, type) => {
    if (type === 'currency') {
      return `$${(value / 1000).toFixed(0)}K`;
    } else if (type === 'percentage') {
      return `${value}%`;
    } else if (type === 'days') {
      return `${value} días`;
    }
    return value.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-8xl mx-auto">
        {/* Header Mejorado */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Dashboard de Proformas
                </h1>
              </div>
              <p className="text-gray-600 ml-4">Gestiona y analiza tus cotizaciones con inteligencia avanzada</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-md transition-all flex items-center gap-2">
                <Filter className="w-4 h-4 flex-shrink-0" />
                Filtros Avanzados
              </button>
              <button className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-md transition-all flex items-center gap-2">
                <Download className="w-4 h-4 flex-shrink-0" />
                Exportar Datos
              </button>
              <button 
                onClick={() => window.location.href = '/proformas/add'}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl px-6 py-2.5 text-sm font-medium hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                <Plus className="w-5 h-5 flex-shrink-0" />
                Nueva Proforma
              </button>
            </div>
          </div>
        </div>

        {/* Métricas Principales Mejoradas */}
        <div className="space-y-5 mb-8">
          {/* Primera fila */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <MetricCard
              title="Total Proformas"
              value={formatValue(metricsData.totalProformas)}
              icon={FileText}
              trend="up"
              trendValue="+18.2%"
              color="blue"
              subtitle="vs mes anterior"
            />
            <MetricCard
              title="Ventas del Mes"
              value={formatValue(metricsData.ventasMes, 'currency')}
              icon={DollarSign}
              trend="up"
              trendValue="+24.5%"
              color="green"
              subtitle="Meta: $500K"
            />
            <MetricCard
              title="Tasa de Conversión"
              value={formatValue(metricsData.tasaConversion, 'percentage')}
              icon={TrendingUp}
              trend="up"
              trendValue="+5.3%"
              color="purple"
              subtitle="Promedio industria: 65%"
            />
          </div>
          
          {/* Segunda fila */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <MetricCard
              title="Pendientes"
              value={metricsData.proformasPendientes}
              icon={Clock}
              color="yellow"
              subtitle="Requieren atención"
            />
            <MetricCard
              title="Clientes Activos"
              value={metricsData.clientesActivos}
              icon={Users}
              trend="up"
              trendValue="+12"
              color="pink"
              subtitle="Este mes"
            />
            <MetricCard
              title="Tiempo Promedio"
              value={formatValue(metricsData.tiempoPromedio, 'days')}
              icon={Calendar}
              trend="down"
              trendValue="-0.5 días"
              color="indigo"
              subtitle="Días de procesamiento"
            />
          </div>
        </div>

        {/* Sección de Gráficos Mejorada */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-8">
          {/* Gráfico de Ventas Mensuales Mejorado */}
          <div className="xl:col-span-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Rendimiento de Ventas</h3>
                <p className="text-sm text-gray-600">Ventas vs Meta mensual vs Proformas</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-b from-indigo-400 to-indigo-200 rounded"></div>
                    <span className="text-xs font-medium text-gray-600">Ventas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-b from-emerald-400 to-emerald-200 rounded"></div>
                    <span className="text-xs font-medium text-gray-600">Ventas + Proformas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 border-2 border-red-400 border-dashed rounded"></div>
                    <span className="text-xs font-medium text-gray-600">Meta</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  {['3M', '6M', '1Y', '2Y'].map((period) => (
                    <button 
                      key={period}
                      onClick={() => setSelectedPeriod(period.toLowerCase())}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        selectedPeriod === period.toLowerCase() 
                          ? 'bg-white text-blue-700 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={ventasMensuales} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="ventasGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="proformasGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="mes" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  domain={[0, 'dataMax + 100000']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    padding: '12px'
                  }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
                  formatter={(value, name) => {
                    if (name === 'ventasTotal') return [`$${value.toLocaleString()}`, 'Ventas + Proformas'];
                    if (name === 'ventas') return [`$${value.toLocaleString()}`, 'Ventas'];
                    if (name === 'proformasValue') return [`$${value.toLocaleString()}`, 'Valor Proformas'];
                    if (name === 'meta') return [`$${value.toLocaleString()}`, 'Meta'];
                    return [value, name];
                  }}
                />
                {/* Área combinada de ventas + proformas (verde) */}
                <Area 
                  type="monotone" 
                  dataKey={(data) => data.ventas + (data.proformas * 2800)} 
                  name="ventasTotal"
                  stroke="#10b981" 
                  fill="url(#proformasGradient)" 
                  strokeWidth={2}
                />
                {/* Área de solo ventas (azul/morado) */}
                <Area 
                  type="monotone" 
                  dataKey="ventas" 
                  stroke="#818cf8" 
                  fill="url(#ventasGradient)" 
                  strokeWidth={2}
                />
                {/* Línea de meta */}
                <ReferenceLine 
                  y={500000} 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  strokeDasharray="8 4"
                  label={{ value: "Meta", position: "right", fill: "#ef4444", fontSize: 12 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Top 3 Vendedores */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Top 3 Vendedores</h3>
                <p className="text-sm text-gray-600">Mejores resultados del mes</p>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <Settings className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
              </div>
            </div>
            <div className="space-y-4">
              {topVendedores.map((vendedor, index) => (
                <VendedorCard key={vendedor.nombre} vendedor={vendedor} index={index} />
              ))}
            </div>
          </div>
        </div>

        {/* Segunda fila de gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* Gráfico de Estado de Proformas Mejorado */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Distribución por Estado</h3>
                <p className="text-sm text-gray-600">Últimos 30 días</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-1/2">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={estadoProformas}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="cantidad"
                    >
                      {estadoProformas.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-3">
                {estadoProformas.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">{item.estado}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">{item.cantidad}</div>
                      <div className="text-xs text-gray-500">{item.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Actividad Reciente</h3>
                <p className="text-sm text-gray-600">Últimas acciones</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Proforma PF-2024-001 aprobada</p>
                  <p className="text-xs text-gray-500">Corporación Tecnológica ABC • Hace 2 horas</p>
                </div>
                <span className="text-xs text-gray-400">$125,400</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Nueva proforma creada</p>
                  <p className="text-xs text-gray-500">Servicios Digitales Pro • Hace 4 horas</p>
                </div>
                <span className="text-xs text-gray-400">$89,200</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Proforma en revisión</p>
                  <p className="text-xs text-gray-500">Constructora Moderna XYZ • Hace 6 horas</p>
                </div>
                <span className="text-xs text-gray-400">$234,100</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Proforma rechazada</p>
                  <p className="text-xs text-gray-500">Tech Innovations Ltd • Hace 8 horas</p>
                </div>
                <span className="text-xs text-gray-400">$67,500</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de Proformas Recientes Mejorada */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Proformas Recientes</h3>
                <p className="text-sm text-gray-600">Gestiona todas tus cotizaciones</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por cliente, ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                  />
                </div>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2">
                  <Filter className="w-4 h-4 flex-shrink-0" />
                  Filtrar
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Proforma
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Vendedor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-gray-100">
                {proformasRecientes.map((proforma, index) => (
                  <tr key={proforma.id} className="hover:bg-white/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full flex-shrink-0"></div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{proforma.id}</div>
                          <div className="text-xs text-gray-500">{proforma.categoria}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{proforma.cliente}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{proforma.fecha}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">${proforma.monto.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={proforma.estado} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={proforma.prioridad} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Avatar name={proforma.vendedor.split(' ').map(n => n[0]).join('')} />
                        <div className="text-sm text-gray-600">{proforma.vendedor}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-1">
                        <button className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando 5 de 1,247 proformas
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Anterior
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                1
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                2
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProformasDashPage;