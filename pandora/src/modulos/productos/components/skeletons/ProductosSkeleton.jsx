/**
 * Componentes Skeleton para productos
 * Mejoran la experiencia de usuario durante la carga
 */

import React from 'react';

/**
 * Skeleton base reutilizable
 */
const SkeletonBase = ({ className = '', children }) => (
  <div className={`animate-pulse ${className}`}>
    {children}
  </div>
);

/**
 * Skeleton para una línea de texto
 */
const SkeletonLine = ({ width = 'w-full', height = 'h-4' }) => (
  <div className={`bg-gray-200 rounded ${width} ${height}`}></div>
);

/**
 * Skeleton para imagen/avatar
 */
const SkeletonImage = ({ size = 'w-16 h-16' }) => (
  <div className={`bg-gray-200 rounded ${size}`}></div>
);

/**
 * Skeleton para una tarjeta de producto en la lista
 */
export const ProductoCardSkeleton = () => (
  <SkeletonBase className="border rounded-lg p-4 mb-4">
    <div className="flex items-start space-x-4">
      {/* Imagen del producto */}
      <SkeletonImage size="w-20 h-20" />
      
      {/* Contenido principal */}
      <div className="flex-1 space-y-2">
        {/* Título */}
        <SkeletonLine width="w-3/4" height="h-5" />
        
        {/* Código */}
        <SkeletonLine width="w-1/4" height="h-4" />
        
        {/* Descripción */}
        <SkeletonLine width="w-full" height="h-4" />
        <SkeletonLine width="w-2/3" height="h-4" />
        
        {/* Metadatos */}
        <div className="flex space-x-4 mt-3">
          <SkeletonLine width="w-20" height="h-3" />
          <SkeletonLine width="w-24" height="h-3" />
          <SkeletonLine width="w-16" height="h-3" />
        </div>
      </div>
      
      {/* Acciones */}
      <div className="space-y-2">
        <SkeletonLine width="w-20" height="h-8" />
        <SkeletonLine width="w-20" height="h-8" />
      </div>
    </div>
  </SkeletonBase>
);

/**
 * Skeleton para lista de productos
 */
export const ProductosListSkeleton = ({ count = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <ProductoCardSkeleton key={index} />
    ))}
  </div>
);

/**
 * Skeleton para tabla de productos
 */
export const ProductosTableSkeleton = ({ rows = 10, columns = 6 }) => (
  <SkeletonBase className="w-full">
    {/* Header de tabla */}
    <div className="border rounded-t-lg bg-gray-50 p-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <SkeletonLine key={index} width="w-3/4" height="h-4" />
        ))}
      </div>
    </div>
    
    {/* Filas de tabla */}
    <div className="border-x border-b rounded-b-lg">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex} 
          className={`p-4 grid gap-4 ${rowIndex !== rows - 1 ? 'border-b' : ''}`}
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonLine 
              key={colIndex} 
              width={colIndex === 0 ? 'w-full' : 'w-2/3'} 
              height="h-4" 
            />
          ))}
        </div>
      ))}
    </div>
  </SkeletonBase>
);

/**
 * Skeleton para detalle de producto
 */
export const ProductoDetailSkeleton = () => (
  <SkeletonBase className="max-w-4xl mx-auto p-6">
    {/* Header */}
    <div className="mb-8">
      <SkeletonLine width="w-1/2" height="h-8" />
      <div className="mt-2">
        <SkeletonLine width="w-1/4" height="h-5" />
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Columna izquierda - Imágenes */}
      <div className="space-y-4">
        {/* Imagen principal */}
        <SkeletonImage size="w-full h-64" />
        
        {/* Galería de imágenes */}
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonImage key={index} size="w-full h-16" />
          ))}
        </div>
      </div>

      {/* Columna derecha - Información */}
      <div className="space-y-6">
        {/* Información básica */}
        <div className="space-y-3">
          <SkeletonLine width="w-full" height="h-5" />
          <SkeletonLine width="w-3/4" height="h-5" />
          <SkeletonLine width="w-1/2" height="h-5" />
        </div>

        {/* Especificaciones */}
        <div className="space-y-3">
          <SkeletonLine width="w-1/3" height="h-6" />
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex justify-between">
              <SkeletonLine width="w-1/4" height="h-4" />
              <SkeletonLine width="w-1/3" height="h-4" />
            </div>
          ))}
        </div>

        {/* Precios */}
        <div className="space-y-3">
          <SkeletonLine width="w-1/4" height="h-6" />
          <div className="space-y-2">
            <SkeletonLine width="w-1/3" height="h-8" />
            <SkeletonLine width="w-1/4" height="h-5" />
          </div>
        </div>

        {/* Acciones */}
        <div className="flex space-x-3">
          <SkeletonLine width="w-24" height="h-10" />
          <SkeletonLine width="w-24" height="h-10" />
          <SkeletonLine width="w-24" height="h-10" />
        </div>
      </div>
    </div>

    {/* Sección de documentos */}
    <div className="mt-8 space-y-4">
      <SkeletonLine width="w-1/4" height="h-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-2">
            <SkeletonLine width="w-3/4" height="h-5" />
            <SkeletonLine width="w-1/2" height="h-4" />
            <SkeletonLine width="w-full" height="h-3" />
          </div>
        ))}
      </div>
    </div>
  </SkeletonBase>
);

/**
 * Skeleton para formulario de producto
 */
export const ProductoFormSkeleton = () => (
  <SkeletonBase className="max-w-4xl mx-auto p-6">
    {/* Header */}
    <div className="mb-8">
      <SkeletonLine width="w-1/3" height="h-8" />
    </div>

    <div className="space-y-8">
      {/* Información general */}
      <div className="space-y-4">
        <SkeletonLine width="w-1/4" height="h-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <SkeletonLine width="w-1/3" height="h-4" />
              <SkeletonLine width="w-full" height="h-10" />
            </div>
          ))}
        </div>
      </div>

      {/* Especificaciones */}
      <div className="space-y-4">
        <SkeletonLine width="w-1/4" height="h-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <SkeletonLine width="w-1/2" height="h-4" />
              <SkeletonLine width="w-full" height="h-10" />
            </div>
          ))}
        </div>
      </div>

      {/* Precios */}
      <div className="space-y-4">
        <SkeletonLine width="w-1/4" height="h-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <SkeletonLine width="w-2/3" height="h-4" />
              <SkeletonLine width="w-full" height="h-10" />
            </div>
          ))}
        </div>
      </div>

      {/* Área de imágenes */}
      <div className="space-y-4">
        <SkeletonLine width="w-1/4" height="h-6" />
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8">
          <div className="text-center space-y-4">
            <SkeletonImage size="w-16 h-16 mx-auto" />
            <SkeletonLine width="w-1/3 mx-auto" height="h-4" />
            <SkeletonLine width="w-1/4 mx-auto" height="h-8" />
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-4">
        <SkeletonLine width="w-24" height="h-10" />
        <SkeletonLine width="w-24" height="h-10" />
      </div>
    </div>
  </SkeletonBase>
);

/**
 * Skeleton para estadísticas/dashboard
 */
export const ProductosStatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {Array.from({ length: 4 }).map((_, index) => (
      <SkeletonBase key={index} className="border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <SkeletonLine width="w-16" height="h-4" />
            <SkeletonLine width="w-12" height="h-8" />
          </div>
          <SkeletonImage size="w-8 h-8" />
        </div>
      </SkeletonBase>
    ))}
  </div>
);

/**
 * Skeleton con componente personalizable
 */
export const CustomSkeleton = ({ 
  lines = 3, 
  showImage = false, 
  className = '',
  imageSize = 'w-16 h-16'
}) => (
  <SkeletonBase className={className}>
    {showImage && (
      <div className="mb-4">
        <SkeletonImage size={imageSize} />
      </div>
    )}
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLine 
          key={index} 
          width={index === lines - 1 ? 'w-2/3' : 'w-full'} 
          height="h-4" 
        />
      ))}
    </div>
  </SkeletonBase>
);

export default {
  ProductoCardSkeleton,
  ProductosListSkeleton,
  ProductosTableSkeleton,
  ProductoDetailSkeleton,
  ProductoFormSkeleton,
  ProductosStatsSkeleton,
  CustomSkeleton
};