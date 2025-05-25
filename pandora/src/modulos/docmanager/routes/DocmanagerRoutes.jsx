import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DocManagerPage from '../pages/DocManagerPage';

// Aquí puedes agregar más imports de páginas secundarias si existen
// import CategoriasPage from '../pages/CategoriasPage';
// import VerDocumentosPage from '../pages/VerDocumentosPage';

const DocmanagerRoutes = () => {
  return (
    <Routes>
      {/* Ruta principal del gestor documental */}
      <Route path="" element={<DocManagerPage />} />
      {/* Ejemplo de cómo agregar más rutas (descomenta y ajusta si tienes más páginas) */}
      {/* <Route path="categorias" element={<CategoriasPage />} /> */}
      {/* <Route path="documentos" element={<VerDocumentosPage />} /> */}
    </Routes>
  );
};

export default DocmanagerRoutes;
