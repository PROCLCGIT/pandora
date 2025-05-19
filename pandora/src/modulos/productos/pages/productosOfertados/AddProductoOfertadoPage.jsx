// /pandora/src/modulos/productos/pages/productosOfertados/AddProductoOfertadoPage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, Package, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/productos/productos-ofertados')}
              className="rounded-full hover:bg-slate-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <Package className="h-6 w-6 text-indigo-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  {formHook.isEditing ? 'Editar Producto Ofertado' : 'Agregar Producto Ofertado'}
                </h1>
              </div>
              {formHook.isEditing && formHook.productoData && (
                <div className="flex items-center gap-2 mt-1 ml-9">
                  <p className="text-sm text-gray-500">Código: <span className="font-medium">{formHook.productoData.code}</span></p>
                  <span className="text-gray-300">•</span>
                  <p className="text-sm text-gray-500">CUDIM: <span className="font-medium">{formHook.productoData.cudim}</span></p>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center">
                    <Badge variant={formHook.productoData.is_active ? "success" : "secondary"} className={formHook.productoData.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {formHook.productoData.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-50 rounded-lg shadow-sm">
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

        <form onSubmit={formHook.handleSubmit(onSubmit)}>
          {/* Componente de Información del Producto */}
          <InformacionProducto 
            control={formHook.control}
            errors={formHook.errors}
            categoriasData={categoriasData}
            especialidadesData={especialidadesData}
          />
          
          {/* Componente de Imágenes del Producto */}
          <ImagenesProducto 
            {...imagenesHook}
          />
          
          {/* Componente de Documentos del Producto */}
          <DocumentosProducto 
            {...documentosHook}
          />

          {/* Botones de acción */}
          <div className="mt-8 pt-6 flex justify-end gap-3 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/productos/productos-ofertados')}
              disabled={mutationHook.isSubmitting}
              className="px-5 py-2 rounded-full border-slate-300 hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={mutationHook.isSubmitting}
              className="px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-sm"
            >
              <Save className="h-4 w-4 mr-2" />
              {mutationHook.isSubmitting ? 'Guardando...' : formHook.isEditing ? 'Actualizar Producto' : 'Guardar Producto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}