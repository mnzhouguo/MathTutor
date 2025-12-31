"""
题目类型数据迁移脚本

确保数据库中的 question_type 与后端 API 保持一致

后端存储标准（与百度OCR API对应）:
- 0: choice      (选择题)
- 1: judge       (判断题)
- 2: fill_blank  (填空题)
- 3: essay       (问答题)
- 4: other       (其他)
"""
import sqlite3
import sys
import os

# 添加项目根目录到路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def migrate_question_types(db_path: str = 'mathtutor.db'):
    """
    迁移题目类型数据

    Args:
        db_path: 数据库文件路径
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # 查询当前所有题目
        cursor.execute('SELECT id, problem_id, question_type FROM problems')
        problems = cursor.fetchall()

        print(f'=== 题目类型迁移 ===')
        print(f'总题目数: {len(problems)}\n')

        # 标准题型映射（仅用于显示，实际数据已是标准格式）
        type_labels = {
            'choice': '选择题',
            'judge': '判断题',
            'fill_blank': '填空题',
            'essay': '问答题',
            'other': '其他',
            'unknown': '未知',
            None: '未设置'
        }

        # 统计当前题型分布
        type_counts = {}
        for pid, problem_id, qtype in problems:
            qtype_key = qtype if qtype else 'unknown'
            type_counts[qtype_key] = type_counts.get(qtype_key, 0) + 1

        print('当前题型分布:')
        for qtype, count in sorted(type_counts.items()):
            label = type_labels.get(qtype, qtype)
            print(f'  {label} ({qtype}): {count} 个题目')

        # 检查是否有非标准题型（需要迁移的数据）
        non_standard_types = set()
        for pid, problem_id, qtype in problems:
            if qtype and qtype not in type_labels:
                non_standard_types.add(qtype)

        if non_standard_types:
            print(f'\n⚠️  发现非标准题型: {non_standard_types}')
            print('这些题型将被标记为 "other"')

            # 将非标准题型更新为 'other'
            cursor.execute(
                'UPDATE problems SET question_type = ? WHERE question_type NOT IN (?, ?, ?, ?, ?) AND question_type IS NOT NULL',
                ('other', 'choice', 'judge', 'fill_blank', 'essay', 'other')
            )
            conn.commit()
            print(f'✓ 已将 {cursor.rowcount} 条记录更新为 "other"')

        else:
            print('\n✓ 所有题型均为标准格式，无需迁移')

        # 最终验证
        cursor.execute('SELECT question_type, COUNT(*) FROM problems GROUP BY question_type')
        final_stats = cursor.fetchall()

        print('\n最终题型分布:')
        for qtype, count in final_stats:
            label = type_labels.get(qtype, qtype)
            print(f'  {label} ({qtype}): {count} 个题目')

        print('\n✓ 迁移完成！')

    except Exception as e:
        conn.rollback()
        print(f'\n✗ 迁移失败: {str(e)}')
        raise
    finally:
        conn.close()


if __name__ == '__main__':
    # 获取数据库路径
    db_path = sys.argv[1] if len(sys.argv) > 1 else 'mathtutor.db'

    print(f'数据库路径: {db_path}\n')

    if not os.path.exists(db_path):
        print(f'✗ 数据库文件不存在: {db_path}')
        sys.exit(1)

    migrate_question_types(db_path)
