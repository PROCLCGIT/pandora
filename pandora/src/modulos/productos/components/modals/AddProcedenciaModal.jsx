import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCreateProcedencia } from '@/modulos/basic/api/procedenciaService';
import { StyledModal, StyledInput, StyledButton } from './StyledModal';
import { Globe, Code } from 'lucide-react';

export function AddProcedenciaModal({ open, onOpenChange, onProcedenciaCreated }) {
  const [formData, setFormData] = useState({
    nombre: '',
    code: ''
  });
  const [errors, setErrors] = useState({});
  const { toast } = useToast();
  
  const createMutation = useCreateProcedencia({
    onSuccess: (data) => {
      toast({
        title: "Procedencia creada",
        description: `La procedencia "${data.nombre}" ha sido creada correctamente`,
      });
      // Limpiar formulario
      setFormData({ nombre: '', code: '' });
      setErrors({});
      // Cerrar modal
      onOpenChange(false);
      // Notificar al componente padre
      if (onProcedenciaCreated) {
        onProcedenciaCreated(data);
      }
    },
    onError: (error) => {
      if (error.response?.data) {
        setErrors(error.response.data);
      }
      toast({
        title: "Error al crear procedencia",
        description: error.message || "Ha ocurrido un error al crear la procedencia",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación básica
    const newErrors = {};
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    if (!formData.code.trim()) {
      newErrors.code = 'El código es requerido';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Enviar datos
    createMutation.mutate(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <StyledModal 
      open={open} 
      onOpenChange={onOpenChange}
      title="Agregar Nueva Procedencia"
      icon="🌍"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <StyledInput
            label="País o Región"
            required
            id="nombre"
            value={formData.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            placeholder="Ej: China, USA, Nacional, Europa"
            error={errors.nombre}
            icon={<Globe className="w-4 h-4" />}
          />
          
          <StyledInput
            label="Código"
            required
            id="code"
            value={formData.code}
            onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
            placeholder="Ej: CHN, USA, NAC, EUR"
            error={errors.code}
            icon={<Code className="w-4 h-4" />}
          />
          
          <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
            💡 <strong>Tip:</strong> Use códigos de país estándar o abreviaturas reconocibles
          </p>
        </div>
        
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
          <StyledButton
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isLoading}
          >
            Cancelar
          </StyledButton>
          <StyledButton 
            type="submit" 
            variant="primary"
            disabled={createMutation.isLoading}
          >
            {createMutation.isLoading ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Creando...
              </>
            ) : (
              <>
                <span className="mr-2">✨</span>
                Crear Procedencia
              </>
            )}
          </StyledButton>
        </div>
      </form>
    </StyledModal>
  );
}