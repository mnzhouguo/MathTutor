"""
Service 层单元测试
"""
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.problem_service import ProblemService
from app.core.exceptions import NotFoundException


@pytest.mark.asyncio
async def test_problem_service_create(db_session: AsyncSession):
    """测试创建题目"""
    service = ProblemService(db_session)

    problem = await service.create_problem(
        content="测试创建题目",
        question_type="choice",
        difficulty=3
    )

    assert problem.id is not None
    assert problem.content == "测试创建题目"
    assert problem.problem_id.startswith("P_MATH_")


@pytest.mark.asyncio
async def test_problem_service_get_by_id(db_session: AsyncSession):
    """测试获取题目"""
    service = ProblemService(db_session)

    # 先创建
    created = await service.create_problem(content="原始题目")

    # 再获取
    found = await service.get_problem_by_id(created.problem_id)

    assert found is not None
    assert found.problem_id == created.problem_id


@pytest.mark.asyncio
async def test_problem_service_get_not_found(db_session: AsyncSession):
    """测试获取不存在的题目"""
    service = ProblemService(db_session)

    with pytest.raises(NotFoundException) as exc_info:
        await service.get_problem_by_id("NON_EXISTENT")

    assert "题目" in str(exc_info.value)


@pytest.mark.asyncio
async def test_problem_service_update(db_session: AsyncSession):
    """测试更新题目"""
    from app.schemas.problem import ProblemUpdate

    service = ProblemService(db_session)

    # 先创建
    created = await service.create_problem(content="原始内容")

    # 更新
    updated = await service.update_problem(
        created.problem_id,
        ProblemUpdate(content="更新内容", difficulty=5)
    )

    assert updated.content == "更新内容"
    assert updated.difficulty == 5


@pytest.mark.asyncio
async def test_problem_service_delete(db_session: AsyncSession):
    """测试删除题目"""
    service = ProblemService(db_session)

    # 先创建
    created = await service.create_problem(content="待删除")

    # 删除 (不抛异常即成功)
    await service.delete_problem(created.problem_id)

    # 验证已删除
    with pytest.raises(NotFoundException):
        await service.get_problem_by_id(created.problem_id)


@pytest.mark.asyncio
async def test_problem_service_pagination(db_session: AsyncSession):
    """测试分页查询"""
    service = ProblemService(db_session)

    # 创建多条数据
    for i in range(15):
        await service.create_problem(content=f"题目 {i}")

    result = await service.get_problems(page=1, size=10)

    assert result["total"] == 15
    assert len(result["items"]) == 10
    assert result["page"] == 1
