import React from 'react';
import { Badge } from '@/components/ui/badge';

export const ProformaHeader = () => {
  return (
    <div className="flex justify-between items-start border-b pb-4">
      <div>
        <h2 className="text-xl font-semibold">Proforma #6551</h2>
        <p className="text-gray-500">Creada: 15 de mayo, 2023</p>
      </div>
      <Badge className="bg-yellow-500">Pendiente</Badge>
    </div>
  );
};