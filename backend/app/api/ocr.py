"""
OCR 相关 API 路由
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.ocr_service import OCRService
from app.schemas.problem import OCRResponseSchema

router = APIRouter(prefix="/api/v1/ocr", tags=["OCR"])


@router.post("/recognize-and-save", response_model=OCRResponseSchema)
async def recognize_and_save(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
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
        raise HTTPException(status_code=400, detail="只支持图片文件")

    # 2. 读取文件内容
    image_bytes = await file.read()

    # 3. 验证文件大小 (5MB)
    from app.core.config import get_settings
    settings = get_settings()
    if len(image_bytes) > settings.max_file_size:
        raise HTTPException(
            status_code=400,
            detail=f"文件大小超过限制 (最大 {settings.max_file_size // 1024 // 1024}MB)"
        )

    # 4. 验证是否为有效图片（通过文件头）
    if len(image_bytes) < 8:
        raise HTTPException(status_code=400, detail="图片文件无效")

    # 简单的文件头检查
    jpeg_header = b'\xff\xd8\xff'
    png_header = b'\x89\x50\x4e\x47'

    if not (image_bytes.startswith(jpeg_header) or image_bytes.startswith(png_header)):
        raise HTTPException(status_code=400, detail="不支持的图片格式，仅支持 JPG 和 PNG")

    # 5. 调用 OCR 服务
    ocr_service = OCRService(db)
    result = await ocr_service.recognize_and_save(file.filename, image_bytes)

    # 6. 检查识别是否成功
    if not result.success:
        raise HTTPException(
            status_code=500,
            detail={
                "error": result.error,
                "error_code": result.error_code
            }
        )

    return result


@router.post("/re-recognize")
async def re_recognize(
    ocr_record_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    重新识别（使用原始图片）

    Args:
        ocr_record_id: OCR 记录 ID

    Returns:
        新旧识别结果对比
    """
    ocr_service = OCRService(db)

    try:
        result = await ocr_service.re_recognize(ocr_record_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail="原始图片文件不存在")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"重新识别失败: {str(e)}")


@router.get("/records/{ocr_record_id}")
async def get_ocr_record(
    ocr_record_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    获取 OCR 记录详情

    Args:
        ocr_record_id: OCR 记录 ID

    Returns:
        OCR 记录详情
    """
    ocr_service = OCRService(db)
    ocr_record = await ocr_service.get_ocr_record(ocr_record_id)

    if not ocr_record:
        raise HTTPException(status_code=404, detail="OCR 记录不存在")

    return {
        "id": ocr_record.id,
        "filename": ocr_record.filename,
        "file_path": ocr_record.file_path,
        "recognized_text": ocr_record.recognized_text,
        "confidence_score": ocr_record.confidence_score,
        "words_count": ocr_record.words_count,
        "processing_time_ms": ocr_record.processing_time_ms,
        "status": ocr_record.status,
        "created_at": ocr_record.created_at
    }
