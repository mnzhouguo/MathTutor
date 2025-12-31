"""
依赖注入容器

提供所有 Service 和 Repository 的依赖注入
使用 FastAPI 的 Depends 机制
"""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.knowledge_service import KnowledgeService
from app.services.problem_service import ProblemService
from app.services.ocr_service import OCRService


# ============ Service 依赖工厂 ============

def knowledge_service(db: AsyncSession = Depends(get_db)) -> KnowledgeService:
    """获取 KnowledgeService 实例"""
    return KnowledgeService(db)


def problem_service(db: AsyncSession = Depends(get_db)) -> ProblemService:
    """获取 ProblemService 实例"""
    return ProblemService(db)


def ocr_service(db: AsyncSession = Depends(get_db)) -> OCRService:
    """获取 OCRService 实例"""
    return OCRService(db)


# 导出所有依赖
__all__ = [
    "knowledge_service",
    "problem_service",
    "ocr_service",
]
