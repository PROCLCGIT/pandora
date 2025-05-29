// /pandora/src/modulos/brief/components/BriefList.jsx

import React from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Building, 
  Package,
  AlertTriangle,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  MessageCircle,
  Users,
  Share2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

import { getPriorityColor, getStatusColor } from '../utils/briefColors';

const BriefList = ({ briefs, onBriefClick, onEdit, onDuplicate, onDelete }) => {
  // Formateo de fechas
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: es });
    } catch {
      return dateString;
    }
  };

  // Cálculo de progreso
  const getProgress = (estado) => {
    const progressMap = {
      draft: 10,
      pending: 25,
      approved: 50,
      processing: 75,
      completed: 100,
      cancelled: 0
    };
    return progressMap[estado] || 0;
  };

  // Iconos de origen
  const originIconMap = {
    telefono: Phone,
    email: Mail,
    presencial: Building,
    whatsapp: MessageCircle,
    web: Globe,
    referido: Users,
    redes: Share2
  };

  const BriefRow = ({ brief }) => {
    const priorityColors = getPriorityColor(brief.priority);
    const statusColors = getStatusColor(brief.estado);
    const OriginIcon = originIconMap[brief.origin] || Phone;
    const progress = getProgress(brief.estado);
    
    const isOverdue = brief.due_date && new Date(brief.due_date) < new Date() && 
                     !['completed', 'cancelled'].includes(brief.estado);

    return (
      <Card className={`
        group transition-all duration-200 hover:shadow-md cursor-pointer
        ${priorityColors.border} border-l-2
        ${brief.priority === 'critica' ? 'animate-pulse' : ''}
      `}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Avatar/Icono del brief */}
            <div className={`
              w-12 h-12 rounded-lg flex items-center justify-center
              ${priorityColors.bg} ${priorityColors.text}
            `}>
              <Package className="w-6 h-6" />
            </div>

            {/* Información principal */}
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                
                {/* Código y título */}
                <div className="lg:col-span-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {brief.code}
                    </Badge>
                    {brief.priority === 'critica' && (
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    )}
                    {isOverdue && (
                      <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Vencido
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 truncate text-sm">
                    {brief.title || 'Brief sin título'}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {brief.client_name ? (
                      <>
                        <Building className="w-3 h-3" />
                        <span className="truncate">{brief.client_name}</span>
                      </>
                    ) : (
                      <span className="italic">Cliente no asignado</span>
                    )}
                  </div>
                </div>

                {/* Estados y prioridad */}
                <div className="lg:col-span-2 space-y-1">
                  <Badge className={`${priorityColors.badge} text-xs`}>
                    {brief.priority_display || brief.priority}
                  </Badge>
                  <br />
                  <Badge className={`${statusColors.badge} text-xs`}>
                    {brief.estado_display || brief.estado}
                  </Badge>
                </div>

                {/* Métricas */}
                <div className="lg:col-span-2 flex gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">
                      {brief.items_count || 0}
                    </div>
                    <div className="text-xs text-gray-500">Items</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">
                      {brief.tiempo_entrega || 0}
                    </div>
                    <div className="text-xs text-gray-500">Días</div>
                  </div>
                </div>

                {/* Presupuesto */}
                <div className="lg:col-span-2 text-sm">
                  <div className="font-semibold text-blue-600">
                    ${brief.presupuesto ? 
                      Number(brief.presupuesto).toLocaleString('es-ES', { minimumFractionDigits: 0 }) : 
                      '0'
                    }
                  </div>
                  <div className="text-xs text-gray-500">Presupuesto</div>
                </div>

                {/* Fechas y operador */}
                <div className="lg:col-span-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="text-xs bg-blue-100 text-blue-800">
                        {brief.operador_name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-gray-600 truncate">
                      {brief.operador_name || 'Sin asignar'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(brief.fecha_emision)}</span>
                  </div>
                  {brief.due_date && (
                    <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(brief.due_date)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span>Progreso</span>
                    {brief.origin && (
                      <Badge variant="outline" className="text-xs">
                        <OriginIcon className="w-3 h-3 mr-1" />
                        {brief.origin_display || brief.origin}
                      </Badge>
                    )}
                  </div>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
            </div>

            {/* Menu de acciones */}
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onBriefClick?.(brief); }}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ver detalles
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(brief); }}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate?.(brief); }}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-600"
                    onClick={(e) => { e.stopPropagation(); onDelete?.(brief); }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!briefs || briefs.length === 0) {
    return (
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="py-12 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay briefs para mostrar
          </h3>
          <p className="text-gray-500">
            Los briefs aparecerán aquí cuando se creen o coincidan con los filtros.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {briefs.map((brief) => (
        <div key={brief.id} onClick={() => onBriefClick?.(brief)}>
          <BriefRow brief={brief} />
        </div>
      ))}
    </div>
  );
};

export default BriefList;
