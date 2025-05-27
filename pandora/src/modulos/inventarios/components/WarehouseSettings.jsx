import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Warehouse,
  MapPin,
  User
} from 'lucide-react';
import { inventoryApi } from '../api/inventoryApi';
import { toast } from 'sonner';

const WarehouseSettings = () => {
  const [almacenes, setAlmacenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAlmacen, setEditingAlmacen] = useState(null);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    direccion: '',
    responsable: '',
    activo: true,
  });

  useEffect(() => {
    fetchAlmacenes();
  }, []);

  const fetchAlmacenes = async () => {
    setLoading(true);
    try {
      const response = await inventoryApi.getAlmacenes();
      setAlmacenes(response.data);
    } catch (error) {
      toast.error('Error al cargar almacenes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingAlmacen) {
        await inventoryApi.updateAlmacen(editingAlmacen.id, formData);
        toast.success('Almacén actualizado correctamente');
      } else {
        await inventoryApi.createAlmacen(formData);
        toast.success('Almacén creado correctamente');
      }
      
      setShowForm(false);
      resetForm();
      fetchAlmacenes();
    } catch (error) {
      toast.error('Error al guardar almacén');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (almacen) => {
    setEditingAlmacen(almacen);
    setFormData({
      codigo: almacen.codigo,
      nombre: almacen.nombre,
      direccion: almacen.direccion || '',
      responsable: almacen.responsable || '',
      activo: almacen.activo,
    });
    setShowForm(true);
  };

  const handleDelete = async (almacenId) => {
    if (!window.confirm('¿Está seguro de eliminar este almacén?')) {
      return;
    }

    try {
      await inventoryApi.deleteAlmacen(almacenId);
      toast.success('Almacén eliminado correctamente');
      fetchAlmacenes();
    } catch (error) {
      toast.error('Error al eliminar almacén. Puede tener movimientos asociados.');
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      nombre: '',
      direccion: '',
      responsable: '',
      activo: true,
    });
    setEditingAlmacen(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Configuración de Almacenes</h2>
          <p className="text-muted-foreground">
            Gestione los almacenes y bodegas del sistema
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Almacén
        </Button>
      </div>

      {/* Tabla de almacenes */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Cargando almacenes...
                </TableCell>
              </TableRow>
            ) : almacenes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No hay almacenes registrados
                </TableCell>
              </TableRow>
            ) : (
              almacenes.map((almacen) => (
                <TableRow key={almacen.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Warehouse className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{almacen.codigo}</span>
                    </div>
                  </TableCell>
                  <TableCell>{almacen.nombre}</TableCell>
                  <TableCell>
                    <div className="flex items-start gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground mt-0.5" />
                      <span className="text-sm">{almacen.direccion || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">
                        {almacen.responsable_nombre || 'Sin asignar'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      almacen.activo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {almacen.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(almacen)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(almacen.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de formulario */}
      <Dialog open={showForm} onOpenChange={(open) => {
        if (!open) {
          resetForm();
        }
        setShowForm(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAlmacen ? 'Editar Almacén' : 'Nuevo Almacén'}
            </DialogTitle>
            <DialogDescription>
              {editingAlmacen 
                ? 'Modifique los datos del almacén' 
                : 'Ingrese los datos del nuevo almacén'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="codigo">Código</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    placeholder="ALM-001"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Almacén Principal"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="direccion">Dirección</Label>
                <Textarea
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Ingrese la dirección completa..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
                />
                <Label htmlFor="activo">Almacén activo</Label>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WarehouseSettings;
