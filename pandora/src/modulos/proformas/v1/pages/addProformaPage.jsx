// /pandora/src/modulos/proformas/pages/v1/addProformaPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import ConfiguracionProformaForm from '../components/ConfiguracionProformaForm'; // Asegúrate que la ruta sea correcta
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Search,
  PlusSquare,
  Edit3,
  Clock,
  FileText,
  ChevronDown,
  Filter,
  ArrowLeftRight,
  Download,
  Printer,
  Share2,
  Settings2,
  CheckSquare,
  Save,
  Loader2,
  Eye,
} from 'lucide-react';

// Importar componentes factorizados
import ClienteSection from '../components/form/ClienteSection';
import DetallesProformaSection from '../components/form/DetallesProformaSection';
import ProductosServiciosTable from '../components/form/ProductosServiciosTable';
import ResumenSection from '../components/form/ResumenSection';
import ProductosDisponiblesSelectionModal from '../components/modals/ProductosDisponiblesSelectionModal';
import ProformasGuardadasModal from '../components/modals/ProformasGuardadasModal';
import TemplateSelector from '../components/TemplateSelector';
import ToolBarSection from '../components/form/ToolBarSection';
import { proformaService } from '../api/proformaService';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// Clave para guardar el borrador en localStorage
const DRAFT_KEY = 'proformaDraft';

export default function AddProformaPage() {
  const [showConfigForm, setShowConfigForm] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); // Para edición de proforma existente
  const [configProformaData, setConfigProformaData] = useState(null); // Para guardar/cargar datos de config
  const [cliente, setCliente] = useState({});
  const [detallesProforma, setDetallesProforma] = useState({
    nombre: '',
    empresa: '',
    tipoContratacion: '',
    fechaEmision: new Date(),
    fechaVencimiento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    formaPago: '50% anticipo, 50% contra entrega',
    tiempoEntrega: '5 días hábiles',
    atencion: '',
    porcentajeImpuesto: 12
  });
  const [productos, setProductos] = useState([]);
  const [totales, setTotales] = useState({ subtotal: 0, iva: 0, total: 0 });
  const [showProductosDisponibles, setShowProductosDisponibles] = useState(false);
  const [showProductosModal, setShowProductosModal] = useState(false);
  const [showProformasGuardadas, setShowProformasGuardadas] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [savedProformaId, setSavedProformaId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadingProforma, setLoadingProforma] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [tiposContratacion, setTiposContratacion] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

  // Cargar borrador y configuración al iniciar (solo si no estamos editando)
  useEffect(() => {
    // No cargar borrador si estamos editando una proforma existente
    if (isEditMode || id) {
      return;
    }
    
    const loadInitialData = async () => {
      try {
        // TODO: Implementar la carga de la configuración de proforma desde la API
        // console.log('Intentando cargar configuración de proforma...');
        // const config = await proformaService.getConfiguracion(); 
        // if (config) {
        //   setConfigProformaData(config);
        //   console.log('Configuración de proforma cargada:', config);
        // } else {
        //   console.log('No se encontró configuración de proforma, usando valores por defecto o nulos.');
        // }

        console.log('Intentando cargar borrador de proforma desde localStorage...');
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
          const draft = JSON.parse(savedDraft);
          console.log('Borrador encontrado:', draft);
          if (draft.cliente && Object.keys(draft.cliente).length > 0) {
            setCliente(draft.cliente);
          }
          if (draft.detallesProforma && Object.keys(draft.detallesProforma).length > 0) {
            setDetallesProforma(prev => ({
              ...prev, // Mantiene los valores predeterminados si no están en el borrador
              ...draft.detallesProforma
            }));
          }
          if (draft.productos && draft.productos.length > 0) {
            setProductos(draft.productos);
          }
        } else {
          console.log('No se encontró borrador de proforma en localStorage.');
        }
      } catch (error) {
        console.warn('Error al cargar datos iniciales (configuración o borrador):', error);
        // Considerar mostrar un toast al usuario si la carga falla de forma crítica
        // toast({ 
        //   title: 'Advertencia', 
        //   description: 'No se pudieron cargar completamente los datos guardados.', 
        //   variant: 'warning' 
        // });
      }
    };

    loadInitialData();
  }, [isEditMode, id]); // Depend on edit mode and id

  // Guardar borrador en localStorage cuando cambie el formulario (solo si no estamos editando)
  useEffect(() => {
    // No guardar borrador si estamos editando una proforma existente
    if (isEditMode || id) {
      return;
    }
    
    const draft = {
      cliente,
      detallesProforma,
      productos
    };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (err) {
      console.warn('No se pudo guardar el borrador de proforma', err);
    }
  }, [cliente, detallesProforma, productos, isEditMode, id]);

  const [notas, setNotas] = useState('Precios incluyen IVA. Entrega en sus oficinas sin costo adicional dentro del perímetro urbano.');


  // Fetch empresas and tipos contratacion on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [empresasData, tiposData] = await Promise.all([
          proformaService.getEmpresas(),
          proformaService.getTiposContratacion()
        ]);
        setEmpresas(empresasData.results || []);
        setTiposContratacion(tiposData.results || []);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchInitialData();
  }, []);

  // Calculate totals when products change
  useEffect(() => {
    const subtotal = productos.reduce((sum, item) => sum + (item.total || 0), 0);
    const porcentajeImpuesto = detallesProforma.porcentajeImpuesto || 12;
    const impuesto = subtotal * (porcentajeImpuesto / 100);
    const total = subtotal + impuesto;
    
    setTotales({
      subtotal,
      iva: impuesto,
      total
    });
  }, [productos, detallesProforma.porcentajeImpuesto]);

  // Load available PDF templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const templatesData = await proformaService.getAvailableTemplates();
        setAvailableTemplates(templatesData.plantillas_disponibles || []);
        if (templatesData.plantilla_default) {
          setSelectedTemplate(templatesData.plantilla_default);
        }
      } catch (error) {
        console.error('Error loading templates:', error);
        // Keep default template if loading fails
      }
    };
    loadTemplates();
  }, []);

  // Load existing proforma for editing
  useEffect(() => {
    console.log('=== ADD PROFORMA PAGE MOUNTED ===');
    console.log('URL params ID:', id);
    console.log('Current location:', window.location.href);
    console.log('Current pathname:', window.location.pathname);
    
    if (id) {
      console.log('ID detected, entering edit mode...');
      setIsEditMode(true);
      setSavedProformaId(parseInt(id));
      loadProformaForEditing(id);
    } else {
      console.log('No ID detected, staying in create mode');
    }
  }, [id]);

  const loadProformaForEditing = async (proformaId) => {
    setLoadingProforma(true);
    try {
      console.log('=== LOADING PROFORMA FOR EDITING ===');
      console.log('Proforma ID:', proformaId);
      
      // Load proforma data first
      console.log('Attempting to load proforma data...');
      const proformaData = await proformaService.getProforma(proformaId);
      console.log('Proforma data loaded successfully:', proformaData);
      
      // Load items data separately
      console.log('Attempting to load items data...');
      const itemsData = await proformaService.getProformaItems(proformaId);
      console.log('Items data loaded successfully:', itemsData);
      
      // Cargar datos del cliente
      setCliente({
        id: proformaData.cliente,
        nombre: proformaData.cliente_nombre || '',
        // Agregar más campos del cliente si es necesario
      });

      // Cargar detalles de la proforma
      setDetallesProforma({
        nombre: proformaData.nombre || '',
        empresa: proformaData.empresa?.toString() || '',
        tipoContratacion: proformaData.tipo_contratacion?.toString() || '',
        fechaEmision: proformaData.fecha_emision ? new Date(proformaData.fecha_emision) : new Date(),
        fechaVencimiento: proformaData.fecha_vencimiento ? new Date(proformaData.fecha_vencimiento) : new Date(),
        atencionA: proformaData.atencion_a || '',
        condicionesPago: proformaData.condiciones_pago || '',
        tiempoEntrega: proformaData.tiempo_entrega || '',
        porcentajeImpuesto: proformaData.porcentaje_impuesto || 12,
      });

      // Cargar productos/items
      const productosFormateados = (itemsData.results || []).map((item, index) => ({
        id: item.id,
        codigo: item.codigo,
        descripcion: item.descripcion,
        unidad_id: item.unidad,
        unidad_nombre: item.unidad_nombre,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        porcentaje_descuento: item.porcentaje_descuento || 0,
        total: item.total,
        orden: item.orden || index + 1,
        tipo_item: item.tipo_item,
        producto_disponible_id: item.producto_disponible,
        producto_ofertado_id: item.producto_ofertado,
        // Mantener los datos originales para referencia
        originalData: item
      }));

      setProductos(productosFormateados);
      setNotas(proformaData.notas || 'Precios incluyen IVA. Entrega en sus oficinas sin costo adicional dentro del perímetro urbano.');

      toast({
        title: 'Éxito',
        description: `Proforma ${proformaData.numero} cargada para edición`,
        variant: 'default'
      });

    } catch (error) {
      console.error('Error loading proforma for editing:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      toast({
        title: 'Error',
        description: 'No se pudo cargar la proforma para edición',
        variant: 'destructive'
      });
      
      // Si hay error, NO redirigir inmediatamente para debugging
      console.log('Error occurred, but NOT redirecting for debugging');
      console.log('Would normally redirect to /proformas');
      // Comentado temporalmente para debugging:
      // navigate('/proformas');
    } finally {
      setLoadingProforma(false);
    }
  };

  // Handle products selected from productos disponibles modal
  const handleProductosSelected = (selectedProducts) => {
    // Add selected products to existing productos array
    setProductos(prevProductos => [...prevProductos, ...selectedProducts]);
  };

  const handleExportPDF = async () => {
    // Check if proforma is saved
    if (!savedProformaId) {
      toast({
        title: 'Información',
        description: 'Primero debe guardar la proforma antes de exportarla a PDF',
        variant: 'default'
      });
      return;
    }

    // Check if there are items in the proforma
    if (!productos || productos.length === 0) {
      toast({
        title: 'Información',
        description: 'La proforma debe tener al menos un producto/servicio para generar el PDF',
        variant: 'default'
      });
      return;
    }

    // Check if client is selected
    if (!cliente.id) {
      toast({
        title: 'Información',
        description: 'Debe seleccionar un cliente antes de generar el PDF',
        variant: 'default'
      });
      return;
    }

    // Show template selector
    setShowTemplateSelector(true);
  };

  const handleTemplateSelected = async (template) => {
    setLoadingPDF(true);
    try {
      await proformaService.generatePDF(savedProformaId, template);
      toast({
        title: 'Éxito',
        description: `PDF generado y descargado correctamente con plantilla ${template}`,
      });
      setShowTemplateSelector(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      let errorMessage = 'No se pudo generar el PDF. Por favor intente nuevamente.';
      
      if (error.response?.status === 404) {
        errorMessage = 'La proforma no fue encontrada en el servidor.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Error del servidor. Por favor contacte al administrador.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoadingPDF(false);
    }
  };

  const handlePreviewPDF = async () => {
    // Same validations as export
    if (!savedProformaId) {
      toast({
        title: 'Información',
        description: 'Primero debe guardar la proforma antes de previsualizarla',
        variant: 'default'
      });
      return;
    }

    if (!productos || productos.length === 0) {
      toast({
        title: 'Información',
        description: 'La proforma debe tener al menos un producto/servicio para previsualizar',
        variant: 'default'
      });
      return;
    }

    if (!cliente.id) {
      toast({
        title: 'Información',
        description: 'Debe seleccionar un cliente antes de previsualizar el PDF',
        variant: 'default'
      });
      return;
    }

    setLoadingPreview(true);
    try {
      await proformaService.previewPDF(savedProformaId, selectedTemplate);
      toast({
        title: 'Éxito',
        description: `Vista previa del PDF abierta en nueva pestaña (plantilla ${selectedTemplate})`,
      });
    } catch (error) {
      console.error('Error previewing PDF:', error);
      let errorMessage = 'No se pudo abrir la vista previa del PDF.';
      
      if (error.message.includes('ventanas emergentes')) {
        errorMessage = 'Por favor habilite las ventanas emergentes en su navegador para ver la vista previa.';
      } else if (error.response?.status === 404) {
        errorMessage = 'La proforma no fue encontrada en el servidor.';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSaveProforma = async () => {
    try {
      // Recopilar todos los errores de validación
      const validationErrors = [];
      const errors = {};
      
      // Validar campos obligatorios
      if (!cliente.id) {
        validationErrors.push('• Cliente: Debe seleccionar un cliente');
        errors.cliente = true;
      }

      if (!detallesProforma.nombre || detallesProforma.nombre.trim() === '') {
        validationErrors.push('• Nombre de proforma: Campo obligatorio');
        errors.nombre = true;
      }

      if (!detallesProforma.empresa) {
        validationErrors.push('• Empresa: Debe seleccionar una empresa');
        errors.empresa = true;
      }

      if (!detallesProforma.tipoContratacion) {
        validationErrors.push('• Tipo de contratación: Debe seleccionar un tipo');
        errors.tipoContratacion = true;
      }

      if (!detallesProforma.fechaEmision) {
        validationErrors.push('• Fecha de emisión: Campo obligatorio');
        errors.fechaEmision = true;
      }

      if (!detallesProforma.fechaVencimiento) {
        validationErrors.push('• Fecha de vencimiento: Campo obligatorio');
        errors.fechaVencimiento = true;
      }

      // Validar que fecha de vencimiento sea posterior a fecha de emisión
      if (detallesProforma.fechaEmision && detallesProforma.fechaVencimiento) {
        const emision = new Date(detallesProforma.fechaEmision);
        const vencimiento = new Date(detallesProforma.fechaVencimiento);
        if (vencimiento <= emision) {
          validationErrors.push('• Fecha de vencimiento debe ser posterior a la fecha de emisión');
          errors.fechaVencimiento = true;
        }
      }

      // Validar productos
      if (productos.length === 0) {
        validationErrors.push('• Productos: Debe agregar al menos un producto');
        errors.productos = true;
      } else {
        // Validar cada producto
        const productosConErrores = [];
        productos.forEach((producto, index) => {
          const productoErrors = [];
          let tieneError = false;
          
          if (!producto.codigo || (typeof producto.codigo === 'string' && producto.codigo.trim() === '')) {
            productoErrors.push('código');
            tieneError = true;
          }
          
          if (!producto.descripcion || (typeof producto.descripcion === 'string' && producto.descripcion.trim() === '')) {
            productoErrors.push('descripción');
            tieneError = true;
          }
          
          if (!producto.cantidad || producto.cantidad <= 0) {
            productoErrors.push('cantidad válida');
            tieneError = true;
          }
          
          // Check both possible field names for price
          const precio = producto.precioUnitario || producto.precio_unitario || 0;
          if (!precio || precio < 0) {
            productoErrors.push('precio unitario');
            tieneError = true;
          }
          
          if (productoErrors.length > 0) {
            validationErrors.push(`• Producto ${index + 1}: Falta ${productoErrors.join(', ')}`);
            productosConErrores.push(index);
          }
        });
        
        if (productosConErrores.length > 0) {
          errors.productosIndices = productosConErrores;
        }
      }

      // Validar totales
      if (totales.total <= 0) {
        validationErrors.push('• Total: El total de la proforma debe ser mayor a 0');
        errors.total = true;
      }

      // Si hay errores, mostrarlos todos
      if (validationErrors.length > 0) {
        setFieldErrors(errors); // Establecer los errores de campo
        
        toast({
          title: 'Errores de validación',
          description: (
            <div className="mt-2">
              <p className="font-medium mb-2">Por favor corrija los siguientes errores:</p>
              <div className="text-sm space-y-1">
                {validationErrors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            </div>
          ),
          variant: 'destructive',
          duration: 10000 // Mostrar por más tiempo para que el usuario pueda leer todos los errores
        });
        return;
      }

      // Limpiar errores si todo está bien
      setFieldErrors({});
      setLoading(true);

      // Format dates for backend
      const formatDateForBackend = (date) => {
        if (!date) return null;
        try {
          const dateObj = typeof date === 'string' ? new Date(date) : date;
          if (isNaN(dateObj.getTime())) return null;
          return format(dateObj, 'yyyy-MM-dd');
        } catch (error) {
          console.error('Error formatting date:', error);
          return null;
        }
      };

      // Safe parseInt function
      const safeParseInt = (value) => {
        const parsed = parseInt(value);
        return isNaN(parsed) ? null : parsed;
      };
      
      // Safe parseFloat function
      const safeParseFloat = (value) => {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
      };
      
      // Ensure string value (handle arrays and other types)
      const ensureString = (value, defaultValue = '') => {
        if (Array.isArray(value)) {
          return value.length > 0 ? String(value[0]) : defaultValue;
        }
        return String(value || defaultValue).trim();
      };

      // Prepare proforma data
      const proformaData = {
        nombre: ensureString(detallesProforma.nombre),
        fecha_emision: formatDateForBackend(detallesProforma.fechaEmision) || format(new Date(), 'yyyy-MM-dd'),
        fecha_vencimiento: formatDateForBackend(detallesProforma.fechaVencimiento) || format(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        cliente: safeParseInt(cliente.id),
        empresa: safeParseInt(detallesProforma.empresa),
        tipo_contratacion: safeParseInt(detallesProforma.tipoContratacion),
        atencion_a: ensureString(detallesProforma.atencion, 'N/A'), // Ensure it's never empty
        condiciones_pago: ensureString(detallesProforma.formaPago, '50% anticipo, 50% contra entrega'),
        tiempo_entrega: ensureString(detallesProforma.tiempoEntrega, '5 días hábiles'),
        porcentaje_impuesto: safeParseFloat(detallesProforma.porcentajeImpuesto) || 12,
        subtotal: safeParseFloat(totales.subtotal),
        impuesto: safeParseFloat(totales.iva),
        total: safeParseFloat(totales.total),
        notas: ensureString(notas),
        estado: 'borrador'
      };

      // Final validation - ensure no required fields are null
      if (!proformaData.cliente || !proformaData.empresa || !proformaData.tipo_contratacion) {
        toast({
          title: 'Error',
          description: 'Por favor complete todos los campos requeridos antes de guardar',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      // Create or update proforma
      let response;
      if (isEditMode && savedProformaId) {
        console.log('Updating existing proforma:', savedProformaId);
        response = await proformaService.updateProforma(savedProformaId, proformaData);
      } else {
        console.log('Creating new proforma');
        response = await proformaService.createProforma(proformaData);
      }
      
      if (!response || !response.id) {
        throw new Error('La respuesta del servidor no contiene el ID de la proforma');
      }

      // Save proforma items if any
      if (productos.length > 0) {
        const itemsToCreate = productos.map((producto, index) => {
          // Validar y asegurar que tenemos un unidad_id válido
          let unidadId = parseInt(producto.unidad_id);
          if (isNaN(unidadId) || unidadId <= 0) {
            console.warn(`Producto ${producto.codigo} sin unidad_id válido, usando valor por defecto 1`);
            unidadId = 1; // Valor por defecto - asegúrate de que existe una unidad con ID=1 en la BD
          }
          
          // Mapear campos correctamente entre frontend y backend
          const precioUnitario = parseFloat(producto.precioUnitario || producto.precio_unitario || producto.precio || 0);
          const porcentajeDescuento = parseFloat(producto.descuento || producto.porcentaje_descuento || 0);
          const cantidad = parseFloat(producto.cantidad || 1);
          
          // Calcular total si no viene calculado
          let total = parseFloat(producto.total || 0);
          if (total === 0) {
            const subtotal = cantidad * precioUnitario;
            const descuento = subtotal * (porcentajeDescuento / 100);
            total = subtotal - descuento;
          }
          
          // Determine correct type and IDs based on product data
          let tipoItem, productoDisponibleId, productoOfertadoId;
          
          // First priority: explicit tipo_item field
          if (producto.tipo_item === 'producto_disponible') {
            tipoItem = 'producto_disponible';
            productoDisponibleId = producto.producto_disponible_id || producto.id;
            productoOfertadoId = null;
          } else if (producto.tipo_item === 'producto_ofertado') {
            tipoItem = 'producto_ofertado';
            productoDisponibleId = null;
            productoOfertadoId = producto.producto_ofertado_id || producto.id;
          } 
          // Second priority: explicit ID fields
          else if (producto.producto_disponible_id) {
            tipoItem = 'producto_disponible';
            productoDisponibleId = producto.producto_disponible_id;
            productoOfertadoId = null;
          } else if (producto.producto_ofertado_id) {
            tipoItem = 'producto_ofertado';
            productoDisponibleId = null;
            productoOfertadoId = producto.producto_ofertado_id;
          } 
          // Third priority: check for specific properties that identify the type
          else if (producto.stock !== undefined || producto.precio_venta !== undefined || producto.unidad_presentacion !== undefined) {
            // This looks like a ProductoDisponible
            tipoItem = 'producto_disponible';
            productoDisponibleId = producto.id;
            productoOfertadoId = null;
          } else if (producto.precio_oferta !== undefined || producto.categoria !== undefined) {
            // This looks like a ProductoOfertado
            tipoItem = 'producto_ofertado';
            productoDisponibleId = null;
            productoOfertadoId = producto.id;
          } else {
            // Fallback for manually added items
            tipoItem = 'producto_disponible';
            productoDisponibleId = null;
            productoOfertadoId = null;
          }

          const itemData = {
            proforma: response.id,
            tipo_item: tipoItem,
            producto_disponible: productoDisponibleId,
            producto_ofertado: productoOfertadoId,
            codigo: producto.codigo || producto.code || '',
            descripcion: producto.descripcion || producto.nombre || '',
            unidad: unidadId,
            cantidad: cantidad,
            precio_unitario: precioUnitario,
            porcentaje_descuento: porcentajeDescuento,
            total: total,
            orden: index + 1
          };
          
          console.log(`[DEBUG] Item ${index + 1} data:`, itemData);
          console.log(`[DEBUG] Original product:`, producto);
          console.log(`[DEBUG] Determined type: ${tipoItem}, disponible_id: ${productoDisponibleId}, ofertado_id: ${productoOfertadoId}`);
          
          return itemData;
        });
        
        // Create items one by one to better handle errors
        let successCount = 0;
        let failedItems = [];
        
        for (let i = 0; i < itemsToCreate.length; i++) {
          try {
            const result = await proformaService.createProformaItem(itemsToCreate[i]);
            console.log(`[DEBUG] Item ${i + 1} created successfully:`, result);
            successCount++;
          } catch (itemError) {
            console.error(`[DEBUG] Error creating item ${i + 1}:`, itemError);
            
            let errorDetail = 'Error desconocido';
            if (itemError.response?.data) {
              if (typeof itemError.response.data === 'string') {
                errorDetail = itemError.response.data;
              } else if (itemError.response.data.detail) {
                errorDetail = itemError.response.data.detail;
              } else if (itemError.response.data.error) {
                errorDetail = itemError.response.data.error;
              } else {
                // Get first field error
                const firstError = Object.entries(itemError.response.data)[0];
                if (firstError) {
                  errorDetail = `${firstError[0]}: ${Array.isArray(firstError[1]) ? firstError[1].join(', ') : firstError[1]}`;
                }
              }
            }
            
            failedItems.push({
              index: i + 1,
              codigo: itemsToCreate[i].codigo,
              descripcion: itemsToCreate[i].descripcion,
              error: errorDetail
            });
          }
        }
        
        // Show results
        if (successCount === itemsToCreate.length) {
          console.log(`[DEBUG] All ${successCount} items created successfully`);
        } else if (failedItems.length > 0) {
          console.error(`[DEBUG] ${failedItems.length} items failed to create`);
          
          // Build error message
          const errorDetails = failedItems.map(item => 
            `• Item ${item.index} (${item.codigo}): ${item.error}`
          ).join('\n');
          
          toast({
            title: 'Advertencia',
            description: `La proforma se creó pero ${failedItems.length} de ${itemsToCreate.length} productos no se pudieron guardar:\n${errorDetails}`,
            variant: 'warning'
          });
        }
      }
      
      toast({
        title: 'Éxito',
        description: `Proforma ${response.numero || response.id} ${isEditMode ? 'actualizada' : 'creada'} correctamente`,
      });

      // Save the proforma ID for PDF generation
      setSavedProformaId(response.id);

      // Clear localStorage draft after successful save
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch (err) {
        console.warn('No se pudo limpiar el borrador', err);
      }
      
    } catch (error) {
      let errorMessage = 'No se pudo guardar la proforma';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.non_field_errors) {
          errorMessage = error.response.data.non_field_errors.join(', ');
        } else {
          // Show field-specific errors
          const fieldErrors = Object.entries(error.response.data)
            .map(([field, errors]) => {
              const errorText = Array.isArray(errors) ? errors.join(', ') : String(errors);
              // Translate field names to Spanish for better UX
              const fieldTranslations = {
                'atencion_a': 'Atención a',
                'fecha_emision': 'Fecha de emisión',
                'fecha_vencimiento': 'Fecha de vencimiento',
                'tipo_contratacion': 'Tipo de contratación',
                'condiciones_pago': 'Condiciones de pago',
                'tiempo_entrega': 'Tiempo de entrega',
                'porcentaje_impuesto': 'Porcentaje de impuesto'
              };
              const fieldName = fieldTranslations[field] || field;
              return `${fieldName}: ${errorText}`;
            })
            .join('; ');
          if (fieldErrors) {
            errorMessage = `Errores en los campos: ${fieldErrors}`;
          }
        }
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading when loading proforma for editing
  if (loadingProforma) {
    console.log('Rendering loading state for proforma editing...');
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-gray-500">Cargando proforma para edición...</p>
        <p className="text-xs text-gray-400">ID: {id} | Edit Mode: {isEditMode.toString()}</p>
      </div>
    );
  }

  console.log('Rendering main AddProformaPage component', {
    id,
    isEditMode,
    loadingProforma,
    savedProformaId
  });

  return (
    <>
      {showConfigForm && (
        <ConfiguracionProformaForm 
          onClose={() => setShowConfigForm(false)} 
          onSave={(data) => {
            console.log('Configuración guardada:', data);
            setConfigProformaData(data); // Actualiza el estado local
            // TODO: Aquí llamarías a tu API para persistir los datos
            // try {
            //   await proformaService.saveConfiguracion(data);
            //   toast({ title: 'Éxito', description: 'Configuración guardada correctamente.' });
            // } catch (error) {
            //   toast({ title: 'Error', description: 'No se pudo guardar la configuración.', variant: 'destructive' });
            // }
            setShowConfigForm(false);
          }}
          initialData={configProformaData || {}} // Pasa los datos existentes o un objeto vacío
        />
      )}
      <div className="space-y-6 p-6 bg-gray-50">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {isEditMode ? 'Editar Proforma' : 'Nueva Proforma'}
        </h1>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline"
            onClick={handleExportPDF}
            disabled={loadingPDF || !savedProformaId || !productos?.length || !cliente.id}
            title={
              !savedProformaId 
                ? "Primero debe guardar la proforma" 
                : !productos?.length 
                  ? "La proforma debe tener productos/servicios"
                  : !cliente.id
                    ? "Debe seleccionar un cliente"
                    : "Exportar proforma a PDF"
            }
          >
            {loadingPDF ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </>
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={handlePreviewPDF}
            disabled={loadingPreview || !savedProformaId || !productos?.length || !cliente.id}
            title={
              !savedProformaId 
                ? "Primero debe guardar la proforma" 
                : !productos?.length 
                  ? "La proforma debe tener productos/servicios"
                  : !cliente.id
                    ? "Debe seleccionar un cliente"
                    : "Ver vista previa del PDF"
            }
          >
            {loadingPreview ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Vista Previa
              </>
            )}
          </Button>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Compartir
          </Button>
          <Button variant="outline" onClick={() => setShowConfigForm(true)}>
            <Settings2 className="mr-2 h-4 w-4" />
            Configurar
          </Button>
          <Button variant="outline">
            <CheckSquare className="mr-2 h-4 w-4" />
            Generar
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowProformasGuardadas(true)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Guardadas
          </Button>
          <Button 
            onClick={handleSaveProforma}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white font-medium"
            title="Guardar proforma en el servidor"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Sub-header */}
      <div className="flex items-center justify-between">
        <span className="text-gray-600"># Se generará automáticamente</span>
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
          Válida hasta: {detallesProforma.fechaVencimiento ? format(detallesProforma.fechaVencimiento, 'd/M/yyyy') : 'No establecida'}
        </span>
      </div>

      {/* Información Base */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-blue-700" />
          <h2 className="text-lg font-semibold text-blue-900">Información Base</h2>
        </div>
        
        {/* Empresa, Tipo Contrato y Nombre de Proforma con layout alineado */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Empresa */}
            <div className="grid grid-cols-[140px,1fr] items-center gap-3">
              <label className="text-sm font-medium text-blue-800">
                Empresa: <span className="text-red-500">*</span>
              </label>
              <Select 
                value={detallesProforma.empresa?.toString() || ''}
                onValueChange={(value) => {
                  setDetallesProforma({...detallesProforma, empresa: value});
                  setFieldErrors(prev => ({...prev, empresa: false}));
                }}
              >
                <SelectTrigger className={`w-full bg-white h-8 text-sm ${fieldErrors.empresa ? 'border-red-500 focus:border-red-500' : 'border-blue-300'}`}>
                  <SelectValue placeholder="Seleccione una empresa" />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id.toString()}>
                      {empresa.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Tipo de Contrato */}
            <div className="grid grid-cols-[140px,1fr] items-center gap-3">
              <label className="text-sm font-medium text-blue-800">
                Tipo de Contrato: <span className="text-red-500">*</span>
              </label>
              <Select 
                value={detallesProforma.tipoContratacion?.toString() || ''}
                onValueChange={(value) => {
                  setDetallesProforma({...detallesProforma, tipoContratacion: parseInt(value)});
                  setFieldErrors(prev => ({...prev, tipoContratacion: false}));
                }}
              >
                <SelectTrigger className={`w-full bg-white h-8 text-sm ${fieldErrors.tipoContratacion ? 'border-red-500 focus:border-red-500' : 'border-blue-300'}`}>
                  <SelectValue placeholder="Seleccione tipo de contrato" />
                </SelectTrigger>
                <SelectContent>
                  {tiposContratacion.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id.toString()}>
                      {tipo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Nombre de Proforma */}
          <div className="grid grid-cols-[140px,1fr] items-center gap-3">
            <label className="text-sm font-medium text-blue-800">
              Nombre de Proforma: <span className="text-red-500">*</span>
            </label>
            <Input
              value={detallesProforma.nombre || ''}
              onChange={(e) => {
                setDetallesProforma({...detallesProforma, nombre: e.target.value});
                setFieldErrors(prev => ({...prev, nombre: false}));
              }}
              placeholder="Ingrese un nombre descriptivo para la proforma"
              className={`bg-white h-8 text-sm ${fieldErrors.nombre ? 'border-red-500 focus:border-red-500' : 'border-blue-300'}`}
            />
          </div>
        </div>
      </div>

      {/* Cliente + Detalles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cliente Section */}
        <ClienteSection 
          cliente={cliente} 
          onClienteChange={setCliente}
          hasError={fieldErrors.cliente}
          onErrorClear={() => setFieldErrors(prev => ({...prev, cliente: false}))}
        />

        {/* Detalles de Proforma Section */}
        <DetallesProformaSection 
          detalles={detallesProforma}
          onDetallesChange={setDetallesProforma}
          fieldErrors={fieldErrors}
          onFieldErrorClear={(field) => setFieldErrors(prev => ({...prev, [field]: false}))}
        />
      </div>

      {/* Herramientas */}
      <ToolBarSection 
        onSelectProducts={() => setShowProductosModal(true)}
      />

      {/* Tabla de Productos y Servicios */}
      <div className={fieldErrors.productos ? 'ring-2 ring-red-500 rounded-lg' : ''}>
        <ProductosServiciosTable 
          productos={productos}
          onProductosChange={setProductos}
          onTotalesChange={setTotales}
          productosConErrores={fieldErrors.productosIndices || []}
          onErrorClear={() => setFieldErrors(prev => ({...prev, productos: false, productosIndices: []}))}
        />
      </div>

      {/* Notas & Resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader className="py-3 px-4 bg-blue-300/20">
            <CardTitle className="flex items-center text-base font-bold">
              <Edit3 className="mr-2 h-4 w-4 text-blue-600" />
              Notas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full min-h-[80px] h-20"
              placeholder="Ingrese notas adicionales para la proforma"
            />
          </CardContent>
        </Card>

        <ResumenSection totales={totales} />
      </div>

      <p className="text-center text-sm text-gray-500">
        Gracias por su preferencia. Esta proforma no constituye una factura.
      </p>

      {/* Modal for selecting productos disponibles */}
      <ProductosDisponiblesSelectionModal
        isOpen={showProductosModal}
        onClose={() => setShowProductosModal(false)}
        onProductosSelected={handleProductosSelected}
      />
      
      {/* Modal for showing saved proformas */}
      <ProformasGuardadasModal
        isOpen={showProformasGuardadas}
        onClose={() => setShowProformasGuardadas(false)}
      />

      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelect={handleTemplateSelected}
        availableTemplates={availableTemplates}
        selectedTemplate={selectedTemplate}
        isGenerating={loadingPDF}
      />
    </div>
    </>
  );
}
