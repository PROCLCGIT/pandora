import React from 'react';
import { Routes, Route } from 'react-router-dom';
import InventoryDashboard from './pages/InventoryDashboard';
import MovementsPage from './pages/MovementsPage';
import ReportsPage from './pages/ReportsPage';

const InventoryRoutes = () => {
  return (
    <Routes>
      <Route index element={<InventoryDashboard />} />
      <Route path="movimientos" element={<MovementsPage />} />
      <Route path="reportes" element={<ReportsPage />} />
    </Routes>
  );
};

export default InventoryRoutes;
