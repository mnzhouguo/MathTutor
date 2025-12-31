/**
 * 题目类型工具函数
 */

/**
 * 题目类型枚举（与后端保持一致）
 */
export enum QuestionType {
  CHOICE = 'choice',       // 选择题
  JUDGE = 'judge',         // 判断题
  FILL_BLANK = 'fill_blank', // 填空题
  ESSAY = 'essay',         // 问答题
  OTHER = 'other',         // 其他
  UNKNOWN = 'unknown',     // 未知
}

/**
 * 题目类型中文显示名称映射
 */
export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  [QuestionType.CHOICE]: '选择题',
  [QuestionType.JUDGE]: '判断题',
  [QuestionType.FILL_BLANK]: '填空题',
  [QuestionType.ESSAY]: '问答题',
  [QuestionType.OTHER]: '其他',
  [QuestionType.UNKNOWN]: '未知',
};

/**
 * 题目类型颜色映射
 */
export const QUESTION_TYPE_COLORS: Record<QuestionType, string> = {
  [QuestionType.CHOICE]: 'blue',
  [QuestionType.JUDGE]: 'green',
  [QuestionType.FILL_BLANK]: 'orange',
  [QuestionType.ESSAY]: 'purple',
  [QuestionType.OTHER]: 'default',
  [QuestionType.UNKNOWN]: 'default',
};

/**
 * 获取题目类型的中文名称
 * @param questionType 题目类型代码
 * @returns 中文名称
 */
export function getQuestionTypeLabel(questionType?: string): string {
  if (!questionType) return '未知';
  return QUESTION_TYPE_LABELS[questionType as QuestionType] || questionType;
}

/**
 * 获取题目类型的颜色
 * @param questionType 题目类型代码
 * @returns 颜色值（用于 Ant Design Tag）
 */
export function getQuestionTypeColor(questionType?: string): string {
  if (!questionType) return 'default';
  return QUESTION_TYPE_COLORS[questionType as QuestionType] || 'default';
}

/**
 * 题目难度等级映射
 */
export const DIFFICULTY_LABELS: Record<number, string> = {
  1: '简单',
  2: '较易',
  3: '中等',
  4: '较难',
  5: '困难',
};

/**
 * 获取难度等级名称
 * @param difficulty 难度值 1-5
 * @returns 难度名称
 */
export function getDifficultyLabel(difficulty?: number): string {
  if (!difficulty || difficulty < 1 || difficulty > 5) return '未评级';
  return DIFFICULTY_LABELS[difficulty];
}

/**
 * 质量等级映射
 */
export const QUALITY_LABELS: Record<string, { text: string; color: string }> = {
  A: { text: '高质量', color: 'success' },
  B: { text: '需确认', color: 'warning' },
  C: { text: '低质量', color: 'error' },
  D: { text: '极差', color: 'error' },
};

/**
 * 获取质量等级信息
 * @param qualityScore 质量等级 A/B/C/D
 * @returns 质量等级信息
 */
export function getQualityInfo(qualityScore?: string) {
  if (!qualityScore) return { text: '未评级', color: 'default' };
  return QUALITY_LABELS[qualityScore] || { text: qualityScore, color: 'default' };
}
