// ImagenesProducto.jsx
import { ImagePlus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Función de utilidad para logs solo en desarrollo
const debug = (...args) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

/**
 * Componente para gestionar imágenes del producto
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.imagenes - Array de imágenes
 * @param {Function} props.removeImage - Función para eliminar imagen
 * @param {Function} props.setPrimaryImage - Función para establecer imagen como principal
 * @param {Object} props.nuevaImagen - Estado de la nueva imagen
 * @param {Function} props.setNuevaImagen - Función para actualizar estado de nueva imagen
 * @param {boolean} props.imageDialogOpen - Estado del diálogo de imágenes
 * @param {Function} props.setImageDialogOpen - Función para actualizar estado del diálogo
 * @param {Function} props.handleImageUpload - Función para manejar la subida de imágenes
 * @param {Function} props.addImage - Función para añadir imagen
 * @param {Function} props.cancelImageDialog - Función para cancelar diálogo
 * @param {Object} props.imageInputRef - Referencia para el input de imágenes
 * @returns {JSX.Element} Componente de imágenes
 */
const ImagenesProducto = ({ 
  imagenes, 
  removeImage, 
  setPrimaryImage, 
  nuevaImagen, 
  setNuevaImagen, 
  imageDialogOpen, 
  setImageDialogOpen, 
  handleImageUpload, 
  addImage, 
  cancelImageDialog, 
  imageInputRef 
}) => {
  return (
    <Card className="border border-gray-200 shadow-md rounded-xl h-full mb-8 bg-white overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-50 to-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="bg-indigo-500 p-2 rounded-lg mr-3 shadow-sm">
            <ImagePlus className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-gray-800">Imágenes del Producto</CardTitle>
            <CardDescription className="text-gray-500">
              Añade imágenes de referencia para el producto ofertado
            </CardDescription>
          </div>
        </div>
      </div>
      <CardHeader className="flex flex-row items-center justify-between pt-6 pb-2">
        <div></div>
        <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-4 ml-auto shadow-sm">
              <ImagePlus className="h-4 w-4 mr-2" />
              Añadir Imagen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Nueva Imagen</DialogTitle>
              <DialogDescription>
                Sube una imagen y añade los detalles necesarios
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="imagen-file" className="text-gray-700 font-medium">Imagen <span className="text-red-500">*</span></Label>
                <Input
                  id="imagen-file"
                  type="file"
                  accept="image/*"
                  ref={imageInputRef}
                  onChange={handleImageUpload}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imagen-descripcion" className="text-gray-700 font-medium">Descripción</Label>
                <Input
                  id="imagen-descripcion"
                  placeholder="Descripción breve de la imagen"
                  value={nuevaImagen.descripcion}
                  onChange={(e) => setNuevaImagen({...nuevaImagen, descripcion: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="imagen-primary"
                  checked={nuevaImagen.isPrimary}
                  onCheckedChange={(checked) => setNuevaImagen({...nuevaImagen, isPrimary: checked === true})}
                  className="text-indigo-600"
                />
                <Label htmlFor="imagen-primary" className="cursor-pointer text-gray-700 font-medium">Imagen principal</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={cancelImageDialog}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={addImage} className="bg-indigo-600 hover:bg-indigo-700 rounded-full">
                Añadir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="px-6 pt-2">
        {imagenes.length === 0 ? (
          <div className="relative flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-indigo-100 rounded-lg bg-gray-50">
            <div className="h-24 w-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
              <ImagePlus size={32} className="text-indigo-400" />
            </div>
            <p className="text-gray-700 font-medium text-lg">Aún no hay imágenes</p>
            <p className="text-sm text-gray-500 mt-2 max-w-md">
              Las imágenes de alta calidad mejoran la presentación y facilitan la identificación del producto
            </p>
            <Button
              className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => setImageDialogOpen(true)}
            >
              <ImagePlus className="h-4 w-4 mr-2" />
              Añadir primera imagen
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {imagenes.map((imagen, index) => (
              <div
                key={imagen.id || imagen.generatedId || `image-${index}`}
                className={`relative rounded-lg overflow-hidden border ${imagen.is_primary ? 'ring-2 ring-indigo-500 border-indigo-300' : 'border-gray-200'} transition-all hover:shadow-md bg-white`}
              >
                <div className="aspect-video bg-slate-50 relative flex items-center justify-center">
                  {(imagen.imagen || imagen.webp_url || imagen.thumbnail_url || imagen.original_url || imagen.imagen_url) && (
                    <img
                      src={(() => {
                        // Si es un archivo nuevo (no guardado)
                        if (imagen.file) {
                          return imagen.preview || '';
                        }
                        
                        // Verificar si tenemos las nuevas URLs basadas en timestamp
                        if (imagen.urls && typeof imagen.urls === 'object') {
                          // Usar las URLs específicas con timestamp que tienen identidad única
                          if (imagen.urls.webp) {
                            debug(`[Imagen ${index}][ID:${imagen.id}] Usando URL webp con timestamp: ${imagen.urls.timestamp || 'N/A'}`); 
                            return imagen.urls.webp;
                          }
                          if (imagen.urls.thumbnail) {
                            debug(`[Imagen ${index}][ID:${imagen.id}] Usando URL thumbnail con timestamp: ${imagen.urls.timestamp || 'N/A'}`);
                            return imagen.urls.thumbnail;
                          }
                          if (imagen.urls.original) {
                            debug(`[Imagen ${index}][ID:${imagen.id}] Usando URL original con timestamp: ${imagen.urls.timestamp || 'N/A'}`);
                            return imagen.urls.original;
                          }
                          if (imagen.urls.default) {
                            debug(`[Imagen ${index}][ID:${imagen.id}] Usando URL default con timestamp: ${imagen.urls.timestamp || 'N/A'}`);
                            return imagen.urls.default;
                          }
                        }
                        
                        // Prioridad de URLs para imágenes ya guardadas
                        // 1. Versión WebP (mejor calidad/tamaño)
                        if (imagen.webp_url) {
                          // Añadir parámetro de timestamp si está disponible para evitar caché
                          const timestamp = imagen.timestamp || '';
                          const separator = imagen.webp_url.includes('?') ? '&' : '?';
                          return timestamp ? `${imagen.webp_url}${separator}t=${timestamp}` : imagen.webp_url;
                        }
                        
                        // 2. Thumbnail (para carga rápida)
                        if (imagen.thumbnail_url) {
                          const timestamp = imagen.timestamp || '';
                          const separator = imagen.thumbnail_url.includes('?') ? '&' : '?';
                          return timestamp ? `${imagen.thumbnail_url}${separator}t=${timestamp}` : imagen.thumbnail_url;
                        }
                        
                        // 3. URL genérica de la imagen si está disponible
                        if (imagen.imagen_url) {
                          const timestamp = imagen.timestamp || '';
                          const separator = imagen.imagen_url.includes('?') ? '&' : '?';
                          return timestamp ? `${imagen.imagen_url}${separator}t=${timestamp}` : imagen.imagen_url;
                        }
                        
                        // 4. Original (mayor tamaño)
                        if (imagen.original_url) {
                          const timestamp = imagen.timestamp || '';
                          const separator = imagen.original_url.includes('?') ? '&' : '?';
                          return timestamp ? `${imagen.original_url}${separator}t=${timestamp}` : imagen.original_url;
                        }
                        
                        // 5. Fallback para casos antiguos - Campo imagen directo
                        if (typeof imagen.imagen === 'string') {
                          let url = imagen.imagen;
                          // Si ya es una URL completa
                          if (!url.startsWith('http') && !url.startsWith('/media/')) {
                            url = `/media/${url}`;
                          }
                          const timestamp = imagen.timestamp || '';
                          const separator = url.includes('?') ? '&' : '?';
                          return timestamp ? `${url}${separator}t=${timestamp}` : url;
                        }
                        
                        // 6. Si tenemos una propiedad 'get_absolute_url'
                        if (imagen.get_absolute_url) {
                          return imagen.get_absolute_url;
                        }
                        
                        // No tenemos una imagen válida
                        debug('Imagen sin URL válida:', imagen);
                        return '';
                      })()}
                      alt={imagen.descripcion || `Imagen ${index + 1}`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        debug("Error al cargar imagen:", imagen);
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjYWFhYWFhIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4=';
                      }}
                    />
                  )}
                  {imagen.is_primary && (
                    <div className="absolute top-2 left-2 bg-indigo-100 text-indigo-800 rounded-full px-2 py-1 text-xs font-medium">
                      Principal
                    </div>
                  )}
                </div>
                <div className="p-4 bg-white">
                  <p className="font-medium truncate text-gray-900">{imagen.descripcion || `Imagen ${index + 1}`}</p>
                  <div className="flex justify-between items-center mt-3">
                    {imagen.is_primary ? (
                      <span className="text-xs bg-indigo-100 text-indigo-800 rounded-full px-2 py-1">
                        Principal
                      </span>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setPrimaryImage(index)}
                        className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 border-indigo-200"
                      >
                        Marcar como principal
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                      onClick={() => removeImage(index)}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImagenesProducto;