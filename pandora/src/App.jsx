import { Routes, Route, useRoutes } from 'react-router-dom';
import { routes } from './routes';

function App() {
  // Utilizamos useRoutes para renderizar las rutas desde el archivo routes.jsx
  const routeElements = useRoutes(routes);
  
  return routeElements;
}

export default App;