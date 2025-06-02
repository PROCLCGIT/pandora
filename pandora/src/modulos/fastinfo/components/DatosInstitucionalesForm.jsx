import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getNombresEntidad } from '../api/fastinfoService';
import { Loader2 } from 'lucide-react';

const DatosInstitucionalesForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null,
  isLoading = false 
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nombre_entidad: '',
    ruc: '',
    usuario: '',
    contrasena: '',
    correo: '',
    telefono: '',
    representante: '',
    direccion: '',
    sitio_web: '',
    observaciones: '',
    activo: true
  });
  const [nombresEntidad, setNombresEntidad] = useState([]);
  const [loadingEntidades, setLoadingEntidades] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadNombresEntidad();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre_entidad: initialData.nombre_entidad?.id || initialData.nombre_entidad || '',
        ruc: initialData.ruc || '',
        usuario: initialData.usuario || '',
        contrasena: '',
        correo: initialData.correo || '',
        telefono: initialData.telefono || '',
        representante: initialData.representante || '',
        direccion: initialData.direccion || '',
        sitio_web: initialData.sitio_web || '',
        observaciones: initialData.observaciones || '',
        activo: initialData.activo !== undefined ? initialData.activo : true
      });
    } else {
      setFormData({
        nombre_entidad: '',
        ruc: '',
        usuario: '',
        contrasena: '',
        correo: '',
        telefono: '',
        representante: '',
        direccion: '',
        sitio_web: '',
        observaciones: '',
        activo: true
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const loadNombresEntidad = async () => {
    setLoadingEntidades(true);
    try {
      const response = await getNombresEntidad({ activo: true });
      setNombresEntidad(response.results || []);
    } catch (error) {
      console.error('Error loading nombres entidad:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los nombres de entidad",
        variant: "destructive"
      });
    } finally {
      setLoadingEntidades(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre_entidad) newErrors.nombre_entidad = 'El nombre de entidad es requerido';
    if (!formData.ruc) newErrors.ruc = 'El RUC es requerido';
    if (!formData.usuario) newErrors.usuario = 'El usuario es requerido';
    if (!initialData && !formData.contrasena) newErrors.contrasena = 'La contraseña es requerida';
    if (!formData.correo) newErrors.correo = 'El correo es requerido';
    if (!formData.telefono) newErrors.telefono = 'El teléfono es requerido';
    if (!formData.representante) newErrors.representante = 'El representante es requerido';

    if (formData.ruc && !/^\d{13}$/.test(formData.ruc)) {
      newErrors.ruc = 'El RUC debe tener exactamente 13 dígitos';
    }

    if (formData.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'El formato del correo no es válido';
    }

    if (formData.telefono && !/^[0-9]{9,10}$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono debe tener entre 9 y 10 dígitos';
    }

    if (formData.sitio_web && formData.sitio_web.trim() && 
        !/^https?:\/\/.+/.test(formData.sitio_web)) {
      newErrors.sitio_web = 'El sitio web debe comenzar con http:// o https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor corrige los errores en el formulario",
        variant: "destructive"
      });
      return;
    }

    const submitData = { ...formData };
    
    if (initialData && !submitData.contrasena) {
      delete submitData.contrasena;
    }

    onSubmit(submitData);
  };

  const handleClose = () => {
    setFormData({
      nombre_entidad: '',
      ruc: '',
      usuario: '',
      contrasena: '',
      correo: '',
      telefono: '',
      representante: '',
      direccion: '',
      sitio_web: '',
      observaciones: '',
      activo: true
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar Datos Institucionales' : 'Agregar Datos Institucionales'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nombre_entidad">Nombre de Entidad *</Label>
            <Select
              value={formData.nombre_entidad}
              onValueChange={(value) => handleInputChange('nombre_entidad', value)}
              disabled={loadingEntidades}
            >
              <SelectTrigger className={errors.nombre_entidad ? 'border-red-500' : ''}>
                <SelectValue placeholder="Seleccione una entidad" />
              </SelectTrigger>
              <SelectContent>
                {loadingEntidades ? (
                  <SelectItem value="" disabled>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cargando...
                    </div>
                  </SelectItem>
                ) : (
                  nombresEntidad.map((entidad) => (
                    <SelectItem key={entidad.id} value={entidad.id.toString()}>
                      {entidad.codigo} - {entidad.nombre}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.nombre_entidad && (
              <p className="text-sm text-red-500">{errors.nombre_entidad}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ruc">RUC *</Label>
              <Input
                id="ruc"
                value={formData.ruc}
                onChange={(e) => handleInputChange('ruc', e.target.value)}
                placeholder="Ej: 1234567890001"
                maxLength={13}
                className={errors.ruc ? 'border-red-500' : ''}
              />
              {errors.ruc && (
                <p className="text-sm text-red-500">{errors.ruc}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="usuario">Usuario *</Label>
              <Input
                id="usuario"
                value={formData.usuario}
                onChange={(e) => handleInputChange('usuario', e.target.value)}
                placeholder="Usuario de acceso"
                className={errors.usuario ? 'border-red-500' : ''}
              />
              {errors.usuario && (
                <p className="text-sm text-red-500">{errors.usuario}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contrasena">
              Contraseña {!initialData && '*'}
              {initialData && <span className="text-sm text-gray-500 ml-2">(dejar vacío para no cambiar)</span>}
            </Label>
            <Input
              id="contrasena"
              type="password"
              value={formData.contrasena}
              onChange={(e) => handleInputChange('contrasena', e.target.value)}
              placeholder={initialData ? "Nueva contraseña (opcional)" : "Contraseña"}
              className={errors.contrasena ? 'border-red-500' : ''}
            />
            {errors.contrasena && (
              <p className="text-sm text-red-500">{errors.contrasena}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="correo">Correo Electrónico *</Label>
              <Input
                id="correo"
                type="email"
                value={formData.correo}
                onChange={(e) => handleInputChange('correo', e.target.value)}
                placeholder="correo@ejemplo.com"
                className={errors.correo ? 'border-red-500' : ''}
              />
              {errors.correo && (
                <p className="text-sm text-red-500">{errors.correo}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                placeholder="0987654321"
                maxLength={10}
                className={errors.telefono ? 'border-red-500' : ''}
              />
              {errors.telefono && (
                <p className="text-sm text-red-500">{errors.telefono}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="representante">Representante *</Label>
            <Input
              id="representante"
              value={formData.representante}
              onChange={(e) => handleInputChange('representante', e.target.value)}
              placeholder="Nombre del representante"
              className={errors.representante ? 'border-red-500' : ''}
            />
            {errors.representante && (
              <p className="text-sm text-red-500">{errors.representante}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Textarea
              id="direccion"
              value={formData.direccion}
              onChange={(e) => handleInputChange('direccion', e.target.value)}
              placeholder="Dirección física de la entidad"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sitio_web">Sitio Web</Label>
            <Input
              id="sitio_web"
              value={formData.sitio_web}
              onChange={(e) => handleInputChange('sitio_web', e.target.value)}
              placeholder="https://www.ejemplo.com"
              className={errors.sitio_web ? 'border-red-500' : ''}
            />
            {errors.sitio_web && (
              <p className="text-sm text-red-500">{errors.sitio_web}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              placeholder="Observaciones adicionales"
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
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DatosInstitucionalesForm;