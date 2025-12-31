"""
OCR 服务层 - 业务逻辑
"""
import os
import uuid
import json
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.utils.baidu_ocr import BaiduOCRClient
from app.models.problem import Problem, OCRRecord
from app.schemas.problem import OCRResponseSchema


class OCRService:
    """OCR 业务逻辑服务"""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.ocr_client = BaiduOCRClient()

    async def recognize_and_save(
        self,
        filename: str,
        image_bytes: bytes
    ) -> OCRResponseSchema:
        """
        OCR 识别并直接保存到题库

        Args:
            filename: 文件名
            image_bytes: 图片二进制数据

        Returns:
            OCRResponseSchema
        """
        try:
            # 1. 调用百度 OCR 识别
            ocr_result = self.ocr_client.recognize_paper_cut_edu(image_bytes)

            # 2. 质量评估
            quality_assessment = self.ocr_client.assess_quality(ocr_result['confidence'])

            # 3. 保存图片文件
            file_path = await self._save_image(filename, image_bytes)

            # 4. 生成题目 ID
            problem_id = self._generate_problem_id()

            # 5. 先创建 OCR 记录 (确保获取 ID)
            ocr_record = OCRRecord(
                filename=filename,
                file_path=file_path,
                recognized_text=ocr_result['text'],
                confidence_score=ocr_result['confidence'],
                words_count=ocr_result['words_count'],
                raw_json=ocr_result.get('raw_json'),
                processing_time_ms=ocr_result['processing_time_ms'],
                status='success'
            )
            self.db.add(ocr_record)
            await self.db.flush()  # 获取 ocr_record.id

            # 6. 创建题目记录,直接关联 ocr_record_id
            problem = Problem(
                problem_id=problem_id,
                content=ocr_result['text'],
                question_type=ocr_result.get('question_type'),
                source='OCR识别',
                status='pending',
                quality_score=quality_assessment['grade'],
                question_number=ocr_result.get('question_number'),
                score=ocr_result.get('score'),
                parsed_data=json.dumps(ocr_result.get('parsed_data', {}), ensure_ascii=False),
                ocr_record_id=ocr_record.id  # 直接设置外键
            )
            self.db.add(problem)

            # 7. 提交事务
            await self.db.commit()
            await self.db.refresh(problem)
            await self.db.refresh(ocr_record)

            # 8. 返回结果
            return OCRResponseSchema(
                success=True,
                problem_id=problem.problem_id,
                content=problem.content,
                confidence_score=ocr_result['confidence'],
                processing_time_ms=ocr_result['processing_time_ms'],
                words_count=ocr_result['words_count'],
                quality_assessment=quality_assessment,
                ocr_record_id=ocr_record.id
            )

        except Exception as e:
            await self.db.rollback()
            import traceback
            error_trace = traceback.format_exc()
            print(f"ERROR in recognize_and_save: {error_trace}")
            return OCRResponseSchema(
                success=False,
                error=str(e),
                error_code="ERR_OCR_FAILED"
            )

    async def _save_image(self, filename: str, image_bytes: bytes) -> str:
        """
        保存图片到本地

        Args:
            filename: 原始文件名
            image_bytes: 图片二进制数据

        Returns:
            保存后的文件路径
        """
        from app.core.config import get_settings
        settings = get_settings()

        # 创建目录结构: uploads/ocr/YYYY/MM/DD/
        now = datetime.now()
        date_dir = now.strftime("%Y/%m/%d")
        save_dir = os.path.join(settings.upload_path, "ocr", date_dir)

        os.makedirs(save_dir, exist_ok=True)

        # 生成唯一文件名
        ext = os.path.splitext(filename)[1]
        unique_filename = f"{now.timestamp()}_{uuid.uuid4().hex[:8]}{ext}"
        file_path = os.path.join(save_dir, unique_filename)

        # 保存文件
        with open(file_path, 'wb') as f:
            f.write(image_bytes)

        # 返回相对路径
        return os.path.join("uploads", "ocr", date_dir, unique_filename).replace("\\", "/")

    def _generate_problem_id(self) -> str:
        """
        生成题目 ID

        格式: P_MATH_YYYY_XXX
        """
        from asyncio import run
        import random

        year = datetime.now().year
        random_num = random.randint(1, 999)
        return f"P_MATH_{year}_{random_num:03d}"

    async def get_ocr_record(self, ocr_record_id: int) -> Optional[OCRRecord]:
        """
        获取 OCR 记录

        Args:
            ocr_record_id: OCR 记录 ID

        Returns:
            OCRRecord 对象
        """
        stmt = select(OCRRecord).where(OCRRecord.id == ocr_record_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def re_recognize(self, ocr_record_id: int) -> Dict[str, Any]:
        """
        重新识别（使用原始图片）

        Args:
            ocr_record_id: OCR 记录 ID

        Returns:
            新旧识别结果对比
        """
        # 1. 查询原 OCR 记录
        old_ocr_record = await self.get_ocr_record(ocr_record_id)
        if not old_ocr_record:
            raise ValueError("OCR 记录不存在")

        # 2. 读取原始图片
        file_path = old_ocr_record.file_path
        if not os.path.exists(file_path):
            raise FileNotFoundError("原始图片文件不存在")

        with open(file_path, 'rb') as f:
            image_bytes = f.read()

        # 3. 重新调用 OCR
        new_ocr_result = self.ocr_client.recognize_paper_cut_edu(image_bytes)

        # 4. 更新 OCR 记录
        old_ocr_record.recognized_text = new_ocr_result['text']
        old_ocr_record.confidence_score = new_ocr_result['confidence']
        old_ocr_record.words_count = new_ocr_result['words_count']
        old_ocr_record.raw_json = new_ocr_result.get('raw_json')
        old_ocr_record.processing_time_ms = new_ocr_result['processing_time_ms']

        # 5. 更新关联的题目 - 通过反向关系查找
        stmt = select(Problem).where(Problem.ocr_record_id == ocr_record_id)
        result = await self.db.execute(stmt)
        problem = result.scalar_one_or_none()
        if problem:
            problem.content = new_ocr_result['text']
            quality_assessment = self.ocr_client.assess_quality(new_ocr_result['confidence'])
            problem.quality_score = quality_assessment['grade']

        await self.db.commit()

        # 6. 返回对比结果
        improvement = new_ocr_result['confidence'] - old_ocr_record.confidence_score

        return {
            "success": True,
            "ocr_record_id": ocr_record_id,
            "old_content": old_ocr_record.recognized_text,
            "new_content": new_ocr_result['text'],
            "old_confidence": old_ocr_record.confidence_score,
            "new_confidence": new_ocr_result['confidence'],
            "improvement": improvement
        }
