// pandora/src/App.jsx

import { useRoutes } from 'react-router-dom';
import { routes } from './routes';
import { Toaster } from '@/components/ui/toaster';
import SessionManager from './components/ui/auth/SessionManager';

function App() {
  // Utilizamos useRoutes para renderizar las rutas desde el archivo routes.jsx
  const routeElements = useRoutes(routes);
  
  return (
    <SessionManager>
      {routeElements}
      <Toaster /> {/* Añadimos el componente Toaster para las notificaciones */}
    </SessionManager>
  );
}

export default App;