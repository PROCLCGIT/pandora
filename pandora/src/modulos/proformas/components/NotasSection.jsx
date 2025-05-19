import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export const NotasSection = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Notas y Términos</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          defaultValue="Los precios no incluyen IGV. Esta proforma es válida por 30 días. Tiempo de entrega: 10 días hábiles después de confirmado el pedido. Forma de pago: 50% adelanto, 50% contra entrega."
          className="min-h-[120px]"
        />
      </CardContent>
    </Card>
  );
};