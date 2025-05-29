// /pandora/src/modulos/brief/utils/briefColors.js

export const PRIORITY_COLORS = {
  baja: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800',
    icon: 'text-emerald-600',
    gradient: 'from-emerald-50 to-emerald-100',
    hover: 'hover:bg-emerald-100',
    ring: 'ring-emerald-200'
  },
  media: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
    icon: 'text-amber-600',
    gradient: 'from-amber-50 to-amber-100',
    hover: 'hover:bg-amber-100',
    ring: 'ring-amber-200'
  },
  alta: {
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-800',
    icon: 'text-orange-600',
    gradient: 'from-orange-50 to-orange-100',
    hover: 'hover:bg-orange-100',
    ring: 'ring-orange-200'
  },
  urgente: {
    bg: 'bg-red-50',
    text: 'text-red-800',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-800',
    icon: 'text-red-600',
    gradient: 'from-red-50 to-red-100',
    hover: 'hover:bg-red-100',
    ring: 'ring-red-200'
  },
  critica: {
    bg: 'bg-red-100',
    text: 'text-red-900',
    border: 'border-red-300',
    badge: 'bg-red-200 text-red-900',
    icon: 'text-red-700',
    gradient: 'from-red-100 to-red-200',
    hover: 'hover:bg-red-200',
    ring: 'ring-red-300',
    pulse: 'animate-pulse'
  }
};

export const STATUS_COLORS = {
  draft: {
    bg: 'bg-slate-50',
    text: 'text-slate-800',
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-800',
    icon: 'text-slate-600',
    gradient: 'from-slate-50 to-slate-100',
    hover: 'hover:bg-slate-100'
  },
  pending: {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
    icon: 'text-blue-600',
    gradient: 'from-blue-50 to-blue-100',
    hover: 'hover:bg-blue-100'
  },
  approved: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800',
    icon: 'text-emerald-600',
    gradient: 'from-emerald-50 to-emerald-100',
    hover: 'hover:bg-emerald-100'
  },
  processing: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-800',
    icon: 'text-indigo-600',
    gradient: 'from-indigo-50 to-indigo-100',
    hover: 'hover:bg-indigo-100'
  },
  completed: {
    bg: 'bg-green-50',
    text: 'text-green-800',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-800',
    icon: 'text-green-600',
    gradient: 'from-green-50 to-green-100',
    hover: 'hover:bg-green-100'
  },
  cancelled: {
    bg: 'bg-gray-50',
    text: 'text-gray-800',
    border: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-800',
    icon: 'text-gray-600',
    gradient: 'from-gray-50 to-gray-100',
    hover: 'hover:bg-gray-100'
  }
};

export const ORIGIN_ICONS = {
  telefono: 'Phone',
  email: 'Mail',
  presencial: 'Building',
  whatsapp: 'MessageCircle',
  web: 'Globe',
  referido: 'Users',
  redes: 'Share2'
};

export const DESTINATION_ICONS = {
  cot_cliente: 'FileText',
  sol_proveedor: 'Truck',
  orden_compra: 'ShoppingCart',
  proforma: 'Receipt',
  analisis: 'TrendingUp'
};

// Función para obtener el color de prioridad
export const getPriorityColor = (priority) => {
  return PRIORITY_COLORS[priority] || PRIORITY_COLORS.media;
};

// Función para obtener el color de estado
export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || STATUS_COLORS.draft;
};

// Función para obtener el ícono de origen
export const getOriginIcon = (origin) => {
  return ORIGIN_ICONS[origin] || 'HelpCircle';
};

// Función para obtener el ícono de destino
export const getDestinationIcon = (destination) => {
  return DESTINATION_ICONS[destination] || 'FileText';
};
