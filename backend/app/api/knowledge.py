from fastapi import APIRouter, Depends
from typing import List

from app.api.deps import knowledge_service
from app.services.knowledge_service import KnowledgeService
from app.schemas.knowledge import CurriculumSchema, ModuleSchema, TopicSchema

router = APIRouter(prefix="/api/v1/knowledge", tags=["知识体系"])


@router.get("/curriculums", response_model=List[CurriculumSchema])
async def get_curriculums(service: KnowledgeService = Depends(knowledge_service)):
    """获取所有课程"""
    return await service.get_all_curriculums()


@router.get("/curriculums/{curriculum_id}", response_model=CurriculumSchema)
async def get_curriculum(
    curriculum_id: int,
    service: KnowledgeService = Depends(knowledge_service)
):
    """根据 ID 获取课程详情(包含模块和专题)"""
    return await service.get_curriculum_by_id(curriculum_id)


@router.get("/modules/{module_id}", response_model=ModuleSchema)
async def get_module(
    module_id: int,
    service: KnowledgeService = Depends(knowledge_service)
):
    """根据 ID 获取模块详情"""
    return await service.get_module_by_id(module_id)


@router.get("/topics/{topic_id}", response_model=TopicSchema)
async def get_topic(
    topic_id: int,
    service: KnowledgeService = Depends(knowledge_service)
):
    """根据 ID 获取专题详情(包含知识点)"""
    return await service.get_topic_by_id(topic_id)


@router.get("/health")
async def health_check():
    """健康检查端点"""
    return {"status": "ok", "message": "MathTutor API is running"}
