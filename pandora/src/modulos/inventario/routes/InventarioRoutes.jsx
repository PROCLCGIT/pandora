import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@/modulos/core/layout/ProtectedRoute';

// Pages
import DashboardInventario from '../pages/DashboardInventario';
import AlmacenesPage from '../pages/AlmacenesPage';
import StockPage from '../pages/StockPage';
import MovimientosPage from '../pages/MovimientosPage';
import AlertasPage from '../pages/AlertasPage';

const InventarioRoutes = () => {
  return (
    <Routes>
      {/* Dashboard */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardInventario />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardInventario />
          </ProtectedRoute>
        } 
      />

      {/* Almacenes */}
      <Route 
        path="/almacenes" 
        element={
          <ProtectedRoute>
            <AlmacenesPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/almacenes/nuevo" 
        element={
          <ProtectedRoute>
            <div className="p-6">
              <h1 className="text-3xl font-bold">Nuevo Almacén</h1>
              <p className="mt-4 text-gray-600">Formulario para crear nuevo almacén - Por implementar</p>
            </div>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/almacenes/:id" 
        element={
          <ProtectedRoute>
            <div className="p-6">
              <h1 className="text-3xl font-bold">Editar Almacén</h1>
              <p className="mt-4 text-gray-600">Formulario para editar almacén - Por implementar</p>
            </div>
          </ProtectedRoute>
        } 
      />

      {/* Stock */}
      <Route 
        path="/stock" 
        element={
          <ProtectedRoute>
            <StockPage />
          </ProtectedRoute>
        } 
      />

      {/* Movimientos */}
      <Route 
        path="/movimientos" 
        element={
          <ProtectedRoute>
            <MovimientosPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/movimientos/nuevo" 
        element={
          <ProtectedRoute>
            <div className="p-6">
              <h1 className="text-3xl font-bold">Nuevo Movimiento</h1>
              <p className="mt-4 text-gray-600">Formulario para registrar movimiento - Por implementar</p>
            </div>
          </ProtectedRoute>
        } 
      />

      {/* Alertas */}
      <Route 
        path="/alertas" 
        element={
          <ProtectedRoute>
            <AlertasPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default InventarioRoutes;