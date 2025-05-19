import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

export const ProductosTable = () => {
  const productos = [
    {
      id: 1,
      codigo: 'SRV001',
      descripcion: 'Servicio de mantenimiento preventivo',
      cantidad: 1,
      unidad: 'Servicio',
      precioUnitario: 500,
      total: 500
    },
    {
      id: 2,
      codigo: 'REP002',
      descripcion: 'Repuesto principal para maquinaria pesada',
      cantidad: 2,
      unidad: 'Unidad',
      precioUnitario: 250,
      total: 500
    }
  ];

  return (
    <div className="border rounded-md">
      <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b">
        <h3 className="font-medium">Productos y Servicios</h3>
        <Button size="sm" variant="ghost">
          <Plus className="h-4 w-4 mr-1" /> Agregar
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead className="w-full">Descripción</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Unidad</TableHead>
            <TableHead>Precio Unit.</TableHead>
            <TableHead>Total</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {productos.map((producto) => (
            <TableRow key={producto.id}>
              <TableCell className="font-medium">{producto.codigo}</TableCell>
              <TableCell>{producto.descripcion}</TableCell>
              <TableCell>{producto.cantidad}</TableCell>
              <TableCell>{producto.unidad}</TableCell>
              <TableCell>${producto.precioUnitario.toFixed(2)}</TableCell>
              <TableCell>${producto.total.toFixed(2)}</TableCell>
              <TableCell>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Trash2 className="h-4 w-4 text-gray-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};