// /pandora/src/modulos/productos/pages/productosDisponibles/AddProductoDisponiblePageRefactored.jsx

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingBag, ChevronRight, DollarSign
} from 'lucide-react';

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
import { useEspecialidades } from '@/modulos/basic/api/especialidadService';

// Importaciones de componentes
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Importaciones de hooks personalizados
import { useProductForm } from '../../hooks/useProductForm';
import { useCodeGeneration } from '../../hooks/useCodeGeneration';
import { useMediaManagement } from '../../hooks/useMediaManagement';

// Importaciones de componentes de formulario
import { GeneralInfoSection } from '../../components/form/GeneralInfoSection';
import { PricesSection } from '../../components/form/PricesSection';
import { ImagesPanel } from '../../components/form/ImagesPanel';
import { DocumentsPanel } from '../../components/form/DocumentsPanel';
import { ActionBar } from '../../components/form/ActionBar';

export default function AddProductoDisponiblePage() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  // React Query hooks para cargar datos
  const { data: productosOfertadosData } = useProductosOfertados({ page_size: 100 });
  const { data: categoriasData } = useCategories({ page_size: 100 });
  const { data: marcasData } = useMarcas({ page_size: 100 });
  const { data: unidadesData } = useUnidades({ page_size: 100 });
  const { data: procedenciasData } = useProcedencias({ page_size: 100 });
  const { data: especialidadesData } = useEspecialidades({ page_size: 100 });

  // Hook para cargar datos del producto si es edición
  const { data: productoData, isLoading: isLoadingProducto } = useProductoDisponibleById(
    id, 
    { enabled: isEditing }
  );

  // Hook personalizado para el formulario
  const {
    handleSubmit,
    control,
    setValue,
    errors,
    isSubmitting,
    isDirty,
    formValues,
    formProgress,
    showOptionalFields,
    setShowOptionalFields,
    isManualCodeMode,
    setIsManualCodeMode,
    requiredFields,
    completedRequiredFields,
    toast
  } = useProductForm(isEditing, productoData);

  // Hook para generación de códigos
  const {
    enableManualMode,
    enableAutoMode
  } = useCodeGeneration(
    formValues, 
    categoriasData, 
    isEditing, 
    isManualCodeMode, 
    setValue, 
    toast
  );

  // Hook para manejo de imágenes y documentos
  const {
    imagenes,
    setImagenes,
    documentos,
    setDocumentos,
    imageDialogOpen,
    setImageDialogOpen,
    docDialogOpen,
    setDocDialogOpen,
    nuevaImagen,
    setNuevaImagen,
    nuevoDocumento,
    setNuevoDocumento,
    handleImageUpload,
    addImage,
    removeImage,
    setPrimaryImage,
    handleDocUpload,
    addDocument,
    removeDocument
  } = useMediaManagement(toast);

  // Efecto para cargar imágenes y documentos en modo edición
  useEffect(() => {
    if (isEditing && productoData) {
      if (productoData.imagenes) {
        setImagenes(productoData.imagenes);
      }
      if (productoData.documentos) {
        setDocumentos(productoData.documentos);
      }
    }
  }, [isEditing, productoData, setImagenes, setDocumentos]);

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

  // Función para manejar el modo manual
  const handleEnableManualMode = () => {
    setIsManualCodeMode(true);
    enableManualMode();
  };

  // Función para manejar el modo automático
  const handleEnableAutoMode = () => {
    setIsManualCodeMode(false);
    enableAutoMode();
  };

  // Manejar el envío del formulario
  const onSubmit = async (data) => {
    console.log('🎯 onSubmit function called!');
    console.log('🎯 isSubmitting state:', isSubmitting);
    console.log('🎯 createMutation state:', {
      isLoading: createMutation.isLoading,
      isError: createMutation.isError,
      error: createMutation.error
    });
    
    try {
      console.log('=== SUBMIT PRODUCTO DISPONIBLE ===');
      console.log('Form data received:', data);
      console.log('Imagenes:', imagenes);
      console.log('Documentos:', documentos);
      
      // Preparar datos para API incluyendo imágenes y documentos
      const formData = new FormData();
      
      // Añadir campos básicos
      Object.keys(data).forEach(key => {
        const value = data[key];
        
        // Campos requeridos: siempre enviar aunque estén vacíos (el backend dará error de validación)
        const requiredFields = ['code', 'nombre', 'id_categoria', 'modelo'];
        
        // Campos que pueden ser null pero deben enviarse si están definidos
        const nullableFields = ['id_producto_ofertado', 'id_marca', 'unidad_presentacion', 'procedencia', 'id_especialidad'];
        
        if (requiredFields.includes(key)) {
          // Campos requeridos: enviar siempre
          const finalValue = value || '';
          formData.append(key, finalValue);
          console.log(`✓ Campo requerido añadido: ${key} = "${finalValue}"`);
        } else if (nullableFields.includes(key)) {
          // Campos nullable: enviar solo si tienen valor válido
          // Tratar "none" como valor vacío (usado para evitar warnings en SelectItem)
          if (value !== null && value !== undefined && value !== '' && value !== 'none') {
            formData.append(key, value);
            console.log(`✓ Campo nullable añadido: ${key} = "${value}"`);
          } else {
            console.log(`⚪ Campo nullable omitido: ${key} (valor: ${value})`);
          }
        } else {
          // Otros campos: enviar si tienen valor
          // Tratar "none" como valor vacío (usado para evitar warnings en SelectItem)
          if (value !== null && value !== undefined && value !== '' && value !== 'none') {
            formData.append(key, value);
            console.log(`✓ Campo opcional añadido: ${key} = "${value}"`);
          } else if (typeof value === 'number' || typeof value === 'boolean') {
            // Números y booleanos siempre se envían
            formData.append(key, value);
            console.log(`✓ Campo numérico/booleano añadido: ${key} = ${value}`);
          } else {
            console.log(`⚪ Campo opcional omitido: ${key} (valor: ${value})`);
          }
        }
      });
      
      // Añadir imágenes en el formato esperado por el backend
      imagenes.forEach((img, index) => {
        if (img.file) {
          // Añadir archivo de imagen
          formData.append('uploaded_images', img.file);
          // Añadir metadatos
          formData.append('image_descriptions', img.descripcion || '');
          formData.append('image_is_primary', img.is_primary ? 'true' : 'false');
          formData.append('image_orden', index.toString());
        }
      });
      
      // Añadir documentos en el formato esperado por el backend
      documentos.forEach((doc, index) => {
        if (doc.file) {
          // Añadir archivo de documento
          formData.append('uploaded_documents', doc.file);
          // Añadir metadatos
          formData.append('document_titles', doc.titulo || '');
          formData.append('document_types', doc.tipo_documento || 'otros');
          formData.append('document_descriptions', doc.descripcion || '');
        }
      });
      
      // Para edición, mantener track de imágenes y documentos existentes
      if (isEditing) {
        const existingImageIds = imagenes.filter(img => img.id && !img.file).map(img => img.id);
        const existingDocumentIds = documentos.filter(doc => doc.id && !doc.file).map(doc => doc.id);
        
        if (existingImageIds.length > 0) {
          formData.append('existing_images', JSON.stringify(existingImageIds));
        }
        if (existingDocumentIds.length > 0) {
          formData.append('existing_documents', JSON.stringify(existingDocumentIds));
        }
      }
      
      // Log del FormData antes del envío
      console.log('📤 FormData entries antes del envío:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: [File] ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }
      
      // Enviar datos al servidor
      console.log(`🚀 Enviando ${isEditing ? 'UPDATE' : 'CREATE'} request...`);
      if (isEditing) {
        await updateMutation.mutateAsync({ id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      
      console.log('✅ Producto guardado exitosamente');
      
    } catch (error) {
      console.error('❌ Error en el formulario:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
  };

  // Función para cancelar
  const handleCancel = () => {
    navigate('/productos/productos-disponibles');
  };

  // Renderizar formulario
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
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
                  onClick={handleCancel}
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
      
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
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
            <CardContent className="p-6 bg-white">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Información General - Ahora incluye todas las especificaciones */}
                <GeneralInfoSection 
                  control={control}
                  errors={errors}
                  formValues={formValues}
                  isEditing={isEditing}
                  isManualCodeMode={isManualCodeMode}
                  enableManualMode={handleEnableManualMode}
                  enableAutoMode={handleEnableAutoMode}
                  categoriasData={categoriasData}
                  productosOfertadosData={productosOfertadosData}
                  marcasData={marcasData}
                  unidadesData={unidadesData}
                  procedenciasData={procedenciasData}
                  especialidadesData={especialidadesData}
                  setValue={setValue}
                />
              </div>
            </CardContent>
          </Card>

          {/* Precios y Tarifas Card */}
          <Card className="overflow-hidden border border-gray-200 shadow-md rounded-xl">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-emerald-600 p-2 rounded-lg mr-3 shadow-sm">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-gray-800">Precios y Tarifas</CardTitle>
                    <CardDescription className="text-gray-500">
                      Configuración de precios y tiempo de entrega
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <PricesSection 
                control={control}
                showOptionalFields={showOptionalFields}
                setShowOptionalFields={setShowOptionalFields}
              />
            </CardContent>
          </Card>
          
          {/* Panel de imágenes y documentos */}
          <div className="grid grid-cols-1 gap-6">
            {/* Imágenes */}
            <ImagesPanel 
              imagenes={imagenes}
              setImagenes={setImagenes}
              imageDialogOpen={imageDialogOpen}
              setImageDialogOpen={setImageDialogOpen}
              nuevaImagen={nuevaImagen}
              setNuevaImagen={setNuevaImagen}
              handleImageUpload={handleImageUpload}
              addImage={addImage}
              removeImage={removeImage}
              setPrimaryImage={setPrimaryImage}
            />

            {/* Documentos */}
            <DocumentsPanel 
              documentos={documentos}
              setDocumentos={setDocumentos}
              docDialogOpen={docDialogOpen}
              setDocDialogOpen={setDocDialogOpen}
              nuevoDocumento={nuevoDocumento}
              setNuevoDocumento={setNuevoDocumento}
              handleDocUpload={handleDocUpload}
              addDocument={addDocument}
              removeDocument={removeDocument}
            />
          </div>

          {/* Barra de acciones */}
          <ActionBar 
            isEditing={isEditing}
            isManualCodeMode={isManualCodeMode}
            isSubmitting={isSubmitting}
            isDirty={isDirty}
            imagenes={imagenes}
            documentos={documentos}
            onCancel={handleCancel}
          />
        </form>
      </div>
    </div>
  );
}