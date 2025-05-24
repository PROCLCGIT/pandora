import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCreateMarca } from '@/modulos/basic/api/marcaService';
import { StyledModal, StyledInput, StyledButton, StyledTextarea, StyledCheckbox } from './StyledModal';
import { Tag, Code, FileText, Users, Globe, Link, Phone } from 'lucide-react';

export function AddMarcaModal({ open, onOpenChange, onMarcaCreated }) {
  const [formData, setFormData] = useState({
    nombre: '',
    code: '',
    description: '',
    proveedores: '',
    country_origin: '',
    website: '',
    contact_info: '',
    is_active: true
  });
  const [errors, setErrors] = useState({});
  const { toast } = useToast();
  
  const createMutation = useCreateMarca({
    onSuccess: (data) => {
      toast({
        title: "Marca creada",
        description: `La marca "${data.nombre}" ha sido creada correctamente`,
      });
      // Limpiar formulario
      setFormData({ 
        nombre: '',
        code: '',
        description: '',
        proveedores: '',
        country_origin: '',
        website: '',
        contact_info: '',
        is_active: true
      });
      setErrors({});
      // Cerrar modal
      onOpenChange(false);
      // Notificar al componente padre
      if (onMarcaCreated) {
        onMarcaCreated(data);
      }
    },
    onError: (error) => {
      if (error.response?.data) {
        setErrors(error.response.data);
      }
      toast({
        title: "Error al crear marca",
        description: error.message || "Ha ocurrido un error al crear la marca",
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
      title="Agregar Nueva Marca"
      icon="🏷️"
    >
      <form onSubmit={handleSubmit}>
        <div className="max-h-[65vh] overflow-y-auto pr-3">
          {/* Campos obligatorios */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl mb-6">
            <h3 className="text-base font-semibold text-blue-900 mb-4 flex items-center">
              <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs mr-2">1</span>
              Información Básica (Requerida)
            </h3>
            
            <div className="grid grid-cols-2 gap-5">
              <StyledInput
                label="Nombre de la Marca"
                required
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Ej: Samsung, Apple, LG"
                error={errors.nombre}
                icon={<Tag className="w-4 h-4" />}
              />
              
              <StyledInput
                label="Código"
                required
                id="code"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                placeholder="Ej: SAM, APP, LG"
                error={errors.code}
                icon={<Code className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Campos opcionales */}
          <div className="bg-gray-50 p-5 rounded-xl">
            <h3 className="text-base font-semibold text-gray-700 mb-4 flex items-center">
              <span className="w-7 h-7 bg-gray-600 text-white rounded-full flex items-center justify-center text-xs mr-2">2</span>
              Información Adicional (Opcional)
            </h3>
            
            <div className="space-y-5">
              {/* Primera fila - Descripción ocupa todo el ancho */}
              <StyledTextarea
                label="Descripción"
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Breve descripción de la marca, productos que maneja, historia..."
                error={errors.description}
                icon={<FileText className="w-4 h-4" />}
                rows={3}
              />
              
              {/* Segunda fila - 2 columnas */}
              <div className="grid grid-cols-2 gap-5">
                <StyledInput
                  label="Proveedores"
                  id="proveedores"
                  value={formData.proveedores}
                  onChange={(e) => handleChange('proveedores', e.target.value)}
                  placeholder="Ej: Distribuidor ABC, Importadora XYZ"
                  error={errors.proveedores}
                  icon={<Users className="w-4 h-4" />}
                />
                
                <StyledInput
                  label="País de Origen"
                  id="country_origin"
                  value={formData.country_origin}
                  onChange={(e) => handleChange('country_origin', e.target.value)}
                  placeholder="Ej: Estados Unidos, China, Japón"
                  error={errors.country_origin}
                  icon={<Globe className="w-4 h-4" />}
                />
              </div>
              
              {/* Tercera fila - Sitio web ocupa todo el ancho */}
              <StyledInput
                label="Sitio Web"
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://www.ejemplo.com"
                error={errors.website}
                icon={<Link className="w-4 h-4" />}
              />
              
              {/* Cuarta fila - Información de contacto ocupa todo el ancho */}
              <StyledTextarea
                label="Información de Contacto"
                id="contact_info"
                value={formData.contact_info}
                onChange={(e) => handleChange('contact_info', e.target.value)}
                placeholder="Teléfono: +1 234 567 890&#10;Email: contacto@marca.com&#10;Dirección: Calle Principal 123"
                error={errors.contact_info}
                icon={<Phone className="w-4 h-4" />}
                rows={3}
              />
              
              {/* Checkbox */}
              <div className="pt-2">
                <StyledCheckbox
                  label="Marca Activa"
                  checked={formData.is_active}
                  onChange={(checked) => handleChange('is_active', checked)}
                  id="is_active"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-start space-x-2 text-xs text-gray-600 bg-amber-50 p-3 rounded-lg">
            <span className="text-amber-600 text-base">💡</span>
            <p>
              <strong>Consejo:</strong> Solo el nombre y código son obligatorios. Los demás campos pueden completarse más tarde desde la lista de marcas.
            </p>
          </div>
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
                Crear Marca
              </>
            )}
          </StyledButton>
        </div>
      </form>
    </StyledModal>
  );
}