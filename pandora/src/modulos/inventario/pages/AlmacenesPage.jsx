import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Search, 
  Warehouse,
  MapPin,
  Edit,
  Trash2,
  Package,
  Box,
  TrendingUp,
  Users,
  Calendar,
  MoreVertical,
  Info
} from 'lucide-react';
import { almacenesService } from '../api/inventarioService';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const AlmacenesPage = () => {
  const [almacenes, setAlmacenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadAlmacenes();
  }, [pagination.page, searchTerm]);

  const loadAlmacenes = async () => {
    try {
      setLoading(true);
      const response = await almacenesService.getAll({
        page: pagination.page,
        page_size: pagination.pageSize,
        search: searchTerm
      });
      
      setAlmacenes(response.data.results || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.count || 0
      }));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los almacenes"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar este almacén?')) return;
    
    try {
      await almacenesService.delete(id);
      toast({
        title: "Éxito",
        description: "Almacén eliminado correctamente"
      });
      loadAlmacenes();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el almacén"
      });
    }
  };

  if (loading && almacenes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <Warehouse className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-600" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Cargando almacenes...</p>
        </div>
      </div>
    );
  }

  // Mock data for warehouse types
  const getWarehouseType = (nombre) => {
    if (nombre?.toLowerCase().includes('principal')) return 'principal';
    if (nombre?.toLowerCase().includes('secundario')) return 'secondary';
    return 'standard';
  };

  const getWarehouseCapacity = () => Math.floor(Math.random() * 40) + 60; // Random between 60-100

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header with gradient */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Gestión de Almacenes
            </h1>
            <p className="text-gray-600 mt-1">Administra tus espacios de almacenamiento</p>
          </div>
          <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all">
            <Link to="/inventario/almacenes/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Almacén
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Almacenes</p>
                  <p className="text-2xl font-bold text-blue-700">{pagination.total}</p>
                </div>
                <Warehouse className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-green-700">
                    {almacenes.filter(a => a.activo).length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Capacidad Promedio</p>
                  <p className="text-2xl font-bold text-purple-700">85%</p>
                </div>
                <Box className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Productos</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {almacenes.reduce((acc, a) => acc + (a.total_productos || 0), 0)}
                  </p>
                </div>
                <Package className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar with enhanced styling */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar almacenes por nombre, dirección..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-lg border-2 focus:border-blue-500 transition-colors"
              />
            </div>
          </CardContent>
        </Card>

        {/* Almacenes Grid with enhanced cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {almacenes.map((almacen) => {
            const warehouseType = getWarehouseType(almacen.nombre);
            const capacity = getWarehouseCapacity();
            
            return (
              <Card key={almacen.id} className="border-0 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden">
                {/* Colored header based on warehouse type */}
                <div className={`h-2 ${
                  warehouseType === 'principal' ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                  warehouseType === 'secondary' ? 'bg-gradient-to-r from-green-500 to-teal-500' :
                  'bg-gradient-to-r from-gray-400 to-gray-500'
                }`} />
                
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        warehouseType === 'principal' ? 'bg-blue-100' :
                        warehouseType === 'secondary' ? 'bg-green-100' :
                        'bg-gray-100'
                      }`}>
                        <Warehouse className={`h-6 w-6 ${
                          warehouseType === 'principal' ? 'text-blue-600' :
                          warehouseType === 'secondary' ? 'text-green-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold">{almacen.nombre}</CardTitle>
                        <Badge 
                          variant={warehouseType === 'principal' ? 'default' : warehouseType === 'secondary' ? 'secondary' : 'outline'}
                          className="mt-1"
                        >
                          {warehouseType === 'principal' ? 'Principal' : warehouseType === 'secondary' ? 'Secundario' : 'Estándar'}
                        </Badge>
                      </div>
                    </div>
                    <Badge 
                      variant={almacen.activo ? "success" : "secondary"}
                      className={`${almacen.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {almacen.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span className="text-sm text-gray-600 line-clamp-2">
                      {almacen.direccion || 'Sin dirección registrada'}
                    </span>
                  </div>
                  
                  {/* Capacity indicator */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Capacidad Utilizada</span>
                      <span className="text-sm font-bold text-gray-900">{capacity}%</span>
                    </div>
                    <Progress value={capacity} className="h-2">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          capacity > 90 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                          capacity > 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                          'bg-gradient-to-r from-green-500 to-green-600'
                        }`} 
                        style={{ width: `${capacity}%` }} 
                      />
                    </Progress>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Package className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-gray-800">{almacen.total_productos || 0}</p>
                      <p className="text-xs text-gray-500">Productos</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Users className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-gray-800">{Math.floor(Math.random() * 10) + 1}</p>
                      <p className="text-xs text-gray-500">Usuarios</p>
                    </div>
                  </div>
                  
                  {/* Description */}
                  {almacen.descripcion && (
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {almacen.descripcion}
                    </p>
                  )}
                  
                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors" asChild>
                      <Link to={`/inventario/almacenes/${almacen.id}`}>
                        <Info className="h-4 w-4 mr-1" />
                        Ver Detalles
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" className="hover:bg-gray-100" asChild>
                      <Link to={`/inventario/almacenes/${almacen.id}/editar`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
                      onClick={() => handleDelete(almacen.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {almacenes.length === 0 && !loading && (
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <Warehouse className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron almacenes</h3>
              <p className="text-gray-500 mb-6">Comienza creando tu primer almacén</p>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Link to="/inventario/almacenes/nuevo">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primer Almacén
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {pagination.total > pagination.pageSize && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Mostrando {((pagination.page - 1) * pagination.pageSize) + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total} almacenes
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="hover:bg-gray-100"
                  >
                    Anterior
                  </Button>
                  <div className="flex items-center px-4 bg-gray-100 rounded-md">
                    <span className="font-medium">
                      {pagination.page} / {Math.ceil(pagination.total / pagination.pageSize)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                    className="hover:bg-gray-100"
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AlmacenesPage;