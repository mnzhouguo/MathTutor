"""
知识体系 Repository
"""
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.repositories.base import BaseRepository
from app.models.knowledge import Curriculum, Module, Topic, KnowledgePoint


class KnowledgeRepository(BaseRepository[KnowledgePoint]):
    """知识点数据访问层"""

    def __init__(self, db: AsyncSession):
        # 默认操作 KnowledgePoint 表
        super().__init__(KnowledgePoint, db)

    # ============ Curriculum 相关 ============

    async def get_all_curriculums(self) -> List[Curriculum]:
        """获取所有课程（预加载关联数据）"""
        result = await self.db.execute(
            select(Curriculum)
            .options(
                selectinload(Curriculum.modules)
                .selectinload(Module.topics)
                .selectinload(Topic.knowledge_points)
            )
        )
        return list(result.scalars().all())

    async def get_curriculum_by_id(
        self,
        curriculum_id: int
    ) -> Optional[Curriculum]:
        """根据 ID 获取课程"""
        result = await self.db.execute(
            select(Curriculum)
            .where(Curriculum.id == curriculum_id)
            .options(
                selectinload(Curriculum.modules)
                .selectinload(Module.topics)
                .selectinload(Topic.knowledge_points)
            )
        )
        return result.scalar_one_or_none()

    # ============ Module 相关 ============

    async def get_module_by_id(self, module_id: int) -> Optional[Module]:
        """根据 ID 获取模块"""
        result = await self.db.execute(
            select(Module)
            .where(Module.id == module_id)
            .options(
                selectinload(Module.topics)
                .selectinload(Topic.knowledge_points)
            )
        )
        return result.scalar_one_or_none()

    async def get_modules_by_curriculum(
        self,
        curriculum_id: int
    ) -> List[Module]:
        """获取指定课程的所有模块"""
        result = await self.db.execute(
            select(Module)
            .where(Module.curriculum_id == curriculum_id)
            .options(selectinload(Module.topics))
        )
        return list(result.scalars().all())

    # ============ Topic 相关 ============

    async def get_topic_by_id(self, topic_id: int) -> Optional[Topic]:
        """根据 ID 获取专题"""
        result = await self.db.execute(
            select(Topic)
            .where(Topic.id == topic_id)
            .options(selectinload(Topic.knowledge_points))
        )
        return result.scalar_one_or_none()

    async def get_topics_by_module(self, module_id: int) -> List[Topic]:
        """获取指定模块的所有专题"""
        result = await self.db.execute(
            select(Topic)
            .where(Topic.module_id == module_id)
            .options(selectinload(Topic.knowledge_points))
        )
        return list(result.scalars().all())

    # ============ KnowledgePoint 相关 ============

    async def get_kp_by_id(self, kp_id: int) -> Optional[KnowledgePoint]:
        """根据 ID 获取知识点"""
        return await self.get_by_id(kp_id)

    async def get_kps_by_topic(self, topic_id: int) -> List[KnowledgePoint]:
        """获取指定专题的所有知识点"""
        result = await self.db.execute(
            select(KnowledgePoint)
            .where(KnowledgePoint.topic_id == topic_id)
        )
        return list(result.scalars().all())

    async def search_kp_by_name(self, keyword: str) -> List[KnowledgePoint]:
        """根据知识点名称搜索"""
        result = await self.db.execute(
            select(KnowledgePoint)
            .where(KnowledgePoint.kp_name.contains(keyword))
        )
        return list(result.scalars().all())
