// /pandora/src/modulos/productos/components/form/ImagesPanel.jsx

import { useRef } from 'react';
import { ImagePlus, Star, Trash } from 'lucide-react';

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
import { Badge } from '@/components/ui/badge';

/**
 * Componente para el panel de gestión de imágenes del producto
 */
export function ImagesPanel({
  imagenes,
  setImagenes,
  imageDialogOpen,
  setImageDialogOpen,
  nuevaImagen,
  setNuevaImagen,
  handleImageUpload,
  addImage,
  removeImage,
  setPrimaryImage
}) {
  const imageInputRef = useRef(null);

  return (
    <Card className="overflow-hidden border border-gray-200 shadow-md rounded-xl h-full">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-indigo-500 p-2 rounded-lg mr-3 shadow-sm">
              <ImagePlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-gray-800">Imágenes del Producto</CardTitle>
              <CardDescription className="text-gray-500">
                Fotografías para presentación del producto
              </CardDescription>
            </div>
          </div>
          <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full px-4 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
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
                  <Label htmlFor="imagenFile">Imagen <span className="text-red-500">*</span></Label>
                  <Input 
                    id="imagenFile" 
                    type="file" 
                    accept="image/*"
                    ref={imageInputRef}
                    onChange={handleImageUpload}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imagenDescripcion">Descripción</Label>
                  <Input 
                    id="imagenDescripcion" 
                    placeholder="Descripción breve de la imagen"
                    value={nuevaImagen.descripcion}
                    onChange={(e) => setNuevaImagen({...nuevaImagen, descripcion: e.target.value})}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="imagenPrimary" 
                    checked={nuevaImagen.isPrimary}
                    onCheckedChange={(checked) => setNuevaImagen({...nuevaImagen, isPrimary: checked})}
                  />
                  <Label htmlFor="imagenPrimary" className="cursor-pointer">Marcar como imagen principal</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setImageDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="button" 
                  onClick={addImage} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={!nuevaImagen.file}
                >
                  Añadir imagen
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-6 bg-white">
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
                key={imagen.id || index} 
                className={`relative rounded-lg overflow-hidden border ${imagen.is_primary ? 'ring-2 ring-indigo-500 border-indigo-300' : 'border-gray-200'} transition-all hover:shadow-md bg-white`}
              >
                {imagen.is_primary && (
                  <div className="absolute top-2 left-2 z-10">
                    <Badge className="bg-indigo-600 text-white">
                      <Star className="h-3 w-3 mr-1 fill-white" /> Principal
                    </Badge>
                  </div>
                )}
                <div className="aspect-video relative bg-gray-100">
                  {(imagen.preview || imagen.imagen || imagen.file) && (
                    <img 
                      src={
                        imagen.preview || 
                        (imagen.file ? URL.createObjectURL(imagen.file) : imagen.imagen)
                      } 
                      alt={imagen.descripcion || `Imagen ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                <div className="p-3 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <p className="font-medium truncate text-sm">
                      {imagen.descripcion || `Imagen ${index + 1}`}
                    </p>
                    <div className="flex space-x-1">
                      {!imagen.is_primary && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                          onClick={() => setPrimaryImage(index)}
                          title="Marcar como principal"
                        >
                          <Star size={16} />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeImage(index)}
                        title="Eliminar imagen"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}