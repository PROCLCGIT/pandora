import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileDown, Filter } from 'lucide-react';
import MovementHistory from '../components/MovementHistory';
import MovementForm from '../components/MovementForm';
import { useMovements } from '../hooks/useMovements';

const MovementsPage = () => {
  const [showMovementForm, setShowMovementForm] = useState(false);
  const { fetchMovimientos } = useMovements();

  const handleMovementSuccess = () => {
    setShowMovementForm(false);
    fetchMovimientos();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Movimientos de Inventario</h1>
          <p className="text-muted-foreground">
            Gestión de entradas, salidas y transferencias
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtros avanzados
          </Button>
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={() => setShowMovementForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Movimiento
          </Button>
        </div>
      </div>

      {/* Tabs de movimientos */}
      <Tabs defaultValue="todos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="entradas">Entradas</TabsTrigger>
          <TabsTrigger value="salidas">Salidas</TabsTrigger>
          <TabsTrigger value="transferencias">Transferencias</TabsTrigger>
          <TabsTrigger value="ajustes">Ajustes</TabsTrigger>
        </TabsList>

        <TabsContent value="todos">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Movimientos</CardTitle>
            </CardHeader>
            <CardContent>
              <MovementHistory />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entradas">
          <Card>
            <CardHeader>
              <CardTitle>Entradas de Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <MovementHistory tipoFiltro="entrada" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salidas">
          <Card>
            <CardHeader>
              <CardTitle>Salidas de Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <MovementHistory tipoFiltro="salida" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transferencias">
          <Card>
            <CardHeader>
              <CardTitle>Transferencias entre Almacenes</CardTitle>
            </CardHeader>
            <CardContent>
              <MovementHistory tipoFiltro="transferencia" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ajustes">
          <Card>
            <CardHeader>
              <CardTitle>Ajustes de Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <MovementHistory tipoFiltro="ajuste" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de nuevo movimiento */}
      <MovementForm
        open={showMovementForm}
        onClose={() => setShowMovementForm(false)}
        onSuccess={handleMovementSuccess}
      />
    </div>
  );
};

export default MovementsPage;
