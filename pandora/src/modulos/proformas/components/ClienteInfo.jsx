import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ClienteInfo = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Información del Cliente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <p className="font-semibold">Comercial ABC S.A.C.</p>
            <p className="text-sm text-gray-500">RUC: 20512345678</p>
          </div>
          <div>
            <p className="text-sm">Av. Principal 123, Lima</p>
            <p className="text-sm">contacto@comercialabc.com</p>
            <p className="text-sm">+51 987 654 321</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};