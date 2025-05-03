// /pandora/src/modulos/basic/pages/categorias/CategoriasInfinitePage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, BookOpen, ArrowLeft, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Componente de lista con paginación infinita
import CategoriasList from '../../components/categorias/CategoriasList';

// Importar hook de búsqueda personalizado para debounce
import { useSearch } from '@/hooks/custom/useSearch';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Importar componentes personalizados
import { PageHeader } from '../../components/layout/PageHeader';
import { FilterCard } from '../../components/layout/FilterCard';
import { SearchInput } from '../../components/ui/SearchInput';

/**
 * Página de categorías con paginación infinita
 */
export default function CategoriasInfinitePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    is_active: undefined,
    level: undefined,
  });
  
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
  
  // Estado para forzar la actualización del componente CategoriasList
  const [key, setKey] = useState(0);
  
  // Manejadores de eventos para filtros
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleStatusChange = (value) => {
    setFilters({ ...filters, is_active: value === 'all' ? undefined : value === 'true' });
  };

  const handleLevelChange = (value) => {
    setFilters({ ...filters, level: value === 'all' ? undefined : parseInt(value) });
  };
  
  // Manejador para cuando se elimina una categoría
  const handleCategoriaDeleted = () => {
    // Forzar actualización del componente para recargar los datos
    setKey(prevKey => prevKey + 1);
  };
  
  // Aplicar filtros
  const applyFilters = () => {
    // Forzar actualización del componente para recargar los datos con los nuevos filtros
    setKey(prevKey => prevKey + 1);
    
    toast({
      title: "Filtros aplicados",
      description: "Se han aplicado los filtros a la lista de categorías.",
    });
  };
  
  // Limpiar filtros
  const clearFilters = () => {
    setSearchValue('');
    setFilters({
      is_active: undefined,
      level: undefined,
    });
    
    // Forzar actualización del componente
    setKey(prevKey => prevKey + 1);
  };
  
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Cabecera de la página */}
      <PageHeader 
        icon={<BookOpen size={40} strokeWidth={1.5} />}
        title="Categorías con Scroll Infinito"
        description="Visualiza las categorías con paginación dinámica al hacer scroll."
        action={{
          label: "Agregar Categoría",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => navigate('/basic/categorias/add')
        }}
      />
      
      <div className="mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/basic/categorias')}
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a vista estándar
        </Button>
      </div>

      {/* Tarjeta de filtros */}
      <FilterCard
        title="Filtros de Búsqueda"
        description="Busca categorías por nombre, código, nivel o estado."
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
          
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="status" className="text-sm font-medium">Estado</label>
            <Select 
              onValueChange={handleStatusChange} 
              value={filters.is_active === undefined ? 'all' : filters.is_active.toString()}
            >
              <SelectTrigger id="status" className="border-blue-200 focus:border-blue-400">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Activo</SelectItem>
                <SelectItem value="false">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="level" className="text-sm font-medium">Nivel</label>
            <Select 
              onValueChange={handleLevelChange} 
              value={filters.level === undefined ? 'all' : filters.level.toString()}
            >
              <SelectTrigger id="level" className="border-blue-200 focus:border-blue-400">
                <SelectValue placeholder="Todos los niveles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="0">Nivel 0 (Raíz)</SelectItem>
                <SelectItem value="1">Nivel 1</SelectItem>
                <SelectItem value="2">Nivel 2</SelectItem>
                <SelectItem value="3">Nivel 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FilterCard>

      {/* Componente de lista con paginación infinita */}
      <Card className="border-blue-100 shadow-md overflow-hidden">
        <CardContent className="p-0">
          <CategoriasList 
            key={key} // Usar key para forzar actualización cuando se aplican filtros
            filters={filters} 
            onDelete={handleCategoriaDeleted}
          />
        </CardContent>
      </Card>
    </div>
  );
}