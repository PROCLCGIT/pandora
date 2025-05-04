// /Users/clc/Ws/Appclc/pandora/src/modulos/proformas/routes/ProformasRoutes.jsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProformaPage from '../pages/proformaPage';

/**
 * Componente de rutas para el módulo de Proformas
 * Define las rutas internas del módulo
 */
const ProformasRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="lista" replace />} />
      <Route path="lista" element={<ProformaPage />} />
      {/* Agregar rutas adicionales del módulo aquí */}
    </Routes>
  );
};

export default ProformasRoutes;