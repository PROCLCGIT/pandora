// /Users/clc/Ws/Appclc/pandora/src/modulos/importexport/routerimportexport.jsx
import { FileSpreadsheet, FileText } from 'lucide-react';
import { Routes, Route } from 'react-router-dom';
import ImportPage from '../pages/ImportPage';
import ProductosOfertadosImportPage from '../pages/ProductosOfertadosImportPage';

// Definimos las rutas para el módulo de importación/exportación
const ImportExportModule = () => {
  return (
    <Routes>
      <Route path="/" element={<ImportPage />} />
      <Route path="/productos-ofertados" element={<ProductosOfertadosImportPage />} />
    </Routes>
  );
};

// También exportamos la configuración de rutas para uso en otros componentes si es necesario
export const importExportRoutes = [
  {
    path: '',
    label: 'Importar/Exportar',
    element: <ImportPage />,
    icon: <FileSpreadsheet className="h-5 w-5" />,
    showInSidebar: true
  },
  {
    path: 'productos-ofertados',
    label: 'Importar Productos Ofertados',
    element: <ProductosOfertadosImportPage />,
    icon: <FileText className="h-5 w-5" />,
    showInSidebar: false
  }
];

export default ImportExportModule;