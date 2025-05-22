// /pandora/src/modulos/productos/pages/productosDisponibles/AddProductoDisponiblePage.jsx

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, X, ShoppingBag, Tag, Upload, 
  File, FilePlus, Trash, ImagePlus, FileText, DollarSign, 
  CheckCircle, AlertCircle, ChevronRight, Star, Eye
} from 'lucide-react';

// Función para generar código aleatorio de producto disponible
const generatePdisCode = () => {
  const randomNumber = Math.floor(Math.random() * 1000); // Genera un número entre 0 y 999
  const paddedNumber = randomNumber.toString().padStart(3, '0'); // Asegura que tenga 3 dígitos, ej: 007, 056, 123
  return `PDIS-${paddedNumber}`
};

// Importaciones para formularios
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Importaciones de servicios
import { 
  useProductoDisponibleById, 
  useCreateProductoDisponible, 
  useUpdateProductoDisponible 
} from '../../api/productoDisponibleService';
import { useProductosOfertados } from '../../api/productoOfertadoService';
import { useCategories } from '@/modulos/basic/api/categoriaService';
import { useMarcas } from '@/modulos/basic/api/marcaService';
import { useUnidades } from '@/modulos/basic/api/unidadService';
import { useProcedencias } from '@/modulos/basic/api/procedenciaService';

// Importaciones de componentes UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Esquema de validación
const productoDisponibleSchema = z.object({
  code: z.string().min(1, 'El código es obligatorio'),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  modelo: z.string().optional(),
  id_categoria: z.string().min(1, 'La categoría es obligatoria'),
  id_producto_ofertado: z.string().min(1, 'El producto ofertado es obligatorio'),
  id_marca: z.string().min(1, 'La marca es obligatoria'),
  unidad_presentacion: z.string().min(1, 'La unidad de presentación es obligatoria'),
  procedencia: z.string().min(1, 'La procedencia es obligatoria'),
  referencia: z.string().optional(),
  tz_oferta: z.coerce.number().optional().default(0),
  tz_demanda: z.coerce.number().optional().default(0),
  tz_inflacion: z.coerce.number().optional().default(0),
  tz_calidad: z.coerce.number().optional().default(0),
  tz_eficiencia: z.coerce.number().optional().default(0),
  tz_referencial: z.coerce.number().optional().default(0),
  costo_referencial: z.coerce.number().optional().default(0),
  precio_sie_referencial: z.coerce.number().optional().default(0),
  precio_sie_tipob: z.coerce.number().optional().default(0),
  precio_venta_privado: z.coerce.number().optional().default(0),
  is_active: z.boolean().default(true),
});

export default function AddProductoDisponiblePage() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Referencias para inputs de archivos
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);
  
  // Estados para imágenes y documentos
  const [imagenes, setImagenes] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [nuevaImagen, setNuevaImagen] = useState({
    file: null,
    descripcion: '',
    isPrimary: false
  });
  const [nuevoDocumento, setNuevoDocumento] = useState({
    file: null,
    tipo_documento: '',
    titulo: '',
    descripcion: '',
    isPublic: false
  });
  
  // Estado para controlar la pantalla completa del formulario
  const [formFullScreen, setFormFullScreen] = useState(false);

  // Estado para mostrar u ocultar campos opcionales
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  // React Query hooks para cargar datos
  const { data: productosOfertadosData } = useProductosOfertados({ page_size: 100 });
  const { data: categoriasData } = useCategories({ page_size: 100 });
  const { data: marcasData } = useMarcas({ page_size: 100 });
  const { data: unidadesData } = useUnidades({ page_size: 100 });
  const { data: procedenciasData } = useProcedencias({ page_size: 100 });

  // Hook para cargar datos del producto si es edición
  const { data: productoData, isLoading: isLoadingProducto } = useProductoDisponibleById(
    id, 
    { enabled: isEditing }
  );

  // React Hook Form
  const {
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(productoDisponibleSchema),
    defaultValues: {
      code: '',
      nombre: '',
      modelo: '',
      id_categoria: '',
      id_producto_ofertado: '',
      id_marca: '',
      unidad_presentacion: '',
      procedencia: '',
      referencia: '',
      tz_oferta: 0,
      tz_demanda: 0,
      tz_inflacion: 0,
      tz_calidad: 0,
      tz_eficiencia: 0,
      tz_referencial: 0,
      costo_referencial: 0,
      precio_sie_referencial: 0,
      precio_sie_tipob: 0,
      precio_venta_privado: 0,
      is_active: true,
    },
  });

  // Valores del formulario para mostrar en tiempo real
  const formValues = watch();

  // Calcular el progreso del formulario
  const requiredFields = ['code', 'nombre', 'id_categoria', 'id_producto_ofertado', 'id_marca', 'unidad_presentacion', 'procedencia'];
  const completedRequiredFields = requiredFields.filter(field => formValues[field] && formValues[field].toString().trim() !== '').length;
  const formProgress = Math.round((completedRequiredFields / requiredFields.length) * 100);

  // Efecto para generar código automáticamente al crear un nuevo producto
  useEffect(() => {
    if (!isEditing) {
      // Generar un código automático para nuevos productos
      setValue('code', generatePdisCode());
    }
  }, [isEditing, setValue]);
  
  // Efecto para cargar los datos en el formulario cuando se obtienen del API
  useEffect(() => {
    if (isEditing && productoData) {
      // Si es edición, siempre mostrar los campos opcionales
      setShowOptionalFields(true);
      
      // Convertir IDs a strings para los selects
      const formData = {
        ...productoData,
        id_categoria: productoData.id_categoria?.toString() || '',
        id_producto_ofertado: productoData.id_producto_ofertado?.toString() || '',
        id_marca: productoData.id_marca?.toString() || '',
        unidad_presentacion: productoData.unidad_presentacion?.toString() || '',
        procedencia: productoData.procedencia?.toString() || '',
      };
      reset(formData);
      
      // Cargar imágenes y documentos si existen
      if (productoData.imagenes) {
        setImagenes(productoData.imagenes);
      }
      if (productoData.documentos) {
        setDocumentos(productoData.documentos);
      }
    }
  }, [isEditing, productoData, reset]);

  // Mutaciones para crear/actualizar
  const createMutation = useCreateProductoDisponible({
    onSuccess: (data) => {
      toast({
        title: "Producto creado",
        description: "El producto ha sido creado correctamente",
      });
      navigate('/productos/productos-disponibles');
    },
    onError: (error) => {
      toast({
        title: "Error al crear el producto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useUpdateProductoDisponible({
    onSuccess: (data) => {
      toast({
        title: "Producto actualizado",
        description: "El producto ha sido actualizado correctamente",
      });
      navigate('/productos/productos-disponibles');
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar el producto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Funciones para gestionar imágenes
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNuevaImagen({
        ...nuevaImagen,
        file: file
      });
    }
  };
  
  const addImage = () => {
    if (!nuevaImagen.file) {
      toast({
        title: "Error",
        description: "Debes seleccionar una imagen",
        variant: "destructive",
      });
      return;
    }
    
    // Generar URL para vista previa
    const imageURL = URL.createObjectURL(nuevaImagen.file);
    
    // Añadir imagen al array
    const newImage = {
      id: `temp-${Date.now()}`,
      imagen: imageURL,
      file: nuevaImagen.file,
      descripcion: nuevaImagen.descripcion,
      is_primary: nuevaImagen.isPrimary,
      orden: imagenes.length
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
  
  const removeImage = (index) => {
    const updatedImages = [...imagenes];
    updatedImages.splice(index, 1);
    setImagenes(updatedImages);
  };
  
  const setPrimaryImage = (index) => {
    const updatedImages = imagenes.map((img, i) => ({
      ...img,
      is_primary: i === index
    }));
    setImagenes(updatedImages);
  };

  // Funciones para gestionar documentos
  const handleDocUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNuevoDocumento({
        ...nuevoDocumento,
        file: file
      });
    }
  };
  
  const addDocument = () => {
    if (!nuevoDocumento.file || !nuevoDocumento.titulo || !nuevoDocumento.tipo_documento) {
      toast({
        title: "Error",
        description: "Debes completar todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }
    
    // Añadir documento al array
    const newDocument = {
      id: `temp-${Date.now()}`,
      documento: nuevoDocumento.file.name,
      file: nuevoDocumento.file,
      tipo_documento: nuevoDocumento.tipo_documento,
      titulo: nuevoDocumento.titulo,
      descripcion: nuevoDocumento.descripcion,
      is_public: nuevoDocumento.isPublic
    };
    
    setDocumentos([...documentos, newDocument]);
    
    // Mostrar notificación de éxito
    toast({
      title: "Documento añadido",
      description: `${nuevoDocumento.tipo_documento}: ${nuevoDocumento.titulo}`,
      variant: "success",
    });
    
    // Resetear el formulario de documento
    setNuevoDocumento({
      file: null,
      tipo_documento: '',
      titulo: '',
      descripcion: '',
      isPublic: false
    });
    
    // Cerrar el diálogo
    setDocDialogOpen(false);
    
    // Resetear el input file
    if (docInputRef.current) {
      docInputRef.current.value = '';
    }
  };
  
  const removeDocument = (index) => {
    const updatedDocs = [...documentos];
    updatedDocs.splice(index, 1);
    setDocumentos(updatedDocs);
  };

  // Obtener nombre del producto ofertado seleccionado
  const getProductoOfertadoNombre = (id) => {
    const producto = productosOfertadosData?.results?.find(p => p.id.toString() === id);
    return producto ? producto.nombre : '';
  };

  // Manejar el envío del formulario
  const onSubmit = async (data) => {
    try {
      // Preparar datos para API incluyendo imágenes y documentos
      const formData = new FormData();
      
      // Añadir campos básicos
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
      
      // Añadir imágenes
      imagenes.forEach((img, index) => {
        if (img.file) {
          formData.append(`imagenes[${index}][imagen]`, img.file);
        } else {
          formData.append(`imagenes[${index}][imagen]`, img.imagen);
        }
        formData.append(`imagenes[${index}][descripcion]`, img.descripcion || '');
        formData.append(`imagenes[${index}][is_primary]`, img.is_primary);
        formData.append(`imagenes[${index}][orden]`, index);
      });
      
      // Añadir documentos
      documentos.forEach((doc, index) => {
        if (doc.file) {
          formData.append(`documentos[${index}][documento]`, doc.file);
        } else {
          formData.append(`documentos[${index}][documento]`, doc.documento);
        }
        formData.append(`documentos[${index}][tipo_documento]`, doc.tipo_documento);
        formData.append(`documentos[${index}][titulo]`, doc.titulo);
        formData.append(`documentos[${index}][descripcion]`, doc.descripcion || '');
        formData.append(`documentos[${index}][is_public]`, doc.is_public);
      });
      
      // Enviar datos al servidor
      if (isEditing) {
        await updateMutation.mutateAsync({ id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch (error) {
      // El error ya se maneja en los callbacks de las mutaciones
      console.error('Error en el formulario:', error);
    }
  };

  // Renderizar formulario
  return (
    <div className={`min-h-screen bg-gradient-to-b from-gray-50 to-white transition-all duration-300 ${formFullScreen ? 'p-0' : ''}`}>
      {/* Header con información del producto */}
      <div className="bg-white shadow-sm border-b border-indigo-100/40">
        <div className="container mx-auto px-4 sm:px-6 py-4 max-w-7xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 rounded-full bg-indigo-200 opacity-0 blur-md group-hover:opacity-30 transition-opacity"></div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="rounded-full bg-white shadow-sm z-10 relative hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-300" 
                  onClick={() => navigate('/productos/productos-disponibles')}
                >
                  <ArrowLeft className="h-5 w-5 text-indigo-600" />
                </Button>
              </div>
              
              <div>
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">
                    {isEditing ? 'Editar Producto Disponible' : 'Agregar Producto Disponible'}
                  </h1>
                  <div className="ml-3">
                    <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 uppercase tracking-wide">
                      {isEditing ? 'Editando' : 'Nuevo'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-500 mt-0.5 max-w-2xl">
                  {isEditing 
                    ? 'Actualice la información, imágenes o documentación del producto' 
                    : 'Complete los campos obligatorios y añada imágenes o documentación técnica'}
                </p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center">
              {/* Progreso de completado */}
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="block text-2xl font-bold text-indigo-600">{formProgress}%</span>
                    <span className="text-xs text-gray-500">Completado</span>
                  </div>
                </div>
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle 
                    className="text-gray-200" 
                    strokeWidth="8" 
                    stroke="currentColor" 
                    fill="transparent" 
                    r="40" 
                    cx="50" 
                    cy="50" 
                  />
                  <circle 
                    className="text-indigo-600 transition-all duration-1000 ease-in-out" 
                    strokeWidth="8" 
                    strokeDasharray={`${formProgress * 2.51} 251`}
                    strokeLinecap="round" 
                    stroke="currentColor" 
                    fill="transparent" 
                    r="40" 
                    cx="50" 
                    cy="50" 
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl transition-all duration-300">
        <div className="flex text-sm font-medium text-slate-500 mb-6 items-center">
          <span>Productos</span>
          <ChevronRight className="h-4 w-4 mx-1 text-slate-400" />
          <span>Productos Disponibles</span>
          <ChevronRight className="h-4 w-4 mx-1 text-slate-400" />
          <span className="text-indigo-600 font-semibold">{isEditing ? 'Editar' : 'Nuevo Producto'}</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información General Card */}
          <Card className="overflow-hidden border border-gray-200 shadow-md rounded-xl">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-indigo-600 p-2 rounded-lg mr-3 shadow-sm">
                    <ShoppingBag className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-gray-800">Información General</CardTitle>
                    <CardDescription className="text-gray-500">
                      Datos básicos del producto disponible
                    </CardDescription>
                  </div>
                </div>
                <div className="hidden sm:flex items-center text-sm text-gray-500">
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 mr-2">
                    {completedRequiredFields} de {requiredFields.length} completados
                  </Badge>
                  <span className="text-red-500 mr-1">*</span> Campos obligatorios
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white">
              {/* Columna 1 - Información Básica */}
              <div className="lg:col-span-5 space-y-5">
                <div className="flex items-center mb-4">
                  <div className="h-6 w-1 bg-indigo-600 rounded-full mr-2"></div>
                  <h3 className="text-md font-semibold text-gray-800">Identificación</h3>
                </div>

                {/* Código */}
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm font-medium flex items-center justify-between">
                    <span>Código <span className="text-red-500">*</span></span>
                    {formValues.code && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </Label>
                  <Controller
                    name="code"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        id="code" 
                        placeholder="Código del producto" 
                        {...field} 
                        className={errors.code ? "border-red-300 focus:ring-red-500" : ""}
                        readOnly={!isEditing} // Solo lectura para nuevos productos
                        title={!isEditing ? "El código se genera automáticamente" : ""}
                      />
                    )}
                  />
                  {errors.code && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.code.message}
                    </p>
                  )}
                </div>

                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-sm font-medium flex items-center justify-between">
                    <span>Nombre <span className="text-red-500">*</span></span>
                    {formValues.nombre && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </Label>
                  <Controller
                    name="nombre"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        id="nombre" 
                        placeholder="Nombre del producto" 
                        {...field} 
                        className={errors.nombre ? "border-red-300 focus:ring-red-500" : ""}
                      />
                    )}
                  />
                  {errors.nombre && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.nombre.message}
                    </p>
                  )}
                </div>
                
                {/* Producto Ofertado */}
                <div className="space-y-2">
                  <Label htmlFor="id_producto_ofertado" className="text-sm font-medium flex items-center justify-between">
                    <span>Producto Ofertado <span className="text-red-500">*</span></span>
                    {formValues.id_producto_ofertado && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </Label>
                  <Controller
                    name="id_producto_ofertado"
                    control={control}
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <SelectTrigger 
                          id="id_producto_ofertado"
                          className={errors.id_producto_ofertado ? "border-red-300 focus:ring-red-500" : ""}
                        >
                          <SelectValue placeholder="Selecciona un producto ofertado" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {productosOfertadosData?.results?.map(producto => (
                            <SelectItem key={producto.id} value={producto.id.toString()}>
                              <div className="flex items-center">
                                <Badge variant="outline" className="mr-2 text-xs">
                                  {producto.code}
                                </Badge>
                                {producto.nombre}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.id_producto_ofertado && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.id_producto_ofertado.message}
                    </p>
                  )}
                </div>

                {/* Categoría */}
                <div className="space-y-2">
                  <Label htmlFor="id_categoria" className="text-sm font-medium flex items-center justify-between">
                    <span>Categoría <span className="text-red-500">*</span></span>
                    {formValues.id_categoria && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </Label>
                  <Controller
                    name="id_categoria"
                    control={control}
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <SelectTrigger 
                          id="id_categoria"
                          className={errors.id_categoria ? "border-red-300 focus:ring-red-500" : ""}
                        >
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {categoriasData?.results?.map(categoria => (
                            <SelectItem key={categoria.id} value={categoria.id.toString()}>
                              {categoria.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.id_categoria && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.id_categoria.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Columna 2 - Especificaciones */}
              <div className="lg:col-span-4 space-y-5">
                <div className="flex items-center mb-4">
                  <div className="h-6 w-1 bg-blue-500 rounded-full mr-2"></div>
                  <h3 className="text-md font-semibold text-gray-800">Especificaciones</h3>
                </div>

                {/* Marca */}
                <div className="space-y-2">
                  <Label htmlFor="id_marca" className="text-sm font-medium flex items-center justify-between">
                    <span>Marca <span className="text-red-500">*</span></span>
                    {formValues.id_marca && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </Label>
                  <Controller
                    name="id_marca"
                    control={control}
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <SelectTrigger 
                          id="id_marca"
                          className={errors.id_marca ? "border-red-300 focus:ring-red-500" : ""}
                        >
                          <SelectValue placeholder="Selecciona una marca" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {marcasData?.results?.map(marca => (
                            <SelectItem key={marca.id} value={marca.id.toString()}>
                              {marca.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.id_marca && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.id_marca.message}
                    </p>
                  )}
                </div>

                {/* Modelo */}
                <div className="space-y-2">
                  <Label htmlFor="modelo" className="text-sm font-medium">Modelo</Label>
                  <Controller
                    name="modelo"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        id="modelo" 
                        placeholder="Modelo del producto" 
                        {...field} 
                      />
                    )}
                  />
                </div>

                {/* Unidad de Presentación */}
                <div className="space-y-2">
                  <Label htmlFor="unidad_presentacion" className="text-sm font-medium flex items-center justify-between">
                    <span>Unidad de Presentación <span className="text-red-500">*</span></span>
                    {formValues.unidad_presentacion && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </Label>
                  <Controller
                    name="unidad_presentacion"
                    control={control}
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <SelectTrigger 
                          id="unidad_presentacion"
                          className={errors.unidad_presentacion ? "border-red-300 focus:ring-red-500" : ""}
                        >
                          <SelectValue placeholder="Selecciona una unidad" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {unidadesData?.results?.map(unidad => (
                            <SelectItem key={unidad.id} value={unidad.id.toString()}>
                              {unidad.nombre} ({unidad.abreviatura})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.unidad_presentacion && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.unidad_presentacion.message}
                    </p>
                  )}
                </div>

                {/* Procedencia */}
                <div className="space-y-2">
                  <Label htmlFor="procedencia" className="text-sm font-medium flex items-center justify-between">
                    <span>Procedencia <span className="text-red-500">*</span></span>
                    {formValues.procedencia && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </Label>
                  <Controller
                    name="procedencia"
                    control={control}
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <SelectTrigger 
                          id="procedencia"
                          className={errors.procedencia ? "border-red-300 focus:ring-red-500" : ""}
                        >
                          <SelectValue placeholder="Selecciona la procedencia" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {procedenciasData?.results?.map(procedencia => (
                            <SelectItem key={procedencia.id} value={procedencia.id.toString()}>
                              {procedencia.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.procedencia && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.procedencia.message}
                    </p>
                  )}
                </div>
                
                {/* Referencia */}
                <div className="space-y-2">
                  <Label htmlFor="referencia" className="text-sm font-medium">Referencia</Label>
                  <Controller
                    name="referencia"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        id="referencia" 
                        placeholder="Referencia del producto" 
                        {...field} 
                      />
                    )}
                  />
                </div>
              </div>
              
              {/* Columna 3 - Precios y TZ */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center mb-4">
                  <div className="h-6 w-1 bg-emerald-500 rounded-full mr-2"></div>
                  <h3 className="text-md font-semibold text-gray-800 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-emerald-600" />
                    Precios y Tarifas
                  </h3>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700">Mostrar campos opcionales</span>
                    <div 
                      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${showOptionalFields ? 'bg-emerald-500 justify-end' : 'bg-gray-300 justify-start'}`}
                      onClick={() => setShowOptionalFields(!showOptionalFields)}
                    >
                      <div className="bg-white w-4 h-4 rounded-full shadow-md transform duration-300"></div>
                    </div>
                  </div>
                  
                  {!showOptionalFields && (
                    <div 
                      className="bg-gray-50 text-gray-500 text-sm p-4 rounded-lg border border-gray-200 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => setShowOptionalFields(true)}
                    >
                      <p>Los campos de precios y tarifas son opcionales</p>
                      <p className="text-indigo-600 font-medium mt-2">Haz clic para mostrar</p>
                    </div>
                  )}
                </div>
                
                {showOptionalFields && (
                  <>
                    {/* Precios */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1">
                        Precios
                      </h4>
                      
                      {/* Costo Referencial */}
                      <div className="space-y-2">
                        <Label htmlFor="costo_referencial" className="text-xs font-medium text-gray-600">Costo Referencial</Label>
                        <Controller
                          name="costo_referencial"
                          control={control}
                          render={({ field }) => (
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                $
                              </span>
                              <Input 
                                id="costo_referencial" 
                                type="number"
                                step="0.01"
                                placeholder="0.00" 
                                {...field} 
                                className="pl-7"
                              />
                            </div>
                          )}
                        />
                      </div>
                      
                      {/* Precio SIE Referencial */}
                      <div className="space-y-2">
                        <Label htmlFor="precio_sie_referencial" className="text-xs font-medium text-gray-600">Precio SIE Referencial</Label>
                        <Controller
                          name="precio_sie_referencial"
                          control={control}
                          render={({ field }) => (
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                $
                              </span>
                              <Input 
                                id="precio_sie_referencial" 
                                type="number"
                                step="0.01"
                                placeholder="0.00" 
                                {...field} 
                                className="pl-7"
                              />
                            </div>
                          )}
                        />
                      </div>
                      
                      {/* Precio SIE Tipo B */}
                      <div className="space-y-2">
                        <Label htmlFor="precio_sie_tipob" className="text-xs font-medium text-gray-600">Precio SIE Tipo B</Label>
                        <Controller
                          name="precio_sie_tipob"
                          control={control}
                          render={({ field }) => (
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                $
                              </span>
                              <Input 
                                id="precio_sie_tipob" 
                                type="number"
                                step="0.01"
                                placeholder="0.00" 
                                {...field} 
                                className="pl-7"
                              />
                            </div>
                          )}
                        />
                      </div>
                      
                      {/* Precio Venta Privado */}
                      <div className="space-y-2">
                        <Label htmlFor="precio_venta_privado" className="text-xs font-medium text-gray-600">Precio Venta Privado</Label>
                        <Controller
                          name="precio_venta_privado"
                          control={control}
                          render={({ field }) => (
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                $
                              </span>
                              <Input 
                                id="precio_venta_privado" 
                                type="number"
                                step="0.01"
                                placeholder="0.00" 
                                {...field} 
                                className="pl-7"
                              />
                            </div>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* TZ */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1 flex items-center">
                        <Tag className="h-4 w-4 mr-1 text-purple-600" />
                        TZ (%)
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {/* TZ Oferta */}
                        <div className="space-y-1">
                          <Label htmlFor="tz_oferta" className="text-xs font-medium text-gray-600">TZ Oferta</Label>
                          <Controller
                            name="tz_oferta"
                            control={control}
                            render={({ field }) => (
                              <div className="relative">
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                                  %
                                </span>
                                <Input 
                                  id="tz_oferta" 
                                  type="number"
                                  placeholder="0" 
                                  {...field} 
                                  className="pr-7"
                                />
                              </div>
                            )}
                          />
                        </div>
                        
                        {/* TZ Demanda */}
                        <div className="space-y-1">
                          <Label htmlFor="tz_demanda" className="text-xs font-medium text-gray-600">TZ Demanda</Label>
                          <Controller
                            name="tz_demanda"
                            control={control}
                            render={({ field }) => (
                              <div className="relative">
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                                  %
                                </span>
                                <Input 
                                  id="tz_demanda" 
                                  type="number"
                                  placeholder="0" 
                                  {...field} 
                                  className="pr-7"
                                />
                              </div>
                            )}
                          />
                        </div>
                        
                        {/* TZ Inflación */}
                        <div className="space-y-1">
                          <Label htmlFor="tz_inflacion" className="text-xs font-medium text-gray-600">TZ Inflación</Label>
                          <Controller
                            name="tz_inflacion"
                            control={control}
                            render={({ field }) => (
                              <div className="relative">
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                                  %
                                </span>
                                <Input 
                                  id="tz_inflacion" 
                                  type="number"
                                  placeholder="0" 
                                  {...field} 
                                  className="pr-7"
                                />
                              </div>
                            )}
                          />
                        </div>
                        
                        {/* TZ Calidad */}
                        <div className="space-y-1">
                          <Label htmlFor="tz_calidad" className="text-xs font-medium text-gray-600">TZ Calidad</Label>
                          <Controller
                            name="tz_calidad"
                            control={control}
                            render={({ field }) => (
                              <div className="relative">
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                                  %
                                </span>
                                <Input 
                                  id="tz_calidad" 
                                  type="number"
                                  placeholder="0" 
                                  {...field} 
                                  className="pr-7"
                                />
                              </div>
                            )}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {/* TZ Eficiencia */}
                        <div className="space-y-1">
                          <Label htmlFor="tz_eficiencia" className="text-xs font-medium text-gray-600">TZ Eficiencia</Label>
                          <Controller
                            name="tz_eficiencia"
                            control={control}
                            render={({ field }) => (
                              <div className="relative">
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                                  %
                                </span>
                                <Input 
                                  id="tz_eficiencia" 
                                  type="number"
                                  placeholder="0" 
                                  {...field} 
                                  className="pr-7"
                                />
                              </div>
                            )}
                          />
                        </div>
                        
                        {/* TZ Referencial */}
                        <div className="space-y-1">
                          <Label htmlFor="tz_referencial" className="text-xs font-medium text-gray-600">TZ Referencial</Label>
                          <Controller
                            name="tz_referencial"
                            control={control}
                            render={({ field }) => (
                              <div className="relative">
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                                  %
                                </span>
                                <Input 
                                  id="tz_referencial" 
                                  type="number"
                                  placeholder="0" 
                                  {...field} 
                                  className="pr-7"
                                />
                              </div>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Estado */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer">Estado</Label>
                    <Controller
                      name="is_active"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm ${field.value ? 'text-emerald-600' : 'text-gray-500'}`}>
                            {field.value ? 'Activo' : 'Inactivo'}
                          </span>
                          <div 
                            className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer ${field.value ? 'bg-emerald-500 justify-end' : 'bg-gray-300 justify-start'}`}
                            onClick={() => field.onChange(!field.value)}
                          >
                            <div className="bg-white w-3 h-3 rounded-full shadow-md"></div>
                          </div>
                        </div>
                      )}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Panel de imágenes y documentos */}
          <div className="grid grid-cols-1 gap-6">
            {/* Imágenes */}
            <Card className="overflow-hidden border border-gray-200 shadow-md rounded-xl h-full">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-indigo-500 p-2 rounded-lg mr-3 shadow-sm">
                      <ImagePlus className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-800">Imágenes del Producto</CardTitle>
                      <CardDescription className="text-gray-500">
                        Fotografías para presentación del producto
                      </CardDescription>
                    </div>
                  </div>
                  <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="rounded-full px-4 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                        <ImagePlus className="h-4 w-4 mr-2" />
                        Añadir Imagen
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Añadir Nueva Imagen</DialogTitle>
                        <DialogDescription>
                          Sube una imagen y añade los detalles necesarios
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="imagenFile">Imagen <span className="text-red-500">*</span></Label>
                          <Input 
                            id="imagenFile" 
                            type="file" 
                            accept="image/*"
                            ref={imageInputRef}
                            onChange={handleImageUpload}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="imagenDescripcion">Descripción</Label>
                          <Input 
                            id="imagenDescripcion" 
                            placeholder="Descripción breve de la imagen"
                            value={nuevaImagen.descripcion}
                            onChange={(e) => setNuevaImagen({...nuevaImagen, descripcion: e.target.value})}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="imagenPrimary" 
                            checked={nuevaImagen.isPrimary}
                            onCheckedChange={(checked) => setNuevaImagen({...nuevaImagen, isPrimary: checked})}
                          />
                          <Label htmlFor="imagenPrimary" className="cursor-pointer">Marcar como imagen principal</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setImageDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button 
                          type="button" 
                          onClick={addImage} 
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          disabled={!nuevaImagen.file}
                        >
                          Añadir imagen
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                {imagenes.length === 0 ? (
                  <div className="relative flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-indigo-100 rounded-lg bg-gray-50">
                    <div className="h-24 w-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                      <ImagePlus size={32} className="text-indigo-400" />
                    </div>
                    <p className="text-gray-700 font-medium text-lg">Aún no hay imágenes</p>
                    <p className="text-sm text-gray-500 mt-2 max-w-md">
                      Las imágenes de alta calidad mejoran la presentación y facilitan la identificación del producto
                    </p>
                    <Button
                      className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={() => setImageDialogOpen(true)}
                    >
                      <ImagePlus className="h-4 w-4 mr-2" />
                      Añadir primera imagen
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {imagenes.map((imagen, index) => (
                      <div 
                        key={imagen.id || index} 
                        className={`relative rounded-lg overflow-hidden border ${imagen.is_primary ? 'ring-2 ring-indigo-500 border-indigo-300' : 'border-gray-200'} transition-all hover:shadow-md bg-white`}
                      >
                        {imagen.is_primary && (
                          <div className="absolute top-2 left-2 z-10">
                            <Badge className="bg-indigo-600 text-white">
                              <Star className="h-3 w-3 mr-1 fill-white" /> Principal
                            </Badge>
                          </div>
                        )}
                        <div className="aspect-video relative bg-gray-100">
                          {imagen.imagen && (
                            <img 
                              src={typeof imagen.imagen === 'string' ? imagen.imagen : URL.createObjectURL(imagen.file)} 
                              alt={imagen.descripcion || `Imagen ${index + 1}`}
                              className="w-full h-full object-contain"
                            />
                          )}
                        </div>
                        <div className="p-3 border-t border-gray-100">
                          <div className="flex justify-between items-center">
                            <p className="font-medium truncate text-sm">
                              {imagen.descripcion || `Imagen ${index + 1}`}
                            </p>
                            <div className="flex space-x-1">
                              {!imagen.is_primary && (
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                                  onClick={() => setPrimaryImage(index)}
                                  title="Marcar como principal"
                                >
                                  <Star size={16} />
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => removeImage(index)}
                                title="Eliminar imagen"
                              >
                                <Trash size={16} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documentos */}
            <Card className="overflow-hidden border border-gray-200 shadow-md rounded-xl h-full">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-amber-500 p-2 rounded-lg mr-3 shadow-sm">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-800">Documentos del Producto</CardTitle>
                      <CardDescription className="text-gray-500">
                        Documentación técnica y certificados
                      </CardDescription>
                    </div>
                  </div>
                  <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="rounded-full px-4 bg-amber-600 hover:bg-amber-700 text-white shadow-sm">
                        <FilePlus className="h-4 w-4 mr-2" />
                        Añadir Documento
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Añadir Nuevo Documento</DialogTitle>
                        <DialogDescription>
                          Sube un documento y añade los detalles necesarios
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="docFile">Documento <span className="text-red-500">*</span></Label>
                          <Input 
                            id="docFile" 
                            type="file" 
                            ref={docInputRef}
                            onChange={handleDocUpload}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="docTipo">Tipo de Documento <span className="text-red-500">*</span></Label>
                          <Select 
                            onValueChange={(value) => setNuevoDocumento({...nuevoDocumento, tipo_documento: value})} 
                            value={nuevoDocumento.tipo_documento}
                          >
                            <SelectTrigger id="docTipo">
                              <SelectValue placeholder="Selecciona un tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Manual">Manual</SelectItem>
                              <SelectItem value="Ficha Técnica">Ficha Técnica</SelectItem>
                              <SelectItem value="Certificado">Certificado</SelectItem>
                              <SelectItem value="Instructivo">Instructivo</SelectItem>
                              <SelectItem value="Otro">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="docTitulo">Título <span className="text-red-500">*</span></Label>
                          <Input 
                            id="docTitulo" 
                            placeholder="Título del documento"
                            value={nuevoDocumento.titulo}
                            onChange={(e) => setNuevoDocumento({...nuevoDocumento, titulo: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="docDescripcion">Descripción</Label>
                          <Textarea 
                            id="docDescripcion" 
                            placeholder="Descripción del documento"
                            value={nuevoDocumento.descripcion}
                            onChange={(e) => setNuevoDocumento({...nuevoDocumento, descripcion: e.target.value})}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="docPublic" 
                            checked={nuevoDocumento.isPublic}
                            onCheckedChange={(checked) => setNuevoDocumento({...nuevoDocumento, isPublic: checked})}
                          />
                          <Label htmlFor="docPublic" className="cursor-pointer">
                            Documento público (visible para clientes)
                          </Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setDocDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button 
                          type="button" 
                          onClick={addDocument} 
                          className="bg-amber-600 hover:bg-amber-700 text-white"
                          disabled={!nuevoDocumento.file || !nuevoDocumento.titulo || !nuevoDocumento.tipo_documento}
                        >
                          Añadir documento
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                {documentos.length === 0 ? (
                  <div className="relative flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-amber-100 rounded-lg bg-gray-50">
                    <div className="h-24 w-24 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                      <FileText size={32} className="text-amber-400" />
                    </div>
                    <p className="text-gray-700 font-medium text-lg">Aún no hay documentos</p>
                    <p className="text-sm text-gray-500 mt-2 max-w-md">
                      Las fichas técnicas, manuales o certificados proporcionan información completa sobre el producto
                    </p>
                    <Button
                      className="mt-6 bg-amber-600 hover:bg-amber-700 text-white"
                      onClick={() => setDocDialogOpen(true)}
                    >
                      <FilePlus className="h-4 w-4 mr-2" />
                      Añadir primer documento
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Título</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Visibilidad</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documentos.map((doc, index) => (
                          <TableRow key={doc.id || index} className="hover:bg-gray-50">
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <File className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                                <span className="truncate max-w-[200px]">{doc.titulo}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-gray-50">
                                {doc.tipo_documento}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={doc.is_public 
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
                                  : "bg-amber-100 text-amber-800 border-amber-200"}
                              >
                                {doc.is_public ? 'Público' : 'Privado'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                                  title="Ver documento"
                                >
                                  <Eye size={16} />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => removeDocument(index)}
                                  title="Eliminar documento"
                                >
                                  <Trash size={16} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Barra de acciones */}
          <div className="sticky bottom-4 py-4 z-10">
            <div className="bg-white backdrop-blur-md bg-opacity-95 p-4 rounded-xl shadow-lg border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-500 hidden md:block">
                {isEditing ? (
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-indigo-600 mr-2" />
                    <span>Actualice los campos necesarios y guarde los cambios.</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></div>
                    <span>Complete los campos requeridos para crear un nuevo producto.</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-lg px-6 border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
                  onClick={() => navigate('/productos/productos-disponibles')}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                
                <Button
                  type="submit"
                  className="rounded-lg px-8 bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto shadow-md transition-all duration-300 hover:shadow-lg"
                  disabled={isSubmitting || (!isDirty && !imagenes.length && !documentos.length)}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Guardando...
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditing ? 'Actualizar Producto' : 'Guardar Producto'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}