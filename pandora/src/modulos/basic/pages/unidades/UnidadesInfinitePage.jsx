// /pandora/src/modulos/basic/pages/unidades/UnidadesInfinitePage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Ruler, ArrowLeft, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Componente de lista con paginación
import UnidadesList from '../../components/unidades/UnidadesList';

// Importar hook de búsqueda personalizado para debounce
import { useSearch } from '@/hooks/custom/useSearch';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

// Importar componentes personalizados
import { PageHeader } from '../../components/layout/PageHeader';
import { FilterCard } from '../../components/layout/FilterCard';
import { SearchInput } from '../../components/ui/SearchInput';

/**
 * Página de unidades de medida con tabla paginada
 */
export default function UnidadesInfinitePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filters, setFilters] = useState({});
  
  // Utilizar hook personalizado para la búsqueda con debounce
  const { 
    inputValue: searchValue, 
    setInputValue: setSearchValue, 
    debouncedValue: debouncedSearch 
  } = useSearch({
    initialValue: '',
    delay: 500,
  });
  
  // Efecto para actualizar los filtros cuando cambia el valor de búsqueda con debounce
  useEffect(() => {
    setFilters(prevFilters => ({ ...prevFilters, search: debouncedSearch }));
  }, [debouncedSearch]);
  
  // Estado para forzar la actualización del componente UnidadesList
  const [key, setKey] = useState(0);
  
  // Manejadores de eventos para filtros
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };
  
  // Aplicar filtros
  const applyFilters = () => {
    // Forzar actualización del componente para recargar los datos con los nuevos filtros
    setKey(prevKey => prevKey + 1);
    
    toast({
      title: "Filtros aplicados",
      description: "Se han aplicado los filtros a la lista de unidades.",
    });
  };
  
  // Limpiar filtros
  const clearFilters = () => {
    setSearchValue('');
    setFilters({});
    
    // Forzar actualización del componente
    setKey(prevKey => prevKey + 1);
  };
  
  // Manejador para cuando se elimina una unidad
  const handleUnidadDeleted = () => {
    // Forzar actualización del componente para recargar los datos
    setKey(prevKey => prevKey + 1);
  };
  
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Cabecera de la página */}
      <PageHeader 
        icon={<Ruler size={40} strokeWidth={1.5} />}
        title="Unidades de Medida"
        description="Gestión de unidades de medida para los productos."
        action={{
          label: "Agregar Unidad",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => navigate('/basic/unidades/add')
        }}
      />
      
      {/* Tarjeta de filtros */}
      <FilterCard
        title="Filtros de Búsqueda"
        description="Busca unidades por nombre o código."
        icon={<Filter className="mr-2 h-5 w-5 text-blue-600" />}
        onClear={clearFilters}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="search" className="text-sm font-medium">Buscar</label>
            <SearchInput
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Buscar por nombre o código..."
              debouncedValue={debouncedSearch}
              inputProps={{ id: "search" }}
            />
          </div>
        </div>
      </FilterCard>

      {/* Componente de lista con tabla paginada */}
      <Card className="border-blue-100 shadow-md overflow-hidden">
        <CardContent className="p-0">
          <UnidadesList 
            key={key} // Usar key para forzar actualización cuando se aplican filtros
            filters={filters} 
            onDelete={handleUnidadDeleted}
          />
        </CardContent>
      </Card>
    </div>
  );
}