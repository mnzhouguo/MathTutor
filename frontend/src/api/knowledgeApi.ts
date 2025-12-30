import apiClient from './client';
import type { Curriculum, Module, Topic } from '../types/knowledge';

export const knowledgeApi = {
  // Get all curriculums
  getCurriculums: async (): Promise<Curriculum[]> => {
    return apiClient.get('/api/knowledge/curriculums');
  },

  // Get curriculum by ID
  getCurriculum: async (id: number): Promise<Curriculum> => {
    return apiClient.get(`/api/knowledge/curriculums/${id}`);
  },

  // Get module by ID
  getModule: async (id: number): Promise<Module> => {
    return apiClient.get(`/api/knowledge/modules/${id}`);
  },

  // Get topic by ID
  getTopic: async (id: number): Promise<Topic> => {
    return apiClient.get(`/api/knowledge/topics/${id}`);
  },

  // Health check
  healthCheck: async () => {
    return apiClient.get('/api/knowledge/health');
  },
};
