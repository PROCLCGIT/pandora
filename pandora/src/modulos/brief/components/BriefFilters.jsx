// /pandora/src/modulos/brief/components/BriefFilters.jsx

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  X, 
  RotateCcw,
  Filter,
  ChevronDown,
  Search
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';

import { useBriefChoices } from '../hooks/useBriefs';
import { getPriorityColor, getStatusColor } from '../utils/briefColors';

const BriefFilters = ({ filters, onFiltersChange, onReset }) => {
  const [localFilters, setLocalFilters] = useState(filters || {});
  const [expandedSections, setExpandedSections] = useState({
    status: true,
    priority: true,
    dates: false,
    commercial: false,
    advanced: false
  });

  const { data: choices } = useBriefChoices();

  // Sincronizar filtros locales con props
  useEffect(() => {
    setLocalFilters(filters || {});
  }, [filters]);

  // Aplicar filtros
  const applyFilters = () => {
    const cleanFilters = Object.fromEntries(
      Object.entries(localFilters).filter(([_, value]) => 
        value !== '' && value !== null && value !== undefined &&
        !(Array.isArray(value) && value.length === 0)
      )
    );
    onFiltersChange(cleanFilters);
  };

  // Limpiar filtros
  const clearFilters = () => {
    setLocalFilters({});
    onReset?.();
  };

  // Actualizar filtro individual
  const updateFilter = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Alternar sección expandida
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Contar filtros activos
  const activeFiltersCount = Object.keys(localFilters).length;

  const FilterSection = ({ title, children, section, defaultExpanded = false }) => (
    <Collapsible 
      open={expandedSections[section]} 
      onOpenChange={() => toggleSection(section)}
      className="space-y-2"
    >
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="flex w-full justify-between p-2 font-medium">
          {title}
          <ChevronDown className={`h-4 w-4 transition-transform ${
            expandedSections[section] ? 'rotate-180' : ''
          }`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 p-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <div className="space-y-6">
      {/* Header con contador de filtros */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Filtros Avanzados</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {activeFiltersCount} activos
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            disabled={activeFiltersCount === 0}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
          <Button
            size="sm"
            onClick={applyFilters}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Aplicar Filtros
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Estados y Prioridades */}
        <div className="space-y-4">
          <FilterSection title="Estados" section="status" defaultExpanded>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Estado del Brief</Label>
              <Select
                value={localFilters.estado || ''}
                onValueChange={(value) => updateFilter('estado', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los estados</SelectItem>
                  {choices?.statuses?.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(status.value).badge.includes('slate') ? 'bg-slate-400' :
                          getStatusColor(status.value).badge.includes('blue') ? 'bg-blue-400' :
                          getStatusColor(status.value).badge.includes('emerald') ? 'bg-emerald-400' :
                          getStatusColor(status.value).badge.includes('indigo') ? 'bg-indigo-400' :
                          getStatusColor(status.value).badge.includes('green') ? 'bg-green-400' :
                          'bg-gray-400'}`} />
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium">Prioridad</Label>
              <Select
                value={localFilters.priority || ''}
                onValueChange={(value) => updateFilter('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las prioridades</SelectItem>
                  {choices?.priorities?.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(priority.value).badge.includes('emerald') ? 'bg-emerald-400' :
                          getPriorityColor(priority.value).badge.includes('amber') ? 'bg-amber-400' :
                          getPriorityColor(priority.value).badge.includes('orange') ? 'bg-orange-400' :
                          getPriorityColor(priority.value).badge.includes('red') ? 'bg-red-400' :
                          'bg-gray-400'}`} />
                        {priority.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Origen</Label>
              <Select
                value={localFilters.origin || ''}
                onValueChange={(value) => updateFilter('origin', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los orígenes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los orígenes</SelectItem>
                  {choices?.origins?.map((origin) => (
                    <SelectItem key={origin.value} value={origin.value}>
                      {origin.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FilterSection>
        </div>

        {/* Fechas */}
        <div className="space-y-4">
          <FilterSection title="Fechas" section="dates">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Fecha de Emisión</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Desde</Label>
                    <Input
                      type="date"
                      value={localFilters.fecha_desde || ''}
                      onChange={(e) => updateFilter('fecha_desde', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Hasta</Label>
                    <Input
                      type="date"
                      value={localFilters.fecha_hasta || ''}
                      onChange={(e) => updateFilter('fecha_hasta', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Fecha Límite</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Desde</Label>
                    <Input
                      type="date"
                      value={localFilters.due_date_desde || ''}
                      onChange={(e) => updateFilter('due_date_desde', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Hasta</Label>
                    <Input
                      type="date"
                      value={localFilters.due_date_hasta || ''}
                      onChange={(e) => updateFilter('due_date_hasta', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </FilterSection>

          <FilterSection title="Comercial" section="commercial">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Presupuesto</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Mínimo</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={localFilters.presupuesto_min || ''}
                      onChange={(e) => updateFilter('presupuesto_min', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Máximo</Label>
                    <Input
                      type="number"
                      placeholder="999999"
                      value={localFilters.presupuesto_max || ''}
                      onChange={(e) => updateFilter('presupuesto_max', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Tiempo de Entrega (días)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Mínimo</Label>
                    <Input
                      type="number"
                      placeholder="1"
                      value={localFilters.tiempo_entrega_min || ''}
                      onChange={(e) => updateFilter('tiempo_entrega_min', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Máximo</Label>
                    <Input
                      type="number"
                      placeholder="365"
                      value={localFilters.tiempo_entrega_max || ''}
                      onChange={(e) => updateFilter('tiempo_entrega_max', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Destino</Label>
                <Select
                  value={localFilters.destino || ''}
                  onValueChange={(value) => updateFilter('destino', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los destinos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los destinos</SelectItem>
                    {choices?.destinations?.map((destination) => (
                      <SelectItem key={destination.value} value={destination.value}>
                        {destination.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </FilterSection>
        </div>

        {/* Búsquedas y Avanzado */}
        <div className="space-y-4">
          <FilterSection title="Búsqueda" section="advanced">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Cliente</Label>
                <Input
                  placeholder="Buscar por nombre de cliente..."
                  value={localFilters.client || ''}
                  onChange={(e) => updateFilter('client', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Código</Label>
                <Input
                  placeholder="Ej: BRF202501001"
                  value={localFilters.code || ''}
                  onChange={(e) => updateFilter('code', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Operador</Label>
                <Input
                  placeholder="Buscar por operador..."
                  value={localFilters.operador || ''}
                  onChange={(e) => updateFilter('operador', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Creado por</Label>
                <Input
                  placeholder="Usuario que creó el brief..."
                  value={localFilters.created_by || ''}
                  onChange={(e) => updateFilter('created_by', e.target.value)}
                />
              </div>
            </div>
          </FilterSection>

          {/* Filtros rápidos */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900">Filtros Rápidos</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vencidos"
                  checked={localFilters.vencidos || false}
                  onCheckedChange={(checked) => updateFilter('vencidos', checked)}
                />
                <Label htmlFor="vencidos" className="text-sm">
                  Solo briefs vencidos
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sin_presupuesto"
                  checked={localFilters.sin_presupuesto || false}
                  onCheckedChange={(checked) => updateFilter('sin_presupuesto', checked)}
                />
                <Label htmlFor="sin_presupuesto" className="text-sm">
                  Sin presupuesto
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="prioritarios"
                  checked={localFilters.prioritarios || false}
                  onCheckedChange={(checked) => updateFilter('prioritarios', checked)}
                />
                <Label htmlFor="prioritarios" className="text-sm">
                  Alta prioridad (Urgente/Crítica)
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de filtros activos */}
      {activeFiltersCount > 0 && (
        <div className="pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700">Filtros activos:</span>
            {Object.entries(localFilters).map(([key, value]) => {
              if (!value || (Array.isArray(value) && value.length === 0)) return null;
              
              const displayValue = typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value;
              
              return (
                <Badge key={key} variant="outline" className="bg-blue-50 text-blue-700">
                  {key}: {displayValue}
                  <button
                    className="ml-1 hover:text-blue-900"
                    onClick={() => updateFilter(key, '')}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BriefFilters;
