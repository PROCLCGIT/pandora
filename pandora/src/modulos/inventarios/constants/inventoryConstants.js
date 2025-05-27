// Estados de stock
export const STOCK_STATES = {
  AGOTADO: 'agotado',
  CRITICO: 'critico',
  BAJO: 'bajo',
  NORMAL: 'normal',
  ALTO: 'alto',
};

// Tipos de movimiento
export const MOVEMENT_TYPES = {
  ENTRADA: 'entrada',
  SALIDA: 'salida',
  AJUSTE: 'ajuste',
  TRANSFERENCIA: 'transferencia',
};

// Estados de movimiento
export const MOVEMENT_STATES = {
  BORRADOR: 'borrador',
  CONFIRMADO: 'confirmado',
  ANULADO: 'anulado',
};

// Tipos de alerta
export const ALERT_TYPES = {
  MINIMO: 'minimo',
  MAXIMO: 'maximo',
  VENCIMIENTO: 'vencimiento',
  AGOTADO: 'agotado',
};

// Configuración de alertas
export const ALERT_CONFIG = {
  DIAS_VENCIMIENTO: 30, // Días antes del vencimiento para generar alerta
  FACTOR_STOCK_BAJO: 1.5, // Factor para considerar stock bajo (stock_minimo * factor)
};

// Colores para estados
export const STATE_COLORS = {
  [STOCK_STATES.AGOTADO]: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
  },
  [STOCK_STATES.CRITICO]: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
  },
  [STOCK_STATES.BAJO]: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    border: 'border-yellow-200',
  },
  [STOCK_STATES.NORMAL]: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
  },
  [STOCK_STATES.ALTO]: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
  },
};
