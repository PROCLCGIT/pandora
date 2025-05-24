import React from 'react'
import { ArrowLeft, Edit, Image as ImageIcon, FileText, Package, Download, DollarSign, Tag, MapPin } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProductoDisponibleById } from '../../api/productoDisponibleService'
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

export default function DetalleProductoDisponible() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: producto, isLoading, isError, error } = useProductoDisponibleById(id)
  
  // Función helper para construir URLs de medios
  const buildMediaUrl = (path, item) => {
    // Verificar primero si tenemos las nuevas URLs basadas en timestamp
    if (item?.urls && typeof item.urls === 'object') {
      // Devolver las URLs específicas con timestamp que ya tienen identidad única
      if (item.urls.webp) return item.urls.webp;
      if (item.urls.thumbnail) return item.urls.thumbnail;
      if (item.urls.original) return item.urls.original;
      if (item.urls.default) return item.urls.default;
    }
    
    // Intentar obtener la URL de la imagen en este orden de prioridad:
    if (item?.webp_url) return item.webp_url;
    if (item?.thumbnail_url) return item.thumbnail_url;
    if (item?.imagen_url) return item.imagen_url;
    if (item?.original_url) return item.original_url;
    
    // Si tenemos un path directo
    if (path) {
      if (path.startsWith('http')) return path;
      if (path.startsWith('/media/')) return path;
      return `/media/${path}`;
    }
    
    return '';
  }
  
  // Función para manejar descarga de documentos
  const handleDownload = (doc) => {
    if (doc && (doc.documento_url || doc.documento)) {
      try {
        const url = doc.documento_url || (doc.documento.startsWith('http') ? doc.documento : `/media/${doc.documento}`);
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
  }

  // Depuración mejorada
  console.log("=== DETALLE PRODUCTO DISPONIBLE DEBUG ===")
  console.log("ID desde params:", id)
  console.log("isLoading:", isLoading)
  console.log("isError:", isError)
  console.log("error:", error)
  console.log("Producto disponible data:", producto)
  
  if (producto) {
    console.log("Propiedades del producto:", Object.keys(producto))
    console.log("producto.imagenes:", producto.imagenes)
    console.log("producto.documentos:", producto.documentos)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (isError) {
    console.log("Error completo:", error)
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">Error al cargar el producto</p>
          <p className="text-sm text-red-500 mt-2">ID: {id}</p>
          <p className="text-sm text-red-500">Error: {error?.message || 'Error desconocido'}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/productos/productos-disponibles')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Volver
          </Button>
        </div>
      </div>
    )
  }

  // Verificar si tenemos datos del producto
  if (!producto || !producto.id) {
    console.log("Producto no encontrado o datos inválidos")
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-600 font-medium">Producto no encontrado</p>
          <p className="text-sm text-yellow-500 mt-2">ID: {id}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/productos/productos-disponibles')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Volver a la lista
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-100 min-h-screen">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto p-4 max-w-7xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {producto?.nombre || 'Producto sin nombre'}
              </h1>
              <p className="text-gray-600">Código: {producto?.code || 'Sin código'}</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/productos/productos-disponibles')}
                className="flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
              <Button 
                size="sm" 
                onClick={() => navigate(`/productos/productos-disponibles/edit/${id}`)} 
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

      {/* Content - Todo en un solo formulario unificado */}
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          {/* Encabezado con estado */}
          <div className="flex items-center mb-6 pb-4 border-b">
            <div className="mr-4">
              <Badge variant={producto.is_active ? "success" : "secondary"} className={producto.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {producto.is_active ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-2 text-indigo-600" />
              <span className="font-medium">{producto.categoria?.nombre || producto.id_categoria?.nombre || 'No especificada'}</span>
            </div>
            {producto.id_producto_ofertado?.code && (
              <div className="ml-4">
                <Badge variant="outline" className="font-mono bg-indigo-50 text-indigo-800 border-indigo-200">
                  Ref: {producto.id_producto_ofertado.code}
                </Badge>
              </div>
            )}
          </div>

          {/* Grid para todas las secciones */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna 1: Información básica y precios */}
            <div className="lg:col-span-1">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-1 border-b border-gray-200">
                <Package className="h-5 w-5 inline mr-2 text-blue-600" />
                Información General
              </h2>
              
              <div className="space-y-4">
                <DetailField label="CÓDIGO">
                  {producto.code}
                </DetailField>
                
                <DetailField label="MARCA">
                  {producto.marca?.nombre || producto.id_marca?.nombre || 'No especificada'}
                </DetailField>
                
                <DetailField label="MODELO">
                  {producto.modelo || 'No especificado'}
                </DetailField>

                <DetailField label="UNIDAD DE PRESENTACIÓN">
                  {producto.unidad?.nombre || producto.unidad_presentacion?.nombre || 'No especificada'}
                </DetailField>
                
                <DetailField label="PROCEDENCIA">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-blue-500" />
                    {producto.procedencia?.nombre || 'No especificada'}
                  </div>
                </DetailField>
              </div>

              <h3 className="text-md font-semibold text-gray-800 mt-6 mb-4 pb-1 border-b border-gray-200">
                <DollarSign className="h-5 w-5 inline mr-2 text-green-600" />
                Información de Precios
              </h3>
              
              <div className="space-y-4">
                <DetailField label="PRECIO VENTA PRIVADO">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                    <span className="text-green-600 font-semibold">
                      {new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(producto.precio_venta_privado || 0)}
                    </span>
                  </div>
                </DetailField>
                
                <DetailField label="PRECIO SIE REFERENCIAL">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-blue-600" />
                    <span className="text-blue-600 font-semibold">
                      {new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(producto.precio_sie_referencial || 0)}
                    </span>
                  </div>
                </DetailField>
                
                <DetailField label="TZ REFERENCIAL">
                  <span className="text-purple-600 font-bold">{producto.tz_referencial || 0}%</span>
                </DetailField>
              </div>
              
              {/* Referencia del Producto Ofertado */}
              <h3 className="text-md font-semibold text-gray-800 mt-6 mb-4 pb-1 border-b border-gray-200">
                <Tag className="h-5 w-5 inline mr-2 text-indigo-600" />
                Producto Ofertado de Referencia
              </h3>
              
              {producto.id_producto_ofertado || producto.producto_ofertado ? (
                <DetailField label="PRODUCTO OFERTADO">
                  <div className="flex items-center">
                    <Tag className="h-5 w-5 mr-2 text-indigo-600" />
                    <span className="font-medium">{producto.id_producto_ofertado?.nombre || producto.producto_ofertado?.nombre || 'No especificado'}</span>
                  </div>
                  {(producto.id_producto_ofertado?.code || producto.producto_ofertado?.code) && (
                    <div className="mt-1">
                      <Badge variant="outline" className="font-mono bg-indigo-50 text-indigo-800 border-indigo-200">
                        {producto.id_producto_ofertado?.code || producto.producto_ofertado?.code}
                      </Badge>
                    </div>
                  )}
                </DetailField>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                  <p className="text-gray-500">No hay producto ofertado de referencia</p>
                </div>
              )}
            </div>

            {/* Columna 2-3: Imágenes y documentos */}
            <div className="lg:col-span-2">
              {/* Imágenes */}
              <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-1 border-b border-gray-200">
                <ImageIcon className="h-5 w-5 inline mr-2 text-blue-600" />
                Imágenes del Producto
              </h2>

              {producto.imagenes && producto.imagenes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                  {producto.imagenes.map((img, index) => (
                    <div key={img.id || index} className="border rounded-lg overflow-hidden shadow-sm bg-white">
                      <div className="aspect-video bg-slate-50 relative flex items-center justify-center">
                        <img
                          src={buildMediaUrl(img.imagen, img)}
                          alt={img.descripcion || `Imagen ${index + 1}`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            console.error("Error al cargar imagen:", img);
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjYWFhYWFhIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4=';
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
                <div className="flex flex-col items-center justify-center py-10 mb-6 text-center bg-white border border-dashed rounded-lg">
                  <ImageIcon size={48} className="text-slate-300 mb-4" />
                  <p className="text-slate-600 font-medium">No hay imágenes disponibles</p>
                  <p className="text-sm text-slate-500 mt-1">Este producto aún no tiene imágenes asociadas</p>
                </div>
              )}

              {/* Documentos */}
              <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-4 pb-1 border-b border-gray-200">
                <FileText className="h-5 w-5 inline mr-2 text-blue-600" />
                Documentos del Producto
              </h2>

              {producto.documentos && producto.documentos.length > 0 ? (
                <div className="space-y-2">
                  {producto.documentos.map((doc, index) => (
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
                <div className="flex flex-col items-center justify-center py-10 text-center bg-white border border-dashed rounded-lg">
                  <FileText size={48} className="text-slate-300 mb-4" />
                  <p className="text-slate-600 font-medium">No hay documentos disponibles</p>
                  <p className="text-sm text-slate-500 mt-1">Este producto aún no tiene documentos asociados</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}