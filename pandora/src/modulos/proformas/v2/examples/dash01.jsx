import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Calendar,
  DollarSign,
  Users
} from 'lucide-react';

const ProformasDashPage = () => {
  // Datos de ejemplo para el dashboard
  const stats = [
    {
      title: 'Total Proformas',
      value: '156',
      icon: <FileText className="h-6 w-6" />,
      change: '+12%',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'En Proceso',
      value: '23',
      icon: <Clock className="h-6 w-6" />,
      change: '+5%',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Aprobadas',
      value: '89',
      icon: <CheckCircle className="h-6 w-6" />,
      change: '+18%',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Rechazadas',
      value: '12',
      icon: <XCircle className="h-6 w-6" />,
      change: '-8%',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  const recentProformas = [
    { id: 'PRO-001', cliente: 'Hospital Central', fecha: '2024-01-24', estado: 'En Proceso', monto: '$15,000' },
    { id: 'PRO-002', cliente: 'Clínica San José', fecha: '2024-01-23', estado: 'Aprobada', monto: '$8,500' },
    { id: 'PRO-003', cliente: 'Farmacia Popular', fecha: '2024-01-22', estado: 'En Proceso', monto: '$3,200' },
    { id: 'PRO-004', cliente: 'Centro Médico Norte', fecha: '2024-01-21', estado: 'Completada', monto: '$25,000' },
    { id: 'PRO-005', cliente: 'Hospital Regional', fecha: '2024-01-20', estado: 'Rechazada', monto: '$12,000' }
  ];

  const getStatusColor = (estado) => {
    const colors = {
      'En Proceso': 'bg-yellow-100 text-yellow-800',
      'Aprobada': 'bg-green-100 text-green-800',
      'Completada': 'bg-blue-100 text-blue-800',
      'Rechazada': 'bg-red-100 text-red-800'
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Proformas</h1>
          <p className="text-gray-600 mt-1">Resumen y estadísticas de proformas</p>
        </div>
        <button 
          onClick={() => window.location.href = '/proformas/add'}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Nueva Proforma
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className={`text-sm mt-2 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change} desde el mes pasado
                </p>
              </div>
              <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Proformas */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Proformas Recientes</h2>
            <a href="/proformas" className="text-indigo-600 hover:text-indigo-700 text-sm">
              Ver todas →
            </a>
          </div>
          <div className="space-y-3">
            {recentProformas.map((proforma) => (
              <div key={proforma.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{proforma.id}</p>
                  <p className="text-sm text-gray-600">{proforma.cliente}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{proforma.monto}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(proforma.estado)}`}>
                    {proforma.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen Mensual</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ventas Totales</p>
                  <p className="font-semibold text-gray-900">$125,430</p>
                </div>
              </div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nuevos Clientes</p>
                  <p className="font-semibold text-gray-900">18</p>
                </div>
              </div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tiempo Promedio</p>
                  <p className="font-semibold text-gray-900">3.5 días</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">Por proforma</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProformasDashPage;