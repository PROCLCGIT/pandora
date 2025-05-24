// Componente de debugging para ver datos de miniatura
import React from 'react';

const DebugMiniaturaData = ({ producto }) => {
  if (!producto) return null;

  console.log("=== DEBUG MINIATURA DATA ===");
  console.log("Producto completo:", producto);
  console.log("Imagenes:", producto.imagenes);
  
  if (producto.imagenes && producto.imagenes.length > 0) {
    producto.imagenes.forEach((imagen, index) => {
      console.log(`Imagen ${index}:`, imagen);
      console.log(`- ID: ${imagen.id}`);
      console.log(`- URLs object:`, imagen.urls);
      console.log(`- thumbnail_url:`, imagen.thumbnail_url);
      console.log(`- webp_url:`, imagen.webp_url);
      console.log(`- original_url:`, imagen.original_url);
      console.log(`- imagen_url:`, imagen.imagen_url);
      console.log(`- imagen:`, imagen.imagen);
    });
  }

  const imagen = producto.imagenes?.find(img => img.is_primary) || producto.imagenes?.[0];
  
  return (
    <div style={{
      border: '2px solid #333',
      padding: '20px',
      margin: '20px',
      backgroundColor: '#f5f5f5',
      fontFamily: 'monospace'
    }}>
      <h3>Debug Miniatura Data - {producto.code}</h3>
      
      <div>
        <h4>Datos de la primera imagen:</h4>
        <pre>{JSON.stringify(imagen, null, 2)}</pre>
      </div>
      
      <div>
        <h4>URLs disponibles:</h4>
        {imagen && (
          <>
            <div>urls.thumbnail: {imagen.urls?.thumbnail || 'null'}</div>
            <div>urls.webp: {imagen.urls?.webp || 'null'}</div>
            <div>urls.original: {imagen.urls?.original || 'null'}</div>
            <div>thumbnail_url: {imagen.thumbnail_url || 'null'}</div>
            <div>webp_url: {imagen.webp_url || 'null'}</div>
            <div>original_url: {imagen.original_url || 'null'}</div>
            <div>imagen_url: {imagen.imagen_url || 'null'}</div>
          </>
        )}
      </div>
      
      <div>
        <h4>Test de URLs:</h4>
        {imagen && (
          <>
            {imagen.urls?.thumbnail && (
              <div>
                <div>Testing urls.thumbnail:</div>
                <img 
                  src={imagen.urls.thumbnail} 
                  alt="Test thumbnail"
                  style={{maxWidth: '100px', border: '1px solid red'}}
                  onLoad={() => console.log('✅ urls.thumbnail LOADED')}
                  onError={() => console.log('❌ urls.thumbnail FAILED')}
                />
              </div>
            )}
            
            {imagen.thumbnail_url && (
              <div>
                <div>Testing thumbnail_url:</div>
                <img 
                  src={imagen.thumbnail_url} 
                  alt="Test thumbnail_url"
                  style={{maxWidth: '100px', border: '1px solid blue'}}
                  onLoad={() => console.log('✅ thumbnail_url LOADED')}
                  onError={() => console.log('❌ thumbnail_url FAILED')}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DebugMiniaturaData;