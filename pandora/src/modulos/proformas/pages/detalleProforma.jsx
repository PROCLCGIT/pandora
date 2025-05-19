import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useParams } from 'react-router-dom';

// Componentes que necesitamos
import { ProformaHeader } from '../components/ProformaHeader';
import { ClienteInfo } from '../components/ClienteInfo';
import { DetallesProforma } from '../components/DetallesProforma';
import { ProductosTable } from '../components/ProductosTable';
import { NotasSection } from '../components/NotasSection';
import { ResumenSection } from '../components/ResumenSection';
import { ActionButtons } from '../components/ActionButtons';

const DetalleProforma = () => {
  const { id } = useParams();
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Proforma #{id}</h1>
          <p className="text-gray-500">Creada el 15 de mayo, 2023</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Editar</Button>
          <Button variant="outline">Imprimir</Button>
          <Button>Aprobar</Button>
        </div>
      </div>

      <Tabs defaultValue="detalles" className="mb-6">
        <TabsList>
          <TabsTrigger value="detalles">Detalles</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="detalles" className="mt-4">
          <Card className="p-6">
            <div className="space-y-6">
              <ProformaHeader />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ClienteInfo />
                <DetallesProforma />
              </div>
              
              <ProductosTable />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <NotasSection />
                <ResumenSection />
              </div>
              
              <ActionButtons />
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="historial" className="mt-4">
          <Card className="p-6">
            <p className="text-center text-gray-500 py-10">
              No hay registros de cambios para esta proforma
            </p>
          </Card>
        </TabsContent>
        
        <TabsContent value="documentos" className="mt-4">
          <Card className="p-6">
            <p className="text-center text-gray-500 py-10">
              No hay documentos asociados a esta proforma
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DetalleProforma;