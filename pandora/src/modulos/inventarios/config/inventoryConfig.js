/**
 * Configuración del módulo de inventarios
 */

export const INVENTORY_CONFIG = {
  // Configuración de alertas
  alerts: {
    daysBeforeExpiration: 30, // Días antes del vencimiento para generar alerta
    lowStockFactor: 1.5, // Factor para considerar stock bajo (stock_minimo * factor)
    refreshInterval: 60000, // Intervalo de actualización de alertas (ms)
  },

  // Configuración de paginación
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  // Configuración de exportación
  export: {
    defaultFormat: 'csv',
    formats: ['csv', 'excel', 'pdf'],
    maxRecords: 10000,
  },

  // Configuración de validaciones
  validation: {
    minQuantity: 0.0001,
    maxQuantity: 999999.9999,
    decimalPlaces: 4,
  },

  // Configuración de gráficos
  charts: {
    colors: {
      primary: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#06b6d4',
    },
    defaultHeight: 300,
  },

  // Configuración de movimientos
  movements: {
    requireDocument: {
      entrada: true,
      salida: true,
      transferencia: true,
      ajuste: false,
    },
    allowNegativeStock: false,
    requireApproval: false,
  },

  // Configuración de reportes
  reports: {
    defaultPeriod: 30, // días
    maxPeriod: 365, // días
    formats: ['pdf', 'excel'],
  },

  // URLs de la API
  api: {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    timeout: 30000, // 30 segundos
    retryAttempts: 3,
  },
};

// Configuración de permisos por rol
export const INVENTORY_PERMISSIONS = {
  admin: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canConfirm: true,
    canCancel: true,
    canViewReports: true,
    canExport: true,
    canManageWarehouses: true,
  },
  supervisor: {
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canConfirm: true,
    canCancel: true,
    canViewReports: true,
    canExport: true,
    canManageWarehouses: false,
  },
  operator: {
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canConfirm: false,
    canCancel: false,
    canViewReports: false,
    canExport: false,
    canManageWarehouses: false,
  },
  viewer: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canConfirm: false,
    canCancel: false,
    canViewReports: true,
    canExport: true,
    canManageWarehouses: false,
  },
};

// Mensajes del sistema
export const INVENTORY_MESSAGES = {
  success: {
    stockUpdated: 'Stock actualizado correctamente',
    movementCreated: 'Movimiento creado correctamente',
    movementConfirmed: 'Movimiento confirmado correctamente',
    movementCanceled: 'Movimiento anulado correctamente',
    warehouseCreated: 'Almacén creado correctamente',
    warehouseUpdated: 'Almacén actualizado correctamente',
    warehouseDeleted: 'Almacén eliminado correctamente',
    reportGenerated: 'Reporte generado correctamente',
    dataExported: 'Datos exportados correctamente',
  },
  error: {
    insufficientStock: 'Stock insuficiente para realizar la operación',
    invalidQuantity: 'La cantidad ingresada no es válida',
    movementNotFound: 'Movimiento no encontrado',
    warehouseNotFound: 'Almacén no encontrado',
    productNotFound: 'Producto no encontrado',
    cannotDeleteWarehouse: 'No se puede eliminar el almacén porque tiene movimientos asociados',
    cannotConfirmMovement: 'No se puede confirmar el movimiento',
    cannotCancelMovement: 'Solo se pueden anular movimientos confirmados',
    reportGenerationFailed: 'Error al generar el reporte',
    exportFailed: 'Error al exportar los datos',
  },
  warning: {
    lowStock: 'El producto tiene stock bajo',
    criticalStock: 'El producto tiene stock crítico',
    expiringSoon: 'El producto está próximo a vencer',
    noData: 'No hay datos para mostrar',
  },
  info: {
    loadingData: 'Cargando datos...',
    processingRequest: 'Procesando solicitud...',
    generatingReport: 'Generando reporte...',
    exportingData: 'Exportando datos...',
  },
};
