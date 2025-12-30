# 知识体系展示模块 - 设计方案

## 一、系统架构概述

### 1.1 技术栈选型

**后端**
- **框架**: FastAPI (Python) - 高性能异步框架,适合构建 RESTful API
- **数据库**:
  - PostgreSQL - 存储用户学习进度、收藏、历史记录
  - Redis - 缓存热点数据,提升查询性能
- **ORM**: SQLAlchemy 2.0 - 类型安全的异步 ORM
- **数据验证**: Pydantic v2 - 请求/响应模型验证

**前端**
- **框架**: Vue 3 + TypeScript - 组合式 API,更好的类型推导
- **状态管理**: Pinia - Vue 3 官方推荐状态管理方案
- **路由**: Vue Router 4 - 支持嵌套路由和动态路由
- **UI 组件库**: 自研组件 + Headless UI - 遵循学术极简主义设计
- **动画库**: GSAP - 专业级动画库,实现流畅的交错显现效果
- **公式渲染**: KaTeX - 轻量级数学公式渲染引擎
- **构建工具**: Vite - 快速的开发体验

---

## 二、后端设计

### 2.1 数据库模型设计

#### 表结构设计

```sql
-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 知识点进度表
CREATE TABLE knowledge_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    kp_id VARCHAR(50) NOT NULL,  -- 知识点ID,如 "KP01_1"
    learning_status VARCHAR(20) DEFAULT 'not_started',  -- not_started, in_progress, mastered, need_review
    mastery_level INTEGER DEFAULT 0,  -- 0-100 掌握程度
    first_learned_at TIMESTAMP,
    last_reviewed_at TIMESTAMP,
    review_count INTEGER DEFAULT 0,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, kp_id)
);

-- 学习记录表
CREATE TABLE learning_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    kp_id VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,  -- started, completed, reviewed, etc.
    time_spent INTEGER,  -- 秒
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 知识库表 (JSON 存储)
CREATE TABLE knowledge_bases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curriculum_name VARCHAR(100) NOT NULL,
    grade VARCHAR(20) NOT NULL,  -- 七年级、八年级、九年级
    semester VARCHAR(10) NOT NULL,  -- 上册、下册
    content JSONB NOT NULL,  -- 存储完整的知识体系结构
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_knowledge_progress_user_kp ON knowledge_progress(user_id, kp_id);
CREATE INDEX idx_knowledge_progress_status ON knowledge_progress(learning_status);
CREATE INDEX idx_learning_logs_user ON learning_logs(user_id);
CREATE INDEX idx_learning_logs_kp ON learning_logs(kp_id);
CREATE INDEX idx_knowledge_bases_grade_semester ON knowledge_bases(grade, semester);
```

#### Pydantic 模型

```python
# models/schemas.py
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class LearningStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    MASTERED = "mastered"
    NEED_REVIEW = "need_review"

class KnowledgePointDTO(BaseModel):
    kp_id: str
    kp_name: str
    detail: str
    learning_status: LearningStatus = LearningStatus.NOT_STARTED
    mastery_level: int = 0
    is_favorite: bool = False
    first_learned_at: Optional[datetime] = None
    last_reviewed_at: Optional[datetime] = None
    related_questions_count: int = 0

class TopicDTO(BaseModel):
    topic_id: str
    topic_name: str
    alias: str
    knowledge_points: List[KnowledgePointDTO]
    total_kps: int
    mastered_kps: int
    in_progress_kps: int

class ModuleDTO(BaseModel):
    module_id: str
    module_name: str
    module_tag: str
    overview: str
    topics: List[TopicDTO]
    total_topics: int
    total_kps: int
    mastered_kps: int
    progress_percentage: float

class CurriculumDTO(BaseModel):
    curriculum: str
    grade: str
    semester: str
    modules: List[ModuleDTO]
    total_modules: int
    total_topics: int
    total_kps: int
    mastered_kps: int
    overall_progress: float

class SearchQuery(BaseModel):
    keyword: str = Field(..., min_length=1, max_length=50)
    grade: Optional[str] = None
    semester: Optional[str] = None
    status_filter: Optional[LearningStatus] = None

class UpdateProgressDTO(BaseModel):
    kp_id: str
    learning_status: LearningStatus
    mastery_level: int = Field(..., ge=0, le=100)
    is_favorite: Optional[bool] = None
```

### 2.2 API 接口设计

#### RESTful API 规范

```python
# api/routes/knowledge.py
from fastapi import APIRouter, Depends, Query
from typing import List, Optional

router = APIRouter(prefix="/api/knowledge", tags=["知识体系"])

# 1. 获取指定年级学期的知识体系
@router.get("/curriculum/{grade}/{semester}")
async def get_curriculum(
    grade: str,  # 七年级、八年级、九年级
    semester: str,  # 上册、下册
    user_id: str = Depends(get_current_user_id)
) -> CurriculumDTO:
    """
    获取完整的知识体系树,包含用户学习进度
    """
    pass

# 2. 搜索知识节点
@router.post("/search")
async def search_knowledge(
    query: SearchQuery,
    user_id: str = Depends(get_current_user_id)
) -> dict:
    """
    支持模糊搜索模块/专题/知识点
    返回匹配的节点及其路径
    """
    pass

# 3. 更新学习状态
@router.put("/progress")
async def update_progress(
    data: UpdateProgressDTO,
    user_id: str = Depends(get_current_user_id)
) -> KnowledgePointDTO:
    """
    更新知识点的学习状态和掌握程度
    """
    pass

# 4. 批量更新进度
@router.put("/progress/batch")
async def batch_update_progress(
    updates: List[UpdateProgressDTO],
    user_id: str = Depends(get_current_user_id)
) -> dict:
    """
    批量更新多个知识点的进度
    """
    pass

# 5. 获取知识点详情
@router.get("/point/{kp_id}")
async def get_knowledge_point(
    kp_id: str,
    user_id: str = Depends(get_current_user_id)
) -> KnowledgePointDTO:
    """
    获取单个知识点的详细信息
    """
    pass

# 6. 获取用户学习统计
@router.get("/statistics")
async def get_statistics(
    grade: Optional[str] = None,
    semester: Optional[str] = None,
    user_id: str = Depends(get_current_user_id)
) -> dict:
    """
    获取用户学习统计数据
    - 总学习时长
    - 已掌握知识点数
    - 各模块完成情况
    - 需复习的知识点
    """
    pass

# 7. 切换收藏状态
@router.put("/favorite/{kp_id}")
async def toggle_favorite(
    kp_id: str,
    user_id: str = Depends(get_current_user_id)
) -> dict:
    """
    切换知识点的收藏状态
    """
    pass

# 8. 获取收藏列表
@router.get("/favorites")
async def get_favorites(
    user_id: str = Depends(get_current_user_id)
) -> List[KnowledgePointDTO]:
    """
    获取用户收藏的所有知识点
    """
    pass

# 9. 获取推荐复习内容
@router.get("/review/recommendations")
async def get_review_recommendations(
    limit: int = Query(10, ge=1, le=50),
    user_id: str = Depends(get_current_user_id)
) -> List[KnowledgePointDTO]:
    """
    基于遗忘曲线算法推荐需要复习的知识点
    """
    pass
```

### 2.3 核心服务层设计

```python
# services/knowledge_service.py
from typing import List, Optional
from datetime import datetime, timedelta
import json

class KnowledgeService:
    """知识体系核心业务逻辑"""

    def __init__(self, db_session, redis_client):
        self.db = db_session
        self.redis = redis_client

    async def get_curriculum_with_progress(
        self,
        user_id: str,
        grade: str,
        semester: str
    ) -> CurriculumDTO:
        """
        获取知识体系并合并用户进度数据

        实现思路:
        1. 从数据库/缓存加载知识库 JSON 结构
        2. 查询用户在该课程下的所有进度记录
        3. 将进度数据合并到知识树中
        4. 计算各层级的进度统计
        """
        # 1. 加载知识库
        cache_key = f"curriculum:{grade}:{semester}"
        curriculum_data = await self.redis.get(cache_key)

        if not curriculum_data:
            # 从数据库加载
            kb = await self.db.get_knowledge_base(grade, semester)
            curriculum_data = kb.content
            # 缓存 1 小时
            await self.redis.setex(cache_key, 3600, json.dumps(curriculum_data))

        # 2. 查询用户进度
        progress_map = await self._get_user_progress_map(user_id, grade, semester)

        # 3. 合并数据
        enriched_modules = []
        for module in curriculum_data['modules']:
            enriched_module = await self._enrich_module_with_progress(
                module, progress_map
            )
            enriched_modules.append(enriched_module)

        # 4. 计算总体统计
        total_kps = sum(m['total_kps'] for m in enriched_modules)
        mastered_kps = sum(m['mastered_kps'] for m in enriched_modules)
        overall_progress = (mastered_kps / total_kps * 100) if total_kps > 0 else 0

        return CurriculumDTO(
            curriculum=curriculum_data['curriculum'],
            grade=grade,
            semester=semester,
            modules=enriched_modules,
            total_modules=len(enriched_modules),
            total_topics=sum(m['total_topics'] for m in enriched_modules),
            total_kps=total_kps,
            mastered_kps=mastered_kps,
            overall_progress=round(overall_progress, 1)
        )

    async def search_knowledge_nodes(
        self,
        user_id: str,
        keyword: str,
        filters: dict
    ) -> List[dict]:
        """
        搜索功能实现

        搜索策略:
        1. 知识点名称/详情模糊匹配
        2. 专题名称/别名匹配
        3. 模块名称/标签匹配
        4. 返回匹配节点及其完整路径(用于面包屑导航)
        """
        results = []

        # 构建搜索查询 (PostgreSQL 全文搜索)
        query = """
            SELECT
                kp_id, kp_name, detail,
                module_id, module_name,
                topic_id, topic_name,
                ts_rank(textvector, query) as rank
            FROM knowledge_bases
            CROSS JOIN to_tsquery(:query) query
            WHERE textvector @@ query
            ORDER BY rank DESC
            LIMIT 20
        """

        # 执行搜索并构建结果树
        # ...

        return results

    async def calculate_review_priority(
        self,
        user_id: str
    ) -> List[KnowledgePointDTO]:
        """
        基于遗忘曲线计算复习优先级

        算法:
        1. 获取已学习知识点列表
        2. 计算距离上次复习时间
        3. 结合复习次数应用艾宾浩斯遗忘曲线
        4. 返回需要复习的知识点(按紧急程度排序)

        遗忘曲线参考:
        - 第1次复习: 20分钟后
        - 第2次复习: 1小时后
        - 第3次复习: 9小时后
        - 第4次复习: 1天后
        - 第5次复习: 2天后
        - 第6次复习: 6天后
        - 第7次复习: 31天后
        """
        review_schedule = {
            0: timedelta(minutes=20),
            1: timedelta(hours=1),
            2: timedelta(hours=9),
            3: timedelta(days=1),
            4: timedelta(days=2),
            5: timedelta(days=6),
            6: timedelta(days=31)
        }

        # 查询已学习知识点
        learned_kps = await self.db.get_learned_knowledge_points(user_id)

        need_review = []
        now = datetime.utcnow()

        for kp in learned_kps:
            last_review = kp['last_reviewed_at']
            review_count = kp['review_count']

            if review_count < 7:
                next_review_time = last_review + review_schedule[review_count]
                if now >= next_review_time:
                    # 计算紧急程度 (超时时间)
                    urgency = (now - next_review_time).total_seconds()
                    need_review.append({
                        **kp,
                        'urgency': urgency
                    })

        # 按紧急程度排序
        need_review.sort(key=lambda x: x['urgency'], reverse=True)

        return need_review[:20]

    async def _get_user_progress_map(
        self,
        user_id: str,
        grade: str,
        semester: str
    ) -> dict:
        """构建用户进度快照 {kp_id: progress_data}"""
        progress_records = await self.db.execute(
            """
            SELECT kp_id, learning_status, mastery_level,
                   is_favorite, first_learned_at, last_reviewed_at
            FROM knowledge_progress
            WHERE user_id = :user_id
            """
            , {"user_id": user_id}
        )

        return {record['kp_id']: record for record in progress_records}

    async def _enrich_module_with_progress(
        self,
        module: dict,
        progress_map: dict
    ) -> dict:
        """为模块及其子节点注入进度数据"""
        enriched_topics = []

        for topic in module['topics']:
            enriched_kps = []
            mastered_count = 0
            in_progress_count = 0

            for kp in topic['knowledge_points']:
                kp_id = kp['kp_id']
                progress = progress_map.get(kp_id, {
                    'learning_status': 'not_started',
                    'mastery_level': 0,
                    'is_favorite': False,
                    'first_learned_at': None,
                    'last_reviewed_at': None
                })

                enriched_kp = {**kp, **progress}
                enriched_kps.append(enriched_kp)

                if progress['learning_status'] == 'mastered':
                    mastered_count += 1
                elif progress['learning_status'] == 'in_progress':
                    in_progress_count += 1

            enriched_topics.append({
                **topic,
                'knowledge_points': enriched_kps,
                'total_kps': len(enriched_kps),
                'mastered_kps': mastered_count,
                'in_progress_kps': in_progress_count
            })

        total_kps = sum(t['total_kps'] for t in enriched_topics)
        mastered_kps = sum(t['mastered_kps'] for t in enriched_topics)
        progress = (mastered_kps / total_kps * 100) if total_kps > 0 else 0

        return {
            **module,
            'topics': enriched_topics,
            'total_topics': len(enriched_topics),
            'total_kps': total_kps,
            'mastered_kps': mastered_kps,
            'progress_percentage': round(progress, 1)
        }
```

### 2.4 性能优化策略

1. **Redis 缓存层级**
   - L1: 知识库结构缓存 (1小时)
   - L2: 用户进度缓存 (5分钟)
   - L3: 热门知识点详情缓存 (30分钟)

2. **数据库优化**
   - JSONB 索引支持知识库内容搜索
   - 复合索引优化进度查询
   - 读写分离 (主库写,从库读)

3. **异步任务队列**
   - 使用 Celery 处理批量进度更新
   - 异步记录学习日志,不阻塞主流程

---

## 三、前端设计

### 3.1 组件架构设计

```
src/
├── views/
│   └── KnowledgeSystem.vue          # 主视图
├── components/
│   ├── knowledge/
│   │   ├── GradeSelector.vue        # 年级选择器
│   │   ├── ModuleCard.vue           # 模块卡片
│   │   ├── TopicList.vue            # 专题列表
│   │   ├── KnowledgePointItem.vue   # 知识点条目
│   │   ├── ProgressBar.vue          # 进度条
│   │   ├── CircularProgress.vue     # 环形进度
│   │   ├── SearchBar.vue            # 搜索框
│   │   ├── BreadcrumbNav.vue        # 面包屑导航
│   │   ├── DirectoryTree.vue        # 目录树(桌面端)
│   │   ├── StatusBadge.vue          # 状态标记
│   │   └── FavoriteButton.vue       # 收藏按钮
│   └── common/
│       ├── LoadingSpinner.vue
│       └── EmptyState.vue
├── stores/
│   └── knowledgeStore.ts            # Pinia Store
├── services/
│   └── knowledgeApi.ts              # API 封装
├── types/
│   └── knowledge.ts                 # TypeScript 类型定义
├── utils/
│   └── animations.ts                # GSAP 动画配置
└── composables/
    ├── useKnowledgeTree.ts          # 知识树操作
    ├── useSearch.ts                 # 搜索功能
    └── useResponsive.ts             # 响应式适配
```

### 3.2 核心组件实现

#### 3.2.1 主视图 - KnowledgeSystem.vue

```vue
<template>
  <div class="knowledge-system">
    <!-- 背景网格纹理 -->
    <div class="grid-background" />

    <!-- 顶部导航栏 -->
    <header class="system-header">
      <div class="header-content">
        <h1 class="title">知识体系</h1>

        <!-- 年级选择器 -->
        <GradeSelector
          v-model="currentGrade"
          v-model:semester="currentSemester"
          @change="handleGradeChange"
        />

        <!-- 全局搜索 -->
        <SearchBar
          v-model="searchQuery"
          @search="handleSearch"
          placeholder="搜索模块/专题/知识点..."
        />
      </div>

      <!-- 全局进度环形图 -->
      <div class="overall-progress">
        <CircularProgress
          :progress="curriculumData?.overall_progress || 0"
          :label="`${curriculumData?.mastered_kps || 0}/${curriculumData?.total_kps || 0}`"
          size="large"
        />
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="system-content">
      <!-- 左侧目录树 (仅桌面端) -->
      <aside v-if="!isMobile" class="directory-panel">
        <DirectoryTree
          :modules="curriculumData?.modules || []"
          :active-path="activePath"
          @navigate="handleNavigate"
        />
      </aside>

      <!-- 右侧知识卡片流 -->
      <section class="knowledge-stream">
        <!-- 面包屑导航 -->
        <BreadcrumbNav
          :path="breadcrumbPath"
          @navigate="handleNavigate"
        />

        <!-- 模块卡片列表 -->
        <div class="modules-grid">
          <ModuleCard
            v-for="module in filteredModules"
            :key="module.module_id"
            :module="module"
            :expanded="expandedModules.has(module.module_id)"
            @toggle="toggleModuleExpand"
            @navigate="handleNavigate"
          />
        </div>

        <!-- 空状态 -->
        <EmptyState
          v-if="filteredModules.length === 0"
          message="未找到相关知识内容"
        />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useKnowledgeStore } from '@/stores/knowledgeStore'
import { useResponsive } from '@/composables/useResponsive'
import { gsap } from 'gsap'

// 组件导入
import GradeSelector from '@/components/knowledge/GradeSelector.vue'
import SearchBar from '@/components/knowledge/SearchBar.vue'
import CircularProgress from '@/components/knowledge/CircularProgress.vue'
import DirectoryTree from '@/components/knowledge/DirectoryTree.vue'
import BreadcrumbNav from '@/components/knowledge/BreadcrumbNav.vue'
import ModuleCard from '@/components/knowledge/ModuleCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'

// 响应式状态
const { isMobile, isTablet, isDesktop } = useResponsive()

// Store
const knowledgeStore = useKnowledgeStore()
const {
  currentGrade,
  currentSemester,
  curriculumData,
  searchQuery,
  expandedModules,
  activePath
} = storeToRefs(knowledgeStore)

// 计算属性
const filteredModules = computed(() => {
  if (!searchQuery.value) return curriculumData.value?.modules || []
  return knowledgeStore.filterModules(searchQuery.value)
})

const breadcrumbPath = computed(() => {
  return knowledgeStore.buildBreadcrumb(activePath.value)
})

// 方法
const handleGradeChange = async () => {
  await knowledgeStore.loadCurriculum()
  animateTransition()
}

const handleSearch = (query: string) => {
  searchQuery.value = query
}

const handleNavigate = (path: string[]) => {
  activePath.value = path
}

const toggleModuleExpand = (moduleId: string) => {
  knowledgeStore.toggleModule(moduleId)
}

// GSAP 动画
const animateTransition = () => {
  gsap.fromTo('.modules-grid',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
  )
}

// 生命周期
onMounted(async () => {
  await knowledgeStore.loadCurriculum()
  animateTransition()
})
</script>

<style scoped lang="scss">
.knowledge-system {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  position: relative;

  // 网格纹理背景
  .grid-background {
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(26, 86, 219, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(26, 86, 219, 0.03) 1px, transparent 1px);
    background-size: 20px 20px;
    pointer-events: none;
    z-index: 0;
  }
}

.system-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(26, 86, 219, 0.1);
  padding: 1.5rem 2rem;

  .header-content {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin-bottom: 1rem;

    .title {
      font-size: 2rem;
      font-weight: 700;
      color: #1A56DB;
      margin: 0;
    }
  }

  .overall-progress {
    display: flex;
    justify-content: center;
  }
}

.system-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  padding: 2rem;
  position: relative;
  z-index: 1;

  .directory-panel {
    position: sticky;
    top: 200px;
    height: fit-content;
    max-height: calc(100vh - 250px);
    overflow-y: auto;
  }

  .knowledge-stream {
    min-width: 0; // 防止 Grid 溢出
  }
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

// 响应式适配
@media (max-width: 1024px) {
  .system-content {
    grid-template-columns: 1fr;
  }

  .modules-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 640px) {
  .system-header {
    padding: 1rem;

    .header-content {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }
  }

  .system-content {
    padding: 1rem;
  }

  .modules-grid {
    grid-template-columns: 1fr;
  }
}
</style>
```

#### 3.2.2 模块卡片组件 - ModuleCard.vue

```vue
<template>
  <div
    class="module-card"
    :class="{
      'expanded': isExpanded,
      'high-progress': module.progress_percentage >= 80,
      'low-progress': module.progress_percentage < 30
    }"
  >
    <!-- 卡片头部 -->
    <div class="card-header" @click="$emit('toggle', module.module_id)">
      <div class="header-main">
        <h3 class="module-name">{{ module.module_name }}</h3>
        <span class="module-tag">{{ module.module_tag }}</span>
      </div>

      <div class="header-meta">
        <p class="module-overview">{{ module.overview }}</p>
        <div class="stats">
          <span class="topic-count">{{ module.total_topics }} 个专题</span>
          <span class="kp-count">{{ module.total_kps }} 个知识点</span>
        </div>
      </div>

      <!-- 进度条 -->
      <div class="progress-container">
        <ProgressBar
          :progress="module.progress_percentage"
          :color="progressColor"
          :animated="true"
        />
        <span class="progress-label">{{ module.progress_percentage }}%</span>
      </div>

      <!-- 展开指示器 -->
      <div class="expand-icon">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          :style="{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }"
        >
          <path
            d="M5 7l5 5 5-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          />
        </svg>
      </div>
    </div>

    <!-- 专题列表 (展开时显示) -->
    <Transition name="accordion">
      <div v-if="isExpanded" class="topics-list">
        <TopicList
          :topics="module.topics"
          @navigate="(path) => $emit('navigate', path)"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ModuleDTO } from '@/types/knowledge'
import ProgressBar from './ProgressBar.vue'
import TopicList from './TopicList.vue'

interface Props {
  module: ModuleDTO
  expanded: boolean
}

const props = defineProps<Props>()

defineEmits<{
  toggle: [moduleId: string]
  navigate: [path: string[]]
}>()

const isExpanded = computed(() => props.expanded)

const progressColor = computed(() => {
  const p = props.module.progress_percentage
  if (p >= 80) return '#10B981' // 绿色
  if (p >= 50) return '#3B82F6' // 蓝色
  if (p >= 30) return '#F59E0B' // 橙色
  return '#9CA3AF' // 灰色
})
</script>

<style scoped lang="scss">
.module-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(26, 86, 219, 0.08);
  overflow: hidden;
  transition: all 0.3s ease-out;
  border: 2px solid transparent;

  &:hover {
    box-shadow: 0 8px 24px rgba(26, 86, 219, 0.12);
    transform: translateY(-2px);
  }

  &.expanded {
    border-color: #1A56DB;
  }

  &.high-progress {
    border-left: 4px solid #10B981;
  }

  &.low-progress {
    border-left: 4px solid #F59E0B;
  }
}

.card-header {
  padding: 1.5rem;
  cursor: pointer;
  position: relative;

  .header-main {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;

    .module-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1F2937;
      margin: 0;
      line-height: 1.4;
    }

    .module-tag {
      padding: 0.25rem 0.75rem;
      background: linear-gradient(135deg, #1A56DB 0%, #3B82F6 100%);
      color: white;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
      white-space: nowrap;
    }
  }

  .header-meta {
    margin-bottom: 1rem;

    .module-overview {
      color: #6B7280;
      font-size: 0.875rem;
      line-height: 1.6;
      margin: 0 0 0.5rem 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .stats {
      display: flex;
      gap: 1rem;
      font-size: 0.75rem;
      color: #9CA3AF;
    }
  }

  .progress-container {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .progress-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #1A56DB;
      min-width: 45px;
      text-align: right;
    }
  }

  .expand-icon {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    color: #9CA3AF;
    transition: transform 0.3s ease-out;
  }
}

.topics-list {
  border-top: 1px solid #E5E7EB;
  background: #F9FAFB;
}

// 手风琴动画
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.3s ease-out;
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}

.accordion-enter-to,
.accordion-leave-from {
  max-height: 500px;
  opacity: 1;
}
</style>
```

#### 3.2.3 知识点条目 - KnowledgePointItem.vue

```vue
<template>
  <div
    class="kp-item"
    :class="[`status-${kp.learning_status}`, { 'favorite': kp.is_favorite }]"
    @click="$emit('navigate', [kp.kp_id])"
  >
    <!-- 状态图标 -->
    <div class="status-icon">
      <svg v-if="kp.learning_status === 'mastered'" viewBox="0 0 20 20">
        <path fill="#10B981" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
      </svg>
      <svg v-else-if="kp.learning_status === 'in_progress'" viewBox="0 0 20 20">
        <path fill="#3B82F6" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
      </svg>
      <svg v-else viewBox="0 0 20 20">
        <path fill="#9CA3AF" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-14a6 6 0 110 12 6 6 0 010-12z"/>
      </svg>
    </div>

    <!-- 内容 -->
    <div class="kp-content">
      <div class="kp-header">
        <h4 class="kp-name">
          <span class="kp-id">{{ kp.kp_id }}</span>
          {{ kp.kp_name }}
        </h4>

        <FavoriteButton
          :active="kp.is_favorite"
          @toggle="$emit('toggle-favorite', kp.kp_id)"
          @click.stop
        />
      </div>

      <p class="kp-detail">{{ kp.detail }}</p>

      <div class="kp-meta">
        <span v-if="kp.related_questions_count > 0" class="meta-item">
          链接 {{ kp.related_questions_count }} 道题目
        </span>

        <span v-if="kp.learning_status !== 'not_started'" class="meta-item">
          掌握度: {{ kp.mastery_level }}%
        </span>

        <span v-if="kp.last_reviewed_at" class="meta-item">
          复习于 {{ formatDate(kp.last_reviewed_at) }}
        </span>
      </div>

      <!-- 学习进度条 (进行中) -->
      <div v-if="kp.learning_status === 'in_progress'" class="mastery-bar">
        <div
          class="mastery-fill"
          :style="{ width: `${kp.mastery_level}%` }"
        />
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="kp-actions">
      <button
        v-if="kp.learning_status === 'not_started'"
        class="btn-start"
        @click.stop="$emit('start-learning', kp)"
      >
        开始学习
      </button>

      <button
        v-else
        class="btn-continue"
        @click.stop="$emit('continue-learning', kp)"
      >
        {{ kp.learning_status === 'mastered' ? '复习' : '继续' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { KnowledgePointDTO } from '@/types/knowledge'
import FavoriteButton from './FavoriteButton.vue'

interface Props {
  kp: KnowledgePointDTO
}

defineProps<Props>()

defineEmits<{
  navigate: [path: string[]]
  'toggle-favorite': [kpId: string]
  'start-learning': [kp: KnowledgePointDTO]
  'continue-learning': [kp: KnowledgePointDTO]
}>()

const formatDate = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString()
}
</script>

<style scoped lang="scss">
.kp-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border-left: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #F3F4F6;
  }

  &.status-mastered {
    border-left-color: #10B981;

    .kp-name {
      color: #065F46;
    }
  }

  &.status-in_progress {
    border-left-color: #3B82F6;

    .kp-name {
      color: #1E40AF;
    }
  }

  &.status-need_review {
    border-left-color: #F59E0B;

    .kp-name {
      color: #92400E;
    }
  }

  &.favorite {
    background: linear-gradient(to right, rgba(245, 158, 11, 0.05), transparent);
  }
}

.status-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;

  svg {
    width: 100%;
    height: 100%;
  }
}

.kp-content {
  flex: 1;
  min-width: 0;

  .kp-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;

    .kp-name {
      font-size: 0.9375rem;
      font-weight: 600;
      color: #1F2937;
      margin: 0;
      line-height: 1.4;

      .kp-id {
        font-family: 'Courier New', monospace;
        font-size: 0.75rem;
        color: #6B7280;
        margin-right: 0.5rem;
      }
    }
  }

  .kp-detail {
    font-size: 0.875rem;
    color: #4B5563;
    line-height: 1.6;
    margin: 0 0 0.75rem 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .kp-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    font-size: 0.75rem;
    color: #9CA3AF;

    .meta-item {
      &:before {
        content: '•';
        margin-right: 0.25rem;
      }

      &:first-child:before {
        display: none;
      }
    }
  }

  .mastery-bar {
    height: 4px;
    background: #E5E7EB;
    border-radius: 2px;
    margin-top: 0.75rem;
    overflow: hidden;

    .mastery-fill {
      height: 100%;
      background: linear-gradient(90deg, #3B82F6 0%, #1A56DB 100%);
      transition: width 0.5s ease-out;
    }
  }
}

.kp-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;

  button {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    &.btn-start {
      background: #1A56DB;
      color: white;
      border: none;

      &:hover {
        background: #1E40AF;
      }
    }

    &.btn-continue {
      background: white;
      color: #1A56DB;
      border: 1px solid #1A56DB;

      &:hover {
        background: #EFF6FF;
      }
    }
  }
}
</style>
```

### 3.3 Pinia Store 设计

```typescript
// stores/knowledgeStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as knowledgeApi from '@/services/knowledgeApi'
import type {
  CurriculumDTO,
  ModuleDTO,
  TopicDTO,
  KnowledgePointDTO
} from '@/types/knowledge'

export const useKnowledgeStore = defineStore('knowledge', () => {
  // 状态
  const currentGrade = ref('七年级')
  const currentSemester = ref('上册')
  const curriculumData = ref<CurriculumDTO | null>(null)
  const searchQuery = ref('')
  const expandedModules = ref<Set<string>>(new Set())
  const activePath = ref<string[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 缓存
  const curriculumCache = ref<Map<string, CurriculumDTO>>(new Map())

  // 计算属性
  const allKnowledgePoints = computed(() => {
    if (!curriculumData.value) return []
    const kps: KnowledgePointDTO[] = []
    curriculumData.value.modules.forEach(module => {
      module.topics.forEach(topic => {
        kps.push(...topic.knowledge_points)
      })
    })
    return kps
  })

  const masteredCount = computed(() => {
    return allKnowledgePoints.value.filter(
      kp => kp.learning_status === 'mastered'
    ).length
  })

  const inProgressCount = computed(() => {
    return allKnowledgePoints.value.filter(
      kp => kp.learning_status === 'in_progress'
    ).length
  })

  const needReviewCount = computed(() => {
    return allKnowledgePoints.value.filter(
      kp => kp.learning_status === 'need_review'
    ).length
  })

  // Actions
  async function loadCurriculum() {
    const cacheKey = `${currentGrade.value}_${currentSemester.value}`

    // 检查缓存
    if (curriculumCache.value.has(cacheKey)) {
      curriculumData.value = curriculumCache.value.get(cacheKey)!
      return
    }

    loading.value = true
    error.value = null

    try {
      const data = await knowledgeApi.getCurriculum(
        currentGrade.value,
        currentSemester.value
      )
      curriculumData.value = data
      curriculumCache.value.set(cacheKey, data)
    } catch (e) {
      error.value = '加载知识体系失败'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function updateProgress(
    kpId: string,
    status: LearningStatus,
    masteryLevel: number
  ) {
    try {
      const updated = await knowledgeApi.updateProgress({
        kp_id: kpId,
        learning_status: status,
        mastery_level: masteryLevel
      })

      // 更新本地状态
      updateLocalKnowledgePoint(kpId, updated)

      // 重新计算进度
      recalculateProgress()
    } catch (e) {
      console.error('更新进度失败:', e)
      throw e
    }
  }

  async function toggleFavorite(kpId: string) {
    try {
      const result = await knowledgeApi.toggleFavorite(kpId)

      updateLocalKnowledgePoint(kpId, {
        is_favorite: result.is_favorite
      })
    } catch (e) {
      console.error('切换收藏失败:', e)
      throw e
    }
  }

  async function searchKnowledge(keyword: string) {
    try {
      const results = await knowledgeApi.searchKnowledge({
        keyword,
        grade: currentGrade.value,
        semester: currentSemester.value
      })
      return results
    } catch (e) {
      console.error('搜索失败:', e)
      throw e
    }
  }

  function filterModules(query: string): ModuleDTO[] {
    if (!curriculumData.value) return []

    const lowerQuery = query.toLowerCase()

    return curriculumData.value.modules.filter(module => {
      // 模块名称匹配
      if (module.module_name.toLowerCase().includes(lowerQuery)) {
        return true
      }

      // 专题或知识点匹配
      return module.topics.some(topic =>
        topic.topic_name.toLowerCase().includes(lowerQuery) ||
        topic.knowledge_points.some(kp =>
          kp.kp_name.toLowerCase().includes(lowerQuery) ||
          kp.detail.toLowerCase().includes(lowerQuery)
        )
      )
    })
  }

  function toggleModule(moduleId: string) {
    if (expandedModules.value.has(moduleId)) {
      expandedModules.value.delete(moduleId)
    } else {
      expandedModules.value.add(moduleId)
    }
  }

  function expandAllModules() {
    if (!curriculumData.value) return
    curriculumData.value.modules.forEach(module => {
      expandedModules.value.add(module.module_id)
    })
  }

  function collapseAllModules() {
    expandedModules.value.clear()
  }

  function buildBreadcrumb(path: string[]): Array<{label: string, path: string[]}> {
    // 根据路径构建面包屑
    const breadcrumb = [
      { label: curriculumData.value?.curriculum || '知识体系', path: [] }
    ]

    if (path.length >= 1) {
      const module = curriculumData.value?.modules.find(m => m.module_id === path[0])
      if (module) {
        breadcrumb.push({ label: module.module_name, path: [module.module_id] })
      }
    }

    if (path.length >= 2) {
      const module = curriculumData.value?.modules.find(m => m.module_id === path[0])
      const topic = module?.topics.find(t => t.topic_id === path[1])
      if (topic) {
        breadcrumb.push({
          label: topic.topic_name,
          path: [module!.module_id, topic.topic_id]
        })
      }
    }

    return breadcrumb
  }

  // 内部辅助方法
  function updateLocalKnowledgePoint(
    kpId: string,
    updates: Partial<KnowledgePointDTO>
  ) {
    if (!curriculumData.value) return

    curriculumData.value.modules.forEach(module => {
      module.topics.forEach(topic => {
        const kp = topic.knowledge_points.find(k => k.kp_id === kpId)
        if (kp) {
          Object.assign(kp, updates)
        }
      })
    })
  }

  function recalculateProgress() {
    if (!curriculumData.value) return

    // 重新计算各层级进度
    curriculumData.value.modules.forEach(module => {
      let moduleMastered = 0
      let moduleTotal = 0

      module.topics.forEach(topic => {
        const mastered = topic.knowledge_points.filter(
          kp => kp.learning_status === 'mastered'
        ).length

        moduleMastered += mastered
        moduleTotal += topic.knowledge_points.length

        topic.mastered_kps = mastered
      })

      module.mastered_kps = moduleMastered
      module.progress_percentage = moduleTotal > 0
        ? Math.round((moduleMastered / moduleTotal) * 100)
        : 0
    })

    // 重新计算总体进度
    const totalMastered = curriculumData.value.modules.reduce(
      (sum, m) => sum + m.mastered_kps,
      0
    )
    const totalKps = curriculumData.value.modules.reduce(
      (sum, m) => sum + m.total_kps,
      0
    )

    curriculumData.value.mastered_kps = totalMastered
    curriculumData.value.overall_progress = totalKps > 0
      ? Math.round((totalMastered / totalKps) * 100)
      : 0
  }

  return {
    // 状态
    currentGrade,
    currentSemester,
    curriculumData,
    searchQuery,
    expandedModules,
    activePath,
    loading,
    error,

    // 计算属性
    allKnowledgePoints,
    masteredCount,
    inProgressCount,
    needReviewCount,

    // Actions
    loadCurriculum,
    updateProgress,
    toggleFavorite,
    searchKnowledge,
    filterModules,
    toggleModule,
    expandAllModules,
    collapseAllModules,
    buildBreadcrumb
  }
})
```

### 3.4 TypeScript 类型定义

```typescript
// types/knowledge.ts
export enum LearningStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  MASTERED = 'mastered',
  NEED_REVIEW = 'need_review'
}

export interface KnowledgePointDTO {
  kp_id: string
  kp_name: string
  detail: string
  learning_status: LearningStatus
  mastery_level: number
  is_favorite: boolean
  first_learned_at?: Date
  last_reviewed_at?: Date
  related_questions_count: number
}

export interface TopicDTO {
  topic_id: string
  topic_name: string
  alias: string
  knowledge_points: KnowledgePointDTO[]
  total_kps: number
  mastered_kps: number
  in_progress_kps: number
}

export interface ModuleDTO {
  module_id: string
  module_name: string
  module_tag: string
  overview: string
  topics: TopicDTO[]
  total_topics: number
  total_kps: number
  mastered_kps: number
  progress_percentage: number
}

export interface CurriculumDTO {
  curriculum: string
  grade: string
  semester: string
  modules: ModuleDTO[]
  total_modules: number
  total_topics: number
  total_kps: number
  mastered_kps: number
  overall_progress: number
}

export interface SearchQuery {
  keyword: string
  grade?: string
  semester?: string
  status_filter?: LearningStatus
}

export interface SearchResult {
  type: 'module' | 'topic' | 'knowledge_point'
  data: ModuleDTO | TopicDTO | KnowledgePointDTO
  path: string[]
  relevance_score: number
}
```

---

## 四、动画设计 (GSAP)

```typescript
// utils/animations.ts
import { gsap } from 'gsap'

export const knowledgeAnimations = {
  // 模块卡片交错显现
  staggerModules: (selector: string, delay: number = 0.1) => {
    gsap.fromTo(selector,
      {
        opacity: 0,
        y: 40,
        scale: 0.95
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: delay,
        ease: 'power2.out'
      }
    )
  },

  // 手风琴展开动画
  expandAccordion: (element: HTMLElement) => {
    gsap.fromTo(element,
      { height: 0, opacity: 0 },
      {
        height: 'auto',
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out'
      }
    )
  },

  // 进度条动画
  animateProgress: (selector: string, targetProgress: number) => {
    gsap.to(selector, {
      width: `${targetProgress}%`,
      duration: 1,
      ease: 'power2.out',
      onUpdate: function() {
        // 更新百分比数字
        const progress = Math.round(this.progress()[0] * targetProgress)
        document.querySelector('.progress-label')!.textContent = `${progress}%`
      }
    })
  },

  // 页面切换过渡
  pageTransition: async (callback: () => void) => {
    const tl = gsap.timeline()

    await tl.to('.main-content', {
      opacity: 0,
      y: -20,
      duration: 0.3,
      ease: 'power2.in'
    })

    callback()

    await tl.to('.main-content', {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: 'power2.out'
    })
  },

  // 状态变化动画
  statusChange: (element: HTMLElement, newStatus: string) => {
    const colors = {
      mastered: '#10B981',
      in_progress: '#3B82F6',
      not_started: '#9CA3AF',
      need_review: '#F59E0B'
    }

    gsap.to(element, {
      backgroundColor: colors[newStatus],
      duration: 0.3,
      ease: 'power2.out'
    })
  },

  // 收藏动画
  favoriteToggle: (element: HTMLElement) => {
    gsap.fromTo(element,
      { scale: 0.5, rotation: -180 },
      {
        scale: 1,
        rotation: 0,
        duration: 0.4,
        ease: 'elastic.out(1, 0.5)'
      }
    )
  }
}
```

---

## 五、API 服务封装

```typescript
// services/knowledgeApi.ts
import axios from 'axios'
import type {
  CurriculumDTO,
  KnowledgePointDTO,
  SearchQuery,
  SearchResult,
  UpdateProgressDTO
} from '@/types/knowledge'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000
})

// 请求拦截器 - 添加认证 token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期,跳转登录
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export async function getCurriculum(
  grade: string,
  semester: string
): Promise<CurriculumDTO> {
  return apiClient.get(`/api/knowledge/curriculum/${grade}/${semester}`)
}

export async function getKnowledgePoint(
  kpId: string
): Promise<KnowledgePointDTO> {
  return apiClient.get(`/api/knowledge/point/${kpId}`)
}

export async function searchKnowledge(
  query: SearchQuery
): Promise<SearchResult[]> {
  return apiClient.post('/api/knowledge/search', query)
}

export async function updateProgress(
  data: UpdateProgressDTO
): Promise<KnowledgePointDTO> {
  return apiClient.put('/api/knowledge/progress', data)
}

export async function batchUpdateProgress(
  updates: UpdateProgressDTO[]
): Promise<{ updated: number; failed: number }> {
  return apiClient.put('/api/knowledge/progress/batch', updates)
}

export async function toggleFavorite(
  kpId: string
): Promise<{ is_favorite: boolean }> {
  return apiClient.put(`/api/knowledge/favorite/${kpId}`)
}

export async function getFavorites(): Promise<KnowledgePointDTO[]> {
  return apiClient.get('/api/knowledge/favorites')
}

export async function getStatistics(
  grade?: string,
  semester?: string
): Promise<any> {
  const params = new URLSearchParams()
  if (grade) params.append('grade', grade)
  if (semester) params.append('semester', semester)
  return apiClient.get(`/api/knowledge/statistics?${params}`)
}

export async function getReviewRecommendations(
  limit: number = 10
): Promise<KnowledgePointDTO[]> {
  return apiClient.get(`/api/knowledge/review/recommendations?limit=${limit}`)
}
```

---

## 六、实施计划

### 阶段一: 基础架构搭建 (1-2周)
- [ ] 初始化 FastAPI 项目,配置数据库连接
- [ ] 设计并创建数据库表结构
- [ ] 实现基础的 CRUD 操作
- [ ] 初始化 Vue 3 + Vite 项目
- [ ] 配置 Tailwind CSS 和开发环境

### 阶段二: 后端核心功能 (2-3周)
- [ ] 实现知识体系数据加载 API
- [ ] 实现用户进度管理 API
- [ ] 实现搜索功能
- [ ] 实现复习推荐算法
- [ ] 编写单元测试

### 阶段三: 前端核心组件 (2-3周)
- [ ] 实现年级选择器组件
- [ ] 实现模块卡片和专题列表
- [ ] 实现知识点条目组件
- [ ] 实现进度可视化组件
- [ ] 集成 GSAP 动画

### 阶段四: 高级功能和优化 (1-2周)
- [ ] 实现响应式适配
- [ ] 实现 Redis 缓存
- [ ] 性能优化 (虚拟滚动、懒加载)
- [ ] 实现离线缓存 (Service Worker)

### 阶段五: 测试和部署 (1周)
- [ ] 端到端测试
- [ ] 性能测试
- [ ] 用户验收测试
- [ ] 部署到生产环境

---

## 七、技术亮点

1. **学术极简主义设计**: 采用微妙的网格纹理背景,深邃的数学蓝配色,符合教育产品定位

2. **流畅动画体验**: 使用 GSAP 实现卡片交错显现、手风琴展开、进度条动画等,提升用户体验

3. **智能复习算法**: 基于艾宾浩斯遗忘曲线,智能推荐需要复习的知识点

4. **高性能优化**:
   - Redis 多级缓存
   - 虚拟滚动处理大量知识点
   - 异步数据加载

5. **类型安全**: 全栈 TypeScript + Pydantic,确保数据类型一致性

6. **响应式设计**: 完美适配移动端、平板、桌面端三种场景

---

## 八、后续扩展方向

1. **知识图谱可视化**: 使用 D3.js 或 Cytoscape.js 展示知识点之间的关联关系

2. **AI 智能推荐**: 基于用户学习数据,推荐个性化学习路径

3. **社区功能**: 允许用户分享学习笔记和解题技巧

4. **多模态学习**: 集成视频教程、互动模拟等富媒体内容

5. **学习数据看板**: 为家长和教师提供学生学习情况的可视化报表

---

**设计文档版本**: v1.0
**最后更新**: 2025-12-30
**设计师**: Claude (Anthropic)
