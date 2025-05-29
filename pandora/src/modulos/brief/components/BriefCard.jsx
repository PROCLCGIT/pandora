// /pandora/src/modulos/brief/components/BriefCard.jsx

import React from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Building, 
  Phone, 
  Mail, 
  Globe, 
  MessageCircle, 
  Users, 
  Share2,
  AlertTriangle,
  CheckCircle,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  ExternalLink,
  FileText,
  Package
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
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

import { getPriorityColor, getStatusColor, getOriginIcon } from '../utils/briefColors';

const BriefCard = ({ brief, onClick, onEdit, onDuplicate, onDelete }) => {
  const priorityColors = getPriorityColor(brief.priority);
  const statusColors = getStatusColor(brief.estado);
  
  // Iconos dinámicos
  const originIconMap = {
    telefono: Phone,
    email: Mail,
    presencial: Building,
    whatsapp: MessageCircle,
    web: Globe,
    referido: Users,
    redes: Share2
  };
  
  const OriginIcon = originIconMap[brief.origin] || Phone;

  // Cálculo de progreso (simulado basado en estado)
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

  const progress = getProgress(brief.estado);

  // Formateo de fechas
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: es });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy • HH:mm", { locale: es });
    } catch {
      return dateString;
    }
  };

  // Determinar si está vencido
  const isOverdue = brief.due_date && new Date(brief.due_date) < new Date() && 
                   !['completed', 'cancelled'].includes(brief.estado);

  return (
    <Card className={`
      group relative overflow-hidden transition-all duration-300 
      hover:shadow-xl hover:-translate-y-1 cursor-pointer
      ${priorityColors.border} border-l-4
      ${brief.priority === 'critica' ? 'animate-pulse' : ''}
    `}>
      {/* Header con código y prioridad */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            {/* Código del brief */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-sm font-semibold">
                {brief.code}
              </Badge>
              {isOverdue && (
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Vencido
                </Badge>
              )}
            </div>

            {/* Título del brief */}
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 leading-tight">
              {brief.title || 'Brief sin título'}
            </h3>

            {/* Cliente */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {brief.client_name ? (
                <>
                  <Building className="w-4 h-4" />
                  <span className="truncate">{brief.client_name}</span>
                </>
              ) : (
                <span className="italic text-gray-400">Cliente no asignado</span>
              )}
            </div>
          </div>

          {/* Menu de acciones */}
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
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick?.(brief); }}>
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
      </CardHeader>

      {/* Contenido principal */}
      <CardContent className="space-y-4" onClick={() => onClick?.(brief)}>
        {/* Badges de estado y prioridad */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={priorityColors.badge}>
            {brief.priority_display || brief.priority}
          </Badge>
          <Badge className={statusColors.badge}>
            {brief.estado_display || brief.estado}
          </Badge>
          {brief.origin && (
            <Badge variant="outline" className="text-xs">
              <OriginIcon className="w-3 h-3 mr-1" />
              {brief.origin_display || brief.origin}
            </Badge>
          )}
        </div>

        {/* Descripción */}
        {brief.description && (
          <p className="text-sm text-gray-600 line-clamp-3">
            {brief.description}
          </p>
        )}

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Progreso</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Métricas del brief */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {brief.items_count || 0}
            </div>
            <div className="text-xs text-gray-500 flex items-center justify-center">
              <Package className="w-3 h-3 mr-1" />
              Items
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {brief.tiempo_entrega || 0}
            </div>
            <div className="text-xs text-gray-500 flex items-center justify-center">
              <Clock className="w-3 h-3 mr-1" />
              Días
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              ${brief.presupuesto ? 
                Number(brief.presupuesto).toLocaleString('es-ES', { minimumFractionDigits: 0 }) : 
                '0'
              }
            </div>
            <div className="text-xs text-gray-500">
              Presupuesto
            </div>
          </div>
        </div>
      </CardContent>

      {/* Footer con información adicional */}
      <CardFooter className="pt-4 border-t bg-gray-50/50">
        <div className="flex items-center justify-between w-full text-xs text-gray-500">
          <div className="flex items-center gap-4">
            {/* Operador */}
            <div className="flex items-center gap-1">
              <Avatar className="w-5 h-5">
                <AvatarFallback className="text-xs bg-blue-100 text-blue-800">
                  {brief.operador_name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="truncate max-w-20">
                {brief.operador_name || 'Sin asignar'}
              </span>
            </div>

            {/* Fecha de emisión */}
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(brief.fecha_emision)}</span>
            </div>
          </div>

          {/* Fecha límite */}
          {brief.due_date && (
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
              <Clock className="w-3 h-3" />
              <span>{formatDate(brief.due_date)}</span>
            </div>
          )}
        </div>
      </CardFooter>

      {/* Indicator de prioridad crítica */}
      {brief.priority === 'critica' && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-ping" />
      )}

      {/* Gradient overlay para hover */}
      <div className={`
        absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity
        ${priorityColors.gradient}
      `} />
    </Card>
  );
};

export default BriefCard;
