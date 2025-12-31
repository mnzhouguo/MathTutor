/**
 * 题目管理相关 API
 */
import apiClient from './client';

export interface OCRResult {
  success: boolean;
  problem_id?: string;
  content?: string;
  confidence_score?: number;
  processing_time_ms?: number;
  words_count?: number;
  quality_assessment?: {
    grade: string;
    action: string;
    label: string;
    color: string;
  };
  ocr_record_id?: number;
  error?: string;
  error_code?: string;
}

export interface Problem {
  id: number;
  problem_id: string;
  content: string;
  question_type?: string;
  difficulty?: number;
  source: string;
  status: string;
  quality_score?: string;
  tags?: string;
  ocr_record_id?: number;
  created_at: string;
  updated_at: string;
}

export interface ProblemListResponse {
  total: number;
  page: number;
  size: number;
  items: Problem[];
}

export const problemsApi = {
  /**
   * OCR 识别并保存到题库
   */
  recognizeAndSave: async (file: File): Promise<OCRResult> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      return await apiClient.post('/api/v1/ocr/recognize-and-save', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 秒超时
      }) as OCRResult;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'OCR识别失败');
    }
  },

  /**
   * 重新识别
   */
  reRecognize: async (ocrRecordId: number): Promise<any> => {
    try {
      return await apiClient.post('/api/v1/ocr/re-recognize', null, {
        params: { ocr_record_id: ocrRecordId }
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || '重新识别失败');
    }
  },

  /**
   * 获取题目列表
   */
  getList: async (
    page: number = 1,
    size: number = 20,
    status?: string
  ): Promise<ProblemListResponse> => {
    try {
      const params: any = { page, size };
      if (status) params.status = status;

      return await apiClient.get('/api/v1/problems/', { params }) as ProblemListResponse;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || '获取题目列表失败');
    }
  },

  /**
   * 获取题目详情
   */
  getDetail: async (problemId: string): Promise<Problem> => {
    try {
      return await apiClient.get(`/api/v1/problems/${problemId}`) as Problem;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || '获取题目详情失败');
    }
  },

  /**
   * 更新题目
   */
  update: async (
    problemId: string,
    data: Partial<Problem>
  ): Promise<Problem> => {
    try {
      return await apiClient.put(`/api/v1/problems/${problemId}`, data) as Problem;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || '更新题目失败');
    }
  },

  /**
   * 删除题目
   */
  delete: async (problemId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/v1/problems/${problemId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || '删除题目失败');
    }
  },
};
