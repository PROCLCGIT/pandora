import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const DetallesProforma = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Detalles de la Proforma</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-sm font-medium text-gray-500">Fecha de emisión</p>
            <p className="text-sm">15/05/2023</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Válido hasta</p>
            <p className="text-sm">15/06/2023</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Moneda</p>
            <p className="text-sm">USD - Dólar Americano</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Vendedor</p>
            <p className="text-sm">Juan Pérez</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};