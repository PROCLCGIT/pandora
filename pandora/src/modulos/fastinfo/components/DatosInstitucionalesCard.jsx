import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Mail, 
  Phone, 
  User, 
  Key, 
  Globe, 
  MapPin,
  Copy,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar
} from 'lucide-react';
import { useState } from 'react';

const DatosInstitucionalesCard = ({ 
  datos, 
  onEdit, 
  onDelete, 
  onCopy,
  onVerificarContrasena 
}) => {
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [verificandoContrasena, setVerificandoContrasena] = useState(false);

  const handleCopyField = (field, value) => {
    navigator.clipboard.writeText(value);
    if (onCopy) {
      onCopy(field, value);
    }
  };

  const handleVerificarContrasena = async () => {
    if (!onVerificarContrasena) return;
    
    setVerificandoContrasena(true);
    try {
      const contrasenaTexto = prompt('Ingrese la contraseña para verificar:');
      if (contrasenaTexto) {
        await onVerificarContrasena(datos.id, contrasenaTexto);
      }
    } finally {
      setVerificandoContrasena(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="h-5 w-5 text-blue-600" />
              {datos.nombre_entidad_texto || datos.nombre_entidad?.nombre || 'Sin nombre'}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={datos.activo ? "default" : "secondary"}>
                {datos.activo ? "Activo" : "Inactivo"}
              </Badge>
              <span className="text-sm text-gray-500">
                RUC: {datos.ruc}
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(datos)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(datos)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Información de contacto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700">Correo</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-900 truncate">{datos.correo}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyField('correo', datos.correo)}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700">Teléfono</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-900">{datos.telefono}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyField('telefono', datos.telefono)}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Representante */}
        <div className="flex items-center gap-3">
          <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700">Representante</p>
            <p className="text-sm text-gray-900">{datos.representante}</p>
          </div>
        </div>

        {/* Credenciales de acceso */}
        <div className="border-t pt-4 space-y-3">
          <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Key className="h-4 w-4" />
            Credenciales de Acceso
          </h4>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700">Usuario</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                    {datos.usuario}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyField('usuario', datos.usuario)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700">Contraseña</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                    {mostrarContrasena ? '••••••••' : '••••••••'}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMostrarContrasena(!mostrarContrasena)}
                    className="h-6 w-6 p-0"
                  >
                    {mostrarContrasena ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  {onVerificarContrasena && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleVerificarContrasena}
                      disabled={verificandoContrasena}
                      className="h-6 w-6 p-0"
                      title="Verificar contraseña"
                    >
                      <Key className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        {(datos.direccion || datos.sitio_web || datos.observaciones) && (
          <div className="border-t pt-4 space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Información Adicional</h4>
            
            {datos.direccion && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700">Dirección</p>
                  <p className="text-sm text-gray-900">{datos.direccion}</p>
                </div>
              </div>
            )}

            {datos.sitio_web && (
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700">Sitio Web</p>
                  <a 
                    href={datos.sitio_web} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 underline truncate block"
                  >
                    {datos.sitio_web}
                  </a>
                </div>
              </div>
            )}

            {datos.observaciones && (
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700">Observaciones</p>
                  <p className="text-sm text-gray-900">{datos.observaciones}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fechas */}
        <div className="border-t pt-3 text-xs text-gray-500 flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Actualizado: {formatDate(datos.fecha_ultima_actualizacion)}</span>
          </div>
          {datos.created_at && (
            <span>Creado: {formatDate(datos.created_at)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DatosInstitucionalesCard;