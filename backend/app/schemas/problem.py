"""
题目相关的 Pydantic Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ProblemKnowledgePointSchema(BaseModel):
    """题目-知识点关联 Schema"""
    id: int
    problem_id: int
    kp_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class OCRRecordSchema(BaseModel):
    """OCR 识别记录 Schema"""
    id: int
    filename: str
    file_path: Optional[str] = None
    recognized_text: str
    confidence_score: float
    words_count: Optional[int] = None
    processing_time_ms: Optional[int] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ProblemCreate(BaseModel):
    """创建题目 Schema"""
    content: str
    question_type: Optional[str] = None
    difficulty: Optional[int] = None
    source: str = 'OCR识别'
    tags: Optional[str] = None


class ProblemUpdate(BaseModel):
    """更新题目 Schema"""
    content: Optional[str] = None
    question_type: Optional[str] = None
    difficulty: Optional[int] = None
    tags: Optional[str] = None
    status: Optional[str] = None
    quality_score: Optional[str] = None


class ProblemSchema(BaseModel):
    """题目 Schema"""
    id: int
    problem_id: str
    content: str
    question_type: Optional[str] = None
    difficulty: Optional[int] = None
    source: str
    status: str
    quality_score: Optional[str] = None
    tags: Optional[str] = None
    ocr_record_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProblemDetailSchema(ProblemSchema):
    """题目详情 Schema"""
    ocr_record: Optional[OCRRecordSchema] = None
    knowledge_points: List[ProblemKnowledgePointSchema] = []


class OCRResponseSchema(BaseModel):
    """OCR 识别响应 Schema"""
    success: bool
    problem_id: Optional[str] = None
    content: Optional[str] = None
    confidence_score: Optional[float] = None
    processing_time_ms: Optional[int] = None
    words_count: Optional[int] = None
    quality_assessment: Optional[dict] = None
    ocr_record_id: Optional[int] = None
    error: Optional[str] = None
    error_code: Optional[str] = None
