import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ProformaHeader } from '../components/ProformaHeader';
import { ClienteInfo } from '../components/ClienteInfo';
import { DetallesProforma } from '../components/DetallesProforma';
import { ProductosTable } from '../components/ProductosTable';
import { NotasSection } from '../components/NotasSection';
import { ResumenSection } from '../components/ResumenSection';
import { ActionButtons } from '../components/ActionButtons';
import { Plus, FileText } from 'lucide-react';

const ProformaPage = () => {
  const [activeTab, setActiveTab] = useState('proforma-6551');

  return (
    <div className="container mx-auto p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Proformas</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <span className="mr-2">⌘</span> Atajos de teclado
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Vista previa</Button>
            <Button variant="outline" size="sm">Ver guardadas</Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Nueva
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs para proformas abiertas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <TabsList className="w-full bg-gray-100 p-0">
          <div className="flex w-full">
            <TabsTrigger value="proforma-6551" className="flex items-center px-4 py-2 border-r">
              <FileText className="h-4 w-4 mr-2" /> Proforma 6551
              <button className="ml-2 text-gray-400 hover:text-gray-600">×</button>
            </TabsTrigger>
            <div className="flex-grow flex justify-end">
              <Button variant="ghost" size="sm" className="ml-auto">
                <Plus className="h-4 w-4 mr-1" /> Nueva
              </Button>
            </div>
          </div>
        </TabsList>

        <TabsContent value="proforma-6551" className="mt-4 border rounded-lg p-6">
          {/* Contenido principal de la proforma */}
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProformaPage;