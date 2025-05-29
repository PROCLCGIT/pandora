// /pandora/src/modulos/brief/hooks/useBriefs.js

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { briefApiService } from '../api/briefApi';
import { toast } from '@/hooks/use-toast';

// Hook principal para gestión de briefs
export const useBriefs = (initialFilters = {}) => {
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 10,
    ...initialFilters
  });
  
  const queryClient = useQueryClient();

  // Query para obtener lista de briefs
  const {
    data: briefsData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['briefs', filters],
    queryFn: () => briefApiService.getBriefs(filters),
    keepPreviousData: true,
    staleTime: 30000, // 30 segundos
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: briefApiService.createBrief,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['briefs']);
      toast({
        title: "Brief creado",
        description: `Brief ${data.code} creado exitosamente.`,
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al crear brief",
        description: error.response?.data?.detail || "Error desconocido",
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => briefApiService.updateBrief(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['briefs']);
      queryClient.invalidateQueries(['brief', data.id]);
      toast({
        title: "Brief actualizado",
        description: `Brief ${data.code} actualizado exitosamente.`,
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar brief",
        description: error.response?.data?.detail || "Error desconocido",
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: briefApiService.deleteBrief,
    onSuccess: () => {
      queryClient.invalidateQueries(['briefs']);
      toast({
        title: "Brief eliminado",
        description: "El brief ha sido eliminado exitosamente.",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar brief",
        description: error.response?.data?.detail || "Error desconocido",
        variant: "destructive",
      });
    }
  });

  const duplicateMutation = useMutation({
    mutationFn: briefApiService.duplicateBrief,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['briefs']);
      toast({
        title: "Brief duplicado",
        description: `Brief duplicado como ${data.code}.`,
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al duplicar brief",
        description: error.response?.data?.detail || "Error desconocido",
        variant: "destructive",
      });
    }
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({ id, status, reason }) => briefApiService.changeStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['briefs']);
      toast({
        title: "Estado actualizado",
        description: "El estado del brief ha sido actualizado.",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al cambiar estado",
        description: error.response?.data?.detail || "Error desconocido",
        variant: "destructive",
      });
    }
  });

  // Helper functions
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ page: 1, page_size: 10 });
  }, []);

  const nextPage = useCallback(() => {
    if (briefsData?.next) {
      setFilters(prev => ({ ...prev, page: prev.page + 1 }));
    }
  }, [briefsData?.next]);

  const prevPage = useCallback(() => {
    if (briefsData?.previous) {
      setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }));
    }
  }, [briefsData?.previous]);

  return {
    // Data
    briefs: briefsData?.results || [],
    pagination: {
      count: briefsData?.count || 0,
      totalPages: briefsData?.total_pages || 0,
      currentPage: briefsData?.current_page || 1,
      pageSize: briefsData?.page_size || 10,
      hasNext: !!briefsData?.next,
      hasPrevious: !!briefsData?.previous,
    },
    
    // States
    isLoading,
    isError,
    error,
    
    // Filters
    filters,
    updateFilters,
    resetFilters,
    
    // Pagination
    nextPage,
    prevPage,
    
    // Actions
    createBrief: createMutation.mutate,
    updateBrief: updateMutation.mutate,
    deleteBrief: deleteMutation.mutate,
    duplicateBrief: duplicateMutation.mutate,
    changeStatus: changeStatusMutation.mutate,
    
    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDuplicating: duplicateMutation.isPending,
    isChangingStatus: changeStatusMutation.isPending,
    
    // Utils
    refetch
  };
};

// Hook para obtener un brief específico
export const useBrief = (id) => {
  const queryClient = useQueryClient();

  const {
    data: brief,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['brief', id],
    queryFn: () => briefApiService.getBrief(id),
    enabled: !!id,
    staleTime: 30000,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => briefApiService.updateBrief(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(['brief', id], data);
      queryClient.invalidateQueries(['briefs']);
      toast({
        title: "Brief actualizado",
        description: `Brief ${data.code} actualizado exitosamente.`,
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar brief",
        description: error.response?.data?.detail || "Error desconocido",
        variant: "destructive",
      });
    }
  });

  return {
    brief,
    isLoading,
    isError,
    error,
    updateBrief: updateMutation.mutate,
    isUpdating: updateMutation.isPending
  };
};

// Hook para estadísticas del dashboard
export const useBriefStats = () => {
  return useQuery({
    queryKey: ['brief-stats'],
    queryFn: briefApiService.getDashboardStats,
    staleTime: 60000, // 1 minuto
    refetchInterval: 300000, // 5 minutos
  });
};

// Hook para opciones de formularios
export const useBriefChoices = () => {
  return useQuery({
    queryKey: ['brief-choices'],
    queryFn: briefApiService.getBriefChoices,
    staleTime: 600000, // 10 minutos - las opciones no cambian frecuentemente
  });
};

// Hook para historial de un brief
export const useBriefHistory = (briefId) => {
  return useQuery({
    queryKey: ['brief-history', briefId],
    queryFn: () => briefApiService.getBriefHistory(briefId),
    enabled: !!briefId,
    staleTime: 30000,
  });
};

export default useBriefs;
