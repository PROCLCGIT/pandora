import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Settings2, 
  Package, 
  Plus,
  Calculator,
  Copy,
  FileDown,
  BarChart
} from 'lucide-react';

const ToolBarSection = ({ onSelectProducts }) => {
  return (
    <Card className="bg-purple-300/20 border-purple-200 hover:bg-purple-300/30 transition-colors">
      <CardContent className="py-3">
        <div className="flex items-center justify-between text-purple-700 font-medium">
          <div className="flex items-center">
            <Settings2 className="mr-2 h-5 w-5" />
            Herramientas:
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={onSelectProducts}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white h-8 w-8 p-0"
              title="Seleccionar Productos"
            >
              <Package className="h-4 w-4" />
            </Button>
            
            <Button 
              onClick={() => console.log('Agregar servicio')}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white h-8 w-8 p-0"
              title="Agregar Servicio"
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            <Button 
              onClick={() => console.log('Calculadora')}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white h-8 w-8 p-0"
              title="Calculadora"
            >
              <Calculator className="h-4 w-4" />
            </Button>
            
            <Button 
              onClick={() => console.log('Duplicar proforma')}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white h-8 w-8 p-0"
              title="Duplicar Proforma"
            >
              <Copy className="h-4 w-4" />
            </Button>
            
            <Button 
              onClick={() => console.log('Descargar plantilla')}
              size="sm"
              className="bg-gray-600 hover:bg-gray-700 text-white h-8 w-8 p-0"
              title="Descargar Plantilla"
            >
              <FileDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ToolBarSection;