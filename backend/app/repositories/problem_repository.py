"""
题目 Repository
"""
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.repositories.base import BaseRepository
from app.models.problem import Problem, OCRRecord, ProblemKnowledgePoint


class ProblemRepository(BaseRepository[Problem]):
    """题目数据访问层"""

    def __init__(self, db: AsyncSession):
        super().__init__(Problem, db)

    async def get_by_problem_id(self, problem_id: str) -> Optional[Problem]:
        """
        根据 problem_id 获取题目

        Args:
            problem_id: 题目 ID (如 P_MATH_2024_001)

        Returns:
            Problem 实例,不存在则返回 None
        """
        result = await self.db.execute(
            select(Problem).where(Problem.problem_id == problem_id)
        )
        return result.scalar_one_or_none()

    async def get_with_ocr(
        self,
        problem_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        获取题目及关联的 OCR 记录

        Args:
            problem_id: 题目 ID

        Returns:
            包含题目和 OCR 信息的字典
        """
        problem = await self.get_by_problem_id(problem_id)
        if not problem:
            return None

        # 获取 OCR 记录
        ocr_record = None
        if problem.ocr_record_id:
            ocr_result = await self.db.execute(
                select(OCRRecord).where(OCRRecord.id == problem.ocr_record_id)
            )
            ocr_record = ocr_result.scalar_one_or_none()

        return {
            "problem": problem,
            "ocr_record": ocr_record
        }

    async def get_with_pagination(
        self,
        page: int = 1,
        size: int = 20,
        status: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        分页查询题目

        Args:
            page: 页码 (从 1 开始)
            size: 每页数量
            status: 状态筛选

        Returns:
            分页结果字典
        """
        # 构建查询
        stmt = select(Problem)
        count_stmt = select(func.count(Problem.id))

        # 状态筛选
        if status:
            stmt = stmt.where(Problem.status == status)
            count_stmt = count_stmt.where(Problem.status == status)

        # 排序
        stmt = stmt.order_by(desc(Problem.created_at))

        # 分页
        offset = (page - 1) * size
        stmt = stmt.offset(offset).limit(size)

        # 执行查询
        result = await self.db.execute(stmt)
        problems = list(result.scalars().all())

        # 总数
        count_result = await self.db.execute(count_stmt)
        total = count_result.scalar()

        return {
            "items": problems,
            "total": total,
            "page": page,
            "size": size,
            "pages": (total + size - 1) // size  # 总页数
        }

    async def get_by_status(
        self,
        status: str,
        limit: int = 100
    ) -> List[Problem]:
        """
        根据状态获取题目列表

        Args:
            status: 状态值
            limit: 最大返回数量

        Returns:
            题目列表
        """
        result = await self.db.execute(
            select(Problem)
            .where(Problem.status == status)
            .order_by(desc(Problem.created_at))
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_knowledge_points(
        self,
        problem_id: int
    ) -> List[ProblemKnowledgePoint]:
        """
        获取题目关联的知识点

        Args:
            problem_id: 题目数据库 ID

        Returns:
            知识点关联列表
        """
        result = await self.db.execute(
            select(ProblemKnowledgePoint)
            .where(ProblemKnowledgePoint.problem_id == problem_id)
        )
        return list(result.scalars().all())

    async def add_knowledge_point(
        self,
        problem_id: int,
        kp_id: str
    ) -> ProblemKnowledgePoint:
        """
        为题目添加知识点关联

        Args:
            problem_id: 题目数据库 ID
            kp_id: 知识点 ID

        Returns:
            关联记录
        """
        pkp = ProblemKnowledgePoint(
            problem_id=problem_id,
            kp_id=kp_id
        )
        self.db.add(pkp)
        await self.db.flush()
        return pkp

    async def search_by_content(
        self,
        keyword: str,
        limit: int = 20
    ) -> List[Problem]:
        """
        根据关键词搜索题目内容

        Args:
            keyword: 搜索关键词
            limit: 最大返回数量

        Returns:
            题目列表
        """
        result = await self.db.execute(
            select(Problem)
            .where(Problem.content.contains(keyword))
            .limit(limit)
        )
        return list(result.scalars().all())
