import { useState, useEffect } from 'react';
import ProductosOfertadosListDebug from '../../components/productoOfertado/ProductosOfertadosListDebug';
import { productoOfertadoService } from '../../api/productoOfertadoService';

export default function DebugProductosPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await productoOfertadoService.getAll({ limit: 10, offset: 0 });
        console.log('API Response:', response);
        setData(response);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Debug - Productos Ofertados</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h2 className="font-bold">Estado de Datos:</h2>
        <p>Loading: {loading ? 'Sí' : 'No'}</p>
        <p>Error: {error ? error.message : 'No'}</p>
        <p>Data: {data ? 'Sí' : 'No'}</p>
        {data && (
          <>
            <p>Count: {data.count}</p>
            <p>Results length: {data.results?.length || 0}</p>
          </>
        )}
      </div>

      {data && data.results && (
        <div className="mb-4 p-4 bg-blue-50 rounded">
          <h2 className="font-bold">Primer Producto con Imagen:</h2>
          {data.results.map((producto, index) => {
            if (producto.imagenes && producto.imagenes.length > 0) {
              return (
                <div key={producto.id} className="mt-2">
                  <p><strong>Producto {index}:</strong> {producto.nombre}</p>
                  <p>Imágenes: {producto.imagenes.length}</p>
                  {producto.imagenes[0] && (
                    <>
                      <p>Thumbnail URL: {producto.imagenes[0].thumbnail_url}</p>
                      <p>Imagen URL: {producto.imagenes[0].imagen_url}</p>
                    </>
                  )}
                </div>
              );
            }
            return null;
          })}
        </div>
      )}

      <ProductosOfertadosListDebug
        data={data}
        isLoading={loading}
        isError={!!error}
        error={error}
        refetch={() => window.location.reload()}
      />
    </div>
  );
}