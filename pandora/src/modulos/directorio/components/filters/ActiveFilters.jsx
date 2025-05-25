import React from 'react';
import { X, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const ActiveFilters = ({ 
  filters, 
  onRemoveFilter, 
  onClearAll,
  tiposCliente = [],
  ciudades = [],
  zonas = [],
  tags = []
}) => {
  const activeFilters = [];
  
  // Search filter
  if (filters.search) {
    activeFilters.push({
      key: 'search',
      label: 'Búsqueda',
      value: filters.search,
      displayValue: filters.search
    });
  }
  
  // Tipo cliente filter
  if (filters.tipo_cliente) {
    const tipo = tiposCliente.find(t => t.id.toString() === filters.tipo_cliente);
    if (tipo) {
      activeFilters.push({
        key: 'tipo_cliente',
        label: 'Tipo',
        value: filters.tipo_cliente,
        displayValue: tipo.nombre
      });
    }
  }
  
  // Ciudad filter
  if (filters.ciudad) {
    const ciudad = ciudades.find(c => c.id.toString() === filters.ciudad);
    if (ciudad) {
      activeFilters.push({
        key: 'ciudad',
        label: 'Ciudad',
        value: filters.ciudad,
        displayValue: ciudad.nombre
      });
    }
  }
  
  // Zona filter
  if (filters.zona) {
    const zona = zonas.find(z => z.id.toString() === filters.zona);
    if (zona) {
      activeFilters.push({
        key: 'zona',
        label: 'Zona',
        value: filters.zona,
        displayValue: zona.nombre
      });
    }
  }
  
  // Estado filter
  if (filters.activo !== undefined) {
    activeFilters.push({
      key: 'activo',
      label: 'Estado',
      value: filters.activo,
      displayValue: filters.activo ? 'Activos' : 'Inactivos'
    });
  }
  
  // Tags filter
  if (filters.tags && filters.tags.length > 0) {
    const selectedTags = tags.filter(tag => filters.tags.includes(tag.id));
    selectedTags.forEach(tag => {
      activeFilters.push({
        key: 'tag',
        tagId: tag.id,
        label: 'Etiqueta',
        value: tag.id,
        displayValue: tag.name,
        color: tag.color_code
      });
    });
  }
  
  if (activeFilters.length === 0) return null;
  
  return (
    <div className="bg-gray-50 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Filter className="h-4 w-4" />
          Filtros activos ({activeFilters.length})
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-7 text-xs hover:text-red-600"
        >
          Limpiar todos
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {activeFilters.map((filter, index) => (
          <Badge
            key={`${filter.key}-${index}`}
            variant="secondary"
            className="pr-1 flex items-center gap-1"
            style={filter.color ? {
              backgroundColor: `${filter.color}20`,
              borderColor: filter.color,
              color: filter.color,
            } : {}}
          >
            <span className="text-xs font-medium">{filter.label}:</span>
            <span className="text-xs">{filter.displayValue}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
              onClick={() => {
                if (filter.key === 'tag') {
                  onRemoveFilter('tag', filter.tagId);
                } else {
                  onRemoveFilter(filter.key);
                }
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default ActiveFilters;