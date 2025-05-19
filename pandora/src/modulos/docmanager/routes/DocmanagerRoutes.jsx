// /pandora/src/modulos/docmanager/routes/DocmanagerRoutes.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Componente temporal para desarrollo
const DocmanagerPlaceholder = () => (
  <div className="p-6 bg-white rounded-lg shadow-md">
    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Módulo de Gestión Documental</h2>
    <p className="text-gray-600 mb-4">
      Este módulo está actualmente en desarrollo. Estará disponible próximamente.
    </p>
    <div className="p-4 bg-blue-50 rounded border border-blue-200">
      <h3 className="font-medium text-blue-800 mb-2">Características planeadas:</h3>
      <ul className="list-disc pl-5 space-y-1 text-blue-700">
        <li>Almacenamiento centralizado de documentos</li>
        <li>Categorización y etiquetado</li>
        <li>Control de versiones</li>
        <li>Búsqueda avanzada</li>
        <li>Permisos de acceso</li>
      </ul>
    </div>
  </div>
);

const DocmanagerRoutes = () => {
  return (
    <Routes>
      <Route index element={<DocmanagerPlaceholder />} />
      <Route path="*" element={<DocmanagerPlaceholder />} />
    </Routes>
  );
};

export default DocmanagerRoutes;