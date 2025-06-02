import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  FileText, 
  Calendar,
  Copy,
  Eye,
  EyeOff,
  ExternalLink
} from 'lucide-react';

const DatoInstitucionalDetalle = ({ 
  dato, 
  isOpen, 
  onClose, 
  onEdit 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  if (!dato) return null;

  const handleCopyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    // Aquí podrías agregar una notificación toast
    console.log(`${field} copiado: ${text}`);
  };

  const handleOpenWebsite = () => {
    if (dato.sitio_web) {
      window.open(dato.sitio_web, '_blank');
    }
  };

  const InfoItem = ({ icon: Icon, label, value, copyable = false, isUrl = false }) => {
    if (!value) return null;

    return (
      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
        <Icon className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-500 mb-1">{label}</div>
          <div className="flex items-center gap-2">
            <span className="text-gray-900 break-words">{value}</span>
            {copyable && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 flex-shrink-0"
                onClick={() => handleCopyToClipboard(value, label)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            )}
            {isUrl && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 flex-shrink-0"
                onClick={handleOpenWebsite}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Detalles de {dato.nombre_entidad_texto}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Información Principal */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">Información Principal</CardTitle>
                <div className="flex gap-2">
                  <Badge variant={dato.activo ? 'default' : 'secondary'}>
                    {dato.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                  <Button onClick={() => onEdit(dato)} size="sm">
                    Editar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem 
                  icon={Building2} 
                  label="Entidad" 
                  value={`${dato.codigo_entidad} - ${dato.nombre_entidad_texto}`} 
                />
                <InfoItem 
                  icon={FileText} 
                  label="RUC" 
                  value={dato.ruc} 
                  copyable 
                />
              </div>
            </CardContent>
          </Card>

          {/* Credenciales de Acceso */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Credenciales de Acceso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem 
                  icon={User} 
                  label="Usuario" 
                  value={dato.usuario} 
                  copyable 
                />
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <User className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-500 mb-1">Contraseña</div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900">
                        {showPassword ? '••••••••' : dato.contrasena_visible}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de Contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem 
                  icon={Mail} 
                  label="Correo Electrónico" 
                  value={dato.correo} 
                  copyable 
                />
                <InfoItem 
                  icon={Phone} 
                  label="Teléfono" 
                  value={dato.telefono} 
                  copyable 
                />
                <InfoItem 
                  icon={User} 
                  label="Representante" 
                  value={dato.representante} 
                />
                {dato.sitio_web && (
                  <InfoItem 
                    icon={Globe} 
                    label="Sitio Web" 
                    value={dato.sitio_web} 
                    isUrl 
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información Adicional */}
          {(dato.direccion || dato.observaciones) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información Adicional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dato.direccion && (
                  <InfoItem 
                    icon={MapPin} 
                    label="Dirección" 
                    value={dato.direccion} 
                  />
                )}
                {dato.observaciones && (
                  <InfoItem 
                    icon={FileText} 
                    label="Observaciones" 
                    value={dato.observaciones} 
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Metadatos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Creado: {new Date(dato.created_at).toLocaleString('es-ES')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Última actualización: {new Date(dato.fecha_ultima_actualizacion).toLocaleString('es-ES')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DatoInstitucionalDetalle;