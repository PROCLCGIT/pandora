// /pandora/src/modulos/brief/routes/index.js

import { lazy } from 'react';
import { 
  FileText, 
  PlusCircle, 
  BarChart3, 
  Settings,
  Clock,
  CheckCircle
} from 'lucide-react';

// Lazy loading de componentes para mejor performance
const BriefDashboard = lazy(() => import('../pages/BriefDashboard'));
const BriefDetailPage = lazy(() => import('../pages/BriefDetailPage'));

// Configuración de rutas del módulo Brief
export const briefRoutes = [
  {
    path: '/briefs',
    element: BriefDashboard,
    name: 'Dashboard',
    title: 'Gestión de Briefs',
    description: 'Administra requerimientos y solicitudes de clientes',
    icon: FileText,
    inNavigation: true,
    permission: 'brief.view_brief'
  },
  {
    path: '/briefs/dashboard',
    element: BriefDashboard,
    name: 'Dashboard',
    title: 'Dashboard de Briefs',
    icon: BarChart3,
    inNavigation: false,
    permission: 'brief.view_brief'
  },
  {
    path: '/briefs/:briefId',
    element: BriefDetailPage,
    name: 'Detalle',
    title: 'Detalle del Brief',
    icon: FileText,
    inNavigation: false,
    permission: 'brief.view_brief'
  }
];

// Configuración de navegación para el sidebar
export const briefNavigation = {
  title: 'Briefs',
  icon: FileText,
  path: '/briefs',
  badge: 'Nuevo',
  children: [
    {
      title: 'Dashboard',
      path: '/briefs',
      icon: BarChart3,
      description: 'Vista general y estadísticas'
    },
    {
      title: 'Todos los Briefs',
      path: '/briefs?view=all',
      icon: FileText,
      description: 'Lista completa de briefs'
    },
    {
      title: 'Pendientes',
      path: '/briefs?estado=pending',
      icon: Clock,
      description: 'Briefs pendientes de procesamiento',
      badge: 'dynamic' // Se calculará dinámicamente
    },
    {
      title: 'Completados',
      path: '/briefs?estado=completed',
      icon: CheckCircle,
      description: 'Briefs completados exitosamente'
    },
    {
      title: 'Crear Brief',
      path: '/briefs?action=create',
      icon: PlusCircle,
      description: 'Crear un nuevo brief'
    }
  ]
};

// Configuración de permisos del módulo
export const briefPermissions = [
  {
    codename: 'view_brief',
    name: 'Can view brief',
    content_type: 'brief'
  },
  {
    codename: 'add_brief',
    name: 'Can add brief',
    content_type: 'brief'
  },
  {
    codename: 'change_brief',
    name: 'Can change brief',
    content_type: 'brief'
  },
  {
    codename: 'delete_brief',
    name: 'Can delete brief',
    content_type: 'brief'
  },
  {
    codename: 'export_brief',
    name: 'Can export brief',
    content_type: 'brief'
  }
];

// Configuración de menús contextuales
export const briefContextMenus = {
  briefCard: [
    { label: 'Ver detalles', action: 'view', icon: 'Eye' },
    { label: 'Editar', action: 'edit', icon: 'Edit', permission: 'brief.change_brief' },
    { label: 'Duplicar', action: 'duplicate', icon: 'Copy', permission: 'brief.add_brief' },
    { separator: true },
    { label: 'Exportar', action: 'export', icon: 'Download', permission: 'brief.export_brief' },
    { label: 'Imprimir', action: 'print', icon: 'Printer' },
    { separator: true },
    { label: 'Eliminar', action: 'delete', icon: 'Trash2', permission: 'brief.delete_brief', danger: true }
  ],
  briefList: [
    { label: 'Seleccionar todos', action: 'selectAll', icon: 'CheckSquare' },
    { label: 'Exportar seleccionados', action: 'exportSelected', icon: 'Download' },
    { label: 'Cambiar estado', action: 'changeStatus', icon: 'RefreshCw' },
    { separator: true },
    { label: 'Eliminar seleccionados', action: 'deleteSelected', icon: 'Trash2', danger: true }
  ]
};

// Configuración de filtros predefinidos
export const briefPresetFilters = [
  {
    name: 'Mis Briefs',
    key: 'my_briefs',
    filters: { my_briefs: true },
    icon: 'User',
    color: 'blue'
  },
  {
    name: 'Urgentes',
    key: 'urgent',
    filters: { priority: ['urgente', 'critica'] },
    icon: 'AlertTriangle',
    color: 'red'
  },
  {
    name: 'Vencidos',
    key: 'overdue',
    filters: { vencidos: true },
    icon: 'Clock',
    color: 'orange'
  },
  {
    name: 'Sin Presupuesto',
    key: 'no_budget',
    filters: { sin_presupuesto: true },
    icon: 'DollarSign',
    color: 'gray'
  },
  {
    name: 'Esta Semana',
    key: 'this_week',
    filters: { 
      fecha_desde: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      fecha_hasta: new Date().toISOString().split('T')[0]
    },
    icon: 'Calendar',
    color: 'green'
  }
];

// Configuración de módulo completa
export const briefModuleConfig = {
  name: 'brief',
  title: 'Gestión de Briefs',
  description: 'Módulo para administrar requerimientos y solicitudes de clientes',
  version: '1.0.0',
  routes: briefRoutes,
  navigation: briefNavigation,
  permissions: briefPermissions,
  contextMenus: briefContextMenus,
  presetFilters: briefPresetFilters,
  settings: {
    defaultPageSize: 10,
    maxPageSize: 100,
    enableRealTimeUpdates: true,
    enableComments: true,
    enableHistory: true,
    defaultView: 'grid', // 'grid' or 'list'
    defaultSortBy: '-fecha_emision',
    enableExport: true,
    enablePrint: true,
    autoSave: true,
    autoSaveInterval: 30000, // 30 segundos
  }
};

export default briefModuleConfig;
