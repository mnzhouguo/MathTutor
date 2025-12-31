# MathTutor 后端 API

AI 智能数学辅导系统后端服务

## 🚀 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 配置环境

```bash
cp .env.example .env
# 编辑 .env 文件,配置必要的环境变量
```

### 3. 初始化数据库

数据库会在首次运行时自动创建。

### 4. 启动服务

```bash
python run.py
```

服务将在 http://localhost:8000 启动

### 5. 访问 API 文档

打开浏览器访问: http://localhost:8000/docs

---

## 🧪 测试

### 运行所有测试

```bash
pytest
```

### 运行特定测试

```bash
pytest tests/test_repositories.py
pytest tests/test_services.py
pytest tests/test_api.py
```

### 查看测试覆盖率

```bash
pytest --cov=app tests/
```

### 验证重构

```bash
python verify_refactoring.py
```

---

## 📁 项目结构

```
backend/
├── app/
│   ├── api/                    # API 路由层
│   │   ├── deps.py             # 依赖注入容器
│   │   ├── knowledge.py        # 知识体系 API
│   │   ├── problems.py         # 题目管理 API
│   │   └── ocr.py              # OCR 识别 API
│   ├── core/                   # 核心配置
│   │   ├── config.py           # 应用配置
│   │   ├── database.py         # 数据库配置
│   │   ├── exceptions.py       # 自定义异常
│   │   └── logger.py           # 日志配置
│   ├── middleware/             # 中间件
│   │   ├── error_handler.py    # 异常处理
│   │   └── logging.py          # 请求日志
│   ├── models/                 # 数据模型
│   │   ├── knowledge.py        # 知识体系模型
│   │   └── problem.py          # 题目模型
│   ├── repositories/           # 数据访问层
│   │   ├── base.py             # 基础 Repository
│   │   ├── problem_repository.py
│   │   └── knowledge_repository.py
│   ├── schemas/                # Pydantic Schema
│   ├── services/               # 业务逻辑层
│   │   ├── knowledge_service.py
│   │   ├── problem_service.py
│   │   └── ocr_service.py
│   ├── utils/                  # 工具函数
│   └── main.py                 # 应用入口
├── tests/                      # 测试
│   ├── conftest.py             # pytest 配置
│   ├── test_api.py             # API 测试
│   ├── test_repositories.py    # Repository 测试
│   └── test_services.py        # Service 测试
├── logs/                       # 日志文件 (自动生成)
├── uploads/                    # 上传文件 (自动生成)
├── .env.example                # 环境变量示例
├── requirements.txt            # Python 依赖
├── pytest.ini                  # pytest 配置
├── run.py                      # 启动脚本
├── verify_refactoring.py       # 验证脚本
├── ARCHITECTURE.md             # 架构文档
└── REFACTORING_SUMMARY.md      # 重构总结
```

---

## 🏗️ 架构

### 三层架构

```
API Layer (路由层)
    ↓
Service Layer (业务逻辑层)
    ↓
Repository Layer (数据访问层)
    ↓
Database
```

**详细文档**: [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 🔧 开发指南

### 添加新功能

1. **创建数据模型**
   ```python
   # app/models/your_model.py
   from app.core.database import Base
   from sqlalchemy import Column, Integer, String

   class YourModel(Base):
       __tablename__ = "your_table"
       id = Column(Integer, primary_key=True)
       name = Column(String(100))
   ```

2. **创建 Repository**
   ```python
   # app/repositories/your_repository.py
   from app.repositories.base import BaseRepository
   from app.models.your_model import YourModel

   class YourRepository(BaseRepository[YourModel]):
       def __init__(self, db):
           super().__init__(YourModel, db)
   ```

3. **创建 Service**
   ```python
   # app/services/your_service.py
   from app.repositories.your_repository import YourRepository

   class YourService:
       def __init__(self, db):
           self.your_repo = YourRepository(db)
   ```

4. **创建 API 路由**
   ```python
   # app/api/your_api.py
   from fastapi import APIRouter, Depends
   from app.api.deps import your_service
   from app.services.your_service import YourService

   router = APIRouter(prefix="/api/your", tags=["Your"])

   @router.get("/")
   async def get_items(service: YourService = Depends(your_service)):
       return await service.get_all()
   ```

5. **注册路由**
   ```python
   # app/main.py
   from app.api.your_api import router as your_router
   app.include_router(your_router)
   ```

6. **编写测试**
   ```python
   # tests/test_your.py
   import pytest
   from app.services.your_service import YourService

   @pytest.mark.asyncio
   async def test_your_service(db_session):
       service = YourService(db_session)
       result = await service.get_all()
       assert len(result) >= 0
   ```

---

## 📝 API 端点

> **版本**: v1 | **基础路径**: `/api/v1`

### 知识体系

- `GET /api/v1/knowledge/curriculums` - 获取所有课程
- `GET /api/v1/knowledge/curriculums/{id}` - 获取课程详情
- `GET /api/v1/knowledge/modules/{id}` - 获取模块详情
- `GET /api/v1/knowledge/topics/{id}` - 获取专题详情

### 题目管理

- `GET /api/v1/problems/` - 获取题目列表 (分页)
- `GET /api/v1/problems/{problem_id}` - 获取题目详情
- `PUT /api/v1/problems/{problem_id}` - 更新题目
- `DELETE /api/v1/problems/{problem_id}` - 删除题目

### OCR 识别

- `POST /api/v1/ocr/recognize-and-save` - OCR 识别并保存
- `POST /api/v1/ocr/re-recognize` - 重新识别
- `GET /api/v1/ocr/records/{id}` - 获取 OCR 记录

**完整文档**: [API_ENDPOINTS.md](API_ENDPOINTS.md) | <http://localhost:8000/docs>

---

## 🔐 环境变量

```bash
# 数据库
DATABASE_URL=sqlite+aiosqlite:///./mathtutor.db

# API
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=True

# CORS
FRONTEND_URL=http://localhost:5173

# 百度 OCR (可选)
BAIDU_OCR_API_KEY=your_api_key
BAIDU_OCR_SECRET_KEY=your_secret_key

# 文件上传
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

---

## 📊 日志

日志文件位于 `logs/` 目录:

- `app_YYYY-MM-DD.log` - 应用日志
- `errors_YYYY-MM-DD.log` - 错误日志

日志级别:
- DEBUG - 调试信息
- INFO - 一般信息
- WARNING - 警告
- ERROR - 错误
- CRITICAL - 严重错误

---

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交变更
4. 推送到分支
5. 创建 Pull Request

---

## 📄 许可证

MIT License

---

## 📞 联系方式

- 项目文档: [ARCHITECTURE.md](ARCHITECTURE.md)
- 重构总结: [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md)
