"""
日志中间件 - 记录所有 HTTP 请求
"""
import time
import uuid
from fastapi import Request
from app.core.logger import logger


async def logging_middleware(request: Request, call_next):
    """
    记录请求日志中间件

    - 生成请求 ID 用于追踪
    - 记录请求方法和路径
    - 记录处理时长
    """
    # 生成请求 ID
    request_id = str(uuid.uuid4())[:8]
    start_time = time.time()

    # 将 request_id 存入 state,供后续使用
    request.state.request_id = request_id

    # 记录请求开始
    logger.info(f"[{request_id}] {request.method} {request.url.path}")

    # 处理请求
    response = await call_next(request)

    # 计算处理时长
    process_time = time.time() - start_time

    # 记录请求完成
    logger.info(
        f"[{request_id}] 完成: {response.status_code} ({process_time:.3f}s)"
    )

    # 将请求 ID 添加到响应头
    response.headers["X-Request-ID"] = request_id

    return response
