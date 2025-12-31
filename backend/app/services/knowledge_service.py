"""
知识体系服务层 - 业务逻辑

使用 Repository 模式进行数据访问
"""
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.knowledge_repository import KnowledgeRepository
from app.models.knowledge import Curriculum, Module, Topic, KnowledgePoint
from app.core.exceptions import NotFoundException
from app.core.logger import logger


class KnowledgeService:
    """知识体系业务逻辑服务"""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.knowledge_repo = KnowledgeRepository(db)

    async def get_all_curriculums(self) -> List[Curriculum]:
        """
        获取所有课程

        Returns:
            课程列表
        """
        logger.info("获取所有课程")
        return await self.knowledge_repo.get_all_curriculums()

    async def get_curriculum_by_id(self, curriculum_id: int) -> Curriculum:
        """
        根据 ID 获取课程详情

        Args:
            curriculum_id: 课程 ID

        Returns:
            课程对象

        Raises:
            NotFoundException: 课程不存在
        """
        curriculum = await self.knowledge_repo.get_curriculum_by_id(curriculum_id)
        if not curriculum:
            logger.warning(f"课程不存在: id={curriculum_id}")
            raise NotFoundException("课程", str(curriculum_id))

        return curriculum

    async def get_module_by_id(self, module_id: int) -> Module:
        """
        根据 ID 获取模块详情

        Args:
            module_id: 模块 ID

        Returns:
            模块对象

        Raises:
            NotFoundException: 模块不存在
        """
        module = await self.knowledge_repo.get_module_by_id(module_id)
        if not module:
            logger.warning(f"模块不存在: id={module_id}")
            raise NotFoundException("模块", str(module_id))

        return module

    async def get_topic_by_id(self, topic_id: int) -> Topic:
        """
        根据 ID 获取专题详情

        Args:
            topic_id: 专题 ID

        Returns:
            专题对象

        Raises:
            NotFoundException: 专题不存在
        """
        topic = await self.knowledge_repo.get_topic_by_id(topic_id)
        if not topic:
            logger.warning(f"专题不存在: id={topic_id}")
            raise NotFoundException("专题", str(topic_id))

        return topic

    async def get_knowledge_point_by_id(self, kp_id: int) -> KnowledgePoint:
        """
        根据 ID 获取知识点详情

        Args:
            kp_id: 知识点 ID

        Returns:
            知识点对象

        Raises:
            NotFoundException: 知识点不存在
        """
        kp = await self.knowledge_repo.get_kp_by_id(kp_id)
        if not kp:
            logger.warning(f"知识点不存在: id={kp_id}")
            raise NotFoundException("知识点", str(kp_id))

        return kp

