import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload } from 'lucide-react';
import StockOverview from '../components/StockOverview';
import InventoryTable from '../components/InventoryTable';
import StockAlerts from '../components/StockAlerts';
import { useInventory } from '../hooks/useInventory';

const InventoryDashboard = () => {
  const { resumen } = useInventory();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventarios</h1>
          <p className="text-muted-foreground">
            Gestión y control de stock en tiempo real
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Movimiento
          </Button>
        </div>
      </div>

      {/* Resumen */}
      <StockOverview resumen={resumen} />

      {/* Alertas */}
      <StockAlerts />

      {/* Tabla de inventario */}
      <Card>
        <CardHeader>
          <CardTitle>Inventario Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <InventoryTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryDashboard;
