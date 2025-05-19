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
    <Card className="border-0 shadow-sm mb-8 bg-white overflow-hidden">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b">
        <CardTitle className="text-lg font-medium text-purple-800">Imágenes del Producto</CardTitle>
        <CardDescription className="text-purple-700/70">
          Añade imágenes de referencia para el producto ofertado
        </CardDescription>
      </div>
      <CardHeader className="flex flex-row items-center justify-between pt-6 pb-2">
        <div></div>
        <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 rounded-full px-4 ml-auto shadow-sm">
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
              <Button type="button" onClick={addImage} className="bg-purple-600 hover:bg-purple-700 rounded-full">
                Añadir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="px-6 pt-2">
        {imagenes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-lg">
            <ImagePlus size={48} className="text-slate-300 mb-4" />
            <p className="text-slate-600 font-medium">Aún no hay imágenes para este producto</p>
            <p className="text-sm text-slate-500 mt-1">
              Haz clic en "Añadir Imagen" para subir imágenes
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {imagenes.map((imagen, index) => (
              <div
                key={imagen.id || imagen.generatedId || `image-${index}`}
                className={`relative rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 ${imagen.is_primary ? 'ring-2 ring-indigo-500' : ''}`}
              >
                <div className="aspect-video bg-slate-50 relative flex items-center justify-center">
                  {imagen.imagen && (
                    <img
                      src={(() => {
                        // Si es un archivo nuevo (no guardado)
                        if (imagen.file) {
                          return imagen.preview || '';
                        }
                        
                        // Si viene del backend, usar imagen_url si está disponible
                        if (imagen.imagen_url) {
                          return imagen.imagen_url;
                        }
                        
                        // Fallback para casos antiguos
                        if (typeof imagen.imagen === 'string') {
                          // Si ya es una URL completa
                          if (imagen.imagen.startsWith('http')) {
                            return imagen.imagen;
                          }
                          // Si necesita prefijo /media/
                          if (!imagen.imagen.startsWith('/media/')) {
                            return `/media/${imagen.imagen}`;
                          }
                          return imagen.imagen;
                        }
                        
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