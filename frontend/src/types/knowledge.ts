/**
 * 知识体系相关类型定义
 */

export enum LearningStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  MASTERED = 'mastered',
  NEED_REVIEW = 'need_review',
}

export interface KnowledgePoint {
  id: number;
  kp_id: string;
  kp_name: string;
  detail?: string;
  topic_id: number;
  learning_status?: LearningStatus;
  mastery_level?: number;
  is_favorite?: boolean;
  first_learned_at?: string;
  last_reviewed_at?: string;
  related_questions_count?: number;
}

export interface Topic {
  id: number;
  topic_id: string;
  topic_name: string;
  alias?: string;
  module_id: number;
  knowledge_points: KnowledgePoint[];
  total_kps?: number;
  mastered_kps?: number;
  in_progress_kps?: number;
}

export interface Module {
  id: number;
  module_id: string;
  module_name: string;
  module_tag?: string;
  overview?: string;
  curriculum_id: number;
  topics: Topic[];
  total_topics?: number;
  total_kps?: number;
  mastered_kps?: number;
  progress_percentage?: number;
}

export interface Curriculum {
  id: number;
  name: string;
  grade: string;
  semester: string;
  modules: Module[];
  total_modules?: number;
  total_topics?: number;
  total_kps?: number;
  mastered_kps?: number;
  overall_progress?: number;
}

export type GradeType = '七年级' | '八年级' | '九年级';
export type SemesterType = '上册' | '下册';
