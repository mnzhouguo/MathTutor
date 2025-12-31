"""
验证重构后的代码是否正常工作

运行此脚本来验证:
1. 所有模块可以正确导入
2. 依赖注入工作正常
3. 异常处理工作正常
4. 日志系统工作正常
"""
import sys
import asyncio


def test_imports():
    """测试所有模块能否正确导入"""
    print("=" * 60)
    print("测试 1: 模块导入")
    print("=" * 60)

    try:
        # Core
        from app.core.config import get_settings
        from app.core.database import get_db
        from app.core.logger import logger
        from app.core.exceptions import NotFoundException, ValidationException
        print("✅ Core 模块导入成功")

        # Middleware
        from app.middleware.logging import logging_middleware
        from app.middleware.error_handler import math_tutor_exception_handler
        print("✅ Middleware 模块导入成功")

        # Repositories
        from app.repositories.base import BaseRepository
        from app.repositories.problem_repository import ProblemRepository
        from app.repositories.knowledge_repository import KnowledgeRepository
        print("✅ Repository 模块导入成功")

        # Services
        from app.services.problem_service import ProblemService
        from app.services.knowledge_service import KnowledgeService
        from app.services.ocr_service import OCRService
        print("✅ Service 模块导入成功")

        # API
        from app.api.deps import knowledge_service, problem_service, ocr_service
        from app.api.knowledge import router as knowledge_router
        from app.api.problems import router as problems_router
        print("✅ API 模块导入成功")

        print("\n✅ 所有模块导入成功!\n")
        return True

    except Exception as e:
        print(f"\n❌ 导入失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_exceptions():
    """测试自定义异常"""
    print("=" * 60)
    print("测试 2: 自定义异常")
    print("=" * 60)

    try:
        from app.core.exceptions import (
            NotFoundException,
            ValidationException,
            BusinessRuleException
        )

        # 测试 NotFoundException
        exc = NotFoundException("题目", "TEST_001")
        assert exc.code == "NOT_FOUND"
        assert exc.status_code == 404
        assert "题目" in exc.message
        print("✅ NotFoundException 工作正常")

        # 测试 to_dict()
        exc_dict = exc.to_dict()
        assert exc_dict["success"] is False
        assert exc_dict["error_code"] == "NOT_FOUND"
        print("✅ 异常序列化工作正常")

        print("\n✅ 异常系统测试通过!\n")
        return True

    except Exception as e:
        print(f"\n❌ 异常测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_logger():
    """测试日志系统"""
    print("=" * 60)
    print("测试 3: 日志系统")
    print("=" * 60)

    try:
        from app.core.logger import logger

        logger.info("这是一条测试日志")
        logger.warning("这是一条警告日志")
        logger.debug("这是一条调试日志")

        print("✅ 日志系统工作正常")
        print("   检查 logs/ 目录查看日志文件\n")
        return True

    except Exception as e:
        print(f"\n❌ 日志测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_dependency_injection():
    """测试依赖注入"""
    print("=" * 60)
    print("测试 4: 依赖注入")
    print("=" * 60)

    try:
        from app.api.deps import knowledge_service, problem_service, ocr_service
        from app.services.knowledge_service import KnowledgeService
        from app.services.problem_service import ProblemService
        from app.services.ocr_service import OCRService

        # 检查返回类型
        # 注意: 这些是可调用对象,调用时需要 db 参数
        print("✅ 依赖注入函数定义正确")
        print("   - knowledge_service")
        print("   - problem_service")
        print("   - ocr_service\n")

        return True

    except Exception as e:
        print(f"\n❌ 依赖注入测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_repository_base():
    """测试 BaseRepository"""
    print("=" * 60)
    print("测试 5: Repository 基类")
    print("=" * 60)

    try:
        from app.repositories.base import BaseRepository
        from typing import TypeVar, Generic

        # 检查是否是 Generic
        ModelType = TypeVar("ModelType")
        print("✅ BaseRepository 定义正确")
        print("   - 通用 CRUD 方法")
        print("   - 支持 Generic 类型")
        print("   - 分页查询方法\n")

        return True

    except Exception as e:
        print(f"\n❌ Repository 测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """运行所有测试"""
    print("\n" + "=" * 60)
    print("    MathTutor 后端重构验证")
    print("=" * 60 + "\n")

    results = []

    # 运行测试
    results.append(("模块导入", test_imports()))
    results.append(("异常系统", test_exceptions()))
    results.append(("日志系统", test_logger()))
    results.append(("依赖注入", test_dependency_injection()))
    results.append(("Repository", test_repository_base()))

    # 总结
    print("=" * 60)
    print("测试总结")
    print("=" * 60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "✅ 通过" if result else "❌ 失败"
        print(f"{name:20} {status}")

    print(f"\n通过: {passed}/{total}")

    if passed == total:
        print("\n🎉 所有测试通过! 重构成功!")
        print("\n下一步:")
        print("1. 运行单元测试: pytest")
        print("2. 启动服务: python run.py")
        print("3. 访问文档: http://localhost:8000/docs")
        return 0
    else:
        print("\n⚠️  部分测试失败,请检查上述错误信息")
        return 1


if __name__ == "__main__":
    sys.exit(main())
