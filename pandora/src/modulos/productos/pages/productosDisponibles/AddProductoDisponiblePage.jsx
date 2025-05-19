// /pandora/src/modulos/productos/pages/productosDisponibles/AddProductoDisponiblePage.jsx

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, ShoppingBag, Tag, Upload, File, FilePlus, Trash, ImagePlus, FileText, DollarSign } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('general');
  
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
    formState: { errors, isSubmitting },
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

  // Efecto para cargar los datos en el formulario cuando se obtienen del API
  useEffect(() => {
    if (isEditing && productoData) {
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
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/productos/productos-disponibles')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Editar Producto Disponible' : 'Agregar Producto Disponible'}
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="general">Información General</TabsTrigger>
            <TabsTrigger value="precios">Precios y TZ</TabsTrigger>
            <TabsTrigger value="imagenes">Imágenes</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
          </TabsList>

          {/* Pestaña de Información General */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
                <CardDescription>
                  Datos básicos del producto disponible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Código */}
                  <div className="space-y-2">
                    <Label htmlFor="code">Código <span className="text-red-500">*</span></Label>
                    <Controller
                      name="code"
                      control={control}
                      render={({ field }) => (
                        <Input 
                          id="code" 
                          placeholder="Código del producto" 
                          {...field} 
                          error={errors.code?.message}
                        />
                      )}
                    />
                    {errors.code && (
                      <p className="text-sm text-red-500">{errors.code.message}</p>
                    )}
                  </div>

                  {/* Nombre */}
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre <span className="text-red-500">*</span></Label>
                    <Controller
                      name="nombre"
                      control={control}
                      render={({ field }) => (
                        <Input 
                          id="nombre" 
                          placeholder="Nombre del producto" 
                          {...field} 
                          error={errors.nombre?.message}
                        />
                      )}
                    />
                    {errors.nombre && (
                      <p className="text-sm text-red-500">{errors.nombre.message}</p>
                    )}
                  </div>

                  {/* Producto Ofertado */}
                  <div className="space-y-2">
                    <Label htmlFor="id_producto_ofertado">Producto Ofertado <span className="text-red-500">*</span></Label>
                    <Controller
                      name="id_producto_ofertado"
                      control={control}
                      render={({ field }) => (
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <SelectTrigger id="id_producto_ofertado">
                            <SelectValue placeholder="Selecciona un producto ofertado" />
                          </SelectTrigger>
                          <SelectContent>
                            {productosOfertadosData?.results?.map(producto => (
                              <SelectItem key={producto.id} value={producto.id.toString()}>
                                {producto.code} - {producto.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.id_producto_ofertado && (
                      <p className="text-sm text-red-500">{errors.id_producto_ofertado.message}</p>
                    )}
                  </div>

                  {/* Categoría */}
                  <div className="space-y-2">
                    <Label htmlFor="id_categoria">Categoría <span className="text-red-500">*</span></Label>
                    <Controller
                      name="id_categoria"
                      control={control}
                      render={({ field }) => (
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <SelectTrigger id="id_categoria">
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                          <SelectContent>
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
                      <p className="text-sm text-red-500">{errors.id_categoria.message}</p>
                    )}
                  </div>

                  {/* Marca */}
                  <div className="space-y-2">
                    <Label htmlFor="id_marca">Marca <span className="text-red-500">*</span></Label>
                    <Controller
                      name="id_marca"
                      control={control}
                      render={({ field }) => (
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <SelectTrigger id="id_marca">
                            <SelectValue placeholder="Selecciona una marca" />
                          </SelectTrigger>
                          <SelectContent>
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
                      <p className="text-sm text-red-500">{errors.id_marca.message}</p>
                    )}
                  </div>

                  {/* Modelo */}
                  <div className="space-y-2">
                    <Label htmlFor="modelo">Modelo</Label>
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
                    <Label htmlFor="unidad_presentacion">Unidad de Presentación <span className="text-red-500">*</span></Label>
                    <Controller
                      name="unidad_presentacion"
                      control={control}
                      render={({ field }) => (
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <SelectTrigger id="unidad_presentacion">
                            <SelectValue placeholder="Selecciona una unidad" />
                          </SelectTrigger>
                          <SelectContent>
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
                      <p className="text-sm text-red-500">{errors.unidad_presentacion.message}</p>
                    )}
                  </div>

                  {/* Procedencia */}
                  <div className="space-y-2">
                    <Label htmlFor="procedencia">Procedencia <span className="text-red-500">*</span></Label>
                    <Controller
                      name="procedencia"
                      control={control}
                      render={({ field }) => (
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <SelectTrigger id="procedencia">
                            <SelectValue placeholder="Selecciona la procedencia" />
                          </SelectTrigger>
                          <SelectContent>
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
                      <p className="text-sm text-red-500">{errors.procedencia.message}</p>
                    )}
                  </div>

                  {/* Referencia */}
                  <div className="space-y-2">
                    <Label htmlFor="referencia">Referencia</Label>
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

                  {/* Activo */}
                  <div className="space-y-2 flex items-center">
                    <div className="flex items-center space-x-2">
                      <Controller
                        name="is_active"
                        control={control}
                        render={({ field }) => (
                          <Checkbox 
                            id="is_active" 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <Label htmlFor="is_active" className="cursor-pointer">Activo</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de Precios y TZ */}
          <TabsContent value="precios">
            <Card>
              <CardHeader>
                <CardTitle>Precios y TZ</CardTitle>
                <CardDescription>
                  Datos de precios y tarifas de comercialización (TZ)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Precios */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                      Precios
                    </h3>
                    
                    {/* Costo Referencial */}
                    <div className="space-y-2">
                      <Label htmlFor="costo_referencial">Costo Referencial</Label>
                      <Controller
                        name="costo_referencial"
                        control={control}
                        render={({ field }) => (
                          <Input 
                            id="costo_referencial" 
                            type="number"
                            step="0.01"
                            placeholder="0.00" 
                            {...field} 
                          />
                        )}
                      />
                    </div>
                    
                    {/* Precio SIE Referencial */}
                    <div className="space-y-2">
                      <Label htmlFor="precio_sie_referencial">Precio SIE Referencial</Label>
                      <Controller
                        name="precio_sie_referencial"
                        control={control}
                        render={({ field }) => (
                          <Input 
                            id="precio_sie_referencial" 
                            type="number"
                            step="0.01"
                            placeholder="0.00" 
                            {...field} 
                          />
                        )}
                      />
                    </div>
                    
                    {/* Precio SIE Tipo B */}
                    <div className="space-y-2">
                      <Label htmlFor="precio_sie_tipob">Precio SIE Tipo B</Label>
                      <Controller
                        name="precio_sie_tipob"
                        control={control}
                        render={({ field }) => (
                          <Input 
                            id="precio_sie_tipob" 
                            type="number"
                            step="0.01"
                            placeholder="0.00" 
                            {...field} 
                          />
                        )}
                      />
                    </div>
                    
                    {/* Precio Venta Privado */}
                    <div className="space-y-2">
                      <Label htmlFor="precio_venta_privado">Precio Venta Privado</Label>
                      <Controller
                        name="precio_venta_privado"
                        control={control}
                        render={({ field }) => (
                          <Input 
                            id="precio_venta_privado" 
                            type="number"
                            step="0.01"
                            placeholder="0.00" 
                            {...field} 
                          />
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* TZ */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <Tag className="h-5 w-5 mr-2 text-purple-600" />
                      Tarifas TZ (%)
                    </h3>
                    
                    {/* TZ Oferta */}
                    <div className="space-y-2">
                      <Label htmlFor="tz_oferta">TZ Oferta</Label>
                      <Controller
                        name="tz_oferta"
                        control={control}
                        render={({ field }) => (
                          <Input 
                            id="tz_oferta" 
                            type="number"
                            placeholder="0" 
                            {...field} 
                          />
                        )}
                      />
                    </div>
                    
                    {/* TZ Demanda */}
                    <div className="space-y-2">
                      <Label htmlFor="tz_demanda">TZ Demanda</Label>
                      <Controller
                        name="tz_demanda"
                        control={control}
                        render={({ field }) => (
                          <Input 
                            id="tz_demanda" 
                            type="number"
                            placeholder="0" 
                            {...field} 
                          />
                        )}
                      />
                    </div>
                    
                    {/* TZ Inflación */}
                    <div className="space-y-2">
                      <Label htmlFor="tz_inflacion">TZ Inflación</Label>
                      <Controller
                        name="tz_inflacion"
                        control={control}
                        render={({ field }) => (
                          <Input 
                            id="tz_inflacion" 
                            type="number"
                            placeholder="0" 
                            {...field} 
                          />
                        )}
                      />
                    </div>
                    
                    {/* TZ Calidad */}
                    <div className="space-y-2">
                      <Label htmlFor="tz_calidad">TZ Calidad</Label>
                      <Controller
                        name="tz_calidad"
                        control={control}
                        render={({ field }) => (
                          <Input 
                            id="tz_calidad" 
                            type="number"
                            placeholder="0" 
                            {...field} 
                          />
                        )}
                      />
                    </div>
                    
                    {/* TZ Eficiencia */}
                    <div className="space-y-2">
                      <Label htmlFor="tz_eficiencia">TZ Eficiencia</Label>
                      <Controller
                        name="tz_eficiencia"
                        control={control}
                        render={({ field }) => (
                          <Input 
                            id="tz_eficiencia" 
                            type="number"
                            placeholder="0" 
                            {...field} 
                          />
                        )}
                      />
                    </div>
                    
                    {/* TZ Referencial */}
                    <div className="space-y-2">
                      <Label htmlFor="tz_referencial">TZ Referencial</Label>
                      <Controller
                        name="tz_referencial"
                        control={control}
                        render={({ field }) => (
                          <Input 
                            id="tz_referencial" 
                            type="number"
                            placeholder="0" 
                            {...field} 
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de Imágenes */}
          <TabsContent value="imagenes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Imágenes del Producto</CardTitle>
                  <CardDescription>
                    Añade imágenes de referencia para el producto disponible
                  </CardDescription>
                </div>
                <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
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
                        <Label htmlFor="imagenPrimary" className="cursor-pointer">Imagen principal</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setImageDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="button" onClick={addImage}>
                        Añadir
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {imagenes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ImagePlus size={48} className="text-gray-300 mb-4" />
                    <p className="text-muted-foreground">Aún no hay imágenes para este producto</p>
                    <p className="text-sm text-muted-foreground">
                      Haz clic en "Añadir Imagen" para subir imágenes
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {imagenes.map((imagen, index) => (
                      <div 
                        key={imagen.id || index} 
                        className={`relative rounded-md border overflow-hidden ${imagen.is_primary ? 'ring-2 ring-indigo-500' : ''}`}
                      >
                        <div className="aspect-video relative bg-gray-100">
                          {imagen.imagen && (
                            <img 
                              src={typeof imagen.imagen === 'string' ? imagen.imagen : URL.createObjectURL(imagen.file)} 
                              alt={imagen.descripcion || `Imagen ${index + 1}`}
                              className="w-full h-full object-contain"
                            />
                          )}
                        </div>
                        <div className="p-3 bg-white">
                          <p className="font-medium truncate">{imagen.descripcion || `Imagen ${index + 1}`}</p>
                          <div className="flex justify-between items-center mt-2">
                            {imagen.is_primary ? (
                              <span className="text-xs bg-indigo-100 text-indigo-800 rounded-full px-2 py-1">
                                Principal
                              </span>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setPrimaryImage(index)}
                              >
                                Marcar como principal
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removeImage(index)}
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de Documentos */}
          <TabsContent value="documentos">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Documentos del Producto</CardTitle>
                  <CardDescription>
                    Añade documentos técnicos, manuales u otros archivos relacionados
                  </CardDescription>
                </div>
                <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
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
                      <Button type="button" onClick={addDocument}>
                        Añadir
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {documentos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FileText size={48} className="text-gray-300 mb-4" />
                    <p className="text-muted-foreground">Aún no hay documentos para este producto</p>
                    <p className="text-sm text-muted-foreground">
                      Haz clic en "Añadir Documento" para subir documentos
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documentos.map((doc, index) => (
                        <TableRow key={doc.id || index}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <File className="h-4 w-4 mr-2 text-gray-500" />
                              {doc.titulo}
                            </div>
                          </TableCell>
                          <TableCell>{doc.tipo_documento}</TableCell>
                          <TableCell>
                            <span 
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                doc.is_public 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {doc.is_public ? 'Público' : 'Privado'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removeDocument(index)}
                            >
                              <Trash size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/productos/productos-disponibles')}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
          </Button>
        </div>
      </form>
    </div>
  );
}