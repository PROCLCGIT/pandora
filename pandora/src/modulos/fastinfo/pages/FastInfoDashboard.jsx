import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Building, 
  Search, 
  Plus, 
  Filter,
  Eye,
  BarChart3,
  Users,
  Key,
  RefreshCw,
  Loader2
} from 'lucide-react';
import DatosInstitucionalesCard from '../components/DatosInstitucionalesCard';
import DatosInstitucionalesForm from '../components/DatosInstitucionalesForm';
import { 
  getDatosInstitucionales,
  createDatosInstitucionales,
  updateDatosInstitucionales,
  deleteDatosInstitucionales,
  getEstadisticas,
  verificarContrasena,
  getNombresEntidad
} from '../api/fastinfoService';

const FastInfoDashboard = () => {
  const { toast } = useToast();
  
  // Estados principales
  const [datosInstitucionales, setDatosInstitucionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState(null);
  const [nombresEntidad, setNombresEntidad] = useState([]);
  
  // Estados de formulario
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEntidad, setFilterEntidad] = useState('');
  const [filterActivo, setFilterActivo] = useState('');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Recargar datos cuando cambien los filtros
  useEffect(() => {
    loadDatosInstitucionales();
  }, [searchTerm, filterEntidad, filterActivo, currentPage]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadDatosInstitucionales(),
        loadEstadisticas(),
        loadNombresEntidad()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast({
        title: "Error",
        description: "Error al cargar los datos iniciales",
        variant: "destructive"
      });
    }
  };

  const loadDatosInstitucionales = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        page_size: 12
      };

      if (searchTerm) {
        params.search = searchTerm;
      }
      if (filterEntidad) {
        params.nombre_entidad = filterEntidad;
      }
      if (filterActivo !== '') {
        params.activo = filterActivo;
      }

      const response = await getDatosInstitucionales(params);
      setDatosInstitucionales(response.results || []);
      setTotalPages(Math.ceil((response.count || 0) / 12));
      setTotalCount(response.count || 0);
    } catch (error) {
      console.error('Error loading datos institucionales:', error);
      toast({
        title: "Error",
        description: "Error al cargar los datos institucionales",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEstadisticas = async () => {
    try {
      const stats = await getEstadisticas();
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error loading estadísticas:', error);
    }
  };

  const loadNombresEntidad = async () => {
    try {
      const response = await getNombresEntidad({ activo: true });
      setNombresEntidad(response.results || []);
    } catch (error) {
      console.error('Error loading nombres entidad:', error);
    }
  };

  const handleCreateOrUpdate = async (formData) => {
    setFormLoading(true);
    try {
      if (editingData) {
        await updateDatosInstitucionales(editingData.id, formData);
        toast({
          title: "Éxito",
          description: "Datos actualizados correctamente",
          variant: "success"
        });
      } else {
        await createDatosInstitucionales(formData);
        toast({
          title: "Éxito",
          description: "Datos creados correctamente",
          variant: "success"
        });
      }
      
      setShowForm(false);
      setEditingData(null);
      await loadDatosInstitucionales();
      await loadEstadisticas();
    } catch (error) {
      console.error('Error saving datos:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Error al guardar los datos",
        variant: "destructive"
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (datos) => {
    setEditingData(datos);
    setShowForm(true);
  };

  const handleDelete = async (datos) => {
    if (!confirm(`¿Está seguro de eliminar los datos de ${datos.nombre_entidad_texto}?`)) {
      return;
    }

    try {
      await deleteDatosInstitucionales(datos.id);
      toast({
        title: "Éxito",
        description: "Datos eliminados correctamente",
        variant: "success"
      });
      await loadDatosInstitucionales();
      await loadEstadisticas();
    } catch (error) {
      console.error('Error deleting datos:', error);
      toast({
        title: "Error",
        description: "Error al eliminar los datos",
        variant: "destructive"
      });
    }
  };

  const handleCopy = (field, value) => {
    navigator.clipboard.writeText(value);
    toast({
      title: "Copiado",
      description: `${field} copiado al portapapeles`,
      variant: "success"
    });
  };

  const handleVerificarContrasena = async (id, contrasena) => {
    try {
      const result = await verificarContrasena(id, contrasena);
      toast({
        title: result.valida ? "Contraseña Válida" : "Contraseña Inválida",
        description: result.valida ? "La contraseña es correcta" : "La contraseña no es correcta",
        variant: result.valida ? "success" : "destructive"
      });
    } catch (error) {
      console.error('Error verificando contraseña:', error);
      toast({
        title: "Error",
        description: "Error al verificar la contraseña",
        variant: "destructive"
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterEntidad('');
    setFilterActivo('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Building className="h-8 w-8" />
                FastInfo - Información Institucional
              </h1>
              <p className="text-blue-100 mt-2">
                Gestión centralizada de credenciales y datos de entidades institucionales
              </p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Entidad
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Entidades</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadisticas.total_entidades}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entidades Activas</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{estadisticas.entidades_activas}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Con Credenciales</CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{estadisticas.con_credenciales}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tipos de Entidad</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadisticas.tipos_entidad}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros y búsqueda */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, RUC, usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterEntidad} onValueChange={setFilterEntidad}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de entidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las entidades</SelectItem>
                  {nombresEntidad.map((entidad) => (
                    <SelectItem key={entidad.id} value={entidad.id.toString()}>
                      {entidad.codigo} - {entidad.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterActivo} onValueChange={setFilterActivo}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los estados</SelectItem>
                  <SelectItem value="true">Activos</SelectItem>
                  <SelectItem value="false">Inactivos</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button variant="outline" onClick={clearFilters} className="flex-1">
                  Limpiar
                </Button>
                <Button onClick={loadDatosInstitucionales} className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Actualizar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Entidades Institucionales ({totalCount})
            </h3>
            {currentPage > 1 && (
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                Página Anterior
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Cargando entidades...</span>
            </div>
          ) : datosInstitucionales.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron entidades
                </h3>
                <p className="text-gray-600 mb-4">
                  No hay entidades que coincidan con los filtros aplicados.
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Primera Entidad
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {datosInstitucionales.map((datos) => (
                  <DatosInstitucionalesCard
                    key={datos.id}
                    datos={datos}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onCopy={handleCopy}
                    onVerificarContrasena={handleVerificarContrasena}
                  />
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-gray-600">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de formulario */}
      <DatosInstitucionalesForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingData(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingData}
        isLoading={formLoading}
      />
    </div>
  );
};

export default FastInfoDashboard;