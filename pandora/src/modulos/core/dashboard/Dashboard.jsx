// src/modulos/core/dashboard/Dashboard.jsx
import { 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Calendar
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Datos de ejemplo para las gráficas
const salesData = [
  { name: 'Ene', ventas: 4000, mantenimientos: 2400 },
  { name: 'Feb', ventas: 3000, mantenimientos: 1398 },
  { name: 'Mar', ventas: 2000, mantenimientos: 9800 },
  { name: 'Abr', ventas: 2780, mantenimientos: 3908 },
  { name: 'May', ventas: 1890, mantenimientos: 4800 },
  { name: 'Jun', ventas: 2390, mantenimientos: 3800 },
  { name: 'Jul', ventas: 3490, mantenimientos: 4300 },
];

const productsData = [
  { name: 'Equipos', disponibles: 65, ofertados: 35 },
  { name: 'Insumos', disponibles: 45, ofertados: 55 },
  { name: 'Repuestos', disponibles: 30, ofertados: 70 },
  { name: 'Consumibles', disponibles: 80, ofertados: 20 },
];

// Tarjetas de información para el dashboard
const StatCard = ({ icon, title, value, trend, trendValue, className }) => (
  <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm ${className}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
        <h4 className="text-2xl font-bold">{value}</h4>
        
        <div className={`flex items-center mt-2 text-sm ${
          trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'
        }`}>
          {trend === 'up' ? (
            <TrendingUp size={14} className="mr-1" />
          ) : trend === 'down' ? (
            <TrendingUp size={14} className="mr-1 transform rotate-180" />
          ) : null}
          <span>{trendValue}</span>
        </div>
      </div>
      
      <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
        {icon}
      </div>
    </div>
  </div>
);

// Componente de tabla para datos recientes
const RecentTable = ({ data, title }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
    <h3 className="text-lg font-medium mb-4">{title}</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr>
            {Object.keys(data[0] || {}).map((header) => (
              <th 
                key={header} 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((item, index) => (
            <tr key={index}>
              {Object.values(item).map((value, i) => (
                <td 
                  key={i} 
                  className="px-4 py-3 whitespace-nowrap"
                >
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Datos para los componentes
const recentProformas = [
  { ID: 'PRO-1234', Cliente: 'Hospital Central', Fecha: '12/04/2023', Monto: '$12,450.00', Estado: 'Aprobada' },
  { ID: 'PRO-1235', Cliente: 'Clínica San Juan', Fecha: '15/04/2023', Monto: '$8,900.00', Estado: 'Pendiente' },
  { ID: 'PRO-1236', Cliente: 'Centro Médico ABC', Fecha: '18/04/2023', Monto: '$21,300.00', Estado: 'En revisión' },
  { ID: 'PRO-1237', Cliente: 'Hospital General', Fecha: '20/04/2023', Monto: '$5,600.00', Estado: 'Aprobada' },
];

const pendingTasks = [
  { 
    title: 'Revisar proforma #1235', 
    priority: 'Alta',
    status: <span className="flex items-center text-yellow-500"><Clock size={14} className="mr-1" /> Pendiente</span>,
    dueDate: '25/04/2023'
  },
  { 
    title: 'Actualizar catálogo de productos', 
    priority: 'Media',
    status: <span className="flex items-center text-blue-500"><Clock size={14} className="mr-1" /> En progreso</span>,
    dueDate: '28/04/2023'
  },
  { 
    title: 'Reunión con proveedor', 
    priority: 'Alta',
    status: <span className="flex items-center text-green-500"><CheckCircle size={14} className="mr-1" /> Completada</span>,
    dueDate: '22/04/2023'
  },
  { 
    title: 'Mantenimiento equipo rayos X', 
    priority: 'Alta',
    status: <span className="flex items-center text-red-500"><AlertCircle size={14} className="mr-1" /> Retrasada</span>,
    dueDate: '20/04/2023'
  },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-none px-6 py-6 space-y-6">
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<DollarSign size={20} />} 
          title="Ventas Totales" 
          value="$145,200" 
          trend="up" 
          trendValue="12% vs mes anterior"
        />
        <StatCard 
          icon={<Package size={20} />} 
          title="Productos Ofertados" 
          value="386" 
          trend="up" 
          trendValue="5% vs mes anterior"
        />
        <StatCard 
          icon={<Users size={20} />} 
          title="Clientes Activos" 
          value="64" 
          trend="down" 
          trendValue="3% vs mes anterior"
        />
        <StatCard 
          icon={<CheckCircle size={20} />} 
          title="Proformas Aprobadas" 
          value="83%" 
          trend="up" 
          trendValue="7% vs mes anterior"
        />
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">Ventas y Mantenimientos</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="ventas" 
                  stroke="#4f46e5" 
                  strokeWidth={2} 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="mantenimientos" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">Disponibilidad de Productos</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="disponibles" fill="#4f46e5" />
                <Bar dataKey="ofertados" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tablas de datos recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTable 
          data={recentProformas} 
          title="Proformas Recientes" 
        />
        
        <RecentTable 
          data={pendingTasks} 
          title="Tareas Pendientes" 
        />
      </div>

      {/* Actividad reciente y calendario */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm lg:col-span-2">
          <h3 className="text-lg font-medium mb-4">Actividad Reciente</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Package size={20} />
              </div>
              <div>
                <p className="font-medium">Nuevo producto añadido</p>
                <p className="text-sm text-gray-500">Se agregó Equipo de monitoreo cardíaco al catálogo</p>
                <p className="text-xs text-gray-500 mt-1">Hace 35 minutos</p>
              </div>
            </div>
            
            <hr className="border-gray-200 dark:border-gray-700" />
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle size={20} />
              </div>
              <div>
                <p className="font-medium">Proforma aprobada</p>
                <p className="text-sm text-gray-500">La proforma #1234 para Hospital Central fue aprobada</p>
                <p className="text-xs text-gray-500 mt-1">Hace 2 horas</p>
              </div>
            </div>
            
            <hr className="border-gray-200 dark:border-gray-700" />
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                <Users size={20} />
              </div>
              <div>
                <p className="font-medium">Nuevo cliente registrado</p>
                <p className="text-sm text-gray-500">Clínica San Rafael se ha registrado como cliente</p>
                <p className="text-xs text-gray-500 mt-1">Hace 5 horas</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Calendario</h3>
            <div className="text-sm text-gray-500 flex items-center">
              <Calendar size={16} className="mr-1" />
              Abril 2023
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border-l-4 border-blue-500">
              <p className="font-medium text-blue-700 dark:text-blue-300">Reunión con proveedores</p>
              <p className="text-sm text-blue-600 dark:text-blue-200">10:00 AM - 11:30 AM</p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border-l-4 border-green-500">
              <p className="font-medium text-green-700 dark:text-green-300">Entrega de equipos</p>
              <p className="text-sm text-green-600 dark:text-green-200">2:00 PM - 4:00 PM</p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded border-l-4 border-purple-500">
              <p className="font-medium text-purple-700 dark:text-purple-300">Capacitación personal</p>
              <p className="text-sm text-purple-600 dark:text-purple-200">Mañana, 9:00 AM</p>
            </div>
            
            <button className="w-full p-2 mt-2 text-center text-sm text-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md">
              Ver todos los eventos
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;