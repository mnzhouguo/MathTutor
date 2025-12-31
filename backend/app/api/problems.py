"""
题目管理 API 路由
"""
from fastapi import APIRouter, Depends, Query
from typing import Optional

from app.api.deps import problem_service
from app.services.problem_service import ProblemService
from app.schemas.problem import ProblemSchema, ProblemUpdate

router = APIRouter(prefix="/api/v1/problems", tags=["题目管理"])


@router.get("/")
async def get_problems(
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量"),
    status: Optional[str] = Query(None, description="状态筛选"),
    service: ProblemService = Depends(problem_service)
):
    """
    获取题目列表（分页）
    """
    result = await service.get_problems(page=page, size=size, status=status)

    # 使用 Schema 序列化
    items = [ProblemSchema.model_validate(p) for p in result["items"]]

    return {
        "total": result["total"],
        "page": result["page"],
        "size": result["size"],
        "items": items
    }


@router.get("/{problem_id}")
async def get_problem_detail(
    problem_id: str,
    service: ProblemService = Depends(problem_service)
):
    """
    获取题目详情（包含 OCR 原始 JSON）
    """
    return await service.get_problem_with_ocr(problem_id)


@router.put("/{problem_id}")
async def update_problem(
    problem_id: str,
    problem_update: ProblemUpdate,
    service: ProblemService = Depends(problem_service)
):
    """
    更新题目信息
    """
    problem = await service.update_problem(problem_id, problem_update)
    return ProblemSchema.model_validate(problem)


@router.delete("/{problem_id}")
async def delete_problem(
    problem_id: str,
    service: ProblemService = Depends(problem_service)
):
    """
    删除题目
    """
    await service.delete_problem(problem_id)
    return {"message": "题目已删除"}
