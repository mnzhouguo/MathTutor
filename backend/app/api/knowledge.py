from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List

from app.core.database import get_db
from app.models.knowledge import Curriculum, Module, Topic, KnowledgePoint
from app.schemas.knowledge import CurriculumSchema, ModuleSchema, TopicSchema, KnowledgePointSchema

router = APIRouter(prefix="/api/knowledge", tags=["knowledge"])


@router.get("/curriculums", response_model=List[CurriculumSchema])
async def get_curriculums(db: AsyncSession = Depends(get_db)):
    """Get all curriculums"""
    result = await db.execute(
        select(Curriculum)
        .options(selectinload(Curriculum.modules).selectinload(Module.topics).selectinload(Topic.knowledge_points))
    )
    curriculums = result.scalars().all()
    return curriculums


@router.get("/curriculums/{curriculum_id}", response_model=CurriculumSchema)
async def get_curriculum(curriculum_id: int, db: AsyncSession = Depends(get_db)):
    """Get curriculum by ID with modules and topics"""
    result = await db.execute(
        select(Curriculum)
        .where(Curriculum.id == curriculum_id)
        .options(selectinload(Curriculum.modules).selectinload(Module.topics).selectinload(Topic.knowledge_points))
    )
    curriculum = result.scalar_one_or_none()

    if not curriculum:
        raise HTTPException(status_code=404, detail="Curriculum not found")

    return curriculum


@router.get("/modules/{module_id}", response_model=ModuleSchema)
async def get_module(module_id: int, db: AsyncSession = Depends(get_db)):
    """Get module by ID"""
    result = await db.execute(
        select(Module)
        .where(Module.id == module_id)
        .options(selectinload(Module.topics).selectinload(Topic.knowledge_points))
    )
    module = result.scalar_one_or_none()

    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    return module


@router.get("/topics/{topic_id}", response_model=TopicSchema)
async def get_topic(topic_id: int, db: AsyncSession = Depends(get_db)):
    """Get topic by ID with knowledge points"""
    result = await db.execute(
        select(Topic)
        .where(Topic.id == topic_id)
        .options(selectinload(Topic.knowledge_points))
    )
    topic = result.scalar_one_or_none()

    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    return topic


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "MathTutor API is running"}
