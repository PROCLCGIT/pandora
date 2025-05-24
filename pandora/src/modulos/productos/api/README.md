# API de Productos - Sistema Centralizado

Este directorio contiene el nuevo sistema centralizado para manejar consultas React Query en el módulo de productos, eliminando duplicación y mejorando el rendimiento.

## Arquitectura

### 📁 Estructura de Archivos

```
api/
├── baseQueryService.js          # Servicio base con funcionalidades comunes
├── productosQueryService.js     # Servicio centralizado para productos
├── migrationHelper.js          # Helper para migración gradual
├── productoOfertadoService.js   # [LEGACY] Servicio específico ofertados
├── productoDisponibleService.js # [LEGACY] Servicio específico disponibles
└── README.md                   # Esta documentación
```

## Servicios Principales

### 🔧 `baseQueryService.js`

Contiene la lógica base reutilizable:

- **Factory de funciones fetch**: `createFetchFunction()`
- **Configuraciones React Query**: `DEFAULT_QUERY_CONFIG`, `LIST_QUERY_CONFIG`, etc.
- **Normalización de respuestas**: `normalizeApiResponse()`
- **Query keys factory**: `createQueryKeys()`
- **Invalidación optimizada**: `createInvalidationPattern()`
- **Manejo de errores**: `handleQueryError()`, `handleQuerySuccess()`

### 🎯 `productosQueryService.js`

Servicio centralizado que elimina duplicación:

```javascript
import { productosOfertadosQuery, productosDisponiblesQuery } from './productosQueryService.js';

// Usar productos ofertados
const { data, isLoading } = productosOfertadosQuery.useList(filters);
const createMutation = productosOfertadosQuery.useCreate({ toast });

// Usar productos disponibles  
const { data: disponibles } = productosDisponiblesQuery.useList(filters);
const updateMutation = productosDisponiblesQuery.useUpdate({ toast });
```

### 🔄 `migrationHelper.js`

Facilita la migración gradual del código existente:

```javascript
// Compatibilidad con API antigua
const compat = createOfertadosCompatibility();
const { data } = compat.useProductosOfertados(filters);

// Migración progresiva
const { isNewAPIEnabled, enableNewAPI } = useMigrationStatus('ProductosPage');
```

## Características Principales

### ⚡ Prefetching Inteligente

```javascript
import { prefetchProductos } from './productosQueryService.js';

// Prefetch automático en rutas
await prefetchProductos.ofertados(queryClient, params);
await prefetchProductos.detalleOfertado(queryClient, id);
```

### 🦴 Skeleton Components

```javascript
import { ProductosListSkeleton, ProductoDetailSkeleton } from '../components/skeletons/ProductosSkeleton.jsx';

// Uso en Suspense
<Suspense fallback={<ProductosListSkeleton />}>
  <ProductosList />
</Suspense>
```

### 🎭 Error Boundaries

```javascript
// Manejo automático de errores en ProductosPrefetchWrapper
<ProductosPrefetchWrapper>
  <YourComponent />
</ProductosPrefetchWrapper>
```

### 📊 Optimistic UI

```javascript
// Actualizaciones optimistas automáticas
const updateMutation = productosOfertadosQuery.useUpdate({
  toast,
  // Automáticamente maneja optimistic UI y rollback en errores
});
```

## Hooks Disponibles

### 📋 Para Listas

```javascript
// Lista paginada
const { data, isLoading, isFetching } = productosOfertadosQuery.useList(filters, options);

// Infinite scroll
const { 
  data, 
  fetchNextPage, 
  hasNextPage 
} = productosOfertadosQuery.useInfiniteList(filters, options);
```

### 🔍 Para Detalles

```javascript
// Detalle por ID
const { data: producto, isLoading } = productosOfertadosQuery.useDetail(id, options);
```

### ✏️ Para Mutations

```javascript
// Crear
const createMutation = productosOfertadosQuery.useCreate({
  toast,
  onSuccess: (data) => console.log('Creado:', data)
});

// Actualizar
const updateMutation = productosOfertadosQuery.useUpdate({
  toast,
  onSuccess: (data) => console.log('Actualizado:', data)
});

// Eliminar
const deleteMutation = productosOfertadosQuery.useDelete({
  toast,
  onSuccess: () => console.log('Eliminado')
});
```

## Configuraciones React Query

### ⏱️ Configuraciones por Defecto

```javascript
// Para listas (más frecuente actualización)
LIST_QUERY_CONFIG = {
  staleTime: 2 * 60 * 1000,      // 2 minutos
  gcTime: 10 * 60 * 1000,        // 10 minutos
  keepPreviousData: true,         // Evita parpadeos
  refetchOnWindowFocus: false
}

// Para detalles (mayor cache)
DETAIL_QUERY_CONFIG = {
  staleTime: 10 * 60 * 1000,     // 10 minutos
  gcTime: 15 * 60 * 1000         // 15 minutos
}
```

### 🔄 Query Keys

Estructura jerárquica para invalidación eficiente:

```javascript
// Productos ofertados
['productos', 'ofertados', 'list', filters]
['productos', 'ofertados', 'detail', id]
['productos', 'ofertados', 'infinite', filters]

// Productos disponibles
['productos', 'disponibles', 'list', filters]
['productos', 'disponibles', 'detail', id]
```

## Migración del Código Existente

### 🔄 Paso 1: Identificar Patrones

```javascript
// ANTES (duplicado en cada servicio)
const fetchProductos = async (params) => {
  const response = await api.get('/productos/productos-ofertados/', { params });
  return response.data;
};
```

```javascript
// DESPUÉS (centralizado)
const fetchFunctions = createFetchFunction('/productos/productos-ofertados/');
```

### 🔄 Paso 2: Usar Compatibilidad

```javascript
// Para migración gradual sin romper código
import { createOfertadosCompatibility } from './migrationHelper.js';

const compat = createOfertadosCompatibility();
// Usar hooks compatibles mientras migras
```

### 🔄 Paso 3: Migración Completa

```javascript
// Reemplazar imports
import { productosOfertadosQuery } from './productosQueryService.js';

// Actualizar hooks
const { data } = productosOfertadosQuery.useList(filters);
```

## Beneficios del Sistema

### 📈 Rendimiento

- **Prefetching inteligente**: Carga anticipada basada en navegación
- **Optimistic UI**: Actualizaciones inmediatas con rollback automático
- **Background refetching**: Datos siempre actualizados sin interferir UX
- **Query deduplication**: Evita requests duplicados

### 🧩 Mantenibilidad

- **Código centralizado**: Un solo lugar para lógica de fetch
- **Tipado consistente**: Interfaces uniformes para todos los recursos
- **Error handling**: Manejo centralizado de errores y notificaciones
- **Testing**: Más fácil mockear y testear

### 👥 Experiencia de Usuario

- **Loading states**: Skeletons específicos para cada tipo de contenido
- **Error boundaries**: Recuperación elegante de errores
- **No flickering**: `keepPreviousData` elimina parpadeos
- **Feedback inmediato**: Optimistic UI para mejor sensación de velocidad

## Ejemplos de Uso

### 📄 Página de Lista Optimizada

Ver: `/pages/examples/ProductosOfertadosPageOptimized.jsx`

### 🔗 Rutas con Prefetch

```javascript
// En ProductosRoutes.jsx
<ProductosPrefetchWrapper>
  <Outlet />
</ProductosPrefetchWrapper>
```

### 🎣 Custom Hooks Optimizados

```javascript
const useOptimizedProductos = (filters) => {
  const prefetch = usePrefetchProductos();
  
  // Prefetch al cambiar filtros
  useEffect(() => {
    prefetch.prefetchOfertados(filters);
  }, [filters]);
  
  return productosOfertadosQuery.useList(filters);
};
```

## Próximos Pasos

1. **Migrar páginas existentes** usando `migrationHelper.js`
2. **Implementar infinite scroll** con `useInfiniteList`
3. **Agregar más skeleton variants** según necesidades
4. **Configurar error monitoring** para producción
5. **Implementar caching persistente** con IndexedDB

## Troubleshooting

### 🐛 Problemas Comunes

**Query no se actualiza:**
```javascript
// Verificar query keys
console.log(productosOfertadosQuery.queryKeys.list(filters));

// Forzar invalidación
const invalidation = productosOfertadosQuery.invalidation(queryClient);
invalidation.invalidateAll();
```

**Prefetch no funciona:**
```javascript
// Verificar que esté en una ruta correcta
<ProductosPrefetchWrapper enablePrefetch={true}>
```

**Error boundaries:**
```javascript
// Los errores se manejan automáticamente en ProductosPrefetchWrapper
// Para manejo custom, usar onError en hooks
```

---

*Esta arquitectura está diseñada para crecer y adaptarse a futuras necesidades del módulo de productos.*