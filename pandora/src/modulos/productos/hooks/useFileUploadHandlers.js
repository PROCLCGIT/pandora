/**
 * Hook optimizado para manejar uploads de archivos
 * Implementa mejores prácticas para event handling y cleanup
 */

import { useCallback } from 'react';

/**
 * Hook para manejar uploads de archivos con manejo robusto de eventos
 */
export const useFileUploadHandlers = () => {
  
  /**
   * Manejador optimizado para subida de imágenes
   * @param {Event} e - Evento del input file
   * @param {Function} onFileSelected - Callback cuando se selecciona un archivo
   * @param {Function} onError - Callback para manejar errores
   */
  const handleImageUpload = useCallback((e, onFileSelected, onError) => {
    try {
      // Usar currentTarget para mayor robustez y optional chaining
      const file = e.currentTarget.files?.[0];
      
      if (!file) {
        // Limpiar el input aunque no haya archivo
        e.target.value = '';
        return;
      }

      // Validaciones básicas
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const maxSizeBytes = 5 * 1024 * 1024; // 5MB

      if (!validImageTypes.includes(file.type)) {
        onError?.({
          type: 'INVALID_TYPE',
          message: 'Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)',
          file
        });
        e.target.value = ''; // Limpiar input
        return;
      }

      if (file.size > maxSizeBytes) {
        onError?.({
          type: 'FILE_TOO_LARGE',
          message: `El archivo es demasiado grande. Máximo 5MB (actual: ${(file.size / 1024 / 1024).toFixed(1)}MB)`,
          file
        });
        e.target.value = ''; // Limpiar input
        return;
      }

      // Archivo válido - llamar callback
      onFileSelected?.(file);
      
      // Limpiar el input después de procesar el archivo exitosamente
      e.target.value = '';
      
    } catch (error) {
      console.error('Error en handleImageUpload:', error);
      onError?.({
        type: 'PROCESSING_ERROR',
        message: 'Error al procesar el archivo',
        error
      });
      
      // Asegurar limpieza del input en caso de error
      try {
        e.target.value = '';
      } catch (cleanupError) {
        console.warn('Error limpiando input:', cleanupError);
      }
    }
  }, []);

  /**
   * Manejador optimizado para subida de documentos
   * @param {Event} e - Evento del input file
   * @param {Function} onFileSelected - Callback cuando se selecciona un archivo
   * @param {Function} onError - Callback para manejar errores
   */
  const handleDocumentUpload = useCallback((e, onFileSelected, onError) => {
    try {
      // Usar currentTarget para mayor robustez y optional chaining
      const file = e.currentTarget.files?.[0];
      
      if (!file) {
        // Limpiar el input aunque no haya archivo
        e.target.value = '';
        return;
      }

      // Validaciones básicas para documentos
      const validDocTypes = [
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
      
      const maxSizeBytes = 10 * 1024 * 1024; // 10MB

      if (!validDocTypes.includes(file.type)) {
        onError?.({
          type: 'INVALID_TYPE',
          message: 'Solo se permiten archivos PDF, Word, Excel, PowerPoint, texto plano, RTF o ZIP',
          file
        });
        e.target.value = ''; // Limpiar input
        return;
      }

      if (file.size > maxSizeBytes) {
        onError?.({
          type: 'FILE_TOO_LARGE',
          message: `El archivo es demasiado grande. Máximo 10MB (actual: ${(file.size / 1024 / 1024).toFixed(1)}MB)`,
          file
        });
        e.target.value = ''; // Limpiar input
        return;
      }

      // Archivo válido - llamar callback
      onFileSelected?.(file);
      
      // Limpiar el input después de procesar el archivo exitosamente
      e.target.value = '';
      
    } catch (error) {
      console.error('Error en handleDocumentUpload:', error);
      onError?.({
        type: 'PROCESSING_ERROR',
        message: 'Error al procesar el archivo',
        error
      });
      
      // Asegurar limpieza del input en caso de error
      try {
        e.target.value = '';
      } catch (cleanupError) {
        console.warn('Error limpiando input:', cleanupError);
      }
    }
  }, []);

  /**
   * Manejador genérico para cualquier tipo de archivo
   * @param {Event} e - Evento del input file
   * @param {Object} config - Configuración de validación
   * @param {Function} onFileSelected - Callback cuando se selecciona un archivo
   * @param {Function} onError - Callback para manejar errores
   */
  const handleFileUpload = useCallback((e, config, onFileSelected, onError) => {
    try {
      const file = e.currentTarget.files?.[0];
      
      if (!file) {
        e.target.value = '';
        return;
      }

      const {
        acceptedTypes = [],
        maxSizeBytes = 10 * 1024 * 1024,
        fileTypeCategory = 'archivo'
      } = config;

      // Validar tipo si se especifican tipos aceptados
      if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
        onError?.({
          type: 'INVALID_TYPE',
          message: `Tipo de ${fileTypeCategory} no válido`,
          file,
          acceptedTypes
        });
        e.target.value = '';
        return;
      }

      // Validar tamaño
      if (file.size > maxSizeBytes) {
        const maxSizeMB = (maxSizeBytes / 1024 / 1024).toFixed(1);
        const actualSizeMB = (file.size / 1024 / 1024).toFixed(1);
        
        onError?.({
          type: 'FILE_TOO_LARGE',
          message: `El ${fileTypeCategory} es demasiado grande. Máximo ${maxSizeMB}MB (actual: ${actualSizeMB}MB)`,
          file
        });
        e.target.value = '';
        return;
      }

      // Archivo válido
      onFileSelected?.(file);
      e.target.value = '';
      
    } catch (error) {
      console.error('Error en handleFileUpload:', error);
      onError?.({
        type: 'PROCESSING_ERROR',
        message: 'Error al procesar el archivo',
        error
      });
      
      try {
        e.target.value = '';
      } catch (cleanupError) {
        console.warn('Error limpiando input:', cleanupError);
      }
    }
  }, []);

  /**
   * Crear un manejador especializado con configuración predefinida
   */
  const createFileHandler = useCallback((config) => {
    return (e, onFileSelected, onError) => {
      handleFileUpload(e, config, onFileSelected, onError);
    };
  }, [handleFileUpload]);

  /**
   * Manejadores preconfigurados para casos comunes
   */
  const presetHandlers = {
    // Imágenes web comunes
    image: createFileHandler({
      acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      maxSizeBytes: 5 * 1024 * 1024,
      fileTypeCategory: 'imagen'
    }),

    // Documentos de oficina
    document: createFileHandler({
      acceptedTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
      ],
      maxSizeBytes: 10 * 1024 * 1024,
      fileTypeCategory: 'documento'
    }),

    // Solo PDFs
    pdf: createFileHandler({
      acceptedTypes: ['application/pdf'],
      maxSizeBytes: 20 * 1024 * 1024,
      fileTypeCategory: 'PDF'
    }),

    // Archivos de imagen para avatares (más restrictivo)
    avatar: createFileHandler({
      acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
      maxSizeBytes: 2 * 1024 * 1024,
      fileTypeCategory: 'imagen de perfil'
    }),

    // Hojas de cálculo
    spreadsheet: createFileHandler({
      acceptedTypes: [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ],
      maxSizeBytes: 15 * 1024 * 1024,
      fileTypeCategory: 'hoja de cálculo'
    })
  };

  return {
    handleImageUpload,
    handleDocumentUpload,
    handleFileUpload,
    createFileHandler,
    presetHandlers
  };
};

/**
 * Hook para manejar múltiples archivos
 */
export const useMultipleFileUploadHandlers = () => {
  
  const handleMultipleFilesUpload = useCallback((e, config, onFilesSelected, onError) => {
    try {
      // Usar currentTarget y convertir FileList a Array
      const files = Array.from(e.currentTarget.files || []);
      
      if (files.length === 0) {
        e.target.value = '';
        return;
      }

      const {
        acceptedTypes = [],
        maxSizeBytes = 10 * 1024 * 1024,
        maxFiles = 10,
        fileTypeCategory = 'archivo'
      } = config;

      // Validar cantidad de archivos
      if (files.length > maxFiles) {
        onError?.({
          type: 'TOO_MANY_FILES',
          message: `Máximo ${maxFiles} archivos permitidos (seleccionados: ${files.length})`,
          files
        });
        e.target.value = '';
        return;
      }

      // Validar cada archivo
      const validFiles = [];
      const errors = [];

      for (const file of files) {
        // Validar tipo
        if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
          errors.push({
            file,
            type: 'INVALID_TYPE',
            message: `${file.name}: Tipo de ${fileTypeCategory} no válido`
          });
          continue;
        }

        // Validar tamaño
        if (file.size > maxSizeBytes) {
          const maxSizeMB = (maxSizeBytes / 1024 / 1024).toFixed(1);
          const actualSizeMB = (file.size / 1024 / 1024).toFixed(1);
          
          errors.push({
            file,
            type: 'FILE_TOO_LARGE',
            message: `${file.name}: Archivo demasiado grande. Máximo ${maxSizeMB}MB (actual: ${actualSizeMB}MB)`
          });
          continue;
        }

        validFiles.push(file);
      }

      // Reportar errores si los hay
      if (errors.length > 0) {
        onError?.({
          type: 'VALIDATION_ERRORS',
          message: `${errors.length} archivo(s) con errores`,
          errors,
          validFiles
        });
      }

      // Procesar archivos válidos si los hay
      if (validFiles.length > 0) {
        onFilesSelected?.(validFiles);
      }

      // Limpiar input
      e.target.value = '';
      
    } catch (error) {
      console.error('Error en handleMultipleFilesUpload:', error);
      onError?.({
        type: 'PROCESSING_ERROR',
        message: 'Error al procesar los archivos',
        error
      });
      
      try {
        e.target.value = '';
      } catch (cleanupError) {
        console.warn('Error limpiando input:', cleanupError);
      }
    }
  }, []);

  return {
    handleMultipleFilesUpload
  };
};

/**
 * Utilidades para trabajar con archivos
 */
export const fileUtils = {
  /**
   * Formatear tamaño de archivo legible
   */
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  },

  /**
   * Obtener extensión de archivo
   */
  getFileExtension: (filename) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  },

  /**
   * Verificar si es imagen
   */
  isImageFile: (file) => {
    return file.type.startsWith('image/');
  },

  /**
   * Verificar si es documento
   */
  isDocumentFile: (file) => {
    const docTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    return docTypes.includes(file.type);
  },

  /**
   * Crear preview URL para imagen
   */
  createImagePreview: (file) => {
    if (!fileUtils.isImageFile(file)) return null;
    return URL.createObjectURL(file);
  }
};

export default useFileUploadHandlers;