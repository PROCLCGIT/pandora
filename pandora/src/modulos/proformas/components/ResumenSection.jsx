import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ResumenSection = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Resumen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Subtotal:</span>
            <span className="text-sm">$1,000.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Descuento:</span>
            <span className="text-sm">$0.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">IGV (18%):</span>
            <span className="text-sm">$180.00</span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="font-medium">Total:</span>
            <span className="font-medium">$1,180.00</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};