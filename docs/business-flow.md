# MathTutor 业务流程图

本文档描述 MathTutor 系统的完整业务流程，展示各个功能模块如何协同工作。

---

## 🎯 核心业务流程总览

```mermaid
graph TB
    Start([学生登录]) --> SelectCurriculum[选择课程/学期]
    SelectCurriculum --> KSS[知识体系展示]

    KSS --> SelectTopic[选择专题学习]
    SelectTopic --> QM[题库管理]

    QM --> SelectProblem[选择题目]
    SelectProblem --> IT[互动式1对1智能教学]

    IT --> CheckAnswer{学生作答}
    CheckAnswer -->|正确| RecordSuccess[记录成功]
    CheckAnswer -->|错误| Scaffolding[支架提示系统]

    Scaffolding --> Hint1[提示1: 方向性暗示]
    Hint1 --> Retry1{再次尝试}
    Retry1 -->|正确| RecordSuccess
    Retry1 -->|仍错误| Hint2[提示2: 明确方法]

    Hint2 --> Retry2{再次尝试}
    Retry2 -->|正确| RecordSuccess
    Retry2 -->|仍错误| Hint3[提示3: 详细步骤]

    Hint3 --> Retry3{再次尝试}
    Retry3 -->|正确| RecordSuccess
    Retry3 -->|仍错误| ShowAnswer[展示答案]

    RecordSuccess --> Methodology[方法论总结]
    ShowAnswer --> Methodology

    Methodology --> ET[实验工具演示]
    ET --> RecordData[记录学习数据]

    RecordData --> GenerateReport[生成学习报告]
    GenerateReport --> CheckContinue{继续学习?}

    CheckContinue -->|是| SelectTopic
    CheckContinue -->|否| KE[知识扩展推荐]

    KE --> ShowRelated[显示相关知识点]
    ShowRelated --> CheckReview{需要复习?}

    CheckReview -->|是| RM[复习模式]
    CheckReview -->|否| End([结束学习])

    RM --> ScheduleReview[安排复习时间]
    ScheduleReview --> End
```

---

## 📊 分层业务流程详解

### 1️⃣ 学习准备阶段

```mermaid
graph LR
    A[学生注册/登录] --> B[系统初始化]
    B --> C{是否新用户?}
    C -->|是| D[能力评估测试]
    C -->|否| E[加载学习历史]

    D --> F[生成初始学习路径]
    E --> F

    F --> G[选择课程/学期]
    G --> H[知识体系展示]
```

**涉及模块**:
- 知识体系展示 (模块1)
- 学习报告生成 (模块5)

---

### 2️⃣ 知识学习阶段

```mermaid
graph TB
    Start[进入知识体系] --> ViewTree[查看知识树]
    ViewTree --> SelectModule[选择模块]
    SelectModule --> ViewTopics[查看专题列表]

    ViewTopics --> SelectTopic[选择专题]
    SelectTopic --> ViewKP[查看知识点]

    ViewKP --> CheckMastery{掌握度评估}
    CheckMastery -->|未掌握| EnterLearning[进入学习流程]
    CheckMastery -->|已掌握| SuggestNext[推荐后续知识]

    EnterLearning --> LoadProblem[加载题目]
```

**涉及模块**:
- 知识体系展示 (模块1)
- 题库管理与结构化分解 (模块2)
- 知识扩展 (模块6)

---

### 3️⃣ 题目学习阶段（核心流程）

```mermaid
graph TB
    Start[加载题目] --> Display[显示题目内容]
    Display --> ShowTools[显示可用实验工具]

    ShowTools --> StudentInput[学生输入答案]
    StudentInput --> AIJudge{AI判断}

    AIJudge -->|完全正确| Celebrate[庆祝动画]
    AIJudge -->|部分正确| Praise[鼓励反馈]
    AIJudge -->|完全错误| Scaffolding[启动支架系统]

    Scaffolding --> Level1{提示级别}
    Level1 -->|第1次| Hint1[提示1: 方向性暗示]
    Level1 -->|第2次| Hint2[提示2: 明确方法]
    Level1 -->|第3次| Hint3[提示3: 详细步骤]
    Level1 -->|第4次| ShowAnswer[展示完整答案]

    Hint1 --> Retry[学生再次尝试]
    Hint2 --> Retry
    Hint3 --> Retry

    Retry --> AIJudge

    ShowAnswer --> Explain[详细讲解]
    Explain --> Methodology[方法论提炼]

    Celebrate --> Methodology
    Praise --> Retry
```

**涉及模块**:
- 题库管理与结构化分解 (模块2)
- 互动式1对1智能教学 (模块3)
- 动态实验工具系统 (模块4)

---

### 4️⃣ 实验工具演示阶段

```mermaid
graph TB
    Start[需要实验演示] --> SelectTool[选择工具类型]

    SelectTool --> Tool1[数轴动点工具]
    SelectTool --> Tool2[绝对值函数工具]
    SelectTool --> Tool3[整体代入工具]
    SelectTool --> Tool4[动态线段工具]

    Tool1 --> LoadParams[加载题目参数]
    Tool2 --> LoadParams
    Tool3 --> LoadParams
    Tool4 --> LoadParams

    LoadParams --> Render[渲染可视化]
    Render --> StudentExplore[学生探索操作]

    StudentExplore --> UpdateView[更新视图]
    UpdateView --> StudentExplore

    StudentExplore --> Understanding[确认理解]
    Understanding --> ReturnLearning[返回教学流程]
```

**涉及模块**:
- 动态实验工具系统 (模块4)
- 互动式1对1智能教学 (模块3)

---

### 5️⃣ 方法论总结阶段

```mermaid
graph TB
    Start[完成题目] --> ExtractMethod[提取方法论]
    ExtractMethod --> CheckExists{方法论已存在?}

    CheckExists -->|否| CreateMethod[AI生成新方法论]
    CheckExists -->|是| UpdateMethod[更新方法论统计]

    CreateMethod --> Validate[专家审核]
    Validate --> Approve{审核通过?}
    Approve -->|是| SaveMethod[保存到方法论库]
    Approve -->|否| Refine[AI优化]
    Refine --> Validate

    UpdateMethod --> Display[展示方法论]
    SaveMethod --> Display

    Display --> UniversalSteps[通用步骤]
    Display --> TypicalModels[典型模型]
    Display --> CommonMistakes[常见错误]

    UniversalSteps --> StudentConfirm[学生确认理解]
    TypicalModels --> StudentConfirm
    CommonMistakes --> StudentConfirm

    StudentConfirm --> RecordMastery[记录方法论掌握度]
```

**涉及模块**:
- 互动式1对1智能教学 (模块3)
- 题库管理与结构化分解 (模块2)

---

### 6️⃣ 学习报告生成阶段

```mermaid
graph TB
    Start[触发报告生成] --> CheckType{报告类型}

    CheckType -->|即时| QuestionReport[题目学习报告]
    CheckType -->|专题完成| TopicReport[专题学习报告]
    CheckType -->|阶段| PeriodReport[阶段性学习报告]

    QuestionReport --> CollectQ[收集题目数据]
    TopicReport --> CollectT[收集专题数据]
    PeriodReport --> CollectP[收集阶段数据]

    CollectQ --> Analyze[AI分析学习情况]
    CollectT --> Analyze
    CollectP --> Analyze

    Analyze --> GenerateCharts[生成图表]
    GenerateCharts --> Radar[能力雷达图]
    GenerateCharts --> Progress[进度图]
    GenerateCharts --> Weakness[薄弱环节分析]

    Radar --> Report[生成报告]
    Progress --> Report
    Weakness --> Report

    Report --> Recommend[改进建议]
    Recommend --> Display[展示报告]
```

**涉及模块**:
- 学习报告生成 (模块5)
- 知识体系展示 (模块1) - 用于展示进度

---

### 7️⃣ 知识扩展阶段

```mermaid
graph TB
    Start[触发知识扩展] --> CurrentKP[当前知识点]
    CurrentKP --> FindPrerequisite[查找前置知识]
    CurrentKP --> FindPost[查找后续知识]
    CurrentKP --> FindRelated[查找相关知识]

    FindPrerequisite --> CheckMastery1{已掌握?}
    CheckMastery1 -->|否| RecommendReview1[推荐复习前置知识]
    CheckMastery1 -->|是| Filter1[过滤]

    FindPost --> CheckReady{准备好?}
    CheckReady -->|是| RecommendNext[推荐学习后续知识]
    CheckReady -->|否| Filter2[过滤]

    FindRelated --> CheckSimilar{相似度?}
    CheckSimilar -->|高| RecommendRelated[推荐相关知识]
    CheckSimilar -->|低| Filter3[过滤]

    Filter1 --> BuildGraph[构建知识图谱]
    Filter2 --> BuildGraph
    Filter3 --> BuildGraph
    RecommendReview1 --> BuildGraph
    RecommendNext --> BuildGraph
    RecommendRelated --> BuildGraph

    BuildGraph --> DisplayGraph[可视化展示]
    DisplayGraph --> StudentSelect[学生选择]
```

**涉及模块**:
- 知识扩展 (模块6)
- 知识体系展示 (模块1)

---

### 8️⃣ 复习模式阶段

```mermaid
graph TB
    Start[触发复习检查] --> CheckHistory[查看学习历史]
    CheckHistory --> Calculate[计算遗忘概率]

    Calculate --> CheckNeed{需要复习?}
    CheckNeed -->|是| SelectReview[选择复习内容]
    CheckNeed -->|否| NoReview[无需复习]

    SelectReview --> ReviewType{复习类型}

    ReviewType -->|间隔复习| SpacedReview[艾宾浩斯复习]
    ReviewType -->|错题复习| MistakeReview[错题本复习]
    ReviewType -->|薄弱项| WeaknessReview[薄弱项强化]

    SpacedReview --> LoadProblem[加载题目]
    MistakeReview --> LoadProblem
    WeaknessReview --> LoadProblem

    LoadProblem --> QuickCheck[快速检验]

    QuickCheck --> Correct?{做对?}
    Correct? -->|是| UpdateInterval[延长复习间隔]
    Correct? -->|否| ResetInterval[重置复习序列]

    UpdateInterval --> Record[记录复习结果]
    ResetInterval --> Record

    Record --> CheckContinue{继续复习?}
    CheckContinue -->|是| LoadProblem
    CheckContinue -->|否| Complete[完成复习]
    NoReview --> Complete
```

**涉及模块**:
- 复习模式 (模块7)
- 题库管理与结构化分解 (模块2)
- 学习报告生成 (模块5)

---

## 🔄 跨模块协同流程

### 场景1：首次学习新专题

```mermaid
sequenceDiagram
    participant S as 学生
    participant KS as 知识体系
    participant QM as 题库管理
    participant IT as 智能教学
    participant ET as 实验工具
    participant MR as 学习报告
    participant RM as 复习模式

    S->>KS: 选择课程
    KS->>S: 显示知识树
    S->>KS: 选择专题
    KS->>QM: 请求题目
    QM->>IT: 加载题目逻辑链
    IT->>S: 展示题目
    S->>IT: 提交答案
    IT->>IT: AI判断+支架提示
    IT->>ET: 请求实验演示
    ET->>S: 可视化演示
    IT->>IT: 方法论总结
    IT->>MR: 记录学习数据
    MR->>RM: 安排复习计划
    MR->>S: 展示学习报告
```

---

### 场景2：复习模式触发

```mermaid
sequenceDiagram
    participant S as 学生
    participant RM as 复习模式
    participant KS as 知识体系
    participant QM as 题库管理
    participant IT as 智能教学
    participant MR as 学习报告

    RM->>RM: 检查复习时间
    RM->>S: 提示复习
    S->>RM: 开始复习
    RM->>KS: 获取知识点状态
    RM->>QM: 加载待复习题目
    QM->>IT: 快速检验模式
    S->>IT: 快速答题
    IT->>MR: 记录复习结果
    MR->>RM: 更新复习间隔
    RM->>S: 复习完成反馈
```

---

### 场景3：知识扩展推荐

```mermaid
sequenceDiagram
    participant S as 学生
    participant IT as 智能教学
    participant KS as 知识体系
    participant KE as 知识扩展
    participant QM as 题库管理

    IT->>IT: 完成当前题目
    IT->>KS: 获取当前知识点
    KS->>KE: 请求知识扩展
    KE->>KE: 分析前置/后续/相关知识
    KE->>KS: 构建知识图谱
    KE->>S: 展示推荐路径
    S->>KE: 选择学习方向
    KE->>QM: 加载推荐题目
    QM->>IT: 开始新题目学习
```

---

## 📈 数据流转关系

```mermaid
graph LR
    KS[知识体系] -->|提供知识结构| QM[题库管理]
    QM -->|题目+逻辑链| IT[智能教学]

    IT -->|学习数据| MR[学习报告]
    IT -->|方法论| QM

    MR -->|学习数据| RM[复习模式]
    MR -->|薄弱环节| KS

    RM -->|复习请求| QM
    KS -->|知识关系| KE[知识扩展]

    KE -->|推荐路径| KS
    KE -->|推荐题目| QM

    IT -->|演示请求| ET[实验工具]
```

---

## 🎯 完整学习循环

```mermaid
graph TB
    Start([开始学习]) --> Assess[能力评估]
    Assess --> Plan[制定学习计划]

    Plan --> Learn[学习新知识]
    Learn --> Practice[题目练习]

    Practice --> Check{掌握了吗?}
    Check -->|否| Scaffold[支架提示]
    Scaffold --> Practice

    Check -->|是| Method[方法论总结]
    Method --> Report[学习报告]

    Report --> Review{需要复习?}
    Review -->|是| ReviewMode[复习模式]
    Review -->|否| Extend[知识扩展]

    ReviewMode --> Practice
    Extend --> Learn

    Report --> Complete([完成阶段学习])
```

---

## 📝 流程图说明

### 图例含义

- **圆角矩形**: 表示开始/结束节点
- **矩形**: 表示处理步骤
- **菱形**: 表示判断节点
- **平行四边形**: 表示输入/输出
- **圆柱形**: 表示数据存储
- **箭头**: 表示数据流向或控制流

### 颜色标识（在支持的工具中）

- 🟢 **绿色**: 学生操作
- 🔵 **蓝色**: 系统处理
- 🟡 **黄色**: AI判断
- 🔴 **红色**: 支架提示/错误处理

---

## 🔗 相关文档

- [需求清单](./REQUIREMENTS.md) - 完整功能需求
- [功能详细需求](./requirements/) - 7个核心功能的详细说明
- [技术架构设计](./architecture/README.md) - 系统技术实现
