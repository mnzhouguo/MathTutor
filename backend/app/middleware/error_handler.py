"""
全局异常处理中间件
"""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from app.core.exceptions import MathTutorException
from app.core.logger import logger
import traceback


async def math_tutor_exception_handler(
    request: Request,
    exc: MathTutorException
):
    """
    处理自定义业务异常
    """
    request_id = getattr(request.state, "request_id", "unknown")

    logger.warning(
        f"[{request_id}] 业务异常: {exc.code} - {exc.message}",
        extra={
            "error_code": exc.code,
            "status_code": exc.status_code,
            "path": request.url.path,
            "details": exc.details
        }
    )

    return JSONResponse(
        status_code=exc.status_code,
        content={
            **exc.to_dict(),
            "path": request.url.path,
            "request_id": request_id
        }
    )


async def general_exception_handler(
    request: Request,
    exc: Exception
):
    """
    处理未捕获的通用异常
    """
    request_id = getattr(request.state, "request_id", "unknown")

    # 记录完整的堆栈信息
    logger.error(
        f"[{request_id}] 未处理的异常: {type(exc).__name__} - {str(exc)}",
        exc_info=True,
        extra={
            "exception_type": type(exc).__name__,
            "path": request.url.path
        }
    )

    # 生产环境不暴露详细错误信息
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "服务器内部错误",
            "error_code": "INTERNAL_SERVER_ERROR",
            "path": request.url.path,
            "request_id": request_id
        }
    )
