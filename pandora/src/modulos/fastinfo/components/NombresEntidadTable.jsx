import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Filter,
  RefreshCw 
} from 'lucide-react';

const NombresEntidadTable = ({ 
  nombres = [], 
  loading = false, 
  onEdit, 
  onDelete, 
  onCreate, 
  onRefresh 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActivo, setFilterActivo] = useState('all');

  const filteredNombres = nombres.filter(nombre => {
    const matchesSearch = nombre.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nombre.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (nombre.descripcion && nombre.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterActivo === 'all' || 
                         (filterActivo === 'active' && nombre.activo) ||
                         (filterActivo === 'inactive' && !nombre.activo);

    return matchesSearch && matchesFilter;
  });

  const handleDelete = (nombre) => {
    if (window.confirm(`¿Está seguro de eliminar la entidad "${nombre.nombre}"?`)) {
      onDelete(nombre.id);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Nombres de Entidad
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              onClick={onCreate}
              className="sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Entidad
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por código, nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={filterActivo}
            onChange={(e) => setFilterActivo(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Cargando...
          </div>
        ) : filteredNombres.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || filterActivo !== 'all' 
              ? 'No se encontraron entidades con los filtros aplicados' 
              : 'No hay entidades registradas'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden md:table-cell">Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="hidden sm:table-cell">Fecha Creación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNombres.map((nombre) => (
                  <TableRow key={nombre.id}>
                    <TableCell className="font-medium">
                      {nombre.codigo}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{nombre.nombre}</div>
                        <div className="md:hidden text-sm text-gray-500 mt-1">
                          {nombre.descripcion && nombre.descripcion.length > 50 
                            ? `${nombre.descripcion.substring(0, 50)}...` 
                            : nombre.descripcion}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="max-w-xs">
                        {nombre.descripcion && nombre.descripcion.length > 100 
                          ? `${nombre.descripcion.substring(0, 100)}...` 
                          : nombre.descripcion || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={nombre.activo ? 'default' : 'secondary'}>
                        {nombre.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {new Date(nombre.created_at).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(nombre)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(nombre)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Información de resultados */}
        {!loading && filteredNombres.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            Mostrando {filteredNombres.length} de {nombres.length} entidades
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NombresEntidadTable;