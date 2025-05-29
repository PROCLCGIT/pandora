// /pandora/src/modulos/brief/components/StatsCards.jsx

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Users,
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const StatsCards = ({ stats, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                <div className="w-16 h-4 bg-gray-200 rounded" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-8 bg-gray-200 rounded w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    colorClass, 
    change, 
    trend,
    subtitle,
    progress,
    additionalInfo 
  }) => {
    const getTrendIcon = () => {
      if (trend === 'up') return <TrendingUp className="h-3 w-3" />;
      if (trend === 'down') return <TrendingDown className="h-3 w-3" />;
      return <Minus className="h-3 w-3" />;
    };

    const getTrendColor = () => {
      if (trend === 'up') return 'text-green-600 bg-green-50';
      if (trend === 'down') return 'text-red-600 bg-red-50';
      return 'text-gray-600 bg-gray-50';
    };

    return (
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        {/* Background pattern */}
        <div className={`absolute top-0 right-0 w-32 h-32 ${colorClass} opacity-10 rounded-full -translate-y-16 translate-x-16`} />
        
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className={`p-2 ${colorClass} rounded-lg shadow-sm`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            {change && (
              <Badge className={`px-2 py-1 text-xs font-medium ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className="ml-1">{change}</span>
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
            {progress !== undefined && (
              <div className="pt-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">{progress}% del objetivo</p>
              </div>
            )}
            {additionalInfo && (
              <div className="pt-2 text-xs text-gray-500">
                {additionalInfo}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Calcular métricas derivadas
  const totalBriefs = stats?.total_briefs || 0;
  const pendingBriefs = stats?.por_estado?.pending || 0;
  const completedBriefs = stats?.por_estado?.completed || 0;
  const urgentBriefs = (stats?.por_prioridad?.urgente || 0) + (stats?.por_prioridad?.critica || 0);
  const overdueBriefs = stats?.vencidos || 0;
  const totalBudget = stats?.total_presupuesto || 0;
  const withoutBudget = stats?.sin_presupuesto || 0;

  // Calcular tasas y porcentajes
  const completionRate = totalBriefs > 0 ? Math.round((completedBriefs / totalBriefs) * 100) : 0;
  const urgencyRate = totalBriefs > 0 ? Math.round((urgentBriefs / totalBriefs) * 100) : 0;
  const overdueRate = totalBriefs > 0 ? Math.round((overdueBriefs / totalBriefs) * 100) : 0;

  const statsConfig = [
    {
      title: "Total de Briefs",
      value: totalBriefs.toLocaleString(),
      icon: FileText,
      colorClass: "bg-gradient-to-br from-blue-500 to-blue-600",
      change: "+12%",
      trend: "up",
      subtitle: "Este mes",
      additionalInfo: `${pendingBriefs} pendientes, ${completedBriefs} completados`
    },
    {
      title: "Tasa de Completado",
      value: `${completionRate}%`,
      icon: CheckCircle,
      colorClass: "bg-gradient-to-br from-green-500 to-green-600",
      change: "+5%",
      trend: "up",
      subtitle: "Promedio mensual",
      progress: completionRate,
      additionalInfo: `${completedBriefs} de ${totalBriefs} briefs completados`
    },
    {
      title: "Briefs Urgentes",
      value: urgentBriefs.toString(),
      icon: AlertTriangle,
      colorClass: "bg-gradient-to-br from-red-500 to-red-600",
      change: overdueBriefs > 0 ? `${overdueBriefs} vencidos` : "Al día",
      trend: overdueBriefs > 0 ? "down" : "up",
      subtitle: `${urgencyRate}% del total`,
      additionalInfo: overdueBriefs > 0 ? `¡${overdueBriefs} briefs han vencido!` : "Todos dentro de plazo"
    },
    {
      title: "Presupuesto Total",
      value: `$${totalBudget.toLocaleString()}`,
      icon: DollarSign,
      colorClass: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      change: "+8%",
      trend: "up",
      subtitle: "Valor acumulado",
      additionalInfo: withoutBudget > 0 ? `${withoutBudget} sin presupuesto` : "Todos presupuestados"
    }
  ];

  // Stats adicionales para una segunda fila
  const additionalStats = [
    {
      title: "Por Estado",
      value: Object.keys(stats?.por_estado || {}).length,
      icon: Activity,
      colorClass: "bg-gradient-to-br from-indigo-500 to-indigo-600",
      subtitle: "Estados activos",
      additionalInfo: `Draft: ${stats?.por_estado?.draft || 0}, Processing: ${stats?.por_estado?.processing || 0}`
    },
    {
      title: "Por Prioridad",
      value: Object.keys(stats?.por_prioridad || {}).length,
      icon: BarChart3,
      colorClass: "bg-gradient-to-br from-purple-500 to-purple-600",
      subtitle: "Niveles de prioridad",
      additionalInfo: `Alta: ${stats?.por_prioridad?.alta || 0}, Media: ${stats?.por_prioridad?.media || 0}`
    },
    {
      title: "Tiempo Promedio",
      value: "7.2 días",
      icon: Clock,
      colorClass: "bg-gradient-to-br from-amber-500 to-amber-600",
      change: "-1.3 días",
      trend: "up",
      subtitle: "Tiempo de procesamiento",
      additionalInfo: "Mejora respecto al mes anterior"
    },
    {
      title: "Operadores Activos",
      value: "8",
      icon: Users,
      colorClass: "bg-gradient-to-br from-cyan-500 to-cyan-600",
      subtitle: "Usuarios trabajando",
      additionalInfo: "Distribuidos en diferentes turnos"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {additionalStats.map((stat, index) => (
          <StatCard key={`additional-${index}`} {...stat} />
        ))}
      </div>

      {/* Resumen ejecutivo */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <BarChart3 className="h-5 w-5" />
            Resumen Ejecutivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">
                {totalBriefs > 0 ? Math.round((pendingBriefs / totalBriefs) * 100) : 0}%
              </div>
              <div className="text-sm text-blue-600">En proceso</div>
              <div className="text-xs text-gray-500 mt-1">
                {pendingBriefs} de {totalBriefs} briefs
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">
                {completionRate}%
              </div>
              <div className="text-sm text-green-600">Completados</div>
              <div className="text-xs text-gray-500 mt-1">
                Meta: 85% mensual
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${overdueBriefs > 0 ? 'text-red-700' : 'text-green-700'}`}>
                {overdueBriefs}
              </div>
              <div className={`text-sm ${overdueBriefs > 0 ? 'text-red-600' : 'text-green-600'}`}>
                Vencidos
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {overdueBriefs > 0 ? 'Requieren atención' : 'Todos al día'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
