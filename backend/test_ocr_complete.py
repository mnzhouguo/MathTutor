"""
测试 OCR 完整流程：识别 -> 解析 -> 保存到数据库
"""
import asyncio
import sys
import os
sys.path.insert(0, '.')

from app.core.database import engine, Base, async_session_maker
from app.services.ocr_service import OCRService


async def main():
    """测试完整流程"""

    print("=" * 60)
    print("OCR 完整流程测试")
    print("=" * 60)

    # 1. 初始化数据库
    print("\n[1] 初始化数据库...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✓ 数据库初始化完成")

    # 2. 创建 OCR 服务
    print("\n[2] 创建 OCR 服务...")
    async with async_session_maker() as db:
        service = OCRService(db)

        # 3. 读取测试图片
        print("\n[3] 读取测试图片: uploads/ocr/2025/12/30/001.png")
        with open('uploads/ocr/2025/12/30/001.png', 'rb') as f:
            image_bytes = f.read()
        print(f"✓ 图片大小: {len(image_bytes)} bytes")

        # 4. 执行 OCR 识别并保存
        print("\n[4] 调用百度 OCR API...")
        result = await service.recognize_and_save('001.png', image_bytes)

        # 5. 输出结果
        print("\n" + "=" * 60)
        print("识别结果")
        print("=" * 60)

        if result.success:
            print(f"✓ 成功识别并保存到数据库")
            print(f"\n题目 ID: {result.problem_id}")
            print(f"题目类型: {result.content_type if hasattr(result, 'content_type') else 'essay'}")
            print(f"识别文本长度: {len(result.content)} 字符")
            print(f"置信度: {result.confidence_score}")
            print(f"处理时间: {result.processing_time_ms} ms")
            print(f"词语数量: {result.words_count}")
            print(f"OCR 记录 ID: {result.ocr_record_id}")
            print(f"质量等级: {result.quality_assessment.get('grade', 'N/A')}")

            print(f"\n识别文本预览:")
            print("-" * 60)
            preview = result.content[:300] if len(result.content) > 300 else result.content
            print(preview + "..." if len(result.content) > 300 else preview)
            print("-" * 60)

            # 6. 验证数据库保存
            print("\n[5] 验证数据库保存...")
            from sqlalchemy import select
            from app.models.problem import Problem, OCRRecord

            # 查询题目
            stmt = select(Problem).where(Problem.problem_id == result.problem_id)
            prob_result = await db.execute(stmt)
            problem = prob_result.scalar_one_or_none()

            if problem:
                print("✓ 题目已保存到数据库")
                print(f"  - content 长度: {len(problem.content)} 字符")
                print(f"  - question_type: {problem.question_type}")
                print(f"  - question_number: {problem.question_number}")
                print(f"  - score: {problem.score}")
                print(f"  - quality_score: {problem.quality_score}")
                print(f"  - ocr_record_id: {problem.ocr_record_id}")

                # 查询 OCR 记录
                if problem.ocr_record_id:
                    ocr_stmt = select(OCRRecord).where(OCRRecord.id == problem.ocr_record_id)
                    ocr_result = await db.execute(ocr_stmt)
                    ocr_record = ocr_result.scalar_one_or_none()

                    if ocr_record:
                        print("✓ OCR 记录已保存到数据库")
                        print(f"  - filename: {ocr_record.filename}")
                        print(f"  - confidence_score: {ocr_record.confidence_score}")
                        print(f"  - words_count: {ocr_record.words_count}")
                else:
                    print("✗ 未关联 OCR 记录")

            else:
                print("✗ 题目未保存到数据库")

        else:
            print(f"✗ 识别失败")
            print(f"错误: {result.error}")
            print(f"错误代码: {result.error_code}")

    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)


if __name__ == '__main__':
    asyncio.run(main())
