// useProductoMutations.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  useCreateProductoOfertado, 
  useUpdateProductoOfertado 
} from '../api/productoOfertadoService';

// Función de utilidad para logs solo en desarrollo
const debug = (...args) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

/**
 * Hook personalizado para gestionar las mutaciones (crear/editar) de productos ofertados
 * @param {string|undefined} id - ID del producto para edición (undefined para creación)
 * @returns {Object} Métodos y estados para mutaciones
 */
export const useProductoMutations = (id) => {
  const isEditing = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estado para mostrar alerta de error general
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Función para extraer mensajes de error de las respuestas del backend
  const extractBackendErrors = (error) => {
    if (error.response && error.response.data) {
      const data = error.response.data;
      if (typeof data === 'string') return data;
      // Combinar mensajes por campo
      return Object.entries(data)
        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
        .join(' | ');
    }
    return error.message;
  };

  // Función para procesar errores de API y mostrar mensajes adecuados
  const processApiError = (error) => {
    // Extraer mensaje de error de forma consistente
    let errorMsg = 'Ocurrió un error al procesar el formulario';
    let errorDetails = {};

    if (error.response) {
      // Detectar errores específicos comunes
      if (error.response.status === 500 &&
          (error.response.data?.error?.includes('especialidad') ||
            error.message?.includes('especialidad'))) {
        setErrorMessage('Se ha detectado un problema con el campo especialidad. Por favor, seleccione una especialidad válida o asegúrese de que esté completamente vacío.');
        setShowErrorAlert(true);
      }

      // Procesar errores del backend según su formato
      if (typeof error.response.data === 'object' && error.response.data !== null) {
        const errorEntries = Object.entries(error.response.data);

        // Mapear errores para mostrarlos al usuario
        errorMsg = errorEntries
          .map(([campo, mensaje]) => {
            const msgText = Array.isArray(mensaje) ? mensaje.join(', ') :
              typeof mensaje === 'object' ? JSON.stringify(mensaje) : mensaje;
            return `${campo}: ${msgText}`;
          })
          .join(' | ');

        // Guardar errores por campo para uso futuro si es necesario
        errorEntries.forEach(([field, message]) => {
          errorDetails[field] = Array.isArray(message) ? message[0] :
            typeof message === 'string' ? message : JSON.stringify(message);
        });
      } else if (typeof error.response.data === 'string') {
        errorMsg = error.response.data;
      }
    } else if (error.message) {
      errorMsg = error.message;
    }

    return { errorMsg, errorDetails };
  };

  // Mutación para crear
  const createMutation = useCreateProductoOfertado({
    onSuccess: () => {
      toast({
        title: 'Producto creado',
        description: 'El producto ha sido creado correctamente',
      });
      navigate('/productos/productos-ofertados');
    },
    onError: (error) => {
      const { errorMsg } = processApiError(error);
      toast({
        title: 'Error al crear el producto',
        description: errorMsg,
        variant: 'destructive',
      });
    },
  });

  // Mutación para actualizar
  const updateMutation = useUpdateProductoOfertado({
    onSuccess: () => {
      toast({
        title: 'Producto actualizado',
        description: 'El producto ha sido actualizado correctamente',
      });
      navigate('/productos/productos-ofertados');
    },
    onError: (error) => {
      const { errorMsg } = processApiError(error);
      toast({
        title: 'Error al actualizar el producto',
        description: errorMsg,
        variant: 'destructive',
      });
    },
  });

  // Manejar el envío del formulario (sin try/catch manual, React Query lo maneja por nosotros)
  const handleSubmit = (formData) => {
    // Deshabilitar múltiples envíos
    if (createMutation.isPending || updateMutation.isPending) {
      debug("Formulario ya en proceso, evitando envío duplicado");
      return;
    }

    // Para evitar errores de especialidad, verificar si este campo está en el formulario
    const especialidadValue = formData.get('especialidad');
    if (especialidadValue === undefined || especialidadValue === 'undefined' || 
        especialidadValue === null || especialidadValue === 'null') {
      debug("Eliminando especialidad indefinida del FormData");
      formData.delete('especialidad');
    }

    // Verificar que tenemos algún dato identificable para la UI optimista
    const productName = formData.get('nombre');
    const productCode = formData.get('code');

    // Extraer información básica para mostrar en toast
    const productInfo = productName || productCode
      ? `${productName || ''} ${productCode ? `(${productCode})` : ''}`.trim()
      : 'producto';

    // Toast inicial para informar que se está procesando (mejor UX)
    const toastId = toast({
      title: isEditing ? 'Actualizando producto...' : 'Creando producto...',
      description: `Procesando ${productInfo}`,
    });

    // Usar mutate en lugar de mutateAsync (React Query maneja los errores)
    if (isEditing) {
      debug('📝 Actualizando producto', id);
      updateMutation.mutate(
        { id, data: formData },
        {
          // Callbacks específicos para esta operación
          onSuccess: () => {
            debug('✅ Actualización exitosa');
            toast({
              id: toastId, // Actualiza el toast existente
              title: 'Operación completada',
              description: `Producto ${productInfo} actualizado correctamente`,
              variant: 'default',
            });
            navigate('/productos/productos-ofertados');
          },
          onError: (error) => {
            debug('❌ Error al actualizar:', error);
            const { errorMsg } = processApiError(error);
            toast({
              id: toastId, // Actualiza el toast existente
              title: 'Error al actualizar',
              description: errorMsg,
              variant: 'destructive',
            });
          }
        }
      );
    } else {
      createMutation.mutate(
        formData,
        {
          // Callbacks específicos para esta operación
          onSuccess: () => {
            toast({
              id: toastId, // Actualiza el toast existente
              title: 'Operación completada',
              description: `Producto ${productInfo} creado correctamente`,
              variant: 'default',
            });
            navigate('/productos/productos-ofertados');
          },
          onError: (error) => {
            const { errorMsg } = processApiError(error);
            toast({
              id: toastId, // Actualiza el toast existente
              title: 'Error al crear',
              description: errorMsg,
              variant: 'destructive',
            });
          }
        }
      );
    }
  };

  return {
    handleSubmit,
    showErrorAlert,
    setShowErrorAlert,
    errorMessage,
    setErrorMessage,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    processApiError,
    isEditing
  };
};

export default useProductoMutations;