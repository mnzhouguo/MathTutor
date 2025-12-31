"""
基础 Repository

提供通用的数据访问方法
"""
from typing import TypeVar, Type, Optional, List, Generic
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update as sql_update
from app.core.logger import logger

ModelType = TypeVar("ModelType")


class BaseRepository(Generic[ModelType]):
    """
    基础 Repository 类

    提供通用的 CRUD 操作
    """

    def __init__(self, model: Type[ModelType], db: AsyncSession):
        """
        初始化 Repository

        Args:
            model: SQLAlchemy 模型类
            db: 异步数据库会话
        """
        self.model = model
        self.db = db

    async def get_by_id(self, id: int) -> Optional[ModelType]:
        """
        根据 ID 获取单条记录

        Args:
            id: 记录 ID

        Returns:
            模型实例,不存在则返回 None
        """
        result = await self.db.execute(
            select(self.model).where(self.model.id == id)
        )
        return result.scalar_one_or_none()

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100
    ) -> List[ModelType]:
        """
        获取所有记录(分页)

        Args:
            skip: 跳过记录数
            limit: 返回记录数

        Returns:
            模型实例列表
        """
        result = await self.db.execute(
            select(self.model).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def count(self) -> int:
        """
        获取记录总数

        Returns:
            记录数量
        """
        result = await self.db.execute(
            select(func.count(self.model.id))
        )
        return result.scalar()

    async def create(self, **kwargs) -> ModelType:
        """
        创建新记录

        Args:
            **kwargs: 模型字段值

        Returns:
            创建的模型实例
        """
        obj = self.model(**kwargs)
        self.db.add(obj)
        await self.db.flush()

        logger.debug(f"创建 {self.model.__name__}: id={obj.id}")
        return obj

    async def update(
        self,
        obj: ModelType,
        **kwargs
    ) -> ModelType:
        """
        更新记录

        Args:
            obj: 模型实例
            **kwargs: 要更新的字段

        Returns:
            更新后的模型实例
        """
        for key, value in kwargs.items():
            if hasattr(obj, key):
                setattr(obj, key, value)

        await self.db.flush()

        logger.debug(f"更新 {self.model.__name__}: id={obj.id}")
        return obj

    async def delete(self, obj: ModelType) -> None:
        """
        删除记录

        Args:
            obj: 模型实例
        """
        await self.db.delete(obj)
        await self.db.flush()

        logger.debug(f"删除 {self.model.__name__}: id={obj.id}")

    async def exists(self, id: int) -> bool:
        """
        检查记录是否存在

        Args:
            id: 记录 ID

        Returns:
            是否存在
        """
        result = await self.db.execute(
            select(func.count(self.model.id)).where(self.model.id == id)
        )
        return result.scalar() > 0

    async def bulk_create(self, items: List[dict]) -> List[ModelType]:
        """
        批量创建记录

        Args:
            items: 字典列表

        Returns:
            创建的模型实例列表
        """
        objects = [self.model(**item) for item in items]
        self.db.add_all(objects)
        await self.db.flush()

        logger.debug(f"批量创建 {self.model.__name__}: count={len(objects)}")
        return objects
