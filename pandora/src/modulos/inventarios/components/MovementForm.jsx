import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from 'lucide-react';
import { inventoryApi } from '../api/inventoryApi';
import { toast } from 'sonner';

const MovementForm = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [tiposMovimiento, setTiposMovimiento] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [unidades, setUnidades] = useState([]);
  
  const [formData, setFormData] = useState({
    tipo_movimiento: '',
    fecha: new Date().toISOString().split('T')[0],
    numero_documento: '',
    almacen_origen: '',
    almacen_destino: '',
    observaciones: '',
    detalles: [
      {
        producto: '',
        cantidad: '',
        unidad_medida: '',
        costo_unitario: '',
        lote: '',
        fecha_vencimiento: '',
      }
    ]
  });

  useEffect(() => {
    if (open) {
      fetchInitialData();
    }
  }, [open]);

  const fetchInitialData = async () => {
    try {
      const [tipos, almacenesData] = await Promise.all([
        inventoryApi.getTiposMovimiento(),
        inventoryApi.getAlmacenes(),
      ]);
      
      setTiposMovimiento(tipos.data);
      setAlmacenes(almacenesData.data);
    } catch (error) {
      toast.error('Error al cargar datos iniciales');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await inventoryApi.createMovimiento(formData);
      toast.success('Movimiento creado exitosamente');
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      toast.error('Error al crear movimiento');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tipo_movimiento: '',
      fecha: new Date().toISOString().split('T')[0],
      numero_documento: '',
      almacen_origen: '',
      almacen_destino: '',
      observaciones: '',
      detalles: [
        {
          producto: '',
          cantidad: '',
          unidad_medida: '',
          costo_unitario: '',
          lote: '',
          fecha_vencimiento: '',
        }
      ]
    });
  };

  const addDetail = () => {
    setFormData({
      ...formData,
      detalles: [
        ...formData.detalles,
        {
          producto: '',
          cantidad: '',
          unidad_medida: '',
          costo_unitario: '',
          lote: '',
          fecha_vencimiento: '',
        }
      ]
    });
  };

  const removeDetail = (index) => {
    const newDetails = formData.detalles.filter((_, i) => i !== index);
    setFormData({ ...formData, detalles: newDetails });
  };

  const updateDetail = (index, field, value) => {
    const newDetails = [...formData.detalles];
    newDetails[index][field] = value;
    setFormData({ ...formData, detalles: newDetails });
  };

  const getTipoMovimiento = () => {
    const tipo = tiposMovimiento.find(t => t.id === parseInt(formData.tipo_movimiento));
    return tipo?.tipo || '';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Movimiento de Inventario</DialogTitle>
          <DialogDescription>
            Registre un nuevo movimiento en el inventario
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Datos generales */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipo_movimiento">Tipo de Movimiento</Label>
                <Select
                  value={formData.tipo_movimiento}
                  onValueChange={(value) => setFormData({ ...formData, tipo_movimiento: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposMovimiento.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id.toString()}>
                        {tipo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  type="date"
                  id="fecha"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="numero_documento">Número de Documento</Label>
                <Input
                  id="numero_documento"
                  value={formData.numero_documento}
                  onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
                  placeholder="Ej: FAC-001-2024"
                />
              </div>

              {(getTipoMovimiento() === 'salida' || getTipoMovimiento() === 'transferencia') && (
                <div>
                  <Label htmlFor="almacen_origen">Almacén Origen</Label>
                  <Select
                    value={formData.almacen_origen}
                    onValueChange={(value) => setFormData({ ...formData, almacen_origen: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione almacén" />
                    </SelectTrigger>
                    <SelectContent>
                      {almacenes.map((almacen) => (
                        <SelectItem key={almacen.id} value={almacen.id.toString()}>
                          {almacen.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(getTipoMovimiento() === 'entrada' || getTipoMovimiento() === 'transferencia') && (
                <div>
                  <Label htmlFor="almacen_destino">Almacén Destino</Label>
                  <Select
                    value={formData.almacen_destino}
                    onValueChange={(value) => setFormData({ ...formData, almacen_destino: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione almacén" />
                    </SelectTrigger>
                    <SelectContent>
                      {almacenes.map((almacen) => (
                        <SelectItem key={almacen.id} value={almacen.id.toString()}>
                          {almacen.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                placeholder="Ingrese observaciones adicionales..."
                rows={3}
              />
            </div>

            {/* Detalles */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Detalles del Movimiento</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDetail}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar Producto
                </Button>
              </div>

              {formData.detalles.map((detalle, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="grid grid-cols-6 gap-2">
                    <div className="col-span-2">
                      <Label>Producto</Label>
                      <Input
                        placeholder="Buscar producto..."
                        value={detalle.producto}
                        onChange={(e) => updateDetail(index, 'producto', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={detalle.cantidad}
                        onChange={(e) => updateDetail(index, 'cantidad', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Unidad</Label>
                      <Input
                        placeholder="Unidad"
                        value={detalle.unidad_medida}
                        onChange={(e) => updateDetail(index, 'unidad_medida', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Costo Unit.</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={detalle.costo_unitario}
                        onChange={(e) => updateDetail(index, 'costo_unitario', e.target.value)}
                      />
                    </div>

                    <div className="flex items-end">
                      {formData.detalles.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeDetail(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Lote</Label>
                      <Input
                        placeholder="Número de lote"
                        value={detalle.lote}
                        onChange={(e) => updateDetail(index, 'lote', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Fecha Vencimiento</Label>
                      <Input
                        type="date"
                        value={detalle.fecha_vencimiento}
                        onChange={(e) => updateDetail(index, 'fecha_vencimiento', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Movimiento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MovementForm;
