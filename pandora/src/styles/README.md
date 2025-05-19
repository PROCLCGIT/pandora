# Estilos de la Aplicación

Este directorio contiene los estilos globales de la aplicación.

## Simplificación de CSS

Hemos consolidado todos los estilos en un solo archivo `globals.css` para mantener la simplicidad y coherencia. Este enfoque ofrece varias ventajas:

- Todos los estilos están en un solo lugar
- Se evitan posibles conflictos entre archivos CSS
- Las directivas de Tailwind CSS están declaradas una sola vez
- Mayor facilidad de mantenimiento

## Estructura de `globals.css`

El archivo `globals.css` está organizado de la siguiente manera:

1. **Directivas de Tailwind CSS** (`@tailwind base`, `@tailwind components`, `@tailwind utilities`)
2. **Variables CSS** y configuración de temas (claro/oscuro)
3. **Componentes personalizados** usando `@layer components`
4. **Estilos globales** para elementos como el body y scrollbars

## Uso de clases personalizadas

Dentro de `@layer components` hemos definido clases personalizadas que se pueden usar en los componentes. Por ejemplo:

```jsx
// Ejemplo de uso de clase personalizada
<a className="sidebar-link active">
  Enlace activo
</a>
```

## Consideraciones importantes

- Para añadir nuevos estilos globales, hazlo siempre en este archivo.
- Si los estilos son específicos para un componente, considera usar:
  1. Clases de Tailwind directamente en el componente
  2. Definir una clase personalizada en el `@layer components` de este archivo si se reutilizan en varios lugares

## Eliminación de archivos CSS redundantes

Como parte de la simplificación, hemos eliminado:
- `App.css` - Sus estilos han sido integrados en `globals.css`
