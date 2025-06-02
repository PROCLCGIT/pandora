import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import ModernCalendar from '@/components/ui/modern-calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Edit3,
  Calendar as CalendarIcon,
  FileCheck,
  Plus,
  Tag,
  Replace,
  CalendarDays,
  Clock
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { proformaService } from '../../api/proformaService';
import { toast } from '@/hooks/use-toast';

const DetallesProformaSection = ({ detalles = {}, onDetallesChange, fieldErrors = {}, onFieldErrorClear }) => {
  const [isEditing, setIsEditing] = useState({
    fechaEmision: false,
    fechaVencimiento: false,
    formaPago: false,
    tiempoEntrega: false,
    atencion: false,
  });

  const [configuracion, setConfiguracion] = useState(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load configuration
      const configData = await proformaService.getConfiguration();

      setConfiguracion(configData);

      // Set default values from configuration
      if (configData && !detalles.empresa) {
        onDetallesChange({
          ...detalles,
          empresa: configData.empresa_predeterminada,
          formaPago: configData.condiciones_pago_predeterminadas || '100% contra entrega',
          tiempoEntrega: configData.tiempo_entrega_predeterminado || 'Entrega Inmediata',
          fechaEmision: new Date(),
          fechaVencimiento: addDays(new Date(), configData.dias_validez_predeterminados || 15),
          porcentajeImpuesto: configData.porcentaje_impuesto_predeterminado || 15
        });
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la configuración inicial',
        variant: 'destructive'
      });
    }
  };

  const handleChange = (field, value) => {
    if (onDetallesChange) {
      onDetallesChange({ ...detalles, [field]: value });
    }
    // Clear field error when user starts typing/changing
    if (onFieldErrorClear && fieldErrors[field]) {
      onFieldErrorClear(field);
    }
  };

  const handleDateChange = (field, date) => {
    handleChange(field, date);
    setIsEditing({ ...isEditing, [field]: false });
  };

  const toggleEdit = (field) => {
    setIsEditing({ ...isEditing, [field]: !isEditing[field] });
  };

  const formatDate = (date) => {
    if (!date) return '';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, 'd/M/yyyy');
    } catch (error) {
      return '';
    }
  };

  return (
    <Card>
      <CardHeader className="py-3 px-4 bg-blue-300/20">
        <div className="flex justify-between items-center min-h-[32px]">
          <CardTitle className="flex items-center text-base font-bold">
            <FileText className="mr-2 h-4 w-4 text-blue-600" />
            Detalles de la Proforma
          </CardTitle>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 w-7 p-0"
            title="Restablecer valores predeterminados"
            onClick={() => {
              // Reset to default values
              if (configuracion) {
                onDetallesChange({
                  ...detalles,
                  formaPago: configuracion.condiciones_pago_predeterminadas || '100% contra entrega',
                  tiempoEntrega: configuracion.tiempo_entrega_predeterminado || 'Entrega Inmediata',
                  fechaEmision: new Date(),
                  fechaVencimiento: addDays(new Date(), configuracion.dias_validez_predeterminados || 30),
                  atencion: '',
                  porcentajeImpuesto: configuracion.porcentaje_impuesto_predeterminado || 15
                });
                toast({
                  title: 'Valores restablecidos',
                  description: 'Se han restablecido los valores predeterminados',
                  variant: 'default'
                });
              }
            }}
          >
            <Replace className="h-3.5 w-3.5 text-orange-500" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4 pb-4 px-4">
        <div className="space-y-3">
          {/* Fecha emisión */}
          <div className="grid grid-cols-[140px,1fr,24px] items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">
              Fecha emisión: <span className="text-red-500">*</span>
            </span>
            {isEditing.fechaEmision ? (
              <Popover open={isEditing.fechaEmision} onOpenChange={(open) => setIsEditing({ ...isEditing, fechaEmision: open })}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-8 text-sm justify-start text-left font-normal",
                      !detalles.fechaEmision && "text-muted-foreground",
                      fieldErrors.fechaEmision && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {detalles.fechaEmision ? formatDate(detalles.fechaEmision) : "Seleccione fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <ModernCalendar
                    selected={detalles.fechaEmision}
                    onSelect={(date) => handleDateChange('fechaEmision', date)}
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <span className={`text-sm ${fieldErrors.fechaEmision ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                {formatDate(detalles.fechaEmision) || (fieldErrors.fechaEmision ? '⚠️ Fecha requerida' : 'No establecida')}
              </span>
            )}
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0"
              onClick={() => toggleEdit('fechaEmision')}
            >
              <Edit3 className="h-3.5 w-3.5 text-blue-500" />
            </Button>
          </div>

          {/* Válido hasta */}
          <div className="grid grid-cols-[140px,1fr,24px,24px,24px] items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">
              Válido hasta: <span className="text-red-500">*</span>
            </span>
            {isEditing.fechaVencimiento ? (
              <Popover open={isEditing.fechaVencimiento} onOpenChange={(open) => setIsEditing({ ...isEditing, fechaVencimiento: open })}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-8 text-sm justify-start text-left font-normal",
                      !detalles.fechaVencimiento && "text-muted-foreground",
                      fieldErrors.fechaVencimiento && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {detalles.fechaVencimiento ? formatDate(detalles.fechaVencimiento) : "Seleccione fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <ModernCalendar
                    selected={detalles.fechaVencimiento}
                    onSelect={(date) => handleDateChange('fechaVencimiento', date)}
                    disabled={(date) => date < detalles.fechaEmision}
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <span className={`text-sm ${fieldErrors.fechaVencimiento ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                {formatDate(detalles.fechaVencimiento) || (fieldErrors.fechaVencimiento ? '⚠️ Fecha requerida' : 'No establecida')}
              </span>
            )}
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0"
              onClick={() => {
                // Add 30 days to emission date
                if (detalles.fechaEmision) {
                  const newDate = addDays(new Date(detalles.fechaEmision), 30);
                  handleChange('fechaVencimiento', newDate);
                } else {
                  toast({
                    title: 'Información',
                    description: 'Primero debe establecer la fecha de emisión',
                    variant: 'default'
                  });
                }
              }}
              title="Agregar 30 días a fecha de emisión"
            >
              <span className="text-xs font-bold text-green-600">30</span>
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0"
              onClick={() => {
                // Add 90 days to emission date
                if (detalles.fechaEmision) {
                  const newDate = addDays(new Date(detalles.fechaEmision), 90);
                  handleChange('fechaVencimiento', newDate);
                } else {
                  toast({
                    title: 'Información',
                    description: 'Primero debe establecer la fecha de emisión',
                    variant: 'default'
                  });
                }
              }}
              title="Agregar 90 días a fecha de emisión"
            >
              <span className="text-xs font-bold text-orange-600">90</span>
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0"
              onClick={() => toggleEdit('fechaVencimiento')}
              title="Editar fecha manualmente"
            >
              <Edit3 className="h-3.5 w-3.5 text-blue-500" />
            </Button>
          </div>

          {/* Forma de pago */}
          <div className="grid grid-cols-[140px,1fr,24px,24px,24px] items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">Forma de pago:</span>
            {isEditing.formaPago ? (
              <Input 
                className="h-8 text-sm" 
                value={detalles.formaPago || ''}
                onChange={(e) => handleChange('formaPago', e.target.value)}
                onBlur={() => setIsEditing({ ...isEditing, formaPago: false })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditing({ ...isEditing, formaPago: false });
                  }
                }}
                autoFocus
              />
            ) : (
              <span className="text-sm text-gray-900">{detalles.formaPago || 'No especificada'}</span>
            )}
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0"
              onClick={() => {
                // Set payment to 30% anticipo, 70% contra entrega
                handleChange('formaPago', '30% Anticipo 70% contra entrega');
              }}
              title="30% Anticipo 70% contra entrega"
            >
              <span className="text-xs font-bold text-green-600">30</span>
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0"
              onClick={() => {
                // Set payment to 50% anticipo, 50% contra entrega
                handleChange('formaPago', '50% Anticipo 50% contra entrega');
              }}
              title="50% Anticipo 50% contra entrega"
            >
              <span className="text-xs font-bold text-orange-600">50</span>
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0"
              onClick={() => toggleEdit('formaPago')}
            >
              <Edit3 className="h-3.5 w-3.5 text-blue-500" />
            </Button>
          </div>

          {/* Tiempo entrega */}
          <div className="grid grid-cols-[140px,1fr,24px,24px,24px] items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">Tiempo entrega:</span>
            {isEditing.tiempoEntrega ? (
              <Input 
                className="h-8 text-sm" 
                value={detalles.tiempoEntrega || ''}
                onChange={(e) => handleChange('tiempoEntrega', e.target.value)}
                onBlur={() => setIsEditing({ ...isEditing, tiempoEntrega: false })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditing({ ...isEditing, tiempoEntrega: false });
                  }
                }}
                autoFocus
              />
            ) : (
              <span className="text-sm text-gray-900">{detalles.tiempoEntrega || 'No especificado'}</span>
            )}
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0"
              onClick={() => {
                // Set delivery time to 3 days
                handleChange('tiempoEntrega', '3 Días');
              }}
              title="3 Días"
            >
              <span className="text-xs font-bold text-green-600">3</span>
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0"
              onClick={() => {
                // Set delivery time to 15 days
                handleChange('tiempoEntrega', '15 Días');
              }}
              title="15 Días"
            >
              <span className="text-xs font-bold text-orange-600">15</span>
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0"
              onClick={() => toggleEdit('tiempoEntrega')}
            >
              <Edit3 className="h-3.5 w-3.5 text-blue-500" />
            </Button>
          </div>

          {/* Atención */}
          <div className="grid grid-cols-[140px,1fr,24px] items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">Atención:</span>
            {isEditing.atencion ? (
              <Input 
                className="h-8 text-sm" 
                placeholder="Nombre de la persona"
                value={detalles.atencion || ''}
                onChange={(e) => handleChange('atencion', e.target.value)}
                onBlur={() => setIsEditing({ ...isEditing, atencion: false })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditing({ ...isEditing, atencion: false });
                  }
                }}
                autoFocus
              />
            ) : (
              <span className="text-sm text-gray-900">{detalles.atencion || 'No especificado'}</span>
            )}
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0"
              onClick={() => toggleEdit('atencion')}
            >
              <Edit3 className="h-3.5 w-3.5 text-blue-500" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DetallesProformaSection;