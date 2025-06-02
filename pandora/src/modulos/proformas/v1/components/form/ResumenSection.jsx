import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileText } from 'lucide-react';

const ResumenSection = ({ totales = {}, porcentajeImpuesto = 15 }) => {
  // Asegurar que los valores sean números
  const subtotal = parseFloat(totales.subtotal) || 0;
  const iva = parseFloat(totales.iva) || 0;
  const total = parseFloat(totales.total) || 0;
  const porcentaje = parseFloat(porcentajeImpuesto) || 15;

  return (
    <Card>
      <CardHeader className="py-3 px-4 bg-blue-300/20">
        <CardTitle className="flex items-center text-base font-bold">
          <FileText className="mr-2 h-4 w-4 text-blue-600" />
          Resumen
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>IVA ({porcentaje}%):</span>
          <span>${iva.toFixed(2)}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-semibold text-lg">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumenSection;