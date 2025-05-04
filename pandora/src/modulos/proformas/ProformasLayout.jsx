// /Users/clc/Ws/Appclc/pandora/src/modulos/proformas/ProformasLayout.jsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProformaPage from './pages/proformaPage';

/**
 * Componente principal para el módulo de Proformas
 * Define las rutas internas del módulo
 */
const ProformasLayout = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="lista" replace />} />
      <Route path="lista" element={<ProformaPage />} />
      {/* Agregar rutas adicionales del módulo aquí */}
    </Routes>
  );
};

export default ProformasLayout;