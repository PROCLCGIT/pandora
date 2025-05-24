// useDocumentos.js
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

// Función de utilidad para logs solo en desarrollo
const debug = (...args) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

/**
 * Hook personalizado para gestionar documentos de productos
 * @returns {Object} Métodos y estados para gestionar documentos
 */
export const useDocumentos = () => {
  const { toast } = useToast();
  const docInputRef = useRef(null);

  // Estados para documentos
  const [documentos, setDocumentos] = useState([]);
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [nuevoDocumento, setNuevoDocumento] = useState({
    file: null,
    tipo_documento: '',
    titulo: '',
    descripcion: '',
    is_public: false
  });

  // Validar tamaño y formato de documento
  const validateDocument = (file) => {
    // Definir límites y formatos permitidos
    const MAX_SIZE_MB = 10; // Máximo tamaño en MB
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024; // Convertir a bytes

    // Lista de tipos MIME permitidos
    const ALLOWED_TYPES = [
      'application/pdf', // PDF
      'application/msword', // DOC
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
      'application/vnd.ms-excel', // XLS
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
      'application/vnd.ms-powerpoint', // PPT
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
      'text/plain', // TXT
      'application/rtf', // RTF
      'application/zip' // ZIP
    ];

    // Extensiones permitidas para verificación adicional
    const ALLOWED_EXTENSIONS = [
      '.pdf', '.doc', '.docx', '.xls', '.xlsx',
      '.ppt', '.pptx', '.txt', '.rtf', '.zip'
    ];

    // Validar tamaño del archivo
    if (file.size > MAX_SIZE_BYTES) {
      toast({
        title: "Error de tamaño",
        description: `El documento debe ser menor de ${MAX_SIZE_MB} MB. Este archivo tiene ${(file.size / (1024 * 1024)).toFixed(2)} MB.`,
        variant: "destructive",
      });
      return false;
    }

    // Validar formato usando tipo MIME
    const isValidType = ALLOWED_TYPES.includes(file.type);

    // Validación adicional por extensión para mayor seguridad
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));

    if (!isValidType && !hasValidExtension) {
      toast({
        title: "Formato no permitido",
        description: `Solo se permiten documentos en formato PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, RTF y ZIP.`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  // Función para procesar un archivo subido
  const handleDocUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar el archivo antes de establecerlo en el estado
      if (validateDocument(file)) {
        setNuevoDocumento({
          ...nuevoDocumento,
          file: file
        });
      } else {
        // Resetear el input file si la validación falla
        if (docInputRef.current) {
          docInputRef.current.value = '';
        }
      }
    }
  };

  // Añadir un nuevo documento
  const addDocument = () => {
    if (!nuevoDocumento.file || !nuevoDocumento.titulo || !nuevoDocumento.tipo_documento) {
      toast({
        title: "Error",
        description: "Debes completar todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    // Validación adicional de seguridad (por si se modificó el archivo después de seleccionarlo)
    if (!validateDocument(nuevoDocumento.file)) {
      // Resetear el input file para permitir otro intento
      if (docInputRef.current) {
        docInputRef.current.value = '';
      }
      return;
    }

    // Crear identificador único para este documento
    const generatedId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Añadir documento al array
    const newDocument = {
      id: undefined, // La API asignará un ID real
      generatedId, // ID único para React key
      documento: nuevoDocumento.file.name,
      file: nuevoDocumento.file,
      tipo_documento: nuevoDocumento.tipo_documento,
      titulo: nuevoDocumento.titulo,
      descripcion: nuevoDocumento.descripcion,
      is_public: nuevoDocumento.is_public
    };

    setDocumentos([...documentos, newDocument]);

    // Resetear el formulario de documento
    setNuevoDocumento({
      file: null,
      tipo_documento: '',
      titulo: '',
      descripcion: '',
      is_public: false
    });

    // Cerrar el diálogo
    setDocDialogOpen(false);

    // Resetear el input file
    if (docInputRef.current) {
      docInputRef.current.value = '';
    }
  };

  // Eliminar un documento
  const removeDocument = (index) => {
    const updatedDocs = [...documentos];
    updatedDocs.splice(index, 1);
    setDocumentos(updatedDocs);
  };

  // Cancelar el diálogo de nuevo documento
  const cancelDocDialog = () => {
    setNuevoDocumento({
      file: null,
      tipo_documento: '',
      titulo: '',
      descripcion: '',
      is_public: false
    });
    if (docInputRef.current) {
      docInputRef.current.value = '';
    }
    setDocDialogOpen(false);
  };

  return {
    documentos,
    setDocumentos,
    docDialogOpen,
    setDocDialogOpen,
    nuevoDocumento,
    setNuevoDocumento,
    docInputRef,
    handleDocUpload,
    addDocument,
    removeDocument,
    cancelDocDialog
  };
};

export default useDocumentos;