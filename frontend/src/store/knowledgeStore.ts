import { create } from 'zustand';
import type { Curriculum, Module, Topic, GradeType, SemesterType, LearningStatus } from '../types/knowledge';
import { knowledgeApi } from '../api/knowledgeApi';
import curriculumData from '../../../knowledge_base/grade7_sem1_advanced_topics.json';

interface KnowledgeState {
  curriculums: Curriculum[];
  currentCurriculum: Curriculum | null;
  currentModule: Module | null;
  currentTopic: Topic | null;
  currentGrade: GradeType;
  currentSemester: SemesterType;
  expandedModules: Set<string>;
  searchQuery: string;
  loading: boolean;
  error: string | null;
  _hasLoadedMockData: boolean;

  // Actions
  fetchCurriculums: () => Promise<void>;
  fetchCurriculum: (id: number) => Promise<void>;
  fetchModule: (id: number) => Promise<void>;
  fetchTopic: (id: number) => Promise<void>;
  setCurrentGrade: (grade: GradeType) => void;
  setCurrentSemester: (semester: SemesterType) => void;
  toggleModule: (moduleId: string) => void;
  setSearchQuery: (query: string) => void;
  loadMockData: () => void;
}

export const useKnowledgeStore = create<KnowledgeState>((set, get) => ({
  // Initial state
  curriculums: [],
  currentCurriculum: null,
  currentModule: null,
  currentTopic: null,
  currentGrade: '七年级',
  currentSemester: '上册',
  expandedModules: new Set<string>(),
  searchQuery: '',
  loading: false,
  error: null,
  _hasLoadedMockData: false,

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

  setCurrentGrade: (grade: GradeType) => {
    set({ currentGrade: grade });
  },

  setCurrentSemester: (semester: SemesterType) => {
    set({ currentSemester: semester });
  },

  toggleModule: (moduleId: string) => {
    const { expandedModules } = get();
    const newSet = new Set(expandedModules);
    if (newSet.has(moduleId)) {
      newSet.delete(moduleId);
    } else {
      newSet.add(moduleId);
    }
    set({ expandedModules: newSet });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  loadMockData: () => {
    const { _hasLoadedMockData } = get();

    // Only load once to prevent infinite loops
    if (_hasLoadedMockData) {
      return;
    }

    // Load mock data from JSON file
    const mockCurriculum: Curriculum = {
      id: 1,
      name: curriculumData.curriculum,
      grade: '七年级',
      semester: '上册',
      modules: curriculumData.modules.map((mod: any, idx: number) => ({
        ...mod,
        id: idx + 1,
        curriculum_id: 1,
        topics: mod.topics.map((topic: any, tIdx: number) => ({
          ...topic,
          id: tIdx + 1,
          module_id: idx + 1,
          knowledge_points: topic.knowledge_points.map((kp: any, kpIdx: number) => ({
            ...kp,
            id: kpIdx + 1,
            topic_id: tIdx + 1,
            learning_status: 'not_started',
            mastery_level: 0,
            is_favorite: false,
            related_questions_count: Math.floor(Math.random() * 20) + 5,
          })),
          total_kps: topic.knowledge_points.length,
          mastered_kps: 0,
          in_progress_kps: 0,
        })),
        total_topics: mod.topics.length,
        total_kps: mod.topics.reduce((sum: number, t: any) => sum + t.knowledge_points.length, 0),
        mastered_kps: 0,
        progress_percentage: 0,
      })),
      total_modules: curriculumData.modules.length,
      total_topics: curriculumData.modules.reduce((sum: number, m: any) => sum + m.topics.length, 0),
      total_kps: curriculumData.modules.reduce(
        (sum: number, m: any) => sum + m.topics.reduce((s: number, t: any) => s + t.knowledge_points.length, 0),
        0
      ),
      mastered_kps: 0,
      overall_progress: 0,
    };

    set({ currentCurriculum: mockCurriculum, _hasLoadedMockData: true });
  },
}));
