// /Users/clc/Ws/Appclc/pandora/src/modulos/proformas/pages/proformaPage.jsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * P�gina principal de proformas
 */
const ProformaPage = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Gesti�n de Proformas</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Listado de Proformas</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Este m�dulo est� en desarrollo. Pr�ximamente podr�s gestionar tus proformas aqu�.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProformaPage;