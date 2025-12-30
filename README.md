# MathTutor 开发环境搭建指南

## 前置要求

### 必需软件
- **Python 3.9+**：[下载地址](https://www.python.org/downloads/)
- **Node.js 18+**：[下载地址](https://nodejs.org/)
- **Git**：[下载地址](https://git-scm.com/downloads)

### 验证安装
```bash
python --version  # 应显示 Python 3.9+
node --version    # 应显示 v18+
npm --version     # 应显示 npm 9+
```

---

## 🚀 快速开始

### 1. 安装后端依赖

```bash
# 进入后端目录
cd backend

# 创建虚拟环境（Windows）
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

### 2. 初始化数据库

```bash
# 确保虚拟环境已激活
python init_db.py
```

成功后会显示：
```
✅ 测试数据创建成功!
  - 课程: 初中数学七年级上册压轴题体系
  - 模块数: 2
  - 专题数: 2
  - 知识点数: 5
```

### 3. 启动后端服务器

```bash
# 方法1：直接运行
python run.py

# 方法2：使用 uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

成功后会显示：
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started server process
INFO:     Waiting for application startup.
Database initialized successfully!
INFO:     Application startup complete.
```

访问 http://localhost:8000 查看 API 根页面
访问 http://localhost:8000/docs 查看 Swagger API 文档

### 4. 安装前端依赖

```bash
# 打开新终端，进入前端目录
cd frontend

# 安装依赖
npm install
```

### 5. 启动前端开发服务器

```bash
npm run dev
```

成功后会显示：
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

访问 http://localhost:5173 查看前端页面

---

## 📂 项目结构

```
MathTutor/
├── backend/                 # 后端代码（Python + FastAPI）
│   ├── app/
│   │   ├── api/            # API 路由
│   │   ├── core/           # 核心配置（数据库、配置）
│   │   ├── models/         # 数据库模型
│   │   ├── schemas/        # Pydantic schemas
│   │   └── main.py         # FastAPI 应用入口
│   ├── init_db.py          # 数据库初始化脚本
│   ├── requirements.txt    # Python 依赖
│   └── run.py              # 启动脚本
│
├── frontend/               # 前端代码（React + Vite）
│   ├── src/
│   │   ├── api/           # API 客户端
│   │   ├── components/    # React 组件
│   │   ├── pages/         # 页面组件
│   │   ├── store/         # Zustand 状态管理
│   │   ├── types/         # TypeScript 类型定义
│   │   └── App.tsx        # 应用入口
│   ├── package.json       # Node 依赖
│   └── vite.config.ts     # Vite 配置
│
├── docs/                  # 项目文档
├── knowledge_base/        # 知识库数据（JSON）
└── README.md             # 本文件
```

---

## 🔧 开发指南

### 后端开发

**添加新的 API 端点：**
1. 在 `backend/app/api/` 创建新的路由文件
2. 在 `backend/app/main.py` 中注册路由
3. 重启服务器（自动重载已启用）

**数据库迁移：**
```bash
# 修改模型后，重新初始化数据库（会清空数据）
python init_db.py
```

### 前端开发

**添加新页面：**
1. 在 `frontend/src/pages/` 创建页面组件
2. 在 `frontend/src/App.tsx` 中添加路由
3. 在导航菜单中添加链接

**环境变量：**
- 修改 `frontend/.env` 中的 `VITE_API_URL` 可更改后端 API 地址

---

## 🧪 测试框架功能

### 1. 测试后端 API

访问 Swagger 文档：http://localhost:8000/docs

测试接口：
- `GET /` - 根路径
- `GET /health` - 健康检查
- `GET /api/knowledge/health` - 知识库服务健康检查
- `GET /api/knowledge/curriculums` - 获取所有课程
- `GET /api/knowledge/curriculums/1` - 获取课程详情（包含模块和专题）

### 2. 测试前端页面

1. 访问 http://localhost:5173
2. 点击导航栏的"知识体系"
3. 点击课程卡片展开查看模块和专题

---

## 🐛 常见问题

### 问题1：Python 未安装
**解决方案：** 访问 https://www.python.org/downloads/ 下载并安装 Python 3.9+

### 问题2：npm install 失败
**解决方案：** 尝试切换 npm 镜像源
```bash
npm config set registry https://registry.npmmirror.com
npm install
```

### 问题3：CORS 错误
**解决方案：** 检查 `backend/.env` 中的 `FRONTEND_URL` 是否与前端地址一致

### 问题4：数据库连接失败
**解决方案：** 删除 `backend/mathtutor.db` 文件，重新运行 `python init_db.py`

---

## 📚 技术栈

### 后端
- **框架**：FastAPI 0.115.0
- **ORM**：SQLAlchemy 2.0
- **数据库**：SQLite（异步 aiosqlite）
- **API 文档**：自动生成 Swagger UI

### 前端
- **框架**：React 18 + TypeScript
- **构建工具**：Vite
- **UI 组件库**：Ant Design
- **状态管理**：Zustand
- **路由**：React Router v6
- **HTTP 客户端**：Axios

---

## 📝 下一步计划

- [ ] 实现题库管理功能
- [ ] 实现智能教学功能（集成千问/DeepSeek API）
- [ ] 实现学习报告功能
- [ ] 添加用户认证
- [ ] 部署到生产环境

---

## 📄 许可证

ISC
