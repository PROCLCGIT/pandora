// /pandora/src/modulos/directorio/routes/DirectorioRoutes.jsx

import { Outlet, useRoutes } from 'react-router-dom';
import { Suspense } from 'react';
// Importaciones para Clientes
import ClientePage from '../pages/clientes/clientePage';
import ClientesInfinitePage from '../pages/clientes/ClientesInfinitePage';
import AddClientePage from '../pages/clientes/addClientePage';
import DetalleCliente from '../pages/clientes/detalleCliente';
// Importaciones para Proveedores
import ProveedorPage from '../pages/proveedores/proveedorPage';
import ProveedoresInfinitePage from '../pages/proveedores/ProveedoresInfinitePage';
import AddProveedorPage from '../pages/proveedores/addProveedorPage';
import DetalleProveedor from '../pages/proveedores/detalleProveedor';
// Importaciones para Contactos
import ContactoPage from '../pages/contactos/contactoPage';
import ContactosInfinitePage from '../pages/contactos/ContactosInfinitePage';
import AddContactoPage from '../pages/contactos/addContactoPage';
import DetalleContacto from '../pages/contactos/detalleContacto';
// Importaciones para Vendedores
import VendedorPage from '../pages/vendedores/vendedorPage';
import VendedoresInfinitePage from '../pages/vendedores/VendedoresInfinitePage';
import AddVendedorPage from '../pages/vendedores/addVendedorPage';
import DetalleVendedor from '../pages/vendedores/detalleVendedor';

// Loading spinner para Suspense
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-full w-full min-h-[200px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

// Layout compartido
const DirectorioLayout = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Outlet />
    </Suspense>
  );
};

// Componente principal que usa useRoutes
const DirectorioRoutes = () => {
  const routes = useRoutes([
    {
      path: '/',
      element: <DirectorioLayout />,
      children: [
        // Rutas de Clientes
        {
          path: 'clientes',
          element: <ClientePage />
        },
        {
          path: 'clientes/infinite',
          element: <ClientesInfinitePage />
        },
        {
          path: 'clientes/add',
          element: <AddClientePage />
        },
        {
          path: 'clientes/edit/:id',
          element: <AddClientePage />
        },
        {
          path: 'clientes/:id',
          element: <DetalleCliente />
        },
        
        // Rutas de Proveedores
        {
          path: 'proveedores',
          element: <ProveedorPage />
        },
        {
          path: 'proveedores/infinite',
          element: <ProveedoresInfinitePage />
        },
        {
          path: 'proveedores/add',
          element: <AddProveedorPage />
        },
        {
          path: 'proveedores/edit/:id',
          element: <AddProveedorPage />
        },
        {
          path: 'proveedores/:id',
          element: <DetalleProveedor />
        },
        
        // Rutas de Contactos
        {
          path: 'contactos',
          element: <ContactoPage />
        },
        {
          path: 'contactos/infinite',
          element: <ContactosInfinitePage />
        },
        {
          path: 'contactos/add',
          element: <AddContactoPage />
        },
        {
          path: 'contactos/edit/:id',
          element: <AddContactoPage />
        },
        {
          path: 'contactos/:id',
          element: <DetalleContacto />
        },
        
        // Rutas de Vendedores
        {
          path: 'vendedores',
          element: <VendedorPage />
        },
        {
          path: 'vendedores/infinite',
          element: <VendedoresInfinitePage />
        },
        {
          path: 'vendedores/add',
          element: <AddVendedorPage />
        },
        {
          path: 'vendedores/edit/:id',
          element: <AddVendedorPage />
        },
        {
          path: 'vendedores/:id',
          element: <DetalleVendedor />
        }
      ]
    }
  ]);

  return routes;
};

export default DirectorioRoutes;