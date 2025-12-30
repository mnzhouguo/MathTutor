# MathTutor 项目

## 项目概述
MathTutor 是一个数学辅导应用程序，旨在帮助学生学习数学概念和解决问题。

## 技术栈
<!-- 请根据实际使用的技术栈填写 -->
- 语言: [例如: Python]
- 框架: [例如: React]
- 数据库: [例如: SQLite]
- 其他工具: [列出其他重要依赖]

## 项目结构
```
MathTutor/
├── knowledge_base/   # 知识库目录
│   ├── grade7_sem1_advanced_topics.json  # 七年级上册压轴题知识体系
├── src/              # 源代码目录
├── tests/            # 测试文件
├── docs/             # 文档
├── assets/           # 静态资源
├── CLAUDE.md         # Claude AI 项目说明文档
└── README.md         # 项目说明
```

## 知识库结构说明

### 数据模型
知识库采用分层结构组织，包含以下层级：

1. **课程（curriculum）**：如"初中数学七年级上册压轴题体系"
2. **模块（module）**：按知识领域划分的大模块
   - `module_id`: 模块唯一标识
   - `module_name`: 模块名称
   - `module_tag`: 模块标签（如"代数思维篇"）
   - `overview`: 模块概述
   - `topics`: 包含的主题列表

3. **主题（topic）**：具体知识点专题
   - `topic_id`: 主题唯一标识
   - `topic_name`: 主题名称
   - `alias`: 别名（如"专题1"）
   - `knowledge_points`: 包含的知识点列表

4. **知识点（knowledge_point）**：最小的知识单元
   - `kp_id`: 知识点唯一标识
   - `kp_name`: 知识点名称
   - `detail`: 详细说明
#
## 开发指南

### 代码规范
- 遵循项目所使用语言的最佳实践
- 保持代码简洁、可读
- 添加必要的注释说明复杂逻辑

### 提交规范
- 提交前确保代码通过测试
- 提交信息清晰描述修改内容
- 遵循项目的版本控制规范

## 需求清单

详细需求文档请参阅：[REQUIREMENTS.md](REQUIREMENTS.md)

## 前端设计要求

Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.

- Production-grade and functional

Visually striking and memorable

Cohesive with a clear aesthetic point-of-view

Meticulously refined in every detail

Role: 你现在是一名顶级前端创意工程师，精通 React 18、Tailwind CSS 和 Konva.js。Project Context: 我们正在开发 MathTutor，一个初中数学 1 对 1 智能私人教练系统。它不仅仅是一个题库，而是一个通过“引导式提问”和“动态可视化”来授人以渔的教育产品。Design Philosophy (Crucial): 请严格遵循 Anthropic 的 Frontend Design 准则：审美定位： 采用“学术极简主义”。背景使用微妙的网格纹理（模拟数学坐标纸），主色调使用深邃的“数学蓝”(#1A56DB) 配合高对比度的强调色。动态深度： 拒绝生硬切换。利用 GSAP 或 Framer Motion 实现“交错显现”效果。特别是当 AI 拆解复杂题目时，步骤应像流水一样平滑滑入。字体与层级： 引入高质量的衬线体处理数学公式（KaTeX 渲染），正文使用高可读性的无衬线体。字间距和行高需经过专业微调以缓解学习疲劳。Initial Implementation Task:请为我初始化项目核心骨架，并实现 [3. 互动式 1 对 1 智能教学] 模块的 UI 原型，要求包含以下细节：智性对话流： 对话框不应是简单的气泡，而应具有“支架感”。根据引导级别（提示、思路、解析）显示不同的视觉深度。分栏布局： 左侧为数学实验工具区（Konva.js 预留画布），右侧为苏格拉底式对话区。公式渲染： 集成 KaTeX，确保所有数学表达式 $y = ax^2 + bx + c$ 的呈现达到出版级水平。微交互： 鼠标悬停在解题步骤上时，左侧实验工具区应有相应的几何图形高亮反馈。
