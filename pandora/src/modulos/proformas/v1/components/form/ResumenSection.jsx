import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileText } from 'lucide-react';

const ResumenSection = ({ totales = {} }) => {
  const { subtotal = 0, iva = 0, total = 0 } = totales;

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
          <span>IVA (12%):</span>
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