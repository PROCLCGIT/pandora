/**
 * Hook optimizado para gestión de memoria de imágenes y URLs
 * Previene memory leaks con URL.createObjectURL mediante cleanup automático
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook para gestión de memoria de URLs de objetos
 * Automáticamente limpia URLs cuando las imágenes se eliminan o el componente se desmonta
 */
export const useImageURLManager = () => {
  // Mantener registro de todas las URLs creadas para cleanup
  const urlRegistryRef = useRef(new Map());

  /**
   * Crear URL y registrarla para cleanup automático
   */
  const createManagedURL = useCallback((file, id = null) => {
    const url = URL.createObjectURL(file);
    const urlId = id || `url_${Date.now()}_${Math.random()}`;
    
    // Registrar URL con metadata
    urlRegistryRef.current.set(urlId, {
      url,
      file,
      createdAt: Date.now()
    });

    return { url, urlId };
  }, []);

  /**
   * Revocar URL específica y eliminarla del registro
   */
  const revokeManagedURL = useCallback((urlId) => {
    const urlData = urlRegistryRef.current.get(urlId);
    if (urlData) {
      URL.revokeObjectURL(urlData.url);
      urlRegistryRef.current.delete(urlId);
    }
  }, []);

  /**
   * Revocar múltiples URLs
   */
  const revokeManagedURLs = useCallback((urlIds) => {
    urlIds.forEach(urlId => revokeManagedURL(urlId));
  }, [revokeManagedURL]);

  /**
   * Limpiar todas las URLs registradas
   */
  const revokeAllURLs = useCallback(() => {
    urlRegistryRef.current.forEach((urlData) => {
      URL.revokeObjectURL(urlData.url);
    });
    urlRegistryRef.current.clear();
  }, []);

  /**
   * Obtener información de URLs registradas (para debugging)
   */
  const getURLRegistry = useCallback(() => {
    return Array.from(urlRegistryRef.current.entries()).map(([id, data]) => ({
      id,
      url: data.url,
      fileName: data.file.name,
      fileSize: data.file.size,
      createdAt: data.createdAt,
      ageMs: Date.now() - data.createdAt
    }));
  }, []);

  // Cleanup automático al desmontar componente
  useEffect(() => {
    return () => {
      revokeAllURLs();
    };
  }, [revokeAllURLs]);

  return {
    createManagedURL,
    revokeManagedURL,
    revokeManagedURLs,
    revokeAllURLs,
    getURLRegistry
  };
};

/**
 * Hook específico para gestión de imágenes con cleanup automático
 */
export const useOptimizedImageManager = (toast) => {
  const [imagenes, setImagenes] = useState([]);
  const { createManagedURL, revokeManagedURL, revokeAllURLs } = useImageURLManager();

  /**
   * Manejador mejorado para upload de imágenes
   * Usar como: onChange={imageManager.handleImageUpload}
   */
  const handleImageUpload = useCallback((e) => {
    // Usar currentTarget para mayor robustez y optional chaining
    const file = e.currentTarget.files?.[0];
    
    if (!file) {
      // Limpiar el input aunque no haya archivo
      e.target.value = '';
      return;
    }

    // Procesar el archivo
    const success = addImage({
      file,
      descripcion: '',
      isPrimary: imagenes.length === 0 // Primera imagen es principal por defecto
    });

    // Limpiar el input después de procesar
    e.target.value = '';

    return success;
  }, [imagenes.length]);

  /**
   * Añadir imagen con gestión automática de memoria
   */
  const addImage = useCallback((imageData) => {
    const { file, descripcion = '', isPrimary = false } = imageData;
    
    if (!file) {
      toast?.({
        title: "Error",
        description: "Debes seleccionar una imagen",
        variant: "destructive",
      });
      return false;
    }

    // Validar tipo y tamaño de archivo
    const MAX_SIZE_MB = 5;
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast?.({
        title: "Error",
        description: "Tipo de archivo no válido. Solo se permiten imágenes JPEG, PNG, GIF y WebP",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast?.({
        title: "Error",
        description: `El archivo es demasiado grande. Máximo ${MAX_SIZE_MB}MB`,
        variant: "destructive",
      });
      return false;
    }

    // Crear URL gestionada
    const imageId = `img_${Date.now()}_${Math.random()}`;
    const { url, urlId } = createManagedURL(file, imageId);

    setImagenes(prevImages => {
      // Calcular el orden correcto ANTES de añadir la nueva imagen
      // Usar la longitud actual + 1 para el siguiente orden disponible
      const nextOrder = prevImages.length;
      
      const newImage = {
        id: imageId,
        urlId,
        imagen: url,
        file,
        descripcion,
        is_primary: isPrimary,
        orden: nextOrder // Usar la longitud actual como siguiente orden
      };

      // Si es imagen principal, desmarcar las otras
      let updatedImages = isPrimary 
        ? prevImages.map(img => ({ ...img, is_primary: false }))
        : prevImages;

      // Añadir la nueva imagen al final
      const finalImages = [...updatedImages, newImage];

      // Recalcular todos los órdenes para mantener secuencia consecutiva 0, 1, 2, 3...
      return finalImages.map((img, index) => ({
        ...img,
        orden: index
      }));
    });

    return true;
  }, [createManagedURL, toast]);

  /**
   * Eliminar imagen con cleanup automático de memoria
   */
  const removeImage = useCallback((index) => {
    setImagenes(prevImages => {
      const imageToRemove = prevImages[index];
      
      // Limpiar URL de memoria si existe
      if (imageToRemove?.urlId) {
        revokeManagedURL(imageToRemove.urlId);
      }

      // Filtrar la imagen eliminada
      const filteredImages = prevImages.filter((_, i) => i !== index);

      // Recalcular todos los órdenes para mantener secuencia consecutiva 0, 1, 2, 3...
      // Esto es crucial después de eliminar elementos intermedios
      return filteredImages.map((img, newIndex) => ({
        ...img,
        orden: newIndex
      }));
    });
  }, [revokeManagedURL]);

  /**
   * Establecer imagen como principal
   */
  const setPrimaryImage = useCallback((index) => {
    setImagenes(prevImages => 
      prevImages.map((img, i) => ({
        ...img,
        is_primary: i === index
      }))
    );
  }, []);

  /**
   * Reordenar imágenes
   */
  const reorderImages = useCallback((startIndex, endIndex) => {
    setImagenes(prevImages => {
      // Crear copia del array para evitar mutaciones
      const result = Array.from(prevImages);
      
      // Validar índices
      if (startIndex < 0 || endIndex < 0 || 
          startIndex >= result.length || endIndex >= result.length) {
        console.warn('Índices de reordenamiento inválidos:', { startIndex, endIndex, length: result.length });
        return prevImages; // Retornar sin cambios
      }

      // Extraer elemento a mover
      const [removed] = result.splice(startIndex, 1);
      
      // Insertar en nueva posición
      result.splice(endIndex, 0, removed);
      
      // Recalcular todos los órdenes después del reordenamiento
      // Mantener secuencia consecutiva 0, 1, 2, 3...
      return result.map((img, index) => ({
        ...img,
        orden: index
      }));
    });
  }, []);

  /**
   * Limpiar todas las imágenes
   */
  const clearAllImages = useCallback(() => {
    revokeAllURLs();
    setImagenes([]);
  }, [revokeAllURLs]);

  /**
   * Obtener estadísticas de memoria (para debugging)
   */
  const getMemoryStats = useCallback(() => {
    const totalImages = imagenes.length;
    const totalSize = imagenes.reduce((acc, img) => acc + (img.file?.size || 0), 0);
    
    return {
      totalImages,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      primaryImage: imagenes.find(img => img.is_primary)?.id || null
    };
  }, [imagenes]);

  return {
    imagenes,
    addImage,
    removeImage,
    setPrimaryImage,
    reorderImages,
    clearAllImages,
    getMemoryStats,
    handleImageUpload
  };
};

/**
 * Hook para gestión de documentos con validación y cleanup
 */
export const useOptimizedDocumentManager = (toast) => {
  const [documentos, setDocumentos] = useState([]);

  /**
   * Manejador mejorado para upload de documentos
   * Usar como: onChange={documentManager.handleDocumentUpload}
   */
  const handleDocumentUpload = useCallback((e) => {
    // Usar currentTarget para mayor robustez y optional chaining
    const file = e.currentTarget.files?.[0];
    
    if (!file) {
      // Limpiar el input aunque no haya archivo
      e.target.value = '';
      return;
    }

    // Solo validar el archivo, no procesarlo automáticamente
    // porque los documentos necesitan más información (título, tipo, etc.)
    const MAX_SIZE_MB = 10;
    const ALLOWED_TYPES = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'application/rtf',
      'application/zip'
    ];

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast?.({
        title: "Error",
        description: "Tipo de archivo no válido. Solo se permiten PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, RTF y ZIP",
        variant: "destructive",
      });
      e.target.value = '';
      return null;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast?.({
        title: "Error",
        description: `El archivo es demasiado grande. Máximo ${MAX_SIZE_MB}MB`,
        variant: "destructive",
      });
      e.target.value = '';
      return null;
    }

    // Limpiar el input después de validar
    e.target.value = '';

    // Retornar el archivo para que se pueda usar en un formulario
    return file;
  }, [toast]);

  /**
   * Añadir documento con validación
   */
  const addDocument = useCallback((documentData) => {
    const { file, tipo_documento, titulo, descripcion = '', isPublic = false } = documentData;

    if (!file || !titulo || !tipo_documento) {
      toast?.({
        title: "Error",
        description: "Debes completar todos los campos obligatorios",
        variant: "destructive",
      });
      return false;
    }

    // Validar tipo y tamaño de archivo
    const MAX_SIZE_MB = 10;
    const ALLOWED_TYPES = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'application/rtf',
      'application/zip'
    ];

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast?.({
        title: "Error",
        description: "Tipo de archivo no válido. Solo se permiten PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, RTF y ZIP",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast?.({
        title: "Error",
        description: `El archivo es demasiado grande. Máximo ${MAX_SIZE_MB}MB`,
        variant: "destructive",
      });
      return false;
    }

    const newDocument = {
      id: `doc_${Date.now()}_${Math.random()}`,
      documento: file.name,
      file,
      tipo_documento,
      titulo,
      descripcion,
      is_public: isPublic,
      fecha_creacion: new Date().toISOString()
    };

    setDocumentos(prev => [...prev, newDocument]);

    toast?.({
      title: "Documento añadido",
      description: `${tipo_documento}: ${titulo}`,
      variant: "default",
    });

    return true;
  }, [toast]);

  /**
   * Eliminar documento
   */
  const removeDocument = useCallback((index) => {
    setDocumentos(prev => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Limpiar todos los documentos
   */
  const clearAllDocuments = useCallback(() => {
    setDocumentos([]);
  }, []);

  return {
    documentos,
    addDocument,
    removeDocument,
    clearAllDocuments,
    handleDocumentUpload
  };
};

export default {
  useImageURLManager,
  useOptimizedImageManager,
  useOptimizedDocumentManager
};