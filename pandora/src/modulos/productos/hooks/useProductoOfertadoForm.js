// useProductoOfertadoForm.js
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useProductoOfertadoById } from '../api/productoOfertadoService';

// Función de utilidad para logs solo en desarrollo
const debug = (...args) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

// Esquema de validación
const productoOfertadoSchema = z.object({
  code: z.string().min(1, 'El código es obligatorio'),
  cudim: z.string().min(1, 'El CUDIM es obligatorio'),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
  // Especialidad puede ser undefined para omitirla completamente, o un ID
  especialidad: z.string().min(1, 'Seleccione una especialidad o ninguna').optional(),
  referencias: z.string().optional(),
  id_categoria: z.string().min(1, 'La categoría es obligatoria'),
  is_active: z.boolean().default(true),
});

/**
 * Hook personalizado que gestiona el formulario de Producto Ofertado
 * @param {string|undefined} id - ID del producto para edición (undefined para creación)
 * @param {Function} setImagenes - Función para actualizar el estado de imágenes
 * @param {Function} setDocumentos - Función para actualizar el estado de documentos
 * @returns {Object} Métodos y estados del formulario
 */
// Función para generar código aleatorio de producto ofertado
const generateOftCode = () => {
  const randomNumber = Math.floor(Math.random() * 1000); // Genera un número entre 0 y 999
  const paddedNumber = randomNumber.toString().padStart(3, '0'); // Asegura que tenga 3 dígitos, ej: 007, 056, 123
  return `OFT-A${paddedNumber}`;
};

export const useProductoOfertadoForm = (id, setImagenes, setDocumentos) => {
  const isEditing = !!id;

  // Configurar React Hook Form
  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState,
    getValues,
  } = useForm({
    resolver: zodResolver(productoOfertadoSchema),
    defaultValues: {
      code: '',
      cudim: '',
      nombre: '',
      descripcion: '',
      especialidad: undefined,
      referencias: '',
      id_categoria: '',
      is_active: true,
    },
  });

  // Extraer valores específicos de formState
  const { errors, isSubmitting } = formState;

  // Hook para cargar datos del producto si es edición
  const { data: productoData, isLoading: isLoadingProducto } = useProductoOfertadoById(
    id,
    {
      enabled: isEditing,
      refetchOnMount: "always", // Siempre refetch al montar para productos (datos críticos)
      refetchOnWindowFocus: false, // No refetch al enfocar ventana
      placeholderData: undefined, // Deshabilitar placeholderData para que no interfiera con la carga
    }
  );

  // Efecto para limpiar los datos cuando el ID cambia y generar código para nuevos productos
  useEffect(() => {
    // Limpiar imágenes y documentos al cambiar el ID o al montar el componente
    if (!isEditing) {
      const newCode = generateOftCode(); // Generar código aleatorio
      reset({
        code: newCode, // Usar el código generado
        cudim: '',
        nombre: '',
        descripcion: '',
        especialidad: undefined,
        referencias: '',
        id_categoria: '',
        is_active: true,
      });
      
      // Limpiar imágenes y documentos
      if (setImagenes) setImagenes([]);
      if (setDocumentos) setDocumentos([]);
    }
  }, [id, isEditing, reset, setImagenes, setDocumentos]);

  // Efecto para cargar los datos en el formulario cuando se obtienen del API
  useEffect(() => {
    if (productoData) {
      // Convertir IDs a strings para los selects y manejar especialidad específicamente
      const formData = {
        ...productoData,
        id_categoria: productoData.id_categoria?.toString() || '',
        // Manejar especialidad específicamente para asegurar que sea string o undefined
        especialidad: productoData.especialidad ? productoData.especialidad.toString() : undefined
      };

      reset(formData);

      // Cargar imágenes y documentos si existen
      if (setImagenes && productoData.imagenes && Array.isArray(productoData.imagenes)) {
        // Depuración para productos específicos
        if (productoData.code === 'OFT-A182' || productoData.code === 'OFT-A250') {
          debug(`[Debug useProductoOfertadoForm][${productoData.code}] Cargando imágenes:`, productoData.imagenes);
          
          // Verificar las propiedades de cada imagen
          productoData.imagenes.forEach((img, idx) => {
            debug(`[Debug useProductoOfertadoForm][${productoData.code}] Imagen ${idx+1}:`, {
              id: img.id,
              imagen: img.imagen,
              webp_url: img.webp_url,
              thumbnail_url: img.thumbnail_url,
              original_url: img.original_url,
              imagen_url: img.imagen_url,
              get_absolute_url: img.get_absolute_url,
              imagen_original: img.imagen_original,
              imagen_thumbnail: img.imagen_thumbnail,
              imagen_webp: img.imagen_webp
            });
          });
        }
        setImagenes(productoData.imagenes);
      } else if (setImagenes) {
        setImagenes([]);
      }

      if (setDocumentos && productoData.documentos && Array.isArray(productoData.documentos)) {
        setDocumentos(productoData.documentos);
      } else if (setDocumentos) {
        setDocumentos([]);
      }
    }
  }, [productoData, reset, setImagenes, setDocumentos]);
  
  // Función para preparar el FormData con todos los campos y archivos
  const prepareFormData = (data, imagenes, documentos) => {
    const formData = new FormData();
    const SEND_FILES = true; // Controla si se envían imágenes y documentos al servidor

    // Helper local para añadir campos al FormData solo si tienen valor
    const appendIfValue = (key, value) => {
      // No añadir campos con valor undefined o null
      if (value === undefined || value === null) return;

      // Para especialidad, solo añadir si tiene un valor válido
      if (key === 'especialidad' && (value === 'none' || String(value).trim() === '')) return;

      // Gestionar específicamente los valores booleanos
      if (typeof value === 'boolean') {
        formData.append(key, value ? 'true' : 'false');
      } else {
        // Para otros tipos de valores, añadirlos normalmente
        formData.append(key, value);
      }
    };

    // Añadir campos básicos
    Object.keys(data).forEach(key => {
      // Debug específico para campos problemáticos
      if (key === 'especialidad' || key === 'id_categoria') {
        debug(`📝 Campo ${key}: tipo=${typeof data[key]}, valor='${data[key]}'`);
      }
      appendIfValue(key, data[key]);
    });

    // Si las imágenes o documentos no se proporcionaron, salir temprano
    if (!imagenes || !documentos || !SEND_FILES) {
      // Si SEND_FILES está deshabilitado, agregamos un campo para indicar
      // al backend que no procese archivos (si tu backend lo soporta)
      formData.append('skip_files_processing', 'true');
      debug('⚠️ Envío de archivos deshabilitado para depuración');
      return formData;
    }

    // Procesar imágenes - Separar nuevas y existentes
    const nuevasImagenes = imagenes.filter(img => img.file);
    const imagenesExistentes = imagenes.filter(img => !img.file && img.id);

    // Añadir IDs de imágenes existentes (para conservarlas en el backend)
    if (isEditing && imagenesExistentes.length > 0) {
      formData.append('existing_images', JSON.stringify(imagenesExistentes.map(img => img.id)));
    }

    // Añadir nuevas imágenes con el formato que espera el backend actual
    nuevasImagenes.forEach((img, index) => {
      // Usar el nombre que espera el backend
      formData.append('uploaded_images', img.file);
      
      // Añadir metadatos de imágenes como campos individuales
      formData.append('image_descriptions', img.descripcion || '');
      formData.append('image_is_primary', img.is_primary ? 'true' : 'false')
      formData.append('image_orden', index)
    });

    // Procesar documentos - Separar nuevos y existentes
    const nuevosDocumentos = documentos.filter(doc => doc.file);
    const documentosExistentes = documentos.filter(doc => !doc.file && doc.id);

    // Añadir IDs de documentos existentes (para conservarlos en el backend)
    if (isEditing && documentosExistentes.length > 0) {
      formData.append('existing_documents', JSON.stringify(documentosExistentes.map(doc => doc.id)));
    }

    // Añadir nuevos documentos con el formato que espera el backend actual
    nuevosDocumentos.forEach((doc) => {
      // Usar el nombre que espera el backend
      formData.append('uploaded_documents', doc.file);
      
      // Añadir metadatos de documentos como campos individuales
      formData.append('document_titles', doc.titulo || '')
      formData.append('document_types', doc.tipo_documento || '')
      formData.append('document_descriptions', doc.descripcion || '');
      formData.append('document_is_public', doc.is_public ? 'true' : 'false')
    });

    // Verificación de campo especialidad
    if (formData.has('especialidad') && !formData.get('especialidad')) {
      debug('⚠️ Eliminando campo especialidad vacío para evitar errores del backend');
      formData.delete('especialidad');
    }

    // Log completo para depuración
    if (import.meta.env.DEV) {
      debug('📝 FormData completo preparado para envío:');
      for (const pair of formData.entries()) {
        const key = pair[0];
        let value = pair[1];
        
        // Para archivos, mostrar información útil
        if (value instanceof File) {
          value = `[File: ${value.name}, ${value.type}, ${Math.round(value.size / 1024)} KB]`;
        }
        
        debug(`  ${key}: ${value}`);
      }
    }

    return formData;
  };

  return {
    control,
    errors,
    isSubmitting,
    formState,
    isLoadingProducto,
    isEditing,
    productoData,
    handleSubmit,
    prepareFormData,
    getValues,
    watch,
  };
};

export default useProductoOfertadoForm;