import React from 'react'
import { ArrowLeft, Edit, Image, FileText, Package, Download } from 'lucide-react'
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

function ImageGallery({ images = [] }) {
  const buildMediaUrl = (path, item) => {
    // Si tenemos imagen_url del serializer, usarla
    if (item.imagen_url) return item.imagen_url
    
    // Fallback al comportamiento anterior
    if (!path) return ''
    if (path.startsWith('http')) return path
    if (path.startsWith('/media/')) return path
    return `/media/${path}`
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Imágenes de Referencia</h3>

      {images && images.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {images.map((img, index) => (
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
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-dashed rounded-lg">
          <Image size={48} className="text-slate-300 mb-4" />
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
              Categoría: <span className="font-medium">{producto.id_categoria?.nombre || 'No especificada'}</span>
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
            {producto.id_categoria?.nombre || 'No especificada'}
          </DetailField>
          
          <DetailField label="ESPECIALIDAD">
            {producto.especialidad || 'No especificada'}
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
        <ImageGallery images={producto.imagenes || []} />

        {/* Documentos */}
        <DocumentList documents={producto.documentos || []} />
      </div>
    </div>
  )
}