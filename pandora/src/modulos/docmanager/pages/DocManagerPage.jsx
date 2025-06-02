import React, { useState } from 'react';
import {
  Search,
  Filter,
  Upload,
  Grid3X3,
  List,
  Download,
  Share2,
  Eye,
  Edit,
  Trash2,
  Star,
  Clock,
  FileText,
  File,
  Image,
  Video,
  Music,
  Archive,
  Plus,
  FolderPlus,
  MoreVertical,
  Calendar,
  User,
  Tag,
  Lock,
  Unlock,
  BookOpen,
  BarChart3,
  TrendingUp,
  Users,
  HardDrive,
  ChevronRight,
  Home,
  Folder,
  Settings,
  Bell,
  Menu,
  X,
  ChevronDown,
  Activity,
  Zap,
  Shield,
  Globe,
  Check,
  ArrowUpRight,
  MousePointer,
  Layout,
  Layers,
  Database
} from 'lucide-react';

// Datos mejorados para documentos
const documentsData = [
  {
    id: 1,
    name: 'Propuesta_Comercial_Q3_2024.pdf',
    type: 'pdf',
    size: '3.2 MB',
    modified: '2024-05-24T14:30:00',
    author: 'María García',
    authorAvatar: 'MG',
    category: 'Ventas',
    status: 'shared',
    starred: true,
    tags: ['importante', 'cliente-vip'],
    preview: '/api/placeholder/300/400',
    downloads: 127,
    views: 456,
    lastAccessed: '2024-05-24T09:15:00'
  },
  {
    id: 2,
    name: 'Contrato_Servicios_Enterprise_ABC.docx',
    type: 'docx',
    size: '1.8 MB',
    modified: '2024-05-23T16:45:00',
    author: 'Carlos López',
    authorAvatar: 'CL',
    category: 'Contratos',
    status: 'restricted',
    starred: false,
    tags: ['legal', 'enterprise'],
    preview: '/api/placeholder/300/400',
    downloads: 23,
    views: 89,
    lastAccessed: '2024-05-23T11:20:00'
  },
  {
    id: 3,
    name: 'Presentacion_Resultados_Q2_2024.pptx',
    type: 'pptx',
    size: '15.7 MB',
    modified: '2024-05-22T10:15:00',
    author: 'Ana Rodríguez',
    authorAvatar: 'AR',
    category: 'Presentaciones',
    status: 'shared',
    starred: true,
    tags: ['financiero', 'ejecutivo'],
    preview: '/api/placeholder/300/400',
    downloads: 89,
    views: 234,
    lastAccessed: '2024-05-22T08:30:00'
  },
  {
    id: 4,
    name: 'Analisis_Financiero_Detallado_Mayo.xlsx',
    type: 'xlsx',
    size: '6.4 MB',
    modified: '2024-05-21T13:20:00',
    author: 'Pedro Martínez',
    authorAvatar: 'PM',
    category: 'Finanzas',
    status: 'private',
    starred: false,
    tags: ['confidencial', 'analisis'],
    preview: '/api/placeholder/300/400',
    downloads: 12,
    views: 45,
    lastAccessed: '2024-05-21T14:45:00'
  },
  {
    id: 5,
    name: 'Manual_Usuario_Sistema_v4.2.pdf',
    type: 'pdf',
    size: '12.3 MB',
    modified: '2024-05-20T09:30:00',
    author: 'Luis Fernández',
    authorAvatar: 'LF',
    category: 'Documentación',
    status: 'public',
    starred: false,
    tags: ['manual', 'usuario'],
    preview: '/api/placeholder/300/400',
    downloads: 345,
    views: 1234,
    lastAccessed: '2024-05-20T15:10:00'
  },
  {
    id: 6,
    name: 'Brand_Guidelines_2024.png',
    type: 'image',
    size: '4.6 MB',
    modified: '2024-05-19T14:20:00',
    author: 'Sofia Chen',
    authorAvatar: 'SC',
    category: 'Diseño',
    status: 'shared',
    starred: true,
    tags: ['branding', 'diseño'],
    preview: '/api/placeholder/300/400',
    downloads: 67,
    views: 189,
    lastAccessed: '2024-05-19T16:30:00'
  }
];

// Métricas mejoradas
const advancedMetrics = {
  totalDocuments: 2847,
  storageUsed: 67.8,
  storageTotal: 100,
  activeCollaborators: 145,
  dailyUploads: 28,
  weeklyDownloads: 1247,
  securityScore: 98,
  systemHealth: 99.9
};

// Categorías mejoradas con iconos y colores
const advancedCategories = [
  { name: 'Todos', count: 2847, icon: Layout, color: 'blue', gradient: 'from-blue-500 to-cyan-500' },
  { name: 'Ventas', count: 456, icon: TrendingUp, color: 'green', gradient: 'from-green-500 to-emerald-500' },
  { name: 'Contratos', count: 234, icon: Shield, color: 'purple', gradient: 'from-purple-500 to-indigo-500' },
  { name: 'Finanzas', count: 189, icon: BarChart3, color: 'yellow', gradient: 'from-yellow-500 to-orange-500' },
  { name: 'Presentaciones', count: 178, icon: BookOpen, color: 'pink', gradient: 'from-pink-500 to-rose-500' },
  { name: 'Diseño', count: 345, icon: Image, color: 'indigo', gradient: 'from-indigo-500 to-purple-500' },
  { name: 'Documentación', count: 567, icon: FileText, color: 'gray', gradient: 'from-gray-500 to-slate-500' }
];

// Actividad reciente
const recentActivity = [
  { user: 'María García', action: 'subió', document: 'Propuesta_Comercial_Q3_2024.pdf', time: '5 min' },
  { user: 'Carlos López', action: 'editó', document: 'Contrato_Servicios_Enterprise.docx', time: '12 min' },
  { user: 'Ana Rodríguez', action: 'compartió', document: 'Presentacion_Resultados_Q2.pptx', time: '25 min' },
  { user: 'Pedro Martínez', action: 'descargó', document: 'Analisis_Financiero_Mayo.xlsx', time: '1 hora' }
];

// Componente de métrica avanzada
const AdvancedMetricCard = ({ title, value, subtitle, icon: Icon, gradient, trend, trendValue }) => {
  return (
    <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group hover:-translate-y-1">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center text-xs px-2 py-1 rounded-full ${
              trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <ArrowUpRight className="w-3 h-3 mr-1" />
              {trendValue}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

// Componente de icono de archivo mejorado
const EnhancedFileIcon = ({ type, className = "w-8 h-8" }) => {
  const iconConfig = {
    pdf: { icon: FileText, gradient: 'from-red-500 to-red-600' },
    docx: { icon: FileText, gradient: 'from-blue-500 to-blue-600' },
    xlsx: { icon: FileText, gradient: 'from-green-500 to-green-600' },
    pptx: { icon: FileText, gradient: 'from-orange-500 to-orange-600' },
    image: { icon: Image, gradient: 'from-purple-500 to-purple-600' },
    video: { icon: Video, gradient: 'from-pink-500 to-pink-600' },
    audio: { icon: Music, gradient: 'from-indigo-500 to-indigo-600' },
    archive: { icon: Archive, gradient: 'from-gray-500 to-gray-600' }
  };

  const config = iconConfig[type] || iconConfig.archive;
  const Icon = config.icon;

  return (
    <div className={`${className} rounded-xl bg-gradient-to-br ${config.gradient} p-2 shadow-lg flex items-center justify-center`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
  );
};

// Componente de badge de estado mejorado
const EnhancedStatusBadge = ({ status }) => {
  const statusConfig = {
    public: { 
      label: 'Público', 
      gradient: 'from-green-500 to-emerald-500', 
      icon: Globe,
      bg: 'bg-green-50 border-green-200'
    },
    shared: { 
      label: 'Compartido', 
      gradient: 'from-blue-500 to-cyan-500', 
      icon: Share2,
      bg: 'bg-blue-50 border-blue-200'
    },
    private: { 
      label: 'Privado', 
      gradient: 'from-gray-500 to-slate-500', 
      icon: Lock,
      bg: 'bg-gray-50 border-gray-200'
    },
    restricted: { 
      label: 'Restringido', 
      gradient: 'from-red-500 to-red-600', 
      icon: Shield,
      bg: 'bg-red-50 border-red-200'
    }
  };

  const config = statusConfig[status] || statusConfig.private;
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center px-3 py-1.5 rounded-full border ${config.bg}`}>
      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${config.gradient} mr-2`}></div>
      <Icon className="w-3 h-3 mr-1 text-gray-600" />
      <span className="text-xs font-medium text-gray-700">{config.label}</span>
    </div>
  );
};

// Componente de avatar
const UserAvatar = ({ name, size = "sm" }) => {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base"
  };

  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg`}>
      {name}
    </div>
  );
};

// Componente principal DocManager Premium
const DocManagerPremium = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('modified');

  const filteredDocuments = documentsData.filter(doc => {
    const matchesCategory = selectedCategory === 'Todos' || doc.category === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header principal con estilo similar a la imagen */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-semibold">Gestor Documental</h1>
            <button className="bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
              <FileText className="w-5 h-5" />
              Subir Documento
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Barra de herramientas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Barra de búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por título, descripción, tipo de archivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            
            {/* Botones de acción */}
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center gap-2 transition-colors">
                <Filter className="w-4 h-4" />
                Filtros
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${
                    viewMode === 'grid' 
                      ? 'bg-white shadow-sm text-blue-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  } transition-all`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${
                    viewMode === 'list' 
                      ? 'bg-white shadow-sm text-blue-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  } transition-all`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
              
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors">
                <Users className="w-4 h-4" />
                Grupos
              </button>
              
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors">
                <Folder className="w-4 h-4" />
                Colecciones
              </button>
            </div>
          </div>
        </div>

        {/* Área Principal - Ancho completo */}
        <div className="space-y-6">

            {/* Vista de documentos */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDocuments.map((doc) => (
                  <div key={doc.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                    {/* Contenido del documento */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <EnhancedFileIcon type={doc.type} />
                        <button className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2" title={doc.name}>
                        {doc.name}
                      </h4>
                      
                      <p className="text-xs text-gray-500 mb-3">{doc.size} • {formatDate(doc.modified)}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserAvatar name={doc.authorAvatar} size="sm" />
                          <span className="text-xs text-gray-600">{doc.author}</span>
                        </div>
                        {doc.starred && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                    </div>
                    
                    {/* Barra de acciones */}
                    <div className="border-t border-gray-100 px-4 py-2 flex items-center justify-between bg-gray-50">
                      <span className="text-xs text-gray-500">{doc.category}</span>
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-green-600 rounded transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-purple-600 rounded transition-colors">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Documento
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Tamaño
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Modificado
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Autor
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredDocuments.map((doc) => (
                        <tr key={doc.id} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-4">
                              <EnhancedFileIcon type={doc.type} className="w-10 h-10" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-gray-900 truncate">{doc.name}</div>
                                <div className="text-sm text-gray-500">{doc.category}</div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {doc.tags.slice(0, 2).map((tag, index) => (
                                    <span key={index} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              {doc.starred && <Star className="w-5 h-5 text-yellow-500 fill-current" />}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {doc.size}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(doc.modified)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <UserAvatar name={doc.authorAvatar} size="md" />
                              <span className="text-sm font-medium text-gray-900">{doc.author}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <EnhancedStatusBadge status={doc.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-all">
                                <Download className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-all">
                                <Share2 className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Paginación */}
            <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="text-sm text-gray-600">
                Mostrando <span className="font-semibold text-gray-900">{filteredDocuments.length}</span> de{' '}
                <span className="font-semibold text-gray-900">{documentsData.length}</span> documentos
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Anterior
                </button>
                <button className="px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  1
                </button>
                <button className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  2
                </button>
                <button className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Siguiente
                </button>
              </div>
            </div>
        </div>

        {/* Secciones auxiliares debajo de la tabla */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Acciones Rápidas */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-blue-600" />
              Acciones Rápidas
            </h3>
            
            <div className="space-y-3">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center">
                <Upload className="w-5 h-5 mr-2" />
                Subir Documentos
              </button>
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center">
                <FolderPlus className="w-5 h-5 mr-2" />
                Nueva Carpeta
              </button>
            </div>
          </div>

          {/* Categorías */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Folder className="w-5 h-5 mr-2 text-indigo-600" />
              Categorías
            </h4>
            <nav className="space-y-2">
              {advancedCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all ${
                      selectedCategory === category.name
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      selectedCategory === category.name 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {category.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Actividad Reciente */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-green-600" />
              Actividad Reciente
            </h4>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.user} {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{activity.document}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocManagerPremium;