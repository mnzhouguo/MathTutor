"""
初始化数据库脚本 - 创建测试数据
"""
import asyncio
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import async_session_maker, init_db
from app.models.knowledge import Curriculum, Module, Topic, KnowledgePoint


async def create_test_data():
    """创建测试数据"""
    async with async_session_maker() as session:
        try:
            # Create curriculum
            curriculum = Curriculum(
                name="初中数学七年级上册压轴题体系",
                grade="七年级",
                semester="上册"
            )
            session.add(curriculum)
            await session.flush()

            # Create modules
            module1 = Module(
                module_id="M01",
                module_name="数与式的深度运算",
                module_tag="代数思维篇",
                overview="涵盖绝对值化简、整式化简、代数式求值等核心题型",
                curriculum_id=curriculum.id
            )
            session.add(module1)
            await session.flush()

            module2 = Module(
                module_id="M02",
                module_name="数轴与动点问题",
                module_tag="数形结合篇",
                overview="数轴上的动点运动、线段与坐标的互化、追及与相遇问题",
                curriculum_id=curriculum.id
            )
            session.add(module2)
            await session.flush()

            # Create topics for module 1
            topic1 = Topic(
                topic_id="T01_01",
                topic_name="绝对值化简",
                alias="专题1",
                module_id=module1.id
            )
            session.add(topic1)
            await session.flush()

            # Create knowledge points for topic 1
            kp1 = KnowledgePoint(
                kp_id="KP01_1",
                kp_name="零点分段法",
                detail="处理多个绝对值相加，通过寻找绝对值为0的临界点，将数轴分成若干区间，在每个区间内去掉绝对值符号",
                topic_id=topic1.id
            )
            session.add(kp1)

            kp2 = KnowledgePoint(
                kp_id="KP01_2",
                kp_name="绝对值的几何意义",
                detail="|a|表示数a到原点的距离；|a-b|表示数a到数b的距离",
                topic_id=topic1.id
            )
            session.add(kp2)

            # Create topics for module 2
            topic2 = Topic(
                topic_id="T02_01",
                topic_name="数轴动点问题",
                alias="专题2",
                module_id=module2.id
            )
            session.add(topic2)
            await session.flush()

            # Create knowledge points for topic 2
            kp3 = KnowledgePoint(
                kp_id="KP02_1",
                kp_name="路程与坐标互化",
                detail="路程=|坐标差|，坐标变化量=路程×方向（+1或-1）",
                topic_id=topic2.id
            )
            session.add(kp3)

            kp4 = KnowledgePoint(
                kp_id="KP02_2",
                kp_name="追及与相遇",
                detail="追及：路程差=初始距离；相遇：路程和=初始距离",
                topic_id=topic2.id
            )
            session.add(kp4)

            kp5 = KnowledgePoint(
                kp_id="KP02_3",
                kp_name="中点公式",
                detail="若M是A、B的中点，则M的坐标=(A坐标+B坐标)/2",
                topic_id=topic2.id
            )
            session.add(kp5)

            # Commit all changes
            await session.commit()

            print("[OK] Test data created successfully!")
            print(f"  - Curriculum: {curriculum.name}")
            print(f"  - Modules: 2")
            print(f"  - Topics: 2")
            print(f"  - Knowledge Points: 5")

        except Exception as e:
            await session.rollback()
            print(f"[ERROR] Failed to create test data: {e}")
            raise


async def main():
    """Main function"""
    print("[START] Initializing database...")

    # Initialize database tables
    await init_db()
    print("[OK] Database tables created successfully!")

    # Create test data
    await create_test_data()

    print("\n[DONE] Database initialization completed!")


if __name__ == "__main__":
    asyncio.run(main())
