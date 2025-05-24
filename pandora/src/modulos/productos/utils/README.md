# Productos Utils

Utilidades y helpers para el módulo de productos.

## Estructura

### `codigoHelper.js`

Helper puro para la generación de códigos de productos disponibles. Contiene funciones puras sin dependencias de React ni efectos secundarios.

#### Funciones principales:

- **`generateCategoryBasedCode(categoryCode, options)`**: Genera códigos basados en categoría (formato: `CATEGORIA-LETRA-NUMERO`)
- **`generateCustomCode(config)`**: Genera códigos personalizados con configuración avanzada
- **`generateCode(categoryCode, customConfig)`**: Función principal que selecciona la estrategia apropiada
- **`validateCodeFormat(code, expectedCategoryCode)`**: Valida formato de códigos
- **`parseCode(code)`**: Extrae información de un código generado

#### Funciones auxiliares:

- **`generateRandomNumber(length)`**: Genera números aleatorios con padding
- **`generateRandomLetter()`**: Genera letras aleatorias A-Z
- **`formatDateForCode(date)`**: Formatea fechas para códigos (YYMMDD)
- **`isValidCategoryCode(categoryCode)`**: Valida códigos de categoría
- **`normalizeCategoryCode(categoryCode)`**: Normaliza códigos de categoría

#### Ejemplo de uso:

```javascript
import { generateCode, validateCodeFormat } from './codigoHelper.js';

// Generar código basado en categoría
const codigo = generateCode('MED'); // "MED-A-001"

// Generar código personalizado
const codigoCustom = generateCode(null, {
  prefix: 'CUSTOM',
  includeDate: true
}); // "CUSTOM-250522-123"

// Validar código
const validation = validateCodeFormat('MED-A-001', 'MED');
console.log(validation.isValid); // true
```

### `codigoHelper.test.js`

Pruebas unitarias completas para todas las funciones del helper. Incluye:

- Tests de generación de números y letras aleatorias
- Tests de validación de códigos de categoría
- Tests de generación de códigos basados en categoría
- Tests de generación de códigos personalizados
- Tests de validación de formato
- Tests de parsing de códigos
- Tests de casos edge y manejo de errores

### `validateHelper.js`

Script de validación que se puede ejecutar directamente para probar las funciones del helper:

```bash
cd pandora
node src/modulos/productos/utils/validateHelper.js
```

## Hook relacionado

### `../hooks/useCodigoProductoDisponible.js`

Hook personalizado que encapsula toda la lógica de generación de códigos, configuración y modos de edición para productos disponibles. Utiliza las funciones del `codigoHelper.js`.

#### Características:

- Manejo de estado para modo manual/automático
- Configuración persistente en localStorage
- Integración con formularios React Hook Form
- Validación en tiempo real
- Notificaciones toast
- Generación automática basada en categorías

#### Ejemplo de uso:

```javascript
import { useCodigoProductoDisponible } from '../hooks/useCodigoProductoDisponible.js';

function ProductForm() {
  const codigoHook = useCodigoProductoDisponible({
    setValue: form.setValue,
    toast,
    formValues: form.watch(),
    categoriasData,
    isEditing: false
  });

  return (
    <div>
      <button onClick={codigoHook.regenerateCode}>
        Regenerar código
      </button>
      <button onClick={codigoHook.enableManualMode}>
        Modo manual
      </button>
    </div>
  );
}
```

## Migración

El hook anterior `useCodeGeneration.js` ha sido marcado como deprecated y ahora delega al nuevo `useCodigoProductoDisponible.js` para mantener compatibilidad durante la transición.

## Formatos de código soportados

1. **Basado en categoría**: `CATEGORIA-LETRA-NUMERO` (ej: `MED-A-001`)
2. **Personalizado simple**: `PREFIJO-NUMERO` (ej: `PDIS-123`)
3. **Personalizado con fecha**: `PREFIJO-YYMMDD-NUMERO` (ej: `PDIS-250522-123`)

## Testing

Para ejecutar las validaciones:

```bash
# Validación rápida con Node.js
node src/modulos/productos/utils/validateHelper.js

# Tests unitarios (requiere configurar Jest/Vitest)
npm test codigoHelper.test.js
```