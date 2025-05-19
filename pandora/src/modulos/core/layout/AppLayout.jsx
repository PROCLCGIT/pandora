import React from 'react'
import MainLayout from './MainLayout'

/**
 * Componente principal de layout que sirve como punto de entrada 
 * para la aplicación. Utiliza MainLayout que ya maneja el Outlet 
 * para rutas anidadas internamente.
 */
function AppLayout() {
  // MainLayout ya incluye el Outlet para rutas anidadas
  return <MainLayout />
}

export default AppLayout 