from pydantic import BaseModel
from typing import List, Optional


class KnowledgePointSchema(BaseModel):
    """知识点 Schema"""
    id: int
    kp_id: str
    kp_name: str
    detail: Optional[str] = None
    topic_id: int

    class Config:
        from_attributes = True


class TopicSchema(BaseModel):
    """专题 Schema"""
    id: int
    topic_id: str
    topic_name: str
    alias: Optional[str] = None
    module_id: int
    knowledge_points: List[KnowledgePointSchema] = []

    class Config:
        from_attributes = True


class ModuleSchema(BaseModel):
    """模块 Schema"""
    id: int
    module_id: str
    module_name: str
    module_tag: Optional[str] = None
    overview: Optional[str] = None
    curriculum_id: int
    topics: List[TopicSchema] = []

    class Config:
        from_attributes = True


class CurriculumSchema(BaseModel):
    """课程 Schema"""
    id: int
    name: str
    grade: str
    semester: str
    modules: List[ModuleSchema] = []

    class Config:
        from_attributes = True
