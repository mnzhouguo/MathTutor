from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.core.database import init_db
from app.api.knowledge import router as knowledge_router

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
    allow_origins=[settings.frontend_url, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(knowledge_router)


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
