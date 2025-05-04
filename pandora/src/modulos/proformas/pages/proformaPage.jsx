// /Users/clc/Ws/Appclc/pandora/src/modulos/proformas/pages/proformaPage.jsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Página principal de proformas
 */
const ProformaPage = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Proformas</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Listado de Proformas</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Este módulo está en desarrollo. Próximamente podrás gestionar tus proformas aquí.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProformaPage;