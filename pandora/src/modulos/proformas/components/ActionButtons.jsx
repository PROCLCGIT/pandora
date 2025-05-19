import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Send, Printer, Copy, XCircle } from 'lucide-react';

export const ActionButtons = () => {
  return (
    <div className="flex justify-end gap-2 pt-4 border-t">
      <Button variant="outline" size="sm">
        <XCircle className="h-4 w-4 mr-1" /> Cancelar
      </Button>
      <Button variant="outline" size="sm">
        <Copy className="h-4 w-4 mr-1" /> Duplicar
      </Button>
      <Button variant="outline" size="sm">
        <Printer className="h-4 w-4 mr-1" /> Imprimir
      </Button>
      <Button variant="outline" size="sm">
        <Send className="h-4 w-4 mr-1" /> Enviar
      </Button>
      <Button size="sm">
        <Save className="h-4 w-4 mr-1" /> Guardar
      </Button>
    </div>
  );
};