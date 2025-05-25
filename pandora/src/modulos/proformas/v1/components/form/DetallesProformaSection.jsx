import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Edit3,
} from 'lucide-react';

const DetallesProformaSection = ({ detalles = {}, onDetallesChange }) => {
  const handleNombreChange = (e) => {
    if (onDetallesChange) {
      onDetallesChange({ ...detalles, nombre: e.target.value });
    }
  };

  return (
    <Card>
      <CardHeader className="py-3 px-4 bg-blue-300/20">
        <CardTitle className="flex items-center text-base font-bold">
          <FileText className="mr-2 h-4 w-4 text-blue-600" />
          Detalles de la Proforma
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-4 px-4">
        <div className="space-y-3">
          <div className="grid grid-cols-[140px,1fr,24px] items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">Nombre:</span>
            <Input 
              className="h-8 text-sm text-left" 
              placeholder="Ingrese un nombre descriptivo"
              value={detalles.nombre || ''}
              onChange={handleNombreChange}
            />
            <div></div>
          </div>
          
          <div className="grid grid-cols-[140px,1fr,24px] items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">Fecha emisión:</span>
            <span className="text-sm text-gray-900">{detalles.fechaEmision || '21/3/2025'}</span>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Edit3 className="h-3.5 w-3.5 text-blue-500" />
            </Button>
          </div>

          <div className="grid grid-cols-[140px,1fr,24px] items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">Válido hasta:</span>
            <span className="text-sm text-gray-900">{detalles.validoHasta || '5/4/2025'}</span>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Edit3 className="h-3.5 w-3.5 text-blue-500" />
            </Button>
          </div>

          <div className="grid grid-cols-[140px,1fr,24px] items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">Forma de pago:</span>
            <span className="text-sm text-gray-900">{detalles.formaPago || '50% anticipo, 50% contra entrega'}</span>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Edit3 className="h-3.5 w-3.5 text-blue-500" />
            </Button>
          </div>

          <div className="grid grid-cols-[140px,1fr,24px] items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">Tiempo entrega:</span>
            <span className="text-sm text-gray-900">{detalles.tiempoEntrega || '5 días hábiles'}</span>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Edit3 className="h-3.5 w-3.5 text-blue-500" />
            </Button>
          </div>

          <div className="grid grid-cols-[140px,1fr,24px] items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">Atención:</span>
            <span className="text-sm text-gray-900">{detalles.atencion || ''}</span>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Edit3 className="h-3.5 w-3.5 text-blue-500" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DetallesProformaSection;