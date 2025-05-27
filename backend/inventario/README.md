# Módulo de Inventarios

## Descripción
Este módulo gestiona el control de inventario del sistema, incluyendo:
- Control de stock en múltiples almacenes
- Movimientos de entrada, salida, transferencias y ajustes
- Alertas automáticas de stock
- Cálculo de costos promedio
- Gestión de lotes y fechas de vencimiento

## Instalación

### Backend

1. **Aplicar migraciones**:
```bash
cd backend
python manage.py makemigrations inventario
python manage.py migrate
```

2. **Cargar datos iniciales**:
```bash
python manage.py loaddata inventario/fixtures/initial_data.json
```

3. **Verificar instalación**:
- Acceder a http://localhost:8000/admin/
- Verificar que aparecen los modelos de inventario

### Frontend

1. **Instalar dependencias** (si no están instaladas):
```bash
cd pandora
npm install axios sonner
```

2. **Importar el módulo en el router principal**:
En el archivo de rutas principal, agregar:
```javascript
import InventoryDashboard from '@/modulos/inventarios/pages/InventoryDashboard';

// En las rutas:
<Route path="/inventarios" element={<InventoryDashboard />} />
```

## Estructura del Módulo

### Backend
```
/backend/inventario/
├── models.py          # Modelos de datos
├── serializers.py     # Serializadores DRF
├── views.py          # Vistas y ViewSets
├── urls.py           # URLs del módulo
├── admin.py          # Configuración del admin
├── utils/            # Utilidades
│   ├── stock_calculator.py
│   └── alerts.py
└── tests/            # Pruebas unitarias
```

### Frontend
```
/pandora/src/modulos/inventarios/
├── api/              # Llamadas a la API
├── components/       # Componentes React
├── hooks/           # Custom hooks
├── pages/           # Páginas principales
├── utils/           # Utilidades
└── constants/       # Constantes
```

## API Endpoints

### Almacenes
- `GET /api/inventario/almacenes/` - Listar almacenes
- `POST /api/inventario/almacenes/` - Crear almacén
- `GET /api/inventario/almacenes/{id}/` - Detalle de almacén
- `PUT /api/inventario/almacenes/{id}/` - Actualizar almacén
- `DELETE /api/inventario/almacenes/{id}/` - Eliminar almacén

### Stocks
- `GET /api/inventario/stocks/` - Listar stocks
- `GET /api/inventario/stocks/resumen/` - Resumen general
- `GET /api/inventario/stocks/alertas/` - Productos con alertas
- `POST /api/inventario/stocks/{id}/ajustar_minimos/` - Ajustar mínimos/máximos

### Movimientos
- `GET /api/inventario/movimientos/` - Listar movimientos
- `POST /api/inventario/movimientos/` - Crear movimiento
- `POST /api/inventario/movimientos/{id}/confirmar/` - Confirmar movimiento
- `POST /api/inventario/movimientos/{id}/anular/` - Anular movimiento

### Tipos de Movimiento
- `GET /api/inventario/tipos-movimiento/` - Listar tipos

### Alertas
- `GET /api/inventario/alertas/` - Listar alertas
- `POST /api/inventario/alertas/{id}/marcar_leida/` - Marcar como leída
- `POST /api/inventario/alertas/marcar_todas_leidas/` - Marcar todas como leídas

## Características Principales

### 1. Control de Stock
- Stock por almacén y lote
- Cantidades disponibles vs reservadas
- Estados automáticos (normal, bajo, crítico, agotado)

### 2. Movimientos
- **Entradas**: Compras, devoluciones
- **Salidas**: Ventas, consumo interno
- **Transferencias**: Entre almacenes
- **Ajustes**: Correcciones de inventario

### 3. Alertas Automáticas
- Stock mínimo alcanzado
- Productos próximos a vencer (30 días)
- Stock agotado
- Stock máximo excedido

### 4. Cálculo de Costos
- Costo promedio ponderado automático
- Valorización del inventario

## Uso

### Crear un movimiento de entrada
```javascript
const movimiento = {
  tipo_movimiento: 1, // ID del tipo
  fecha: '2024-01-15',
  numero_documento: 'FAC-001',
  almacen_destino: 1,
  observaciones: 'Compra inicial',
  detalles: [
    {
      producto: 1,
      cantidad: 100,
      unidad_medida: 1,
      costo_unitario: 10.50,
      lote: 'L001'
    }
  ]
};

await inventoryApi.createMovimiento(movimiento);
```

### Consultar stock disponible
```javascript
const stocks = await inventoryApi.getStocks({
  almacen: 1,
  estado_stock: 'critico'
});
```

## Permisos y Seguridad
- Todos los endpoints requieren autenticación
- Los movimientos confirmados no pueden modificarse
- Solo se pueden anular movimientos confirmados
- Las alertas son personales por usuario

## Mantenimiento

### Limpieza de alertas antiguas
```python
from inventario.utils.alerts import AlertManager
AlertManager.limpiar_alertas_antiguas(dias=30)
```

### Verificación de alertas
```python
from inventario.utils.alerts import AlertManager
alertas_nuevas = AlertManager.verificar_alertas_stock()
```

## Troubleshooting

### Error: "Stock insuficiente"
- Verificar que existe stock disponible en el almacén origen
- Revisar que no esté reservado

### Las alertas no se generan
- Verificar que los stocks tengan definidos stock_minimo
- Ejecutar manualmente `verificar_alertas_stock()`

### Error en cálculo de costos
- Verificar que los movimientos de entrada tengan costo_unitario
- Revisar la configuración de afecta_costo en el tipo de movimiento
