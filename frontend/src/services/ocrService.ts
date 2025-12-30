/**
 * OCR 相关 API 服务
 */
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001';

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

/**
 * OCR 识别并保存到题库
 */
export const recognizeAndSave = async (file: File): Promise<OCRResult> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post<OCRResult>(
      `${API_BASE_URL}/api/v1/ocr/recognize-and-save`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 秒超时
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'OCR识别失败');
  }
};

/**
 * 重新识别
 */
export const reRecognize = async (ocrRecordId: number): Promise<any> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/ocr/re-recognize`,
      null,
      {
        params: { ocr_record_id: ocrRecordId }
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || '重新识别失败');
  }
};

/**
 * 获取题目列表
 */
export const getProblems = async (
  page: number = 1,
  size: number = 20,
  status?: string
): Promise<ProblemListResponse> => {
  try {
    const params: any = { page, size };
    if (status) params.status = status;

    const response = await axios.get<ProblemListResponse>(
      `${API_BASE_URL}/api/v1/problems/`,
      { params }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || '获取题目列表失败');
  }
};

/**
 * 获取题目详情
 */
export const getProblemDetail = async (problemId: string): Promise<Problem> => {
  try {
    const response = await axios.get<Problem>(
      `${API_BASE_URL}/api/v1/problems/${problemId}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || '获取题目详情失败');
  }
};

/**
 * 更新题目
 */
export const updateProblem = async (
  problemId: string,
  data: Partial<Problem>
): Promise<Problem> => {
  try {
    const response = await axios.put<Problem>(
      `${API_BASE_URL}/api/v1/problems/${problemId}`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || '更新题目失败');
  }
};

/**
 * 删除题目
 */
export const deleteProblem = async (problemId: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/api/v1/problems/${problemId}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || '删除题目失败');
  }
};
