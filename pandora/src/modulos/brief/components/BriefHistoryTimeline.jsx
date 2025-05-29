// /pandora/src/modulos/brief/components/BriefHistoryTimeline.jsx

import React from 'react';
import { 
  Clock, 
  FileText, 
  Edit, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  User,
  Calendar,
  RefreshCw,
  Activity,
  Settings,
  MessageSquare,
  Eye,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const BriefHistoryTimeline = ({ briefId, history = [], isLoading = false }) => {
  
  // Iconos por tipo de cambio
  const getChangeIcon = (fieldChanged) => {
    const iconMap = {
      'estado': CheckCircle,
      'priority': AlertTriangle,
      'title': Edit,
      'description': FileText,
      'operador': User,
      'presupuesto': Settings,
      'tiempo_entrega': Clock,
      'due_date': Calendar,
      'items': Plus,
      'created': FileText
    };
    return iconMap[fieldChanged] || Activity;
  };

  // Colores por tipo de cambio
  const getChangeColor = (fieldChanged) => {
    const colorMap = {
      'estado': 'bg-green-500',
      'priority': 'bg-red-500',
      'title': 'bg-blue-500',
      'description': 'bg-purple-500',
      'operador': 'bg-indigo-500',
      'presupuesto': 'bg-emerald-500',
      'tiempo_entrega': 'bg-orange-500',
      'due_date': 'bg-yellow-500',
      'items': 'bg-pink-500',
      'created': 'bg-blue-600'
    };
    return colorMap[fieldChanged] || 'bg-gray-500';
  };

  // Formatear fecha
  const formatDateTime = (dateString) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM, yyyy • HH:mm", { locale: es });
    } catch {
      return dateString;
    }
  };

  // Formatear fecha relativa
  const formatRelativeTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Hace menos de 1 hora';
      if (diffInHours < 24) return `Hace ${diffInHours} horas`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `Hace ${diffInDays} días`;
      
      return format(date, "dd MMM yyyy", { locale: es });
    } catch {
      return dateString;
    }
  };

  // Descripción amigable del cambio
  const getChangeDescription = (change) => {
    const { field_changed, old_value, new_value } = change;
    
    const descriptions = {
      'estado': `Estado cambió de "${old_value}" a "${new_value}"`,
      'priority': `Prioridad cambió de "${old_value}" a "${new_value}"`,
      'title': `Título actualizado`,
      'description': `Descripción modificada`,
      'operador': `Operador asignado: ${new_value}`,
      'presupuesto': `Presupuesto actualizado: $${Number(new_value).toLocaleString()}`,
      'tiempo_entrega': `Tiempo de entrega: ${new_value} días`,
      'due_date': `Fecha límite establecida: ${new_value}`,
      'items': `Items del brief modificados`,
      'created': `Brief creado`
    };
    
    return descriptions[field_changed] || `${field_changed} modificado`;
  };

  const TimelineItem = ({ change, isLast }) => {
    const Icon = getChangeIcon(change.field_changed);
    const colorClass = getChangeColor(change.field_changed);
    
    return (
      <div className="relative flex gap-4 group">
        {/* Línea vertical */}
        {!isLast && (
          <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200 group-hover:bg-blue-200 transition-colors" />
        )}
        
        {/* Icono */}
        <div className={`
          relative z-10 flex items-center justify-center w-12 h-12 rounded-full text-white shadow-lg
          ${colorClass} group-hover:scale-110 transition-transform
        `}>
          <Icon className="w-5 h-5" />
        </div>
        
        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow group-hover:border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Título del cambio */}
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {getChangeDescription(change)}
                  </h4>
                  
                  {/* Descripción adicional */}
                  {change.change_reason && (
                    <p className="text-sm text-gray-600 mb-3">
                      <MessageSquare className="w-4 h-4 inline mr-1" />
                      {change.change_reason}
                    </p>
                  )}
                  
                  {/* Detalles del cambio */}
                  {(change.old_value || change.new_value) && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-1">
                      {change.old_value && (
                        <div className="text-sm">
                          <span className="text-gray-500">Anterior:</span>
                          <span className="ml-2 text-gray-700 font-medium">
                            {change.old_value}
                          </span>
                        </div>
                      )}
                      {change.new_value && (
                        <div className="text-sm">
                          <span className="text-gray-500">Nuevo:</span>
                          <span className="ml-2 text-gray-900 font-medium">
                            {change.new_value}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Información del usuario y fecha */}
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-800">
                          {change.changed_by_name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-700">
                        {change.changed_by_name || 'Usuario'}
                      </span>
                    </div>
                    
                    <Separator orientation="vertical" className="h-4" />
                    
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatRelativeTime(change.change_date)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Badge con tipo de cambio */}
                <Badge variant="outline" className="shrink-0 text-xs">
                  {change.field_changed}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Historial de Cambios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Historial de Cambios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sin historial disponible
            </h3>
            <p className="text-gray-500">
              Los cambios realizados en este brief aparecerán aquí.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Agrupar cambios por fecha
  const groupedHistory = history.reduce((groups, change) => {
    const date = format(new Date(change.change_date), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(change);
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Historial de Cambios
              <Badge variant="outline">{history.length}</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{history.length}</div>
              <div className="text-sm text-gray-500">Total cambios</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {new Set(history.map(h => h.changed_by_name)).size}
              </div>
              <div className="text-sm text-gray-500">Usuarios</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(groupedHistory).length}
              </div>
              <div className="text-sm text-gray-500">Días activos</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="space-y-8">
            {Object.entries(groupedHistory)
              .sort(([a], [b]) => new Date(b) - new Date(a))
              .map(([date, changes]) => (
                <div key={date} className="space-y-6">
                  {/* Separador de fecha */}
                  <div className="flex items-center gap-4">
                    <Separator className="flex-1" />
                    <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                      {format(new Date(date), "dd 'de' MMMM, yyyy", { locale: es })}
                    </Badge>
                    <Separator className="flex-1" />
                  </div>
                  
                  {/* Cambios del día */}
                  <div className="space-y-6">
                    {changes
                      .sort((a, b) => new Date(b.change_date) - new Date(a.change_date))
                      .map((change, index) => (
                        <TimelineItem
                          key={change.id || index}
                          change={change}
                          isLast={
                            index === changes.length - 1 && 
                            date === Object.keys(groupedHistory).sort().reverse()[Object.keys(groupedHistory).length - 1]
                          }
                        />
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BriefHistoryTimeline;
