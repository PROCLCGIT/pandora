// /src/modulos/basic/pages/categorias/CategoriasInfinitePage.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import CategoriasList from '../../components/categorias/CategoriasList';

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

/**
 * Página de categorías con paginación infinita
 */
export default function CategoriasInfinitePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    search: '',
    is_active: undefined,
    level: undefined,
  });
  
  // Estado para forzar la actualización del componente CategoriasList
  const [key, setKey] = useState(0);
  
  // Manejadores de eventos para filtros
  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value });
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
    setFilters({
      search: '',
      is_active: undefined,
      level: undefined,
    });
    
    // Forzar actualización del componente
    setKey(prevKey => prevKey + 1);
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categorías (Scroll Infinito)</h1>
        <Button onClick={() => navigate('/basic/categorias/add')} className="bg-primary">
          <Plus className="mr-2 h-4 w-4" /> Agregar Categoría
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Filtros</CardTitle>
          <CardDescription>Filtra las categorías por diversos criterios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="search" className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Input
                  id="search"
                  placeholder="Buscar por nombre o código..."
                  value={filters.search}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="status" className="text-sm font-medium">Estado</label>
              <Select 
                onValueChange={handleStatusChange} 
                value={filters.is_active === undefined ? 'all' : filters.is_active.toString()}
              >
                <SelectTrigger id="status">
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
                <SelectTrigger id="level">
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
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" onClick={clearFilters} className="mr-2">
            Limpiar Filtros
          </Button>
          <Button onClick={applyFilters}>
            <Filter className="mr-2 h-4 w-4" /> Filtrar
          </Button>
        </CardFooter>
      </Card>

      {/* Componente de lista con paginación infinita */}
      <CategoriasList 
        key={key} // Usar key para forzar actualización cuando se aplican filtros
        filters={filters} 
        onDelete={handleCategoriaDeleted}
      />
    </div>
  );
}