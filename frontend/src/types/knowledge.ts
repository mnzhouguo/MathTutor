export interface KnowledgePoint {
  id: number;
  kp_id: string;
  kp_name: string;
  detail?: string;
  topic_id: number;
}

export interface Topic {
  id: number;
  topic_id: string;
  topic_name: string;
  alias?: string;
  module_id: number;
  knowledge_points: KnowledgePoint[];
}

export interface Module {
  id: number;
  module_id: string;
  module_name: string;
  module_tag?: string;
  overview?: string;
  curriculum_id: number;
  topics: Topic[];
}

export interface Curriculum {
  id: number;
  name: string;
  grade: string;
  semester: string;
  modules: Module[];
}
