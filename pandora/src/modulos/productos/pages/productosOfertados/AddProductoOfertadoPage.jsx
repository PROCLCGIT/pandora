// /pandora/src/modulos/productos/pages/productosOfertados/AddProductoOfertadoPage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, Package, AlertTriangle, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Custom hooks
import useProductoOfertadoForm from '../../hooks/useProductoOfertadoForm';
import useImagenes from '../../hooks/useImagenes';
import useDocumentos from '../../hooks/useDocumentos';
import useProductoMutations from '../../hooks/useProductoMutations';

// Data services
import { useCategories } from '@/modulos/basic/api/categoriaService';
import { useEspecialidades } from '@/modulos/basic/api/especialidadService';

// Components
import InformacionProducto from '../../components/productoOfertado/InformacionProducto';
import ImagenesProducto from '../../components/productoOfertado/ImagenesProducto';
import DocumentosProducto from '../../components/productoOfertado/DocumentosProducto';

// Función de utilidad para logs solo en desarrollo
const debug = (...args) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

export default function AddProductoOfertadoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Inicializar hooks de imágenes y documentos
  const imagenesHook = useImagenes();
  const documentosHook = useDocumentos();
  
  // Inicializar hook del formulario, pasando setters para imágenes y documentos
  const formHook = useProductoOfertadoForm(
    id, 
    imagenesHook.setImagenes, 
    documentosHook.setDocumentos
  );
  
  // Valores del formulario para mostrar en tiempo real
  const formValues = formHook.watch();
  
  // Inicializar hook de mutaciones
  const mutationHook = useProductoMutations(id);
  
  // Cargar datos de categorías y especialidades
  const { data: categoriasData } = useCategories({ 
    page_size: 100,
    staleTime: 10 * 60 * 1000, // 10 minutos para reducir consultas duplicadas
    cacheTime: 15 * 60 * 1000, // 15 minutos de caché
  });
  
  const { data: especialidadesData } = useEspecialidades({ 
    page_size: 100,
    staleTime: 10 * 60 * 1000, // 10 minutos para reducir consultas duplicadas
    cacheTime: 15 * 60 * 1000, // 15 minutos de caché
  });
  
  // Calcular el progreso del formulario
  const requiredFields = ['code', 'cudim', 'nombre', 'id_categoria'];
  const completedRequiredFields = requiredFields.filter(field => formValues[field] && formValues[field].toString().trim() !== '').length;
  const formProgress = Math.round((completedRequiredFields / requiredFields.length) * 100);

  // Función que combina la preparación del formulario con el envío
  const onSubmit = async (data) => {
    // Preparar FormData con datos del formulario, imágenes y documentos
    const formData = formHook.prepareFormData(data, imagenesHook.imagenes, documentosHook.documentos);
    
    // Log de depuración solo en desarrollo
    debug('Formulario preparado para enviar', { data, formData })

    // Enviar FormData al servidor usando las mutaciones
    mutationHook.handleSubmit(formData);
  };

  // Mostrar indicador de carga si estamos en modo edición y los datos están cargando
  if (formHook.isEditing && formHook.isLoadingProducto) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[300px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          <p className="text-lg text-gray-700">Cargando información del producto...</p>
        </div>
      </div>
    );
  }

  // Renderizar formulario
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white transition-all duration-300">
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
                  onClick={() => navigate('/productos/productos-ofertados')}
                >
                  <ArrowLeft className="h-5 w-5 text-indigo-600" />
                </Button>
              </div>
              
              <div>
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">
                    {formHook.isEditing ? 'Editar Producto Ofertado' : 'Agregar Producto Ofertado'}
                  </h1>
                  <div className="ml-3">
                    <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 uppercase tracking-wide">
                      {formHook.isEditing ? 'Editando' : 'Nuevo'}
                    </span>
                  </div>
                </div>
                {formHook.isEditing && formHook.productoData && (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-slate-500">Código: <span className="font-medium">{formHook.productoData.code}</span></p>
                    <span className="text-gray-300">•</span>
                    <p className="text-sm text-slate-500">CUDIM: <span className="font-medium">{formHook.productoData.cudim}</span></p>
                    <span className="text-gray-300">•</span>
                    <Badge className={formHook.productoData.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {formHook.productoData.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                )}
                {!formHook.isEditing && (
                  <p className="text-sm text-slate-500 mt-0.5 max-w-2xl">
                    Complete los campos obligatorios y añada imágenes o documentación técnica
                  </p>
                )}
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
          <span>Productos Ofertados</span>
          <ChevronRight className="h-4 w-4 mx-1 text-slate-400" />
          <span className="text-indigo-600 font-semibold">{formHook.isEditing ? 'Editar' : 'Nuevo Producto'}</span>
        </div>

        {/* Mostrar alerta de error si es necesario */}
        {mutationHook.showErrorAlert && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              <p className="font-medium">Error al procesar el formulario</p>
            </div>
            <p className="mt-2">{mutationHook.errorMessage}</p>
            <div className="mt-3 flex">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="text-xs border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => mutationHook.setShowErrorAlert(false)}
              >
                Entendido
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={formHook.handleSubmit(onSubmit)} className="space-y-6">
          {/* Componente de Información del Producto */}
          <InformacionProducto 
            control={formHook.control}
            errors={formHook.errors}
            categoriasData={categoriasData}
            especialidadesData={especialidadesData}
            formValues={formValues}
          />
          
          {/* Panel de imágenes y documentos */}
          <div className="grid grid-cols-1 gap-6">
            {/* Componente de Imágenes del Producto */}
            <ImagenesProducto 
              {...imagenesHook}
            />
            
            {/* Componente de Documentos del Producto */}
            <DocumentosProducto 
              {...documentosHook}
            />
          </div>

          {/* Barra de acciones */}
          <div className="sticky bottom-4 py-4 z-10">
            <div className="bg-white backdrop-blur-md bg-opacity-95 p-4 rounded-xl shadow-lg border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-500 hidden md:block">
                {formHook.isEditing ? (
                  <div className="flex items-center">
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
                  onClick={() => navigate('/productos/productos-ofertados')}
                  disabled={mutationHook.isSubmitting}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                
                <Button
                  type="submit"
                  className="rounded-lg px-8 bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto shadow-md transition-all duration-300 hover:shadow-lg"
                  disabled={mutationHook.isSubmitting}
                >
                  {mutationHook.isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Guardando...
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {formHook.isEditing ? 'Actualizar Producto' : 'Guardar Producto'}
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