"""
题目管理 API 路由
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional, List
from app.core.database import get_db
from app.models.problem import Problem
from app.schemas.problem import ProblemSchema, ProblemDetailSchema, ProblemUpdate

router = APIRouter(prefix="/api/v1/problems", tags=["题目管理"])


@router.get("/", response_model=dict)
async def get_problems(
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量"),
    status: Optional[str] = Query(None, description="状态筛选"),
    db: AsyncSession = Depends(get_db)
):
    """
    获取题目列表（分页）
    """
    # 构建查询
    stmt = select(Problem)
    count_stmt = select(func.count(Problem.id))

    # 状态筛选
    if status:
        stmt = stmt.where(Problem.status == status)
        count_stmt = count_stmt.where(Problem.status == status)

    # 排序
    stmt = stmt.order_by(Problem.created_at.desc())

    # 分页
    offset = (page - 1) * size
    stmt = stmt.offset(offset).limit(size)

    # 执行查询
    result = await db.execute(stmt)
    problems = result.scalars().all()

    # 总数
    count_result = await db.execute(count_stmt)
    total = count_result.scalar()

    return {
        "total": total,
        "page": page,
        "size": size,
        "items": problems
    }


@router.get("/{problem_id}", response_model=ProblemDetailSchema)
async def get_problem_detail(
    problem_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    获取题目详情
    """
    stmt = select(Problem).where(Problem.problem_id == problem_id)
    result = await db.execute(stmt)
    problem = result.scalar_one_or_none()

    if not problem:
        raise HTTPException(status_code=404, detail="题目不存在")

    return problem


@router.put("/{problem_id}", response_model=ProblemSchema)
async def update_problem(
    problem_id: str,
    problem_update: ProblemUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    更新题目信息
    """
    stmt = select(Problem).where(Problem.problem_id == problem_id)
    result = await db.execute(stmt)
    problem = result.scalar_one_or_none()

    if not problem:
        raise HTTPException(status_code=404, detail="题目不存在")

    # 更新字段
    update_data = problem_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(problem, field, value)

    await db.commit()
    await db.refresh(problem)

    return problem


@router.delete("/{problem_id}")
async def delete_problem(
    problem_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    删除题目
    """
    stmt = select(Problem).where(Problem.problem_id == problem_id)
    result = await db.execute(stmt)
    problem = result.scalar_one_or_none()

    if not problem:
        raise HTTPException(status_code=404, detail="题目不存在")

    await db.delete(problem)
    await db.commit()

    return {"message": "题目已删除"}
