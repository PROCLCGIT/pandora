import React from 'react';
import { Routes, Route } from 'react-router-dom';
import FastInfoDashboard from '../pages/FastInfoDashboard';
import NombresEntidadPage from '../pages/NombresEntidadPage';

const FastInfoRoutes = () => {
  return (
    <Routes>
      {/* Ruta principal - Dashboard */}
      <Route path="" element={<FastInfoDashboard />} />
      <Route path="dashboard" element={<FastInfoDashboard />} />
      
      {/* Gestión de nombres de entidad */}
      <Route path="nombres-entidad" element={<NombresEntidadPage />} />
      
      {/* Ruta por defecto redirige al dashboard */}
      <Route path="*" element={<FastInfoDashboard />} />
    </Routes>
  );
};

export default FastInfoRoutes;