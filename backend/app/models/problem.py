"""
题目相关数据模型
"""
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Problem(Base):
    """题目表"""
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(String(50), unique=True, nullable=False, index=True)
    content = Column(Text, nullable=False)
    question_type = Column(String(20))  # 选择/填空/计算/应用/证明
    difficulty = Column(Integer)  # 1-5
    source = Column(String(50), default='OCR识别')
    ocr_record_id = Column(Integer, ForeignKey('ocr_records.id'), nullable=True)
    status = Column(String(20), default='pending')  # pending/completed/archived
    quality_score = Column(String(1))  # A/B/C/D
    tags = Column(Text)  # JSON 数组字符串
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    ocr_record = relationship("OCRRecord", back_populates="problem")
    knowledge_points = relationship("ProblemKnowledgePoint", back_populates="problem", cascade="all, delete-orphan")


class ProblemKnowledgePoint(Base):
    """题目-知识点关联表"""
    __tablename__ = "problem_knowledge_points"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey('problems.id'), nullable=False)
    kp_id = Column(String(20), nullable=False)  # 知识点ID，如 KP02_1
    created_at = Column(DateTime, default=datetime.utcnow)

    # 关系
    problem = relationship("Problem", back_populates="knowledge_points")


class OCRRecord(Base):
    """OCR识别记录表"""
    __tablename__ = "ocr_records"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500))
    recognized_text = Column(Text, nullable=False)
    confidence_score = Column(Float, nullable=False)
    words_count = Column(Integer)
    raw_json = Column(Text)  # 原始API返回的JSON
    processing_time_ms = Column(Integer)
    status = Column(String(20), default='success')  # success/failed
    error_message = Column(Text)
    api_version = Column(String(50), default='paper_cut_edu')
    created_at = Column(DateTime, default=datetime.utcnow)

    # 关系 - 通过 Problem.ocr_record_id 建立反向关系
    problem = relationship("Problem", back_populates="ocr_record")
