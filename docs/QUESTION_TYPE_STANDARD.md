# 题目类型标准文档

## 概述

本文档定义了 MathTutor 项目中题目类型的统一标准，确保前后端、API 和数据库存储的一致性。

## 题型映射表

| 百度OCR API | 后端存储 | 数据库字段 | 前端显示 | 颜色 |
|------------|---------|-----------|---------|------|
| 0 | `choice` | `question_type` | 选择题 | blue |
| 1 | `judge` | `question_type` | 判断题 | green |
| 2 | `fill_blank` | `question_type` | 填空题 | orange |
| 3 | `essay` | `question_type` | 问答题 | purple |
| 4 | `other` | `question_type` | 其他 | default |

## 数据流

```
┌─────────────┐
│ 百度OCR API │ qus_type: 3
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ 后端解析逻辑    │ question_type: "essay"
│ baidu_ocr.py    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ 数据库存储      │ question_type: "essay"
│ problems表      │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ API响应         │ question_type: "essay"
│ ProblemSchema   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ 前端工具函数    │ getQuestionTypeLabel("essay")
│ problemUtils.ts │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ 用户界面显示    │ "问答题" (紫色标签)
│                │
└─────────────────┘
```

## 代码实现

### 后端 (Python)

**文件**: `backend/app/utils/baidu_ocr.py`

```python
# 题目类型映射（百度OCR官方文档）
# 0：选择题；1：判断题；2：填空题；3：问答题；4：其他
type_map = {
    '0': 'choice',       # 选择题
    '1': 'judge',        # 判断题
    '2': 'fill_blank',   # 填空题
    '3': 'essay',        # 问答题/主观题
    '4': 'other',        # 其他
}
question_type = type_map.get(str(qus_type), 'unknown')
```

### 前端 (TypeScript)

**文件**: `frontend/src/utils/problemUtils.ts`

```typescript
export enum QuestionType {
  CHOICE = 'choice',       // 选择题
  JUDGE = 'judge',         // 判断题
  FILL_BLANK = 'fill_blank', // 填空题
  ESSAY = 'essay',         // 问答题
  OTHER = 'other',         // 其他
  UNKNOWN = 'unknown',     // 未知
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  [QuestionType.CHOICE]: '选择题',
  [QuestionType.JUDGE]: '判断题',
  [QuestionType.FILL_BLANK]: '填空题',
  [QuestionType.ESSAY]: '问答题',
  [QuestionType.OTHER]: '其他',
  [QuestionType.UNKNOWN]: '未知',
};

export const QUESTION_TYPE_COLORS: Record<QuestionType, string> = {
  [QuestionType.CHOICE]: 'blue',
  [QuestionType.JUDGE]: 'green',
  [QuestionType.FILL_BLANK]: 'orange',
  [QuestionType.ESSAY]: 'purple',
  [QuestionType.OTHER]: 'default',
  [QuestionType.UNKNOWN]: 'default',
};
```

## 使用示例

### 前端组件

```tsx
import { getQuestionTypeLabel, getQuestionTypeColor } from '../../utils/problemUtils';

// 显示题型标签
<Tag color={getQuestionTypeColor(problem.question_type)}>
  {getQuestionTypeLabel(problem.question_type)}
</Tag>

// 编辑下拉框
<Select
  value={editForm.question_type}
  onChange={(value) => setEditForm({ ...editForm, question_type: value })}
>
  <Select.Option value={QuestionType.CHOICE}>
    {QUESTION_TYPE_LABELS[QuestionType.CHOICE]}
  </Select.Option>
  {/* ... 其他选项 */}
</Select>
```

## 数据库迁移

如需迁移历史数据，使用以下脚本：

```bash
cd backend
python scripts/migrate_question_types.py
```

脚本会自动：
1. 检测非标准题型
2. 将非标准题型更新为 `other`
3. 输出迁移报告

## 扩展指南

如需添加新的题目类型：

1. **后端**: 更新 `baidu_ocr.py` 中的 `type_map`
2. **前端**: 更新 `problemUtils.ts` 中的枚举和映射
3. **数据库**: 运行迁移脚本更新历史数据
4. **测试**: 确保前后端显示一致

## 注意事项

1. **始终使用英文代码存储**: 数据库和 API 中始终使用英文代码（如 `essay`），而非中文
2. **前端负责本地化**: 仅在前端展示时转换为中文
3. **保持一致性**: 任何修改都必须同步更新前后端代码
4. **向后兼容**: 新增题型时，旧数据不应受影响

## 版本历史

- **v1.0** (2025-12-31): 初始版本，统一前后端题型标准
  - 修正百度 OCR API 映射错误（1=判断题, 2=填空题）
  - 创建前端工具函数统一显示逻辑
  - 数据库验证：所有现有数据均为标准格式
