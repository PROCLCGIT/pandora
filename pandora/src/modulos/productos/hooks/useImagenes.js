// useImagenes.js
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

// Función de utilidad para logs solo en desarrollo
const debug = (...args) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

/**
 * Hook personalizado para gestionar imágenes de productos
 * @returns {Object} Métodos y estados para gestionar imágenes
 */
export const useImagenes = () => {
  const { toast } = useToast();
  const imageInputRef = useRef(null);
  
  // Estados para imágenes
  const [imagenes, setImagenes] = useState([]);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [nuevaImagen, setNuevaImagen] = useState({
    file: null,
    descripcion: '',
    isPrimary: false
  });

  // Efecto para revocar las ObjectURLs cuando las imágenes cambien o el componente se desmonte
  useEffect(() => {
    // Función de limpieza que se ejecutará cuando imagenes cambie o el componente se desmonte
    return () => {
      // Revocar ObjectURLs de imágenes cargadas localmente
      imagenes.forEach(imagen => {
        // Solo procesar imágenes con flag isLocalBlob (las que creamos localmente)
        if (imagen.isLocalBlob) {
          // Revocar URL en preview
          if (imagen.preview && typeof imagen.preview === 'string') {
            try {
              URL.revokeObjectURL(imagen.preview);
              debug('URL de vista previa revocada:', imagen.preview);
            } catch (error) {
              debug('Error al revocar URL de vista previa:', error);
            }
          }

          // Por compatibilidad, también verificar las propiedades antiguas

          // Revocar URL en imagen.imagen (compatibilidad con código anterior)
          if (imagen.imagen && typeof imagen.imagen === 'string' && imagen.imagen.startsWith('blob:')) {
            try {
              URL.revokeObjectURL(imagen.imagen);
              debug('Revocada ObjectURL (imagen):', imagen.imagen);
            } catch (error) {
              debug('Error al revocar ObjectURL (imagen):', error);
            }
          }

          // Revocar URL en imagen.blobUrl (compatibilidad con enfoques anteriores)
          if (imagen.blobUrl && typeof imagen.blobUrl === 'string') {
            try {
              URL.revokeObjectURL(imagen.blobUrl);
              debug('Revocada ObjectURL (blobUrl):', imagen.blobUrl);
            } catch (error) {
              debug('Error al revocar ObjectURL (blobUrl):', error);
            }
          }
        }
      });
    };
  }, [imagenes]);

  // Validar tamaño y formato de imagen
  const validateImage = (file) => {
    // Definir límites y formatos permitidos
    const MAX_SIZE_MB = 5; // Máximo tamaño en MB
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024; // Convertir a bytes
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']; // Formatos permitidos
    
    // Validar tamaño del archivo
    if (file.size > MAX_SIZE_BYTES) {
      toast({
        title: "Error de tamaño",
        description: `La imagen debe ser menor de ${MAX_SIZE_MB} MB. Este archivo tiene ${(file.size / (1024 * 1024)).toFixed(2)} MB.`,
        variant: "destructive",
      });
      return false;
    }
    
    // Validar formato/tipo del archivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: "Formato no permitido",
        description: `Solo se permiten imágenes en formato ${ALLOWED_TYPES.map(t => t.replace('image/', '')).join(', ')}. Este archivo es ${file.type || 'de tipo desconocido'}.`,
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  // Función para procesar un archivo subido
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar el archivo antes de establecerlo en el estado
      if (validateImage(file)) {
        setNuevaImagen({
          ...nuevaImagen,
          file: file
        });
      } else {
        // Resetear el input file si la validación falla
        if (imageInputRef.current) {
          imageInputRef.current.value = '';
        }
      }
    }
  };
  
  // Añadir una nueva imagen
  const addImage = () => {
    if (!nuevaImagen.file) {
      toast({
        title: "Error",
        description: "Debes seleccionar una imagen",
        variant: "destructive",
      });
      return;
    }
    
    // Validación adicional de seguridad (por si se modificó el archivo después de seleccionarlo)
    if (!validateImage(nuevaImagen.file)) {
      // Resetear el input file para permitir otro intento
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
      return;
    }

    // Generar URL para vista previa con manejo de errores
    let preview;
    try {
      preview = URL.createObjectURL(nuevaImagen.file);
    } catch (error) {
      // Si hay error al crear la URL, mostrar mensaje y abortar
      toast({
        title: "Error",
        description: "No se pudo crear la vista previa de la imagen",
        variant: "destructive",
      });
      debug("Error al crear URL:", error);
      return;
    }

    // Crear identificador único para esta imagen
    const generatedId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Añadir imagen al array
    const newImage = {
      id: undefined, // La API asignará un ID real
      generatedId, // ID único para React key
      imagen: nuevaImagen.file.name, // Nombre del archivo como referencia
      file: nuevaImagen.file,
      descripcion: nuevaImagen.descripcion,
      is_primary: nuevaImagen.isPrimary,
      orden: imagenes.length,
      isLocalBlob: true, // Flag para identificar blobs locales que necesitan ser revocados
      preview // Guardar URL de preview para usarla en vez de crear nuevas en cada render
    };

    // Si esta imagen es principal, desmarcar las otras
    if (nuevaImagen.isPrimary) {
      const updatedImages = imagenes.map(img => ({
        ...img,
        is_primary: false
      }));
      setImagenes([...updatedImages, newImage]);
    } else {
      setImagenes([...imagenes, newImage]);
    }

    // Resetear el formulario de imagen
    setNuevaImagen({
      file: null,
      descripcion: '',
      isPrimary: false
    });

    // Cerrar el diálogo
    setImageDialogOpen(false);

    // Resetear el input file
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };
  
  // Eliminar una imagen
  const removeImage = (index) => {
    const updatedImages = [...imagenes];

    // Si la imagen que se va a eliminar tiene URLs de blob, revocarlas
    const imagen = updatedImages[index];
    if (imagen.isLocalBlob) {
      // Revocar preview URL
      if (imagen.preview) {
        try {
          URL.revokeObjectURL(imagen.preview);
          debug('Revocada URL de preview al eliminar imagen:', imagen.preview);
        } catch (error) {
          debug('Error al revocar URL de preview al eliminar:', error);
        }
      }

      // Por compatibilidad, también verificar las propiedades antiguas
      if (imagen.imagen && typeof imagen.imagen === 'string' && imagen.imagen.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(imagen.imagen);
          debug('Revocada ObjectURL al eliminar imagen:', imagen.imagen);
        } catch (error) {
          debug('Error al revocar ObjectURL al eliminar:', error);
        }
      }
      if (imagen.blobUrl) {
        try {
          URL.revokeObjectURL(imagen.blobUrl);
          debug('Revocada blobUrl al eliminar imagen:', imagen.blobUrl);
        } catch (error) {
          debug('Error al revocar blobUrl al eliminar:', error);
        }
      }
    }

    // Eliminar del array
    updatedImages.splice(index, 1);
    setImagenes(updatedImages);
  };
  
  // Establecer una imagen como principal
  const setPrimaryImage = (index) => {
    const updatedImages = imagenes.map((img, i) => ({
      ...img,
      is_primary: i === index
    }));
    setImagenes(updatedImages);
  };

  // Cancelar el diálogo de nueva imagen
  const cancelImageDialog = () => {
    setNuevaImagen({
      file: null,
      descripcion: '',
      isPrimary: false
    });
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
    setImageDialogOpen(false);
  };

  return {
    imagenes,
    setImagenes,
    imageDialogOpen,
    setImageDialogOpen,
    nuevaImagen,
    setNuevaImagen,
    imageInputRef,
    handleImageUpload,
    addImage,
    removeImage,
    setPrimaryImage,
    cancelImageDialog
  };
};

export default useImagenes;