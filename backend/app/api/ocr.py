"""
OCR 相关 API 路由
"""
from fastapi import APIRouter, UploadFile, File, Depends
from typing import Dict, Any

from app.api.deps import ocr_service
from app.services.ocr_service import OCRService
from app.schemas.problem import OCRResponseSchema
from app.core.exceptions import NotFoundException, ValidationException, ExternalServiceException
from app.core.config import get_settings
from app.core.logger import logger

router = APIRouter(prefix="/api/v1/ocr", tags=["OCR识别"])


@router.post("/recognize-and-save", response_model=OCRResponseSchema)
async def recognize_and_save(
    file: UploadFile = File(...),
    service: OCRService = Depends(ocr_service)
):
    """
    OCR 识别并直接保存到题库

    Args:
        file: 图片文件 (支持 JPG、PNG)

    Returns:
        OCRResponseSchema
    """
    # 1. 验证文件格式
    if not file.content_type.startswith('image/'):
        raise ValidationException("只支持图片文件")

    # 2. 读取文件内容
    image_bytes = await file.read()

    # 3. 验证文件大小
    settings = get_settings()
    if len(image_bytes) > settings.max_file_size:
        raise ValidationException(
            f"文件大小超过限制 (最大 {settings.max_file_size // 1024 // 1024}MB)"
        )

    # 4. 验证是否为有效图片
    if len(image_bytes) < 8:
        raise ValidationException("图片文件无效")

    # 文件头检查
    jpeg_header = b'\xff\xd8\xff'
    png_header = b'\x89\x50\x4e\x47'

    if not (image_bytes.startswith(jpeg_header) or image_bytes.startswith(png_header)):
        raise ValidationException("不支持的图片格式，仅支持 JPG 和 PNG")

    logger.info(f"开始 OCR 识别: {file.filename}, 大小: {len(image_bytes)} bytes")

    # 5. 调用 OCR 服务
    try:
        result = await service.recognize_and_save(file.filename, image_bytes)
        logger.info(f"OCR 识别成功: {file.filename}")
        return result

    except Exception as e:
        logger.error(f"OCR 识别失败: {file.filename}, 错误: {str(e)}")
        raise ExternalServiceException("百度 OCR", str(e))


@router.post("/re-recognize")
async def re_recognize(
    ocr_record_id: int,
    service: OCRService = Depends(ocr_service)
):
    """
    重新识别（使用原始图片）

    Args:
        ocr_record_id: OCR 记录 ID

    Returns:
        新旧识别结果对比
    """
    logger.info(f"重新识别 OCR 记录: {ocr_record_id}")

    try:
        result = await service.re_recognize(ocr_record_id)
        logger.info(f"重新识别成功: {ocr_record_id}")
        return result

    except ValueError:
        raise NotFoundException("OCR 记录", str(ocr_record_id))
    except FileNotFoundError:
        raise NotFoundException("原始图片文件")
    except Exception as e:
        logger.error(f"重新识别失败: {ocr_record_id}, 错误: {str(e)}")
        raise ExternalServiceException("百度 OCR", "重新识别失败")


@router.get("/records/{ocr_record_id}")
async def get_ocr_record(
    ocr_record_id: int,
    service: OCRService = Depends(ocr_service)
):
    """
    获取 OCR 记录详情

    Args:
        ocr_record_id: OCR 记录 ID

    Returns:
        OCR 记录详情
    """
    ocr_record = await service.get_ocr_record(ocr_record_id)

    if not ocr_record:
        raise NotFoundException("OCR 记录", str(ocr_record_id))

    return {
        "id": ocr_record.id,
        "filename": ocr_record.filename,
        "file_path": ocr_record.file_path,
        "recognized_text": ocr_record.recognized_text,
        "confidence_score": ocr_record.confidence_score,
        "words_count": ocr_record.words_count,
        "processing_time_ms": ocr_record.processing_time_ms,
        "status": ocr_record.status,
        "created_at": ocr_record.created_at.isoformat() if ocr_record.created_at else None
    }
