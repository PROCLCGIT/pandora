// /pandora/src/modulos/productos/hooks/useMediaManagement.js

import { useImagenes } from './useImagenes';
import { useDocumentos } from './useDocumentos';

/**
 * Hook personalizado que combina la gestión de imágenes y documentos
 * utilizando los hooks especializados useImagenes y useDocumentos
 */
export function useMediaManagement(toast) {
  // Usar hooks especializados
  const imagenesHook = useImagenes();
  const documentosHook = useDocumentos();

  return {
    // Delegación completa a hooks especializados
    ...imagenesHook,
    ...documentosHook
  };
}