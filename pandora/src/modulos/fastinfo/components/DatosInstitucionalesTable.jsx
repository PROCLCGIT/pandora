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
  Database,
  RefreshCw,
  Eye,
  Copy,
  ExternalLink
} from 'lucide-react';

const DatosInstitucionalesTable = ({ 
  datos = [], 
  loading = false, 
  onEdit, 
  onDelete, 
  onCreate, 
  onRefresh,
  onView 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActivo, setFilterActivo] = useState('all');
  const [filterEntidad, setFilterEntidad] = useState('all');

  // Obtener entidades únicas para el filtro
  const entidadesUnicas = [...new Set(datos.map(dato => dato.nombre_entidad_texto))].sort();

  const filteredDatos = datos.filter(dato => {
    const searchFields = [
      dato.ruc,
      dato.usuario,
      dato.correo,
      dato.representante,
      dato.nombre_entidad_texto
    ].join(' ').toLowerCase();

    const matchesSearch = searchFields.includes(searchTerm.toLowerCase());
    
    const matchesActivoFilter = filterActivo === 'all' || 
                               (filterActivo === 'active' && dato.activo) ||
                               (filterActivo === 'inactive' && !dato.activo);

    const matchesEntidadFilter = filterEntidad === 'all' || 
                                dato.nombre_entidad_texto === filterEntidad;

    return matchesSearch && matchesActivoFilter && matchesEntidadFilter;
  });

  const handleDelete = (dato) => {
    if (window.confirm(`¿Está seguro de eliminar los datos de "${dato.nombre_entidad_texto}" con RUC ${dato.ruc}?`)) {
      onDelete(dato.id);
    }
  };

  const handleCopyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    // Aquí podrías agregar una notificación toast
    console.log(`${field} copiado: ${text}`);
  };

  const handleOpenWebsite = (url) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Datos Institucionales
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              onClick={onCreate}
              className="sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevos Datos
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
              placeholder="Buscar por RUC, usuario, correo, representante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={filterEntidad}
            onChange={(e) => setFilterEntidad(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas las entidades</option>
            {entidadesUnicas.map(entidad => (
              <option key={entidad} value={entidad}>{entidad}</option>
            ))}
          </select>
          
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
        ) : filteredDatos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || filterActivo !== 'all' || filterEntidad !== 'all'
              ? 'No se encontraron datos con los filtros aplicados' 
              : 'No hay datos institucionales registrados'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entidad</TableHead>
                  <TableHead>RUC</TableHead>
                  <TableHead className="hidden md:table-cell">Usuario</TableHead>
                  <TableHead className="hidden lg:table-cell">Correo</TableHead>
                  <TableHead className="hidden lg:table-cell">Representante</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="hidden sm:table-cell">Última Act.</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDatos.map((dato) => (
                  <TableRow key={dato.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{dato.nombre_entidad_texto}</div>
                        <div className="md:hidden text-sm text-gray-500 mt-1">
                          {dato.usuario}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      <div className="flex items-center gap-2">
                        <span>{dato.ruc}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleCopyToClipboard(dato.ruc, 'RUC')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <span>{dato.usuario}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleCopyToClipboard(dato.usuario, 'Usuario')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="max-w-xs truncate">{dato.correo}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleCopyToClipboard(dato.correo, 'Correo')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="max-w-xs truncate">{dato.representante}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={dato.activo ? 'default' : 'secondary'}>
                        {dato.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {new Date(dato.fecha_ultima_actualizacion).toLocaleDateString('es-ES')}
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
                          <DropdownMenuItem onClick={() => onView && onView(dato)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(dato)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          {dato.sitio_web && (
                            <DropdownMenuItem onClick={() => handleOpenWebsite(dato.sitio_web)}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Abrir Sitio Web
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDelete(dato)}
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
        {!loading && filteredDatos.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            Mostrando {filteredDatos.length} de {datos.length} registros
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DatosInstitucionalesTable;