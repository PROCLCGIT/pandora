// pandora/src/App.jsx

import { Routes, Route, useRoutes } from 'react-router-dom';
import { routes } from './routes';
import { Toaster } from '@/components/ui/toaster';

function App() {
  // Utilizamos useRoutes para renderizar las rutas desde el archivo routes.jsx
  const routeElements = useRoutes(routes);
  
  return (
    <>
      {routeElements}
      <Toaster /> {/* Añadimos el componente Toaster para las notificaciones */}
    </>
  );
}

export default App;