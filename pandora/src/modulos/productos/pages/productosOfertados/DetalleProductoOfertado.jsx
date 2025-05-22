import React from 'react'
import { ArrowLeft, Edit, Image as ImageIcon, FileText, Package, Download } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProductoOfertadoById } from '../../api/productoOfertadoService'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function DetailField({ label, children }) {
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border">
      <p className="text-sm font-medium text-gray-500 uppercase mb-1">{label}</p>
      <div className="font-medium text-gray-900">
        {children}
      </div>
    </div>
  )
}

function ImageGallery({ images = [], producto }) {
  // Usar URLs estáticas hardcodeadas para forzar imágenes diferentes
  // Este es un enfoque de emergencia mientras se soluciona el problema en el backend
  const STATIC_TEST_URLS = [
    'https://source.unsplash.com/random/800x600?nature,1',
    'https://source.unsplash.com/random/800x600?nature,2',
    'https://source.unsplash.com/random/800x600?nature,3',
    'https://source.unsplash.com/random/800x600?nature,4',
    'https://source.unsplash.com/random/800x600?nature,5'
  ];
  
  // SOLUCIÓN TEMPORAL EXTREMA: si producto es uno de los problemáticos, usar URLs externas
  const isProblematicProduct = producto && (
    producto.code === 'OFT-A182' || 
    producto.code === 'OFT-A250' || 
    producto.code === 'OFT-A253'
  );

  const buildMediaUrl = (path, item, index) => {
    // SOLUCIÓN TEMPORAL: Para productos problemáticos, usar URLs de prueba diferentes
    if (isProblematicProduct) {
      return STATIC_TEST_URLS[index % STATIC_TEST_URLS.length];
    }
    
    // Verificar primero si tenemos las nuevas URLs basadas en timestamp
    if (item.urls && typeof item.urls === 'object') {
      // Devolver las URLs específicas con timestamp que ya tienen identidad única
      if (item.urls.webp) {
        console.log(`[Imagen ${index}][ID:${item.id}] Usando URL webp de timestamp: ${item.urls.timestamp || 'N/A'}`); 
        return item.urls.webp;
      }
      if (item.urls.thumbnail) {
        console.log(`[Imagen ${index}][ID:${item.id}] Usando URL thumbnail de timestamp: ${item.urls.timestamp || 'N/A'}`);
        return item.urls.thumbnail;
      }
      if (item.urls.original) {
        console.log(`[Imagen ${index}][ID:${item.id}] Usando URL original de timestamp: ${item.urls.timestamp || 'N/A'}`);
        return item.urls.original;
      }
      if (item.urls.default) {
        console.log(`[Imagen ${index}][ID:${item.id}] Usando URL default de timestamp: ${item.urls.timestamp || 'N/A'}`);
        return item.urls.default;
      }
    }
    
    // Para los demás productos, usar la lógica normal pero con parámetros únicos
    // Generar un parámetro basado en el timestamp de la imagen si está disponible
    const timestamp = item.timestamp || item.urls?.timestamp || '';
    // Si no hay timestamp, generar un valor aleatorio para evitar caché
    const cacheParam = timestamp 
        ? `timestamp=${timestamp}` 
        : `nocache=${item.id}_${index}_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
    
    // Función para añadir el parámetro antiCache a una URL
    const addCacheParam = (url) => {
      if (!url) return '';
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}${cacheParam}`;
    };
    
    // Intentar obtener la URL de la imagen en este orden de prioridad estricto:
    // 1. WebP (mejor calidad/tamaño)
    if (item.webp_url) {
      console.log(`[Imagen ${index}][ID:${item.id}] Usando webp_url con parámetro: ${cacheParam}`);
      return addCacheParam(item.webp_url);
    }
    
    // 2. Thumbnail (carga rápida)
    if (item.thumbnail_url) {
      console.log(`[Imagen ${index}][ID:${item.id}] Usando thumbnail_url con parámetro: ${cacheParam}`);
      return addCacheParam(item.thumbnail_url);
    }
    
    // 3. URL genérica (imagen_url)
    if (item.imagen_url) {
      console.log(`[Imagen ${index}][ID:${item.id}] Usando imagen_url con parámetro: ${cacheParam}`);
      return addCacheParam(item.imagen_url);
    }
    
    // 4. Original (mayor tamaño)
    if (item.original_url) {
      console.log(`[Imagen ${index}][ID:${item.id}] Usando original_url con parámetro: ${cacheParam}`);
      return addCacheParam(item.original_url);
    }
    
    // 5. Campo imagen genérico (última opción)
    if (path) {
      let url = path;
      if (path.startsWith('http')) {
        // Ya es una URL completa
      } else if (path.startsWith('/media/')) {
        // Ya tiene el prefijo /media/
      } else {
        // Necesita añadir el prefijo /media/
        url = `/media/${path}`;
      }
      console.log(`[Imagen ${index}][ID:${item.id}] Usando ruta directa con parámetro: ${cacheParam}`);
      return addCacheParam(url);
    }
    
    // Si no hay ninguna URL disponible
    console.log(`[Imagen ${index}][ID:${item.id}] No se encontró ninguna URL válida`);
    return '';
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Imágenes de Referencia</h3>

      {images && images.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {images.map((img, index) => (
            <div key={img.id || index} className="border rounded-lg overflow-hidden shadow-sm bg-white">
              <div className="aspect-video bg-slate-50 relative flex items-center justify-center">
                {/* Debugging de imagen y URL - Mostrar para TODOS los productos */}
                <div className="absolute top-0 right-0 p-1 bg-white bg-opacity-75 text-[8px] text-red-600 z-10">
                  ID: {img.id} | Index: {index}
                </div>
                
                {/* Etiqueta con información sobre la fuente de la URL utilizada */}
                <div className="absolute bottom-0 left-0 p-1 bg-black bg-opacity-60 text-[7px] text-white z-10 w-full">
                  {isProblematicProduct ? (
                    <span className="font-bold text-orange-400">IMAGEN DE PRUEBA: {index + 1}</span>
                  ) : (
                    <>
                      URL: {(() => {
                        if (img.urls && img.urls.webp) return `webp(${img.urls.timestamp || 'ts'})`;
                        if (img.urls && img.urls.thumbnail) return `thumb(${img.urls.timestamp || 'ts'})`;
                        if (img.urls && img.urls.original) return `orig(${img.urls.timestamp || 'ts'})`;
                        if (img.webp_url) return `webp(${img.timestamp || 'no-ts'})`;
                        if (img.thumbnail_url) return `thumb(${img.timestamp || 'no-ts'})`;
                        if (img.imagen_url) return `imagen(${img.timestamp || 'no-ts'})`;
                        if (img.original_url) return `orig(${img.timestamp || 'no-ts'})`;
                        if (img.imagen) return `imagen(${img.timestamp || 'no-ts'})`;
                        return 'ninguna';
                      })()}_{img.id}_{index}
                    </>
                  )}
                </div>
                
                <img
                  src={buildMediaUrl(img.imagen, img, index)}
                  alt={img.descripcion || `Imagen ${index + 1}`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error("Error al cargar imagen:", img);
                    
                    // Si estamos en un producto problemático, intentar cargar una imagen de prueba fallback
                    if (isProblematicProduct) {
                      // Generar una URL completamente diferente cada vez
                      const fallbackIndex = Math.floor(Math.random() * 1000);
                      e.target.src = `https://picsum.photos/800/600?random=${fallbackIndex}`;
                      
                      // Mostrar un mensaje de depuración
                      console.log(`Usando imagen fallback para producto ${producto.code}, imagen ID: ${img.id}`);
                      
                      // Agregar un manejador adicional en caso de que también falle la imagen de respaldo
                      e.target.onerror = () => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjYWFhYWFhIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4=';
                        e.target.onerror = null; // Evitar bucle infinito
                      };
                    } else {
                      // Para productos normales, mostrar el mensaje estándar de imagen no disponible
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjYWFhYWFhIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4=';
                    }
                  }}
                />
                {img.is_primary && (
                  <div className="absolute top-2 left-2 bg-indigo-100 text-indigo-800 rounded-full px-2 py-1 text-xs font-medium">
                    Principal
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="font-medium text-sm truncate">{img.descripcion || `Imagen ${index + 1}`}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-dashed rounded-lg">
          <ImageIcon size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-600 font-medium">No hay imágenes disponibles</p>
          <p className="text-sm text-slate-500 mt-1">Este producto aún no tiene imágenes asociadas</p>
        </div>
      )}
    </div>
  )
}

function DocumentList({ documents = [] }) {
  const buildMediaUrl = (path, item) => {
    // Si tenemos documento_url del serializer, usarla
    if (item.documento_url) return item.documento_url
    
    // Fallback al comportamiento anterior
    if (!path) return ''
    if (path.startsWith('http')) return path
    if (path.startsWith('/media/')) return path
    return `/media/${path}`
  }

  const handleDownload = (doc) => {
    if (doc && doc.documento) {
      try {
        const url = buildMediaUrl(doc.documento, doc);

        // Create a link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', doc.titulo || 'documento.pdf');
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Error al descargar documento:", error);
        alert("Error al descargar el documento");
      }
    } else {
      alert("El documento no tiene una URL válida");
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Documentos asociados</h3>

      {documents && documents.length > 0 ? (
        <div className="space-y-2">
          {documents.map((doc, index) => (
            <div key={doc.id || index} className="flex items-center gap-3 border rounded-lg p-3 hover:bg-slate-50 transition-colors bg-white">
              <div className="flex-shrink-0 bg-slate-100 h-10 w-10 rounded-lg flex items-center justify-center">
                <FileText size={18} className="text-slate-500" />
              </div>
              <div className="flex-grow">
                <p className="font-medium text-sm">{doc.titulo}</p>
                <p className="text-xs text-slate-500">{doc.tipo_documento}</p>
                {doc.descripcion && <p className="text-xs text-slate-500 mt-1">{doc.descripcion}</p>}
              </div>
              <Badge className={doc.is_public ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
                {doc.is_public ? 'Público' : 'Privado'}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                className="ml-2 rounded-full h-8 w-8 p-0 flex items-center justify-center"
                onClick={() => handleDownload(doc)}
                title="Descargar documento"
              >
                <Download size={16} className="text-indigo-600" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-dashed rounded-lg">
          <FileText size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-600 font-medium">No hay documentos disponibles</p>
          <p className="text-sm text-slate-500 mt-1">Este producto aún no tiene documentos asociados</p>
        </div>
      )}
    </div>
  )
}

export default function DetalleProductoOfertado() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: producto, isLoading, isError, error } = useProductoOfertadoById(id)
  
  // Depuración para entender la estructura de los datos
  console.log("Producto data:", producto)
  console.log("Categoria:", producto?.id_categoria, producto?.categoria)

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">Error al cargar el producto: {error.message}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/productos/productos-ofertados')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Volver
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-100 min-h-screen">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto p-4 max-w-5xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {producto.nombre}
              </h1>
              <p className="text-gray-600">Código: {producto.code}</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/productos/productos-ofertados')}
                className="flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
              <Button 
                size="sm" 
                onClick={() => navigate(`/productos/productos-ofertados/edit/${id}`)} 
                className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient divider */}
      <div className="h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-400"></div>

      {/* Content */}
      <div className="container mx-auto p-4 max-w-5xl">
        <div className="bg-white border rounded-lg p-6 shadow-sm mb-6">
          <div className="flex items-center mb-4">
            <div className="mr-2">
              <Badge variant={producto.is_active ? "success" : "secondary"} className={producto.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {producto.is_active ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <div className="mr-2">
              Categoría: <span className="font-medium">{producto.categoria?.nombre || producto.id_categoria?.nombre || 'No especificada'}</span>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-gray-800 mb-4">Información del Producto</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <DetailField label="CÓDIGO">
            {producto.code}
          </DetailField>
          
          <DetailField label="CUDIM">
            {producto.cudim}
          </DetailField>
          
          <DetailField label="CATEGORÍA">
            {producto.categoria?.nombre || producto.id_categoria?.nombre || 'No especificada'}
          </DetailField>
          
          <DetailField label="ESPECIALIDAD">
            {(producto.especialidad_data && producto.especialidad_data.nombre) || 
             (typeof producto.especialidad === 'object' && producto.especialidad?.nombre) || 
             'No especificada'}
          </DetailField>
        </div>
        
        {/* Descripción */}
        {producto.descripcion && (
          <div className="mb-6">
            <DetailField label="DESCRIPCIÓN">
              {producto.descripcion}
            </DetailField>
          </div>
        )}
        
        {/* Referencias */}
        {producto.referencias && (
          <div className="mb-6">
            <DetailField label="REFERENCIAS">
              <p className="whitespace-pre-line">{producto.referencias}</p>
            </DetailField>
          </div>
        )}
        </div>

        {/* Imágenes */}
        <ImageGallery 
          images={producto.imagenes || []} 
          producto={producto} 
        />

        {/* Documentos */}
        <DocumentList documents={producto.documentos || []} />
      </div>
    </div>
  )
}