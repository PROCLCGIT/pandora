// /pandora/src/modulos/brief/index.js

// Exportar páginas principales
export { default as BriefDashboard } from './pages/BriefDashboard';
export { default as BriefDetailPage } from './pages/BriefDetailPage';

// Exportar componentes principales
export { default as BriefCard } from './components/BriefCard';
export { default as BriefList } from './components/BriefList';
export { default as BriefForm } from './components/BriefForm';
export { default as BriefFilters } from './components/BriefFilters';
export { default as StatsCards } from './components/StatsCards';
export { default as BriefItemsList } from './components/BriefItemsList';
export { default as BriefHistoryTimeline } from './components/BriefHistoryTimeline';
export { default as BriefComments } from './components/BriefComments';

// Exportar hooks
export { 
  useBriefs, 
  useBrief, 
  useBriefStats, 
  useBriefChoices, 
  useBriefHistory 
} from './hooks/useBriefs';

// Exportar servicios
export { briefApiService } from './api/briefApi';

// Exportar utilidades
export * from './utils/briefColors';

// Exportar rutas y configuración
export { default as BriefRoutes } from './routes/BriefRoutes';
export { briefModuleConfig } from './routes/index';

// Configuración por defecto del módulo
export const BRIEF_MODULE_INFO = {
  name: 'brief',
  displayName: 'Gestión de Briefs',
  version: '1.0.0',
  description: 'Módulo completo para la gestión de requerimientos y solicitudes de clientes',
  author: 'Equipo de Desarrollo',
  category: 'Ventas y CRM',
  dependencies: [
    'react',
    'react-router-dom',
    '@tanstack/react-query',
    'react-hook-form',
    'axios',
    'date-fns',
    'lucide-react'
  ],
  features: [
    'Dashboard interactivo con estadísticas en tiempo real',
    'Gestión completa de briefs (CRUD)',
    'Sistema de filtros avanzados',
    'Vista de tarjetas y lista',
    'Formularios inteligentes con validación',
    'Sistema de comentarios y colaboración',
    'Historial de cambios con timeline',
    'Exportación y reportes',
    'Sistema de permisos granular',
    'Responsive design',
    'Colores dinámicos por prioridad y estado',
    'Búsqueda en tiempo real',
    'Paginación eficiente',
    'Integración con otros módulos'
  ],
  screenshots: [
    '/screenshots/brief-dashboard.png',
    '/screenshots/brief-detail.png',
    '/screenshots/brief-form.png'
  ],
  documentation: '/docs/brief-module.md'
};

// Constantes útiles del módulo
export const BRIEF_CONSTANTS = {
  // Estados
  STATUS: {
    DRAFT: 'draft',
    PENDING: 'pending',
    APPROVED: 'approved',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },
  
  // Prioridades
  PRIORITY: {
    BAJA: 'baja',
    MEDIA: 'media',
    ALTA: 'alta',
    URGENTE: 'urgente',
    CRITICA: 'critica'
  },
  
  // Orígenes
  ORIGIN: {
    TELEFONO: 'telefono',
    EMAIL: 'email',
    PRESENCIAL: 'presencial',
    WHATSAPP: 'whatsapp',
    WEB: 'web',
    REFERIDO: 'referido',
    REDES_SOCIALES: 'redes'
  },
  
  // Destinos
  DESTINATION: {
    COTIZACION_CLIENTE: 'cot_cliente',
    SOLICITUD_PROVEEDOR: 'sol_proveedor',
    ORDEN_COMPRA: 'orden_compra',
    PROFORMA: 'proforma',
    ANALISIS_PRECIOS: 'analisis'
  },
  
  // Formas de pago
  PAYMENT_METHOD: {
    CONTADO: 'contado',
    CREDITO_15: 'credito_15',
    CREDITO_30: 'credito_30',
    CREDITO_45: 'credito_45',
    CREDITO_60: 'credito_60',
    CREDITO_90: 'credito_90',
    TRANSFERENCIA: 'transferencia',
    CHEQUE: 'cheque'
  }
};

// Funciones de utilidad del módulo
export const BRIEF_UTILS = {
  // Generar código de brief
  generateBriefCode: (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-4);
    return `BRF${year}${month}${timestamp}`;
  },
  
  // Calcular días restantes
  getDaysRemaining: (dueDate) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },
  
  // Verificar si está vencido
  isOverdue: (dueDate, status) => {
    if (!dueDate || ['completed', 'cancelled'].includes(status)) return false;
    return new Date(dueDate) < new Date();
  },
  
  // Calcular progreso basado en estado
  getProgressByStatus: (status) => {
    const progressMap = {
      [BRIEF_CONSTANTS.STATUS.DRAFT]: 10,
      [BRIEF_CONSTANTS.STATUS.PENDING]: 25,
      [BRIEF_CONSTANTS.STATUS.APPROVED]: 50,
      [BRIEF_CONSTANTS.STATUS.PROCESSING]: 75,
      [BRIEF_CONSTANTS.STATUS.COMPLETED]: 100,
      [BRIEF_CONSTANTS.STATUS.CANCELLED]: 0
    };
    return progressMap[status] || 0;
  },
  
  // Formatear presupuesto
  formatBudget: (amount, currency = 'USD') => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  },
  
  // Validar datos de brief
  validateBriefData: (briefData) => {
    const errors = {};
    
    if (!briefData.title?.trim()) {
      errors.title = 'El título es requerido';
    }
    
    if (!briefData.client) {
      errors.client = 'El cliente es requerido';
    }
    
    if (!briefData.operador) {
      errors.operador = 'El operador es requerido';
    }
    
    if (briefData.tiempo_entrega && briefData.tiempo_entrega < 1) {
      errors.tiempo_entrega = 'El tiempo de entrega debe ser al menos 1 día';
    }
    
    if (briefData.presupuesto && briefData.presupuesto < 0) {
      errors.presupuesto = 'El presupuesto no puede ser negativo';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

// Hook de configuración del módulo
export const useBriefModule = () => {
  return {
    moduleInfo: BRIEF_MODULE_INFO,
    constants: BRIEF_CONSTANTS,
    utils: BRIEF_UTILS,
    config: briefModuleConfig
  };
};

export default {
  // Componentes principales
  BriefDashboard,
  BriefDetailPage,
  BriefCard,
  BriefList,
  BriefForm,
  BriefFilters,
  StatsCards,
  BriefItemsList,
  BriefHistoryTimeline,
  BriefComments,
  
  // Rutas
  BriefRoutes,
  
  // Configuración
  config: briefModuleConfig,
  constants: BRIEF_CONSTANTS,
  utils: BRIEF_UTILS,
  info: BRIEF_MODULE_INFO
};
