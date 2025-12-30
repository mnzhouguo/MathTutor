from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import get_settings
from app.core.database import init_db
from app.api.knowledge import router as knowledge_router
from app.api.ocr import router as ocr_router
from app.api.problems import router as problems_router
import os

settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title="MathTutor API",
    description="AI 智能数学辅导系统后端 API",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(knowledge_router)
app.include_router(ocr_router)
app.include_router(problems_router)

# Mount uploads directory for static file serving
uploads_dir = os.path.join(os.path.dirname(__file__), "..", "uploads")
if os.path.exists(uploads_dir):
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    await init_db()
    print("Database initialized successfully!")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to MathTutor API",
        "docs": "/docs",
        "version": "0.1.0"
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}
