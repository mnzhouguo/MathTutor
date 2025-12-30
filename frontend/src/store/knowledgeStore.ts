import { create } from 'zustand';
import type { Curriculum, Module, Topic } from '../types/knowledge';
import { knowledgeApi } from '../api/knowledgeApi';

interface KnowledgeState {
  curriculums: Curriculum[];
  currentCurriculum: Curriculum | null;
  currentModule: Module | null;
  currentTopic: Topic | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchCurriculums: () => Promise<void>;
  fetchCurriculum: (id: number) => Promise<void>;
  fetchModule: (id: number) => Promise<void>;
  fetchTopic: (id: number) => Promise<void>;
}

export const useKnowledgeStore = create<KnowledgeState>((set) => ({
  // Initial state
  curriculums: [],
  currentCurriculum: null,
  currentModule: null,
  currentTopic: null,
  loading: false,
  error: null,

  // Actions
  fetchCurriculums: async () => {
    set({ loading: true, error: null });
    try {
      const data = await knowledgeApi.getCurriculums();
      set({ curriculums: data, loading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch curriculums',
        loading: false
      });
    }
  },

  fetchCurriculum: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const data = await knowledgeApi.getCurriculum(id);
      set({ currentCurriculum: data, loading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch curriculum',
        loading: false
      });
    }
  },

  fetchModule: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const data = await knowledgeApi.getModule(id);
      set({ currentModule: data, loading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch module',
        loading: false
      });
    }
  },

  fetchTopic: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const data = await knowledgeApi.getTopic(id);
      set({ currentTopic: data, loading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch topic',
        loading: false
      });
    }
  },
}));
