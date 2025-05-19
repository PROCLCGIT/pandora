// src/modulos/productos/components/imagemanager/ProductImages.jsx

import React, { useState } from 'react';
import { Trash2, ArrowUp, ArrowDown, Star, StarOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import axios from 'axios';

const ProductImages = ({ productId, productType = 'ofertado', images, onImagesUpdated, className = '' }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  
  const handleDelete = async (imageId) => {
    if (!confirm('¿Está seguro de eliminar esta imagen?')) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      await axios.delete(`/api/productos/images/${imageId}/`);
      if (onImagesUpdated) {
        onImagesUpdated(images.filter(img => img.id !== imageId));
      }
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
      setError(error.response?.data?.error || 'Ocurrió un error al eliminar la imagen');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleSetFeatured = async (imageId) => {
    try {
      await axios.patch(`/api/productos/images/${imageId}/`, {
        is_featured: true
      });
      
      // Actualizar el estado local
      if (onImagesUpdated) {
        const updatedImages = images.map(img => ({
          ...img,
          is_featured: img.id === imageId
        }));
        onImagesUpdated(updatedImages);
      }
    } catch (error) {
      console.error('Error al establecer imagen destacada:', error);
      setError(error.response?.data?.error || 'Ocurrió un error al actualizar la imagen');
    }
  };
  
  const handleReorder = async (imageId, direction) => {
    const currentIndex = images.findIndex(img => img.id === imageId);
    if (currentIndex < 0) return;
    
    // No se puede mover más arriba del primer elemento
    if (direction === 'up' && currentIndex === 0) return;
    // No se puede mover más abajo del último elemento
    if (direction === 'down' && currentIndex === images.length - 1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    try {
      // URL basada en el tipo de producto
      const url = productType === 'disponible'
        ? `/api/productos/products/${productId}/disponible/images/reorder/`
        : `/api/productos/products/${productId}/images/reorder/`;
        
      await axios.post(url, {
        image_id: imageId,
        new_order: newIndex
      });
      
      // Actualizar el estado local reordenando las imágenes
      if (onImagesUpdated) {
        const updatedImages = [...images];
        const [movedImage] = updatedImages.splice(currentIndex, 1);
        updatedImages.splice(newIndex, 0, movedImage);
        onImagesUpdated(updatedImages);
      }
    } catch (error) {
      console.error('Error al reordenar las imágenes:', error);
      setError(error.response?.data?.error || 'Ocurrió un error al reordenar las imágenes');
    }
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-medium">Imágenes del producto</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
          <button 
            className="absolute top-0 right-0 p-2" 
            onClick={() => setError(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      {images.length === 0 ? (
        <p className="text-gray-500">No hay imágenes para este producto</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="relative aspect-square">
                <img
                  src={image.standard}
                  alt={image.alt_text || image.title}
                  className="w-full h-full object-contain"
                />
                {image.is_featured && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 rounded-full p-1">
                    <Star size={16} />
                  </div>
                )}
              </div>
              
              <div className="p-3">
                <p className="font-medium truncate">{image.title || 'Sin título'}</p>
                {image.alt_text && (
                  <p className="text-sm text-gray-500 truncate">{image.alt_text}</p>
                )}
                
                <div className="mt-2 flex justify-between">
                  <div className="flex space-x-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleReorder(image.id, 'up')}
                      disabled={images.indexOf(image) === 0}
                      title="Mover arriba"
                    >
                      <ArrowUp size={16} />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleReorder(image.id, 'down')}
                      disabled={images.indexOf(image) === images.length - 1}
                      title="Mover abajo"
                    >
                      <ArrowDown size={16} />
                    </Button>
                    
                    {!image.is_featured && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetFeatured(image.id)}
                        title="Establecer como destacada"
                      >
                        <StarOff size={16} />
                      </Button>
                    )}
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(image.id)}
                    disabled={isDeleting}
                    title="Eliminar imagen"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImages;