// /Users/clc/Ws/Appclc/pandora/src/modulos/brief/pages/BriefDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Calendar,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import * as briefService from '../api/briefService';
import { useDebounce } from '@/hooks/custom/useDebounce';

const BriefDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingBriefs, setIsLoadingBriefs] = useState(true);
  const [briefStats, setBriefStats] = useState({
    total: 0,
    by_status: {
      draft: 0,
      pending: 0,
      approved: 0,
      processing: 0,
      completed: 0,
      cancelled: 0
    },
    by_priority: {},
    by_origin: {},
    vencidos: 0,
    sin_presupuesto: 0,
    total_presupuesto: 0
  });
  const [recentBriefs, setRecentBriefs] = useState([]);
  const [filteredBriefs, setFilteredBriefs] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    client: '',
    dateFrom: '',
    dateTo: ''
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch stats
  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const stats = await briefService.getBriefStats();
      setBriefStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las estadísticas',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Fetch recent briefs
  const fetchRecentBriefs = async () => {
    try {
      setIsLoadingBriefs(true);
      const response = await briefService.getBriefs({ 
        ordering: '-fecha_emision',
        page_size: 10 
      });
      const briefs = response.results || [];
      setRecentBriefs(briefs);
      setFilteredBriefs(briefs);
    } catch (error) {
      console.error('Error fetching briefs:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los briefs recientes',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingBriefs(false);
    }
  };

  // Search and filter briefs
  const searchAndFilterBriefs = async () => {
    try {
      setIsLoadingBriefs(true);
      const params = {
        search: debouncedSearchTerm,
        estado: filters.status,
        priority: filters.priority,
        client: filters.client,
        fecha_desde: filters.dateFrom,
        fecha_hasta: filters.dateTo,
        ordering: '-fecha_emision'
      };
      const response = await briefService.getBriefs(params);
      const briefs = response.results || [];
      setFilteredBriefs(briefs);
    } catch (error) {
      console.error('Error searching briefs:', error);
      toast({
        title: 'Error',
        description: 'Error al buscar briefs',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingBriefs(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchStats();
    fetchRecentBriefs();
  }, []);

  // Search effect
  useEffect(() => {
    if (debouncedSearchTerm || Object.values(filters).some(f => f)) {
      searchAndFilterBriefs();
    } else {
      setFilteredBriefs(recentBriefs);
    }
  }, [debouncedSearchTerm, filters, recentBriefs]);

  // Handle navigation to new brief
  const handleNewBrief = () => {
    navigate('/brief/nuevo');
  };

  // Handle navigation to brief detail
  const handleViewDetail = (briefId) => {
    navigate(`/brief/${briefId}`);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'baja': 'bg-green-100 text-green-800',
      'media': 'bg-yellow-100 text-yellow-800',
      'alta': 'bg-red-100 text-red-800',
      'urgente': 'bg-purple-100 text-purple-800',
      'critica': 'bg-red-200 text-red-900'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'processing': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-200 text-green-900',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': <Clock className="h-4 w-4" />,
      'approved': <CheckCircle className="h-4 w-4" />,
      'processing': <TrendingUp className="h-4 w-4" />,
      'completed': <CheckCircle className="h-4 w-4" />,
      'cancelled': <XCircle className="h-4 w-4" />
    };
    return icons[status] || <AlertCircle className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Brief</h1>
            <p className="text-gray-600 mt-1">Gestión de requerimientos y solicitudes</p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleNewBrief}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Brief
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Briefs</p>
                  {isLoadingStats ? (
                    <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{briefStats.total}</p>
                  )}
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  {isLoadingStats ? (
                    <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    <p className="text-2xl font-bold text-yellow-600">{briefStats.by_status?.pending || 0}</p>
                  )}
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aprobados</p>
                  {isLoadingStats ? (
                    <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    <p className="text-2xl font-bold text-green-600">{briefStats.by_status?.approved || 0}</p>
                  )}
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completados</p>
                  {isLoadingStats ? (
                    <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    <p className="text-2xl font-bold text-blue-600">{briefStats.by_status?.completed || 0}</p>
                  )}
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cancelados</p>
                  {isLoadingStats ? (
                    <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    <p className="text-2xl font-bold text-red-600">{briefStats.by_status?.cancelled || 0}</p>
                  )}
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Briefs Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar briefs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="border-blue-200 text-blue-700">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>

            {/* Briefs Table */}
            {isLoadingBriefs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : filteredBriefs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">No se encontraron briefs</p>
                <p className="text-gray-500 mt-2">
                  {searchTerm || Object.values(filters).some(f => f) 
                    ? 'Intenta ajustar tus filtros de búsqueda' 
                    : 'Crea tu primer brief para comenzar'}
                </p>
                {!searchTerm && !Object.values(filters).some(f => f) && (
                  <Button 
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleNewBrief}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Brief
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Código</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Título</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Cliente</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Prioridad</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Operador</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Fecha</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBriefs.map((brief) => (
                      <tr key={brief.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="font-mono bg-blue-50 text-blue-800 border-blue-200">
                            {brief.code}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">{brief.title}</td>
                        <td className="py-3 px-4 text-gray-600">{brief.client_display || 'Sin cliente'}</td>
                        <td className="py-3 px-4">
                          <Badge className={getPriorityColor(brief.priority)}>
                            {brief.priority.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(brief.estado)}
                            <Badge className={getStatusColor(brief.estado)}>
                              {brief.estado.toUpperCase()}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {brief.operador_display || 'Sin asignar'}
                        </td>
                        <td className="py-3 px-4 text-gray-600 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(brief.fecha_emision).toLocaleDateString('es-ES')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600 hover:bg-blue-50"
                            onClick={() => handleViewDetail(brief.id)}
                          >
                            Ver Detalle
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BriefDashboard;