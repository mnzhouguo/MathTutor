import sys
sys.path.insert(0, 'e:/code/MathTutor/backend')

from app.models.problem import OCRRecord, Problem
from sqlalchemy import inspect

print("OCRRecord columns:")
mapper = inspect(OCRRecord)
for column in mapper.columns:
    print(f"  - {column.name}: {column.type}")

print("\nProblem columns:")
mapper = inspect(Problem)
for column in mapper.columns:
    print(f"  - {column.name}: {column.type}")

# Try to create an OCRRecord instance
print("\n\nTrying to create OCRRecord instance...")
try:
    ocr = OCRRecord(
        filename="test.png",
        file_path="/path/to/test.png",
        recognized_text="Test content",
        confidence_score=0.95,
        words_count=100,
        processing_time_ms=1000
    )
    print("✓ OCRRecord created successfully!")
    print(f"  Fields: {ocr.__dict__}")
except Exception as e:
    print(f"✗ Error creating OCRRecord: {e}")
