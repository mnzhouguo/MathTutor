"""
题目服务层 - 业务逻辑

使用 Repository 模式进行数据访问
"""
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from app.repositories.problem_repository import ProblemRepository
from app.models.problem import Problem
from app.schemas.problem import ProblemUpdate
from app.core.exceptions import NotFoundException
from app.core.logger import logger


class ProblemService:
    """题目业务逻辑服务"""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.problem_repo = ProblemRepository(db)

    async def get_problems(
        self,
        page: int = 1,
        size: int = 20,
        status: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        获取题目列表(分页)

        Args:
            page: 页码
            size: 每页数量
            status: 状态筛选

        Returns:
            分页结果
        """
        logger.info(f"查询题目列表: page={page}, size={size}, status={status}")
        return await self.problem_repo.get_with_pagination(page, size, status)

    async def get_problem_by_id(self, problem_id: str) -> Problem:
        """
        根据 problem_id 获取题目

        Args:
            problem_id: 题目 ID

        Returns:
            题目对象

        Raises:
            NotFoundException: 题目不存在
        """
        problem = await self.problem_repo.get_by_problem_id(problem_id)
        if not problem:
            logger.warning(f"题目不存在: {problem_id}")
            raise NotFoundException("题目", problem_id)

        return problem

    async def get_problem_with_ocr(self, problem_id: str) -> Dict[str, Any]:
        """
        获取题目详情(包含 OCR 信息)

        Args:
            problem_id: 题目 ID

        Returns:
            题目详情字典

        Raises:
            NotFoundException: 题目不存在
        """
        result = await self.problem_repo.get_with_ocr(problem_id)
        if not result:
            raise NotFoundException("题目", problem_id)

        problem = result["problem"]
        ocr_record = result["ocr_record"]

        # 构建响应
        response = {
            "id": problem.id,
            "problem_id": problem.problem_id,
            "content": problem.content,
            "question_type": problem.question_type,
            "difficulty": problem.difficulty,
            "source": problem.source,
            "status": problem.status,
            "quality_score": problem.quality_score,
            "tags": problem.tags,
            "ocr_record_id": problem.ocr_record_id,
            "question_number": problem.question_number,
            "score": problem.score,
            "parsed_data": problem.parsed_data,
            "created_at": problem.created_at.isoformat() if problem.created_at else None,
            "updated_at": problem.updated_at.isoformat() if problem.updated_at else None,
        }

        if ocr_record:
            response["ocr_info"] = {
                "filename": ocr_record.filename,
                "file_path": ocr_record.file_path,
                "confidence_score": ocr_record.confidence_score,
                "words_count": ocr_record.words_count,
                "processing_time_ms": ocr_record.processing_time_ms,
                "raw_json": ocr_record.raw_json,
            }

        return response

    async def update_problem(
        self,
        problem_id: str,
        problem_update: ProblemUpdate
    ) -> Problem:
        """
        更新题目信息

        Args:
            problem_id: 题目 ID
            problem_update: 更新数据

        Returns:
            更新后的题目对象

        Raises:
            NotFoundException: 题目不存在
        """
        problem = await self.problem_repo.get_by_problem_id(problem_id)
        if not problem:
            raise NotFoundException("题目", problem_id)

        # 更新字段
        update_data = problem_update.model_dump(exclude_unset=True)
        await self.problem_repo.update(problem, **update_data)

        await self.db.commit()
        await self.db.refresh(problem)

        logger.info(f"更新题目成功: {problem_id}")
        return problem

    async def delete_problem(self, problem_id: str) -> None:
        """
        删除题目

        Args:
            problem_id: 题目 ID

        Raises:
            NotFoundException: 题目不存在
        """
        problem = await self.problem_repo.get_by_problem_id(problem_id)
        if not problem:
            raise NotFoundException("题目", problem_id)

        await self.problem_repo.delete(problem)
        await self.db.commit()

        logger.info(f"删除题目成功: {problem_id}")

    async def create_problem(
        self,
        content: str,
        question_type: Optional[str] = None,
        difficulty: Optional[int] = None,
        source: str = "手动创建",
        tags: Optional[str] = None,
        status: str = "pending"
    ) -> Problem:
        """
        创建题目

        Args:
            content: 题目内容
            question_type: 题目类型
            difficulty: 难度 (1-5)
            source: 来源
            tags: 标签
            status: 状态

        Returns:
            创建的题目对象
        """
        problem = await self.problem_repo.create(
            problem_id=self._generate_problem_id(),
            content=content,
            question_type=question_type,
            difficulty=difficulty,
            source=source,
            tags=tags,
            status=status
        )

        await self.db.commit()
        await self.db.refresh(problem)

        logger.info(f"创建题目成功: {problem.problem_id}")
        return problem

    def _generate_problem_id(self) -> str:
        """
        生成题目 ID

        格式: P_MATH_YYYY_XXX
        """
        import random
        year = datetime.now().year
        random_num = random.randint(1, 999)
        return f"P_MATH_{year}_{random_num:03d}"
