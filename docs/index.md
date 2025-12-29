---
layout: home

hero:
  name: MathTutor
  text: AI 智能数学辅导系统
  tagline: 初中数学 1 对 1 智能辅导，授人以渔的AI私人教练
  image:
    src: /logo.png
    alt: MathTutor
    

features:
  - title: 🤖 苏格拉底式教学
    details: 通过提问引导学生主动思考，而非直接给出答案
  - title: 📚 方法论提炼
    details: 不仅教会做某道题，更要教会解决一类问题的通用方法
  - title: 🎨 可视化实验工具
    details: 动态实验工具将抽象数学概念转化为直观图形
  - title: 📊 智能结构化分解
    details: AI自动将复杂题目拆解为循序渐进的解题步骤
  - title: 🧠 个性化学习路径
    details: 基于学习数据智能推荐最适合的学习内容
  - title: 📈 科学复习规划
    details: 基于艾宾浩斯遗忘曲线，智能规划复习时机
---

## 🎯 项目定位

构建一个 **1对1 的 AI 数学私人教练**，基于 AI 技术的初中数学智能辅导系统。

### 核心设计理念

- **授人以渔**：不仅教会学生做某道题，更要教会解决一类问题的方法论
- **苏格拉底式教学**：通过提问引导思考，而非直接给出答案
- **支架式教学**：三级渐进提示系统，根据学生需要提供恰到好处的帮助
- **可视化学习**：动态实验工具将抽象概念转化为直观图形
- **个性化路径**：基于学习数据智能推荐最适合的学习内容

---

## 📊 核心功能模块

本项目包含 7 个核心功能模块，详细需求请参阅 [功能详细需求目录](/requirements/)。

### ⭐ 教学核心功能

- **[1. 知识体系展示](/requirements/01-knowledge-system.md)** - 构建层次化的知识体系导航系统
- **[2. 题库管理与结构化分解](/requirements/02-question-bank.md)** - AI 驱动的题目结构化分解
- **[3. 互动式 1 对 1 智能教学](/requirements/03-interactive-teaching.md)** - 苏格拉底式渐进式教学
- **[4. 动态实验工具系统](/requirements/04-experimental-tools.md)** - 可视化实验工具

### 🛠️ 学习辅助功能

- **[5. 学习报告生成](/requirements/05-learning-reports.md)** - 多维度学习报告
- **[6. 知识扩展](/requirements/06-knowledge-extension.md)** - 知识网络构建
- **[7. 复习模式](/requirements/07-review-mode.md)** - 科学复习规划

---

## 🏗️ 技术架构概览

### 技术栈选型

**前端技术栈**
- **框架**：Vue 3 / React
- **构建工具**：Vite
- **UI 组件库**：Element Plus / Ant Design
- **状态管理**：Pinia / Redux Toolkit
- **图表库**：ECharts / Chart.js

**后端技术栈**
- **框架**：Node.js + Express / Python + FastAPI
- **数据库**：PostgreSQL (主数据) + Redis (缓存)
- **AI 集成**：OpenAI API / Claude API

**实验工具**
- **渲染**：HTML5 Canvas / SVG
- **动画**：GSAP / Anime.js

### 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                      客户端层                            │
│  Web 前端 (Vue/React) │ 移动端 H5 │ 实验工具组件        │
└─────────────────────────────────────────────────────────┘
                            ▲
                            │ HTTP/WebSocket
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      应用服务层                          │
│  教学服务 │ 题库服务 │ AI服务 │ 知识服务 │ 实验工具服务 │
└─────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      数据层                              │
│           PostgreSQL │ Redis │ 文件存储 (OSS/S3)        │
└─────────────────────────────────────────────────────────┘
```

### 核心数据模型

系统采用层次化的四层数据模型：课程 → 模块 → 专题 → 知识点，并包含题库结构与方法论提取机制。

详细的数据模型设计请参阅 [需求清单](/REQUIREMENTS.md#核心数据模型)。

---


## 📚 快速导航

### 📘 核心规划文档

- **[需求清单](/REQUIREMENTS.md)** - 完整功能需求、数据模型、非功能性需求、成功指标
- **[业务流程图](/business-flow.md)** - 系统业务流程与模块协同关系
- **[技术架构设计](/architecture/README.md)** - 技术选型、系统架构、数据库设计、API 设计
- **[开发计划](/development/README.md)** - 开发优先级、里程碑计划、团队分工、风险管理

### 📗 功能详细需求

- **[功能详细需求目录](/requirements/)** - 7 个核心功能的完整需求文档
  - [1. 知识体系展示](/requirements/01-knowledge-system.md)
  - [2. 题库管理与结构化分解](/requirements/02-question-bank.md)
  - [3. 互动式 1 对 1 智能教学](/requirements/03-interactive-teaching.md)
  - [4. 动态实验工具系统](/requirements/04-experimental-tools.md)
  - [5. 学习报告生成](/requirements/05-learning-reports.md)
  - [6. 知识扩展](/requirements/06-knowledge-extension.md)
  - [7. 复习模式](/requirements/07-review-mode.md)

### 📕 其他文档

- **[UI/UX 设计规范](/design/README.md)** - 设计理念和组件规范
- **[知识库示例文件](https://github.com/your-repo/mathtutor/blob/main/knowledge_base/grade7_sem1_advanced_topics.json)** - 实际数据示例

---

<style>
.VPHero .image {
  max-width: 320px;
}
</style>
