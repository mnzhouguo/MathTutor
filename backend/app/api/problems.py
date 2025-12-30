"""
题目管理 API 路由
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional, List
from app.core.database import get_db
from app.models.problem import Problem, OCRRecord
from app.schemas.problem import ProblemSchema, ProblemDetailSchema, ProblemUpdate

router = APIRouter(prefix="/api/v1/problems", tags=["题目管理"])


@router.get("/")
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

    # 手动序列化为字典列表
    items = []
    for problem in problems:
        items.append({
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
            "created_at": problem.created_at.isoformat() if problem.created_at else None,
            "updated_at": problem.updated_at.isoformat() if problem.updated_at else None,
        })

    return {
        "total": total,
        "page": page,
        "size": size,
        "items": items
    }


@router.get("/{problem_id}")
async def get_problem_detail(
    problem_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    获取题目详情（包含 OCR 原始 JSON）
    """
    stmt = select(Problem).where(Problem.problem_id == problem_id)
    result = await db.execute(stmt)
    problem = result.scalar_one_or_none()

    if not problem:
        raise HTTPException(status_code=404, detail="题目不存在")

    # 获取 OCR 记录（如果存在）
    ocr_record = None
    if problem.ocr_record_id:
        ocr_stmt = select(OCRRecord).where(OCRRecord.id == problem.ocr_record_id)
        ocr_result = await db.execute(ocr_stmt)
        ocr_record = ocr_result.scalar_one_or_none()

    # 手动序列化
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

    # 添加 OCR 信息
    if ocr_record:
        response["ocr_info"] = {
            "filename": ocr_record.filename,
            "file_path": ocr_record.file_path,
            "confidence_score": ocr_record.confidence_score,
            "words_count": ocr_record.words_count,
            "processing_time_ms": ocr_record.processing_time_ms,
            "raw_json": ocr_record.raw_json,  # 原始 JSON
        }

    return response


@router.put("/{problem_id}")
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

    # 手动序列化
    return {
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
        "created_at": problem.created_at.isoformat() if problem.created_at else None,
        "updated_at": problem.updated_at.isoformat() if problem.updated_at else None,
    }


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
