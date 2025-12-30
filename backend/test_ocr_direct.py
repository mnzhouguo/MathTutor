"""Direct test of OCR API"""
import asyncio
from app.utils.baidu_ocr import BaiduOCRClient
from app.services.ocr_service import OCRService
from app.core.database import async_session_maker

async def test():
    """Test OCR directly"""
    # Read image
    with open('uploads/ocr/2025/12/30/001.png', 'rb') as f:
        image_bytes = f.read()

    # Test BaiduOCRClient directly
    print("Testing BaiduOCRClient.recognize_paper_cut_edu()...")
    client = BaiduOCRClient()
    result = client.recognize_paper_cut_edu(image_bytes)

    print(f"Text length: {len(result.get('text', ''))}")
    print(f"Text preview: {result.get('text', '')[:100]}")
    print(f"Question type: {result.get('question_type')}")
    print(f"Question number: {result.get('question_number')}")
    print(f"Score: {result.get('score')}")
    print(f"Words count: {result.get('words_count')}")
    print(f"Confidence: {result.get('confidence')}")

    # Test full OCRService
    print("\nTesting OCRService.recognize_and_save()...")
    async with async_session_maker() as db:
        service = OCRService(db)
        response = await service.recognize_and_save("001.png", image_bytes)

        print(f"Success: {response.success}")
        print(f"Problem ID: {response.problem_id}")
        print(f"Content: {response.content[:100] if response.content else 'EMPTY'}")
        print(f"Confidence: {response.confidence_score}")

if __name__ == "__main__":
    asyncio.run(test())
