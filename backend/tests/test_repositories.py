"""
Repository 层单元测试
"""
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.problem_repository import ProblemRepository
from app.models.problem import Problem


@pytest.mark.asyncio
async def test_problem_repository_create(db_session: AsyncSession):
    """测试创建题目"""
    repo = ProblemRepository(db_session)

    problem = await repo.create(
        problem_id="TEST_001",
        content="测试题目",
        question_type="choice",
        difficulty=3,
        source="test"
    )

    assert problem.id is not None
    assert problem.problem_id == "TEST_001"
    assert problem.content == "测试题目"


@pytest.mark.asyncio
async def test_problem_repository_get_by_id(db_session: AsyncSession):
    """测试根据 ID 获取题目"""
    repo = ProblemRepository(db_session)

    # 先创建
    created = await repo.create(
        problem_id="TEST_002",
        content="测试题目2",
        source="test"
    )

    # 再查询
    found = await repo.get_by_id(created.id)

    assert found is not None
    assert found.id == created.id
    assert found.problem_id == "TEST_002"


@pytest.mark.asyncio
async def test_problem_repository_get_by_problem_id(db_session: AsyncSession):
    """测试根据 problem_id 获取题目"""
    repo = ProblemRepository(db_session)

    # 先创建
    await repo.create(
        problem_id="TEST_003",
        content="测试题目3",
        source="test"
    )

    # 再查询
    found = await repo.get_by_problem_id("TEST_003")

    assert found is not None
    assert found.problem_id == "TEST_003"


@pytest.mark.asyncio
async def test_problem_repository_update(db_session: AsyncSession):
    """测试更新题目"""
    repo = ProblemRepository(db_session)

    # 先创建
    problem = await repo.create(
        problem_id="TEST_004",
        content="原始内容",
        source="test"
    )

    # 更新
    updated = await repo.update(problem, content="更新后的内容", difficulty=5)

    assert updated.content == "更新后的内容"
    assert updated.difficulty == 5


@pytest.mark.asyncio
async def test_problem_repository_delete(db_session: AsyncSession):
    """测试删除题目"""
    repo = ProblemRepository(db_session)

    # 先创建
    problem = await repo.create(
        problem_id="TEST_005",
        content="待删除",
        source="test"
    )
    problem_id = problem.id

    # 删除
    await repo.delete(problem)

    # 验证已删除
    found = await repo.get_by_id(problem_id)
    assert found is None


@pytest.mark.asyncio
async def test_problem_repository_pagination(db_session: AsyncSession):
    """测试分页查询"""
    repo = ProblemRepository(db_session)

    # 创建多条数据
    for i in range(25):
        await repo.create(
            problem_id=f"TEST_PAGE_{i:03d}",
            content=f"题目 {i}",
            source="test"
        )

    # 提交
    await db_session.commit()

    # 查询第一页
    result = await repo.get_with_pagination(page=1, size=10)

    assert result["total"] == 25
    assert len(result["items"]) == 10
    assert result["page"] == 1
    assert result["pages"] == 3
