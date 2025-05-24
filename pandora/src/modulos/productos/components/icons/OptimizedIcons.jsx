/**
 * Sistema de íconos optimizado con carga dinámica
 * Reduce el bundle size mediante lazy loading de íconos
 */

import React, { Suspense, lazy, memo } from 'react';

/**
 * Componente de fallback para íconos mientras cargan
 */
const IconFallback = memo(({ size = 16, className = '' }) => (
  <div 
    className={`inline-block bg-gray-200 rounded ${className}`}
    style={{ 
      width: size, 
      height: size,
      minWidth: size,
      minHeight: size
    }}
    aria-hidden="true"
  />
));

IconFallback.displayName = 'IconFallback';

/**
 * Cache de íconos cargados dinámicamente
 */
const iconCache = new Map();

/**
 * Factory para crear componentes de íconos lazy
 */
const createLazyIcon = (iconName) => {
  if (iconCache.has(iconName)) {
    return iconCache.get(iconName);
  }

  const LazyIcon = lazy(async () => {
    try {
      // Import dinámico del ícono específico
      const iconModule = await import(`lucide-react/${iconName}`);
      
      // Verificar que el ícono existe en el módulo
      const IconComponent = iconModule[iconName] || iconModule.default;
      
      if (!IconComponent) {
        throw new Error(`Icon ${iconName} not found`);
      }

      return {
        default: memo((props) => <IconComponent {...props} />)
      };
    } catch (error) {
      console.warn(`Failed to load icon: ${iconName}`, error);
      
      // Fallback a un ícono genérico
      const { AlertCircle } = await import('lucide-react');
      return {
        default: memo((props) => <AlertCircle {...props} />)
      };
    }
  });

  iconCache.set(iconName, LazyIcon);
  return LazyIcon;
};

/**
 * Componente principal para renderizar íconos optimizados
 */
export const OptimizedIcon = memo(({ 
  name, 
  size = 16, 
  className = '',
  fallbackSize,
  ...props 
}) => {
  if (!name) {
    return <IconFallback size={fallbackSize || size} className={className} />;
  }

  const LazyIconComponent = createLazyIcon(name);

  return (
    <Suspense fallback={<IconFallback size={fallbackSize || size} className={className} />}>
      <LazyIconComponent 
        size={size} 
        className={className} 
        {...props}
      />
    </Suspense>
  );
});

OptimizedIcon.displayName = 'OptimizedIcon';

/**
 * Hook para precargar íconos que se van a usar pronto
 */
export const usePreloadIcons = () => {
  const preloadIcon = React.useCallback((iconName) => {
    if (!iconCache.has(iconName)) {
      createLazyIcon(iconName);
    }
  }, []);

  const preloadIcons = React.useCallback((iconNames) => {
    iconNames.forEach(preloadIcon);
  }, [preloadIcon]);

  return { preloadIcon, preloadIcons };
};

/**
 * Hook para limpiar cache de íconos (útil en desarrollo)
 */
export const useIconCache = () => {
  const clearCache = React.useCallback(() => {
    iconCache.clear();
  }, []);

  const getCacheSize = React.useCallback(() => {
    return iconCache.size;
  }, []);

  const getCachedIcons = React.useCallback(() => {
    return Array.from(iconCache.keys());
  }, []);

  return { clearCache, getCacheSize, getCachedIcons };
};

/**
 * Componentes específicos más utilizados con carga optimizada
 * Se cargan bajo demanda pero con nombres semánticos
 */

// Íconos de acciones comunes
export const SaveIcon = memo((props) => (
  <OptimizedIcon name="Save" {...props} />
));

export const BackIcon = memo((props) => (
  <OptimizedIcon name="ArrowLeft" {...props} />
));

export const CloseIcon = memo((props) => (
  <OptimizedIcon name="X" {...props} />
));

export const EditIcon = memo((props) => (
  <OptimizedIcon name="Edit3" {...props} />
));

export const DeleteIcon = memo((props) => (
  <OptimizedIcon name="Trash" {...props} />
));

export const AddIcon = memo((props) => (
  <OptimizedIcon name="Plus" {...props} />
));

export const SearchIcon = memo((props) => (
  <OptimizedIcon name="Search" {...props} />
));

export const FilterIcon = memo((props) => (
  <OptimizedIcon name="Filter" {...props} />
));

// Íconos de estado
export const LoadingIcon = memo((props) => (
  <OptimizedIcon name="Loader2" className="animate-spin" {...props} />
));

export const SuccessIcon = memo((props) => (
  <OptimizedIcon name="CheckCircle" {...props} />
));

export const ErrorIcon = memo((props) => (
  <OptimizedIcon name="AlertCircle" {...props} />
));

export const WarningIcon = memo((props) => (
  <OptimizedIcon name="AlertTriangle" {...props} />
));

export const InfoIcon = memo((props) => (
  <OptimizedIcon name="Info" {...props} />
));

// Íconos de productos
export const ProductIcon = memo((props) => (
  <OptimizedIcon name="ShoppingBag" {...props} />
));

export const CategoryIcon = memo((props) => (
  <OptimizedIcon name="Tag" {...props} />
));

export const ImageIcon = memo((props) => (
  <OptimizedIcon name="Image" {...props} />
));

export const DocumentIcon = memo((props) => (
  <OptimizedIcon name="FileText" {...props} />
));

export const PriceIcon = memo((props) => (
  <OptimizedIcon name="DollarSign" {...props} />
));

export const UploadIcon = memo((props) => (
  <OptimizedIcon name="Upload" {...props} />
));

// Íconos de navegación
export const HomeIcon = memo((props) => (
  <OptimizedIcon name="Home" {...props} />
));

export const MenuIcon = memo((props) => (
  <OptimizedIcon name="Menu" {...props} />
));

export const SettingsIcon = memo((props) => (
  <OptimizedIcon name="Settings" {...props} />
));

export const ProfileIcon = memo((props) => (
  <OptimizedIcon name="User" {...props} />
));

/**
 * Provider para precargar íconos comunes
 */
export const IconPreloader = memo(({ children, iconNames = [] }) => {
  const { preloadIcons } = usePreloadIcons();

  React.useEffect(() => {
    // Precargar íconos comunes por defecto
    const commonIcons = [
      'Save', 'ArrowLeft', 'X', 'Edit3', 'Trash', 'Plus',
      'CheckCircle', 'AlertCircle', 'Loader2',
      'ShoppingBag', 'Tag', 'Image', 'FileText', 'DollarSign',
      ...iconNames
    ];

    // Precargar con delay para no bloquear el render inicial
    const timer = setTimeout(() => {
      preloadIcons(commonIcons);
    }, 100);

    return () => clearTimeout(timer);
  }, [preloadIcons, iconNames]);

  return children;
});

IconPreloader.displayName = 'IconPreloader';

/**
 * Utilidad para crear bundles de íconos específicos por módulo
 */
export const createIconBundle = (iconMapping) => {
  const bundle = {};
  
  Object.entries(iconMapping).forEach(([key, iconName]) => {
    bundle[key] = memo((props) => (
      <OptimizedIcon name={iconName} {...props} />
    ));
    bundle[key].displayName = `${key}Icon`;
  });

  return bundle;
};

/**
 * Bundle específico para el módulo de productos
 */
export const ProductosIcons = createIconBundle({
  // Acciones básicas
  save: 'Save',
  back: 'ArrowLeft',
  close: 'X',
  edit: 'Edit3',
  delete: 'Trash',
  add: 'Plus',
  
  // Productos específicos
  product: 'ShoppingBag',
  category: 'Tag', 
  brand: 'Award',
  unit: 'Package',
  origin: 'MapPin',
  
  // Medios
  image: 'Image',
  document: 'FileText',
  upload: 'Upload',
  download: 'Download',
  
  // Estados
  active: 'CheckCircle',
  inactive: 'XCircle',
  loading: 'Loader2',
  error: 'AlertCircle',
  warning: 'AlertTriangle',
  
  // Precios y finanzas
  price: 'DollarSign',
  trend: 'TrendingUp',
  discount: 'Percent',
  
  // Configuración
  settings: 'Settings',
  gear: 'Cog',
  filter: 'Filter',
  sort: 'ArrowUpDown',
  
  // Navegación
  next: 'ChevronRight',
  prev: 'ChevronLeft',
  up: 'ChevronUp',
  down: 'ChevronDown',
  
  // Visualización
  view: 'Eye',
  hide: 'EyeOff',
  expand: 'Maximize',
  collapse: 'Minimize',
  
  // Estado de código
  lock: 'Lock',
  unlock: 'Unlock',
  refresh: 'RotateCcw',
  star: 'Star'
});

export default OptimizedIcon;