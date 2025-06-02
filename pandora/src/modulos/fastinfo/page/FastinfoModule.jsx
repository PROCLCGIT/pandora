import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building2, 
  Database, 
  BarChart3,
  Info
} from 'lucide-react';

import FastinfoDashboard from './pages/FastinfoDashboard';
import NombresEntidadPage from './pages/NombresEntidadPage';
import DatosInstitucionalesPage from './pages/DatosInstitucionalesPage';

const FastinfoModule = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header del módulo */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FastInfo</h1>
              <p className="text-gray-600">
                Gestión de información institucional diaria
              </p>
            </div>
          </div>
          
          {/* Descripción del módulo */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Acerca de FastInfo</p>
                  <p>
                    Módulo para almacenar y gestionar información de entidades institucionales 
                    como SRI, IESS, municipios, etc. Incluye credenciales de acceso, datos de 
                    contacto y información relevante para el uso diario.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navegación por tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="nombres" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Entidades</span>
            </TabsTrigger>
            <TabsTrigger value="datos" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Datos Institucionales</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <FastinfoDashboard />
          </TabsContent>

          <TabsContent value="nombres">
            <NombresEntidadPage />
          </TabsContent>

          <TabsContent value="datos">
            <DatosInstitucionalesPage />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FastinfoModule;