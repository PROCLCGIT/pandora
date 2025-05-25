import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from '@/config/axios';

const API_ENDPOINT = '/directorio/tags';

// Get all tags
export const useTags = (params = {}) => {
  return useQuery({
    queryKey: ['tags', params],
    queryFn: async () => {
      const { data } = await axios.get(API_ENDPOINT, { params });
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get tag by ID
export const useTagById = (id, options = {}) => {
  return useQuery({
    queryKey: ['tags', id],
    queryFn: async () => {
      const { data } = await axios.get(`${API_ENDPOINT}/${id}/`);
      return data;
    },
    enabled: !!id,
    ...options,
  });
};

// Create tag
export const useCreateTag = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newTag) => {
      const { data } = await axios.post(`${API_ENDPOINT}/`, newTag);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    ...options,
  });
};

// Update tag
export const useUpdateTag = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await axios.patch(`${API_ENDPOINT}/${id}/`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['tags', variables.id] });
    },
    ...options,
  });
};

// Delete tag
export const useDeleteTag = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${API_ENDPOINT}/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    ...options,
  });
};

// Service functions for direct API calls
export const tagService = {
  getAll: async (params = {}) => {
    const { data } = await axios.get(API_ENDPOINT, { params });
    return data;
  },
  
  getById: async (id) => {
    const { data } = await axios.get(`${API_ENDPOINT}/${id}/`);
    return data;
  },
  
  create: async (tagData) => {
    const { data } = await axios.post(`${API_ENDPOINT}/`, tagData);
    return data;
  },
  
  update: async (id, tagData) => {
    const { data } = await axios.patch(`${API_ENDPOINT}/${id}/`, tagData);
    return data;
  },
  
  delete: async (id) => {
    await axios.delete(`${API_ENDPOINT}/${id}/`);
  },
};