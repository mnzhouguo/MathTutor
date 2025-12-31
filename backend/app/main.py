from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi import status

from app.core.config import get_settings
from app.core.database import init_db
from app.core.exceptions import MathTutorException
from app.core.logger import logger
from app.middleware.logging import logging_middleware
from app.middleware.error_handler import math_tutor_exception_handler, general_exception_handler
from app.api.knowledge import router as knowledge_router
from app.api.ocr import router as ocr_router
from app.api.problems import router as problems_router

# Scalar 文档
from scalar_fastapi import get_scalar_api_reference, Theme

import os

settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title="MathTutor API",
    description="AI 智能数学辅导系统后端 API",
    version="0.1.0",
    docs_url=None,  # 禁用默认的 Swagger UI
    redoc_url=None  # 禁用默认的 ReDoc
)

# ============ 注册中间件 ============

# 日志中间件
app.middleware("http")(logging_middleware)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ 注册异常处理器 ============

app.add_exception_handler(MathTutorException, math_tutor_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# ============ 注册路由 ============

app.include_router(knowledge_router)
app.include_router(ocr_router)
app.include_router(problems_router)

# ============ 静态文件 ============

uploads_dir = os.path.join(os.path.dirname(__file__), "..", "uploads")
if os.path.exists(uploads_dir):
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")


# ============ 生命周期事件 ============

@app.on_event("startup")
async def startup_event():
    """应用启动时初始化"""
    logger.info("MathTutor API 正在启动...")

    # 初始化数据库
    await init_db()
    logger.info("数据库初始化成功")

    # 打印配置信息
    logger.info(f"环境: {'Development' if settings.api_reload else 'Production'}")
    logger.info(f"数据库: {settings.database_url[:20]}...")
    logger.info(f"OCR 配置: {'已配置' if settings.baidu_ocr_configured else '未配置'}")

    logger.info("MathTutor API 启动完成")


@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭时清理"""
    logger.info("MathTutor API 正在关闭...")


# ============ 基础端点 ============

@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "Welcome to MathTutor API",
        "docs": "/docs",
        "version": "0.1.0",
        "status": "running"
    }


@app.get("/health")
async def health():
    """健康检查"""
    return {"status": "healthy", "service": "MathTutor API"}


# ============ API 文档端点 ============

@app.get("/docs", include_in_schema=False)
async def scalar_docs():
    """
    Scalar API 文档

    现代化的 API 文档界面,支持交互式测试
    """
    return get_scalar_api_reference(
        openapi_url="/openapi.json",
        title="MathTutor API - AI 智能数学辅导系统"
    )
