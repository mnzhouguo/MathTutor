from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Curriculum(Base):
    """课程表"""
    __tablename__ = "curriculums"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    grade = Column(String(50), nullable=False)
    semester = Column(String(50), nullable=False)

    # Relationships
    modules = relationship("Module", back_populates="curriculum")


class Module(Base):
    """模块表"""
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(String(50), unique=True, nullable=False, index=True)
    module_name = Column(String(200), nullable=False)
    module_tag = Column(String(100))
    overview = Column(Text)
    curriculum_id = Column(Integer, ForeignKey("curriculums.id"))

    # Relationships
    curriculum = relationship("Curriculum", back_populates="modules")
    topics = relationship("Topic", back_populates="module")


class Topic(Base):
    """专题表"""
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(String(50), unique=True, nullable=False, index=True)
    topic_name = Column(String(200), nullable=False)
    alias = Column(String(100))
    module_id = Column(Integer, ForeignKey("modules.id"))

    # Relationships
    module = relationship("Module", back_populates="topics")
    knowledge_points = relationship("KnowledgePoint", back_populates="topic")


class KnowledgePoint(Base):
    """知识点表"""
    __tablename__ = "knowledge_points"

    id = Column(Integer, primary_key=True, index=True)
    kp_id = Column(String(50), unique=True, nullable=False, index=True)
    kp_name = Column(String(200), nullable=False)
    detail = Column(Text)
    topic_id = Column(Integer, ForeignKey("topics.id"))

    # Relationships
    topic = relationship("Topic", back_populates="knowledge_points")
