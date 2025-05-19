// src/modulos/productos/components/imagemanager/ImageUploader.jsx

import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import axios from 'axios';

const ImageUploader = ({ productId, productType = 'ofertado', onImageUploaded, className = '' }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [altText, setAltText] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      setError('Por favor seleccione un archivo de imagen válido');
      return;
    }
    
    setSelectedFile(file);
    setError(null);
    
    // Crear preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Por favor seleccione una imagen');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('title', title);
      formData.append('alt_text', altText);
      formData.append('is_featured', isFeatured);
      
      // URL basada en el tipo de producto
      const url = productType === 'disponible'
        ? `/api/productos/products/${productId}/disponible/images/upload/`
        : `/api/productos/products/${productId}/images/upload/`;
      
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (onImageUploaded) {
        onImageUploaded(response.data);
      }
      
      // Limpiar el formulario
      setTitle('');
      setAltText('');
      setIsFeatured(false);
      setPreview(null);
      setSelectedFile(null);
      
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      setError(error.response?.data?.error || 'Ocurrió un error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Card className={`p-4 ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="image-upload">Imagen del producto</Label>
            <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
              {preview ? (
                <div className="relative">
                  <img 
                    src={preview} 
                    alt="Vista previa" 
                    className="max-h-64 object-contain"
                  />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    onClick={() => {
                      setPreview(null);
                      setSelectedFile(null);
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex flex-col sm:flex-row text-sm text-gray-600 justify-center items-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500"
                    >
                      <span>Subir una imagen</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">o arrastrar y soltar</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WEBP hasta 10MB
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          
          <div>
            <Label htmlFor="title">Título de la imagen</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ej. Vista frontal del producto"
            />
          </div>
          
          <div>
            <Label htmlFor="alt-text">Texto alternativo (para accesibilidad)</Label>
            <Input
              id="alt-text"
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Descripción de la imagen para lectores de pantalla"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is-featured"
              checked={isFeatured}
              onCheckedChange={setIsFeatured}
            />
            <Label htmlFor="is-featured">Establecer como imagen principal</Label>
          </div>
          
          <Button 
            type="submit" 
            disabled={isUploading || !selectedFile}
            className="w-full"
          >
            {isUploading ? 'Subiendo...' : 'Subir imagen'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ImageUploader;