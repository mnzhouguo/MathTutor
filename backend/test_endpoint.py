import asyncio
import sys
sys.path.insert(0, 'e:/code/MathTutor/backend')

from app.core.database import async_session_maker
from app.services.ocr_service import OCRService

async def test():
    async with async_session_maker() as db:
        service = OCRService(db)

        # Read the test image
        with open('e:/code/MathTutor/backend/uploads/ocr/2025/12/30/001.png', 'rb') as f:
            image_bytes = f.read()

        # Call the actual method
        print("Calling recognize_and_save()...")
        result = await service.recognize_and_save('001.png', image_bytes)

        print("Result:", result.success)
        if not result.success:
            print("Error:", result.error)
        else:
            print("Problem ID:", result.problem_id)

asyncio.run(test())
