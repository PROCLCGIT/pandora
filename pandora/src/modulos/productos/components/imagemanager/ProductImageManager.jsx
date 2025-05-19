// src/modulos/productos/components/imagemanager/ProductImageManager.jsx

import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageUploader from './ImageUploader';
import ProductImages from './ProductImages';
import axios from 'axios';

const ProductImageManager = ({ 
  productId, 
  productType = 'ofertado', 
  className = '' 
}) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchImages = async () => {
    try {
      setLoading(true);
      
      // Determinar la URL correcta según el tipo de producto
      const url = productType === 'disponible'
        ? `/api/productos/productos-disponibles/${productId}/imagenes/`
        : `/api/productos/productos-ofertados/${productId}/imagenes/`;
      
      const response = await axios.get(url);
      
      // Verificar si la respuesta tiene el formato esperado
      const imagesData = response.data.results || response.data || [];
      setImages(imagesData);
      setError(null);
    } catch (error) {
      console.error('Error al cargar las imágenes:', error);
      setError('No se pudieron cargar las imágenes. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchImages();
  }, [productId, productType]);
  
  const handleImageUploaded = (newImage) => {
    setImages([...images, newImage]);
  };
  
  const handleImagesUpdated = (updatedImages) => {
    setImages(updatedImages);
  };
  
  if (loading) {
    return (
      <div className={`flex justify-center items-center h-32 ${className}`}>
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className={className}>
      <Tabs defaultValue="upload" className="w-full">
        <TabsList>
          <TabsTrigger value="upload">Subir Imagen</TabsTrigger>
          <TabsTrigger value="manage">Gestionar Imágenes ({images.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <ImageUploader 
            productId={productId} 
            productType={productType}
            onImageUploaded={handleImageUploaded} 
          />
        </TabsContent>
        
        <TabsContent value="manage">
          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              <p>{error}</p>
              <button 
                onClick={fetchImages} 
                className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 py-1 px-3 rounded"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <ProductImages 
              productId={productId} 
              productType={productType}
              images={images} 
              onImagesUpdated={handleImagesUpdated} 
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductImageManager;