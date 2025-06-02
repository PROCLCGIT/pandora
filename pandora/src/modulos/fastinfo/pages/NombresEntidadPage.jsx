import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Building2,
  Code,
  FileText,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { 
  getNombresEntidad,
  createNombreEntidad,
  updateNombreEntidad,
  deleteNombreEntidad
} from '../api/fastinfoService';

const NombresEntidadPage = () => {
  const { toast } = useToast();
  
  // Estados principales
  const [nombresEntidad, setNombresEntidad] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de formulario
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    activo: true
  });
  const [errors, setErrors] = useState({});
  
  // Estados de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  // Cargar datos iniciales
  useEffect(() => {
    loadNombresEntidad();
  }, []);

  // Filtrar datos cuando cambie el término de búsqueda
  useEffect(() => {
    if (searchTerm) {
      const filtered = nombresEntidad.filter(entidad => 
        entidad.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entidad.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entidad.descripcion && entidad.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(nombresEntidad);
    }
  }, [searchTerm, nombresEntidad]);

  const loadNombresEntidad = async () => {
    setLoading(true);
    try {
      const response = await getNombresEntidad();
      setNombresEntidad(response.results || []);
    } catch (error) {
      console.error('Error loading nombres entidad:', error);
      toast({
        title: "Error",
        description: "Error al cargar los nombres de entidad",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      activo: true
    });
    setErrors({});
    setEditingData(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código es requerido';
    } else if (formData.codigo.length > 10) {
      newErrors.codigo = 'El código no puede tener más de 10 caracteres';
    } else if (!/^[A-Z0-9_-]+$/.test(formData.codigo)) {
      newErrors.codigo = 'El código solo puede contener letras mayúsculas, números, guiones y guiones bajos';
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length > 100) {
      newErrors.nombre = 'El nombre no puede tener más de 100 caracteres';
    }

    // Verificar códigos duplicados
    const existingCodigo = nombresEntidad.find(entidad => 
      entidad.codigo === formData.codigo && 
      (!editingData || entidad.id !== editingData.id)
    );
    if (existingCodigo) {
      newErrors.codigo = 'Ya existe una entidad con este código';
    }

    // Verificar nombres duplicados
    const existingNombre = nombresEntidad.find(entidad => 
      entidad.nombre.toLowerCase() === formData.nombre.toLowerCase() && 
      (!editingData || entidad.id !== editingData.id)
    );
    if (existingNombre) {
      newErrors.nombre = 'Ya existe una entidad con este nombre';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor corrige los errores en el formulario",
        variant: "destructive"
      });
      return;
    }

    setFormLoading(true);
    try {
      if (editingData) {
        await updateNombreEntidad(editingData.id, formData);
        toast({
          title: "Éxito",
          description: "Nombre de entidad actualizado correctamente",
          variant: "success"
        });
      } else {
        await createNombreEntidad(formData);
        toast({
          title: "Éxito",
          description: "Nombre de entidad creado correctamente",
          variant: "success"
        });
      }
      
      setShowForm(false);
      resetForm();
      await loadNombresEntidad();
    } catch (error) {
      console.error('Error saving nombre entidad:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Error al guardar el nombre de entidad",
        variant: "destructive"
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (entidad) => {
    setEditingData(entidad);
    setFormData({
      codigo: entidad.codigo,
      nombre: entidad.nombre,
      descripcion: entidad.descripcion || '',
      activo: entidad.activo
    });
    setShowForm(true);
  };

  const handleDelete = async (entidad) => {
    if (!confirm(`¿Está seguro de eliminar la entidad "${entidad.nombre}"?`)) {
      return;
    }

    try {
      await deleteNombreEntidad(entidad.id);
      toast({
        title: "Éxito",
        description: "Nombre de entidad eliminado correctamente",
        variant: "success"
      });
      await loadNombresEntidad();
    } catch (error) {
      console.error('Error deleting nombre entidad:', error);
      toast({
        title: "Error",
        description: "Error al eliminar el nombre de entidad",
        variant: "destructive"
      });
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Building2 className="h-8 w-8" />
                Nombres de Entidad
              </h1>
              <p className="text-indigo-100 mt-2">
                Gestión del catálogo de tipos de entidades institucionales
              </p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-white text-indigo-600 hover:bg-indigo-50"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Entidad
            </Button>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por código, nombre o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={loadNombresEntidad} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de resultados */}
        <Card>
          <CardHeader>
            <CardTitle>
              Entidades ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <span className="ml-2 text-gray-600">Cargando entidades...</span>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No se encontraron resultados' : 'No hay entidades'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? 'Intenta con otros términos de búsqueda.'
                    : 'Comienza agregando la primera entidad.'
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Primera Entidad
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Creado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((entidad) => (
                      <TableRow key={entidad.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Code className="h-4 w-4 text-gray-500" />
                            <span className="font-mono font-medium">{entidad.codigo}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{entidad.nombre}</TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            {entidad.descripcion ? (
                              <p className="text-sm text-gray-600 truncate" title={entidad.descripcion}>
                                {entidad.descripcion}
                              </p>
                            ) : (
                              <span className="text-gray-400 text-sm">Sin descripción</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={entidad.activo ? "default" : "secondary"}>
                            {entidad.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(entidad.created_at).toLocaleDateString('es-EC')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(entidad)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(entidad)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de formulario */}
      <Dialog open={showForm} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingData ? 'Editar Nombre de Entidad' : 'Agregar Nombre de Entidad'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => handleInputChange('codigo', e.target.value.toUpperCase())}
                placeholder="Ej: SRI, IESS, MSP"
                maxLength={10}
                className={errors.codigo ? 'border-red-500' : ''}
              />
              {errors.codigo && (
                <p className="text-sm text-red-500">{errors.codigo}</p>
              )}
              <p className="text-xs text-gray-500">
                Solo letras mayúsculas, números, guiones y guiones bajos
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                placeholder="Ej: Servicio de Rentas Internas"
                maxLength={100}
                className={errors.nombre ? 'border-red-500' : ''}
              />
              {errors.nombre && (
                <p className="text-sm text-red-500">{errors.nombre}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                placeholder="Descripción detallada de la entidad (opcional)"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="activo"
                checked={formData.activo}
                onChange={(e) => handleInputChange('activo', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="activo">Entidad activa</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseForm}
                disabled={formLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingData ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NombresEntidadPage;