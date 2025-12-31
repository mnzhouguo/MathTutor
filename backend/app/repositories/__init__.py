"""
Repository 数据访问层
"""
from app.repositories.base import BaseRepository
from app.repositories.problem_repository import ProblemRepository
from app.repositories.knowledge_repository import KnowledgeRepository

__all__ = [
    "BaseRepository",
    "ProblemRepository",
    "KnowledgeRepository",
]
