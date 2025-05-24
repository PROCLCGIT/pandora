/**
 * Ejemplo de uso mejorado para file uploads
 * Demuestra el uso correcto de e.currentTarget.files?.[0] y limpieza automática
 */

import React, { useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Hooks mejorados
import { useOptimizedImageManager, useOptimizedDocumentManager } from '../hooks/useImageMemoryManagement.js';
import { useFileUploadHandlers } from '../hooks/useFileUploadHandlers.js';

// Componentes UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const ImprovedFileUploadExample = () => {
  const { toast } = useToast();
  
  // Referencias para inputs
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);
  const multipleImagesInputRef = useRef(null);
  
  // Estados para diálogos
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [docFormData, setDocFormData] = useState({
    titulo: '',
    tipo_documento: '',
    descripcion: '',
    isPublic: false
  });

  // Gestores de archivos optimizados
  const imageManager = useOptimizedImageManager(toast);
  const documentManager = useOptimizedDocumentManager(toast);
  const { presetHandlers, handleFileUpload } = useFileUploadHandlers();

  // ============================================================================
  // MÉTODO 1: Usando los hooks optimizados directamente (RECOMENDADO)
  // ============================================================================

  /**
   * Manejador directo de imágenes - el más simple
   * El hook se encarga de todo: validación, cleanup, gestión de memoria
   */
  const handleDirectImageUpload = (e) => {
    // El hook maneja currentTarget, validación y cleanup automáticamente
    imageManager.handleImageUpload(e);
  };

  /**
   * Manejador de documentos con formulario
   * El hook valida y retorna el archivo para procesamiento adicional
   */
  const handleDirectDocUpload = (e) => {
    // El hook valida y limpia, retorna el archivo o null
    const file = documentManager.handleDocumentUpload(e);
    
    if (file) {
      // Archivo válido - abrir formulario para completar información
      setPendingFile(file);
      setDocDialogOpen(true);
    }
  };

  // ============================================================================
  // MÉTODO 2: Usando los handlers genéricos con configuración personalizada
  // ============================================================================

  /**
   * Manejador personalizado usando preset handlers
   */
  const handlePresetImageUpload = (e) => {
    presetHandlers.image(
      e,
      // onFileSelected
      (file) => {
        const success = imageManager.addImage({
          file,
          descripcion: '',
          isPrimary: imageManager.imagenes.length === 0
        });
        
        if (success) {
          toast({
            title: "Imagen añadida",
            description: `${file.name} se ha añadido correctamente`,
          });
        }
      },
      // onError
      (error) => {
        toast({
          title: "Error al subir imagen",
          description: error.message,
          variant: "destructive",
        });
      }
    );
  };

  /**
   * Manejador para múltiples imágenes
   */
  const handleMultipleImagesUpload = (e) => {
    // Usar currentTarget y convertir FileList a Array
    const files = Array.from(e.currentTarget.files || []);
    
    if (files.length === 0) {
      e.target.value = '';
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    files.forEach((file, index) => {
      // Validar cada archivo individualmente
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const maxSizeBytes = 5 * 1024 * 1024; // 5MB

      if (!validImageTypes.includes(file.type)) {
        errorCount++;
        toast({
          title: `Error en ${file.name}`,
          description: "Tipo de archivo no válido",
          variant: "destructive",
        });
        return;
      }

      if (file.size > maxSizeBytes) {
        errorCount++;
        toast({
          title: `Error en ${file.name}`,
          description: "Archivo demasiado grande (máximo 5MB)",
          variant: "destructive",
        });
        return;
      }

      // Añadir imagen válida
      const success = imageManager.addImage({
        file,
        descripcion: '',
        isPrimary: imageManager.imagenes.length === 0 && index === 0
      });

      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
    });

    // Limpiar input después de procesar todos los archivos
    e.target.value = '';

    // Mostrar resumen
    if (successCount > 0) {
      toast({
        title: "Imágenes procesadas",
        description: `${successCount} imagen(es) añadida(s)${errorCount > 0 ? `, ${errorCount} con errores` : ''}`,
        variant: successCount > errorCount ? "default" : "destructive",
      });
    }
  };

  // ============================================================================
  // MÉTODO 3: Manejador personalizado con configuración específica
  // ============================================================================

  /**
   * Manejador completamente personalizado
   */
  const handleCustomFileUpload = (e) => {
    handleFileUpload(
      e,
      // Configuración personalizada
      {
        acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxSizeBytes: 3 * 1024 * 1024, // 3MB más restrictivo
        fileTypeCategory: 'imagen de producto'
      },
      // onFileSelected
      (file) => {
        console.log('Archivo seleccionado:', file.name, file.size, file.type);
        
        // Procesamiento personalizado
        const success = imageManager.addImage({
          file,
          descripcion: `Imagen subida automáticamente: ${file.name}`,
          isPrimary: false
        });

        if (success) {
          toast({
            title: "Imagen añadida",
            description: `${file.name} procesada con configuración personalizada`,
          });
        }
      },
      // onError
      (error) => {
        console.error('Error personalizado:', error);
        toast({
          title: "Error en upload personalizado",
          description: error.message,
          variant: "destructive",
        });
      }
    );
  };

  /**
   * Procesar documento con información adicional
   */
  const handleDocumentSubmit = () => {
    if (!pendingFile || !docFormData.titulo || !docFormData.tipo_documento) {
      toast({
        title: "Error",
        description: "Completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    const success = documentManager.addDocument({
      file: pendingFile,
      ...docFormData
    });

    if (success) {
      // Limpiar estado
      setPendingFile(null);
      setDocFormData({
        titulo: '',
        tipo_documento: '',
        descripcion: '',
        isPublic: false
      });
      setDocDialogOpen(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Ejemplos de File Upload Mejorados</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Método 1: Hooks optimizados (Más simple) */}
        <Card>
          <CardHeader>
            <CardTitle>Método 1: Hooks Optimizados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="direct-image">Imagen directa (recomendado)</Label>
              <Input
                id="direct-image"
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleDirectImageUpload}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Usa imageManager.handleImageUpload directamente
              </p>
            </div>

            <div>
              <Label htmlFor="direct-doc">Documento con formulario</Label>
              <Input
                id="direct-doc"
                ref={docInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleDirectDocUpload}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Valida y abre formulario para completar datos
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Método 2: Preset Handlers */}
        <Card>
          <CardHeader>
            <CardTitle>Método 2: Preset Handlers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="preset-image">Imagen con preset</Label>
              <Input
                id="preset-image"
                type="file"
                accept="image/*"
                onChange={handlePresetImageUpload}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Usa presetHandlers.image con callbacks
              </p>
            </div>

            <div>
              <Label htmlFor="multiple-images">Múltiples imágenes</Label>
              <Input
                id="multiple-images"
                ref={multipleImagesInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleMultipleImagesUpload}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Procesa múltiples archivos con validación individual
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Método 3: Configuración personalizada */}
        <Card>
          <CardHeader>
            <CardTitle>Método 3: Configuración Personalizada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="custom-upload">Upload personalizado</Label>
              <Input
                id="custom-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleCustomFileUpload}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Solo JPEG, PNG, WebP. Máximo 3MB
              </p>
            </div>

            <Button
              onClick={() => {
                // Trigger programático con limpieza
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.multiple = true;
                
                input.onchange = (e) => {
                  handleMultipleImagesUpload(e);
                  // El evento se auto-limpia cuando se destruye el elemento
                };
                
                input.click();
              }}
              variant="outline"
              className="w-full"
            >
              Upload programático
            </Button>
          </CardContent>
        </Card>

        {/* Resultados */}
        <Card>
          <CardHeader>
            <CardTitle>Archivos Procesados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Imágenes: {imageManager.imagenes.length}
              </p>
              <p className="text-sm font-medium">
                Documentos: {documentManager.documentos.length}
              </p>
              <p className="text-sm text-muted-foreground">
                Memoria: {imageManager.getMemoryStats().totalSizeMB}MB
              </p>
            </div>

            {imageManager.imagenes.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Imágenes:</p>
                <div className="grid grid-cols-3 gap-2">
                  {imageManager.imagenes.map((imagen, index) => (
                    <div key={imagen.id} className="relative">
                      <img
                        src={imagen.imagen}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-16 object-cover rounded border"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => imageManager.removeImage(index)}
                        className="absolute -top-1 -right-1 h-5 w-5 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog para completar información de documentos */}
      <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Completar información del documento</DialogTitle>
          </DialogHeader>
          
          {pendingFile && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded">
                <p className="text-sm">
                  <strong>Archivo:</strong> {pendingFile.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Tamaño: {(pendingFile.size / 1024 / 1024).toFixed(2)}MB
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc-titulo">Título *</Label>
                <Input
                  id="doc-titulo"
                  value={docFormData.titulo}
                  onChange={(e) => setDocFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Título del documento"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc-tipo">Tipo de documento *</Label>
                <Input
                  id="doc-tipo"
                  value={docFormData.tipo_documento}
                  onChange={(e) => setDocFormData(prev => ({ ...prev, tipo_documento: e.target.value }))}
                  placeholder="Ej: Manual, Ficha técnica, Catálogo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc-descripcion">Descripción</Label>
                <Input
                  id="doc-descripcion"
                  value={docFormData.descripcion}
                  onChange={(e) => setDocFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Descripción opcional"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setDocDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleDocumentSubmit}>
                  Añadir Documento
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImprovedFileUploadExample;