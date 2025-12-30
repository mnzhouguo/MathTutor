from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings"""

    # Database
    database_url: str = "sqlite+aiosqlite:///./mathtutor.db"

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_reload: bool = True

    # CORS
    frontend_url: str = "http://localhost:5173"

    # 百度 OCR
    baidu_ocr_api_key: str = "yuKIK2DC61nyyRCDVXwSMKuJ"
    baidu_ocr_secret_key: str = "t2uybCmT8pUeLdMFyeXJsULjnw6VYg5l"

    # 文件上传
    upload_path: str = "./uploads"
    max_file_size: int = 5242880  # 5MB
    allowed_formats: list = ["jpg", "jpeg", "png"]

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
