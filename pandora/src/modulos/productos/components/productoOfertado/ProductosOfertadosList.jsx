// /pandora/src/modulos/productos/components/productoOfertado/ProductosOfertadosList.jsx

import { Package, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/modulos/basic/components/data/DataTable';
import { useNavigate } from 'react-router-dom';
import { ActionButtons } from '@/modulos/basic/components/ui/ActionButtons';

/**
 * Componente que muestra una lista de productos ofertados con acciones
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.data - Datos paginados de productos ofertados
 * @param {boolean} props.isLoading - Indica si los datos están cargando
 * @param {boolean} props.isError - Indica si hubo un error en la carga
 * @param {Object} props.error - Objeto de error si hubo alguno
 * @param {Function} props.refetch - Función para recargar los datos
 * @param {Object} props.pagination - Configuración de paginación
 * @param {Function} props.onDeleteClick - Función para manejar la eliminación de un producto
 * @returns {JSX.Element} Tabla de productos ofertados
 */
export default function ProductosOfertadosList({ 
  data, 
  isLoading, 
  isError, 
  error, 
  refetch, 
  onDeleteClick,
  pagination,
  categoriasList = [],
  especialidadesList = [],
  isLoadingEspecialidades // Nueva prop para el estado de carga
}) {
  const navigate = useNavigate();

  const columns = [
    {
      header: 'Imagen',
      accessor: 'imagenes',
      cell: (producto) => {
        // Obtener la primera imagen o la imagen principal
        const imagen = producto.imagenes?.find(img => img.is_primary) || producto.imagenes?.[0];

        // Enhanced debugging to see all available data
        console.log(`[Debug Imagen][${producto.code}] Full imagen object:`, imagen);
        
        // Try multiple URL sources in order of preference
        let imageUrl = null;
        
        if (imagen) {
          // Check for urls object first (preferred)
          if (imagen.urls) {
            imageUrl = imagen.urls.thumbnail || imagen.urls.webp || imagen.urls.original || imagen.urls.default;
          }
          
          // Fallback to direct URL properties
          if (!imageUrl) {
            imageUrl = imagen.thumbnail_url || imagen.webp_url || imagen.imagen_url || imagen.original_url;
          }
          
          // Fallback to imagen field
          if (!imageUrl && imagen.imagen) {
            imageUrl = imagen.imagen.startsWith('/media/') ? imagen.imagen : `/media/${imagen.imagen}`;
          }
          
          console.log(`[Debug Imagen][${producto.code}] Selected imageUrl:`, imageUrl);
        }
        
        if (imageUrl) {
          return (
            <div className="flex items-center justify-center">
              <img 
                src={imageUrl} 
                alt={imagen.alt_text || `Miniatura de ${producto.nombre}`}
                className="w-12 h-12 object-cover rounded border border-gray-200"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center"><svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                }}
              />
            </div>
          );
        }
        
        return (
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Código',
      accessor: 'code',
      cell: (producto) => (
        <Badge variant="outline" className="font-mono bg-blue-50 text-blue-800 border-blue-200">
          {producto.code}
        </Badge>
      )
    },
    {
      header: 'CUDIM',
      accessor: 'cudim',
      cell: (producto) => (
        <Badge variant="outline" className="font-mono bg-purple-50 text-purple-800 border-purple-200">
          {producto.cudim}
        </Badge>
      )
    },
    {
      header: 'Nombre',
      accessor: 'nombre',
      cell: (producto) => (
        <div className="font-medium flex items-center text-gray-800">
          <Package className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
          <span className="truncate" title={producto.nombre}>{producto.nombre}</span>
        </div>
      )
    },
    {
      header: 'Especialidad',
      accessor: 'especialidad',
      cell: (producto) => {
        // --- INICIO DEBUGGING ---
        if (producto.nombre && producto.nombre.includes('NOMBRE_ESPECIFICO_DE_PRODUCTO_PARA_DEBUG')) { // Reemplaza con un nombre de producto para filtrar logs
          console.log('[Debug Especialidad] Producto:', producto);
          console.log('[Debug Especialidad] producto.especialidad:', producto.especialidad, typeof producto.especialidad);
          console.log('[Debug Especialidad] isLoadingEspecialidades:', isLoadingEspecialidades);
          console.log('[Debug Especialidad] especialidadesList:', especialidadesList);
        }
        // --- FIN DEBUGGING ---

        const especialidadId = producto.especialidad;

        if (typeof especialidadId === 'undefined' || especialidadId === null) {
          return <span className="text-gray-400 text-sm">No especificado</span>;
        }

        // Si las especialidades están cargando y la lista aún está vacía
        if (isLoadingEspecialidades && (!especialidadesList || especialidadesList.length === 0)) {
          return <span className="text-xs italic text-gray-500">Cargando...</span>;
        }

        let nombreToShow = especialidadId.toString(); // Fallback al ID

        if (especialidadesList && especialidadesList.length > 0) {
          // Intentar una comparación más robusta convirtiendo ambos a número si es posible
          const foundEspecialidad = especialidadesList.find(esp => 
            String(esp.id).trim() === String(especialidadId).trim()
          );

          // --- INICIO DEBUGGING ---
          if (producto.nombre && producto.nombre.includes('NOMBRE_ESPECIFICO_DE_PRODUCTO_PARA_DEBUG')) {
             console.log('[Debug Especialidad] foundEspecialidad:', foundEspecialidad);
          }
          // --- FIN DEBUGGING ---

          if (foundEspecialidad && typeof foundEspecialidad.nombre === 'string' && foundEspecialidad.nombre.trim() !== '') {
            nombreToShow = foundEspecialidad.nombre;
          } else if (foundEspecialidad) {
            // ID encontrado pero sin nombre válido, o nombre es cadena vacía, mantener el ID
            console.warn(`[Debug Especialidad] Especialidad encontrada para ID ${especialidadId} pero sin nombre válido:`, foundEspecialidad);
            nombreToShow = especialidadId.toString();
          }
          // Si no se encontró después de la búsqueda, nombreToShow sigue siendo especialidadId.toString()
        } else if (!isLoadingEspecialidades) {
          // Si la lista está vacía y no está cargando, podría indicar un problema con la carga de especialidades
          console.warn('[Debug Especialidad] especialidadesList está vacía y no está cargando. ID del producto:', especialidadId);
        }
        
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            {nombreToShow}
          </Badge>
        );
      }
    },
    {
      header: 'Categoría',
      accessor: 'id_categoria.nombre',
      cell: (producto) => (
        <div className="flex items-center">
          <Tag className="h-4 w-4 mr-1 text-indigo-500" />
          <span className="text-sm">{
            (producto.id_categoria && categoriasList.find(cat => cat.id === producto.id_categoria)?.nombre) || 'Sin categoría'
          }</span>
        </div>
      )
    },
    {
      header: 'Acciones',
      accessor: 'id',
      style: { textAlign: 'center', width: '7rem' },
      cell: (producto) => (
        <ActionButtons 
          onView={() => {
            console.log(`[DEBUG] Navigating to detail view for producto ID: ${producto.id}`);
            console.log(`[DEBUG] Full producto object:`, producto);
            console.log(`[DEBUG] Target URL: /productos/productos-ofertados/${producto.id}`);
            navigate(`/productos/productos-ofertados/${producto.id}`);
          }}
          onEdit={() => navigate(`/productos/productos-ofertados/edit/${producto.id}`)}
          onDelete={() => onDeleteClick(producto)}
        />
      )
    },
  ];

  return (
    <>
      <DataTable 
        columns={columns}
        data={data?.results}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        onRetry={refetch}
        emptyMessage="No se encontraron productos ofertados que coincidan con la búsqueda."
        pagination={pagination}
      />
      
    </>
  );
}