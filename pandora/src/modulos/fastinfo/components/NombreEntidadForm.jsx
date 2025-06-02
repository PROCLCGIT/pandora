import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, X } from 'lucide-react';

const NombreEntidadForm = ({ 
  nombreEntidad = null, 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    activo: true
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (nombreEntidad) {
      setFormData({
        codigo: nombreEntidad.codigo || '',
        nombre: nombreEntidad.nombre || '',
        descripcion: nombreEntidad.descripcion || '',
        activo: nombreEntidad.activo !== undefined ? nombreEntidad.activo : true
      });
    }
  }, [nombreEntidad]);

  const handleChange = (field, value) => {
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código es requerido';
    } else if (formData.codigo.length > 10) {
      newErrors.codigo = 'El código no puede tener más de 10 caracteres';
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length > 100) {
      newErrors.nombre = 'El nombre no puede tener más de 100 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {nombreEntidad ? 'Editar' : 'Crear'} Nombre de Entidad
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Código */}
          <div className="space-y-2">
            <Label htmlFor="codigo">
              Código <span className="text-red-500">*</span>
            </Label>
            <Input
              id="codigo"
              value={formData.codigo}
              onChange={(e) => handleChange('codigo', e.target.value.toUpperCase())}
              placeholder="Ej: SRI, IESS"
              maxLength={10}
              className={errors.codigo ? 'border-red-500' : ''}
            />
            {errors.codigo && (
              <Alert variant="destructive">
                <AlertDescription>{errors.codigo}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder="Nombre completo de la entidad"
              maxLength={100}
              className={errors.nombre ? 'border-red-500' : ''}
            />
            {errors.nombre && (
              <Alert variant="destructive">
                <AlertDescription>{errors.nombre}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder="Descripción detallada de la entidad"
              rows={3}
            />
          </div>

          {/* Activo */}
          <div className="flex items-center space-x-2">
            <Switch
              id="activo"
              checked={formData.activo}
              onCheckedChange={(checked) => handleChange('activo', checked)}
            />
            <Label htmlFor="activo">
              Entidad activa
            </Label>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              {nombreEntidad ? 'Actualizar' : 'Crear'}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NombreEntidadForm;