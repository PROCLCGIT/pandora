import React from 'react';
import { Sparkles, Star, Clock, Building2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const QuickFilters = ({ onQuickFilter, activeQuickFilter }) => {
  const quickFilters = [
    {
      id: 'active',
      label: 'Activos',
      icon: <Sparkles className="h-3.5 w-3.5" />,
      action: () => onQuickFilter({ activo: true }),
      color: 'text-green-600 hover:bg-green-50'
    },
    {
      id: 'vip',
      label: 'VIP',
      icon: <Star className="h-3.5 w-3.5" />,
      action: () => onQuickFilter({ tag_name: 'VIP' }),
      color: 'text-yellow-600 hover:bg-yellow-50'
    },
    {
      id: 'recent',
      label: 'Recientes',
      icon: <Clock className="h-3.5 w-3.5" />,
      action: () => onQuickFilter({ ordering: '-created_at' }),
      color: 'text-blue-600 hover:bg-blue-50'
    },
    {
      id: 'corporate',
      label: 'Empresas',
      icon: <Building2 className="h-3.5 w-3.5" />,
      action: () => onQuickFilter({ tipo_cliente_name: 'Empresa' }),
      color: 'text-purple-600 hover:bg-purple-50'
    },
    {
      id: 'inactive',
      label: 'Inactivos',
      icon: <XCircle className="h-3.5 w-3.5" />,
      action: () => onQuickFilter({ activo: false }),
      color: 'text-red-600 hover:bg-red-50'
    }
  ];
  
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <span className="text-sm font-medium text-gray-600 flex items-center mr-2">
        Filtros rápidos:
      </span>
      {quickFilters.map((filter) => (
        <Button
          key={filter.id}
          variant={activeQuickFilter === filter.id ? "secondary" : "ghost"}
          size="sm"
          onClick={filter.action}
          className={`h-8 text-xs ${filter.color} ${
            activeQuickFilter === filter.id ? 'bg-gray-100' : ''
          }`}
        >
          {filter.icon}
          <span className="ml-1">{filter.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default QuickFilters;