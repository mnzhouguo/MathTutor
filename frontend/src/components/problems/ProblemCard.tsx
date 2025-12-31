import { motion } from 'framer-motion';
import {
  EyeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  CameraOutlined,
  StarFilled,
  TagOutlined
} from '@ant-design/icons';
import { Tag } from 'antd';
import type { Problem } from '../../api/problemsApi';
import { getQuestionTypeLabel, getQuestionTypeColor } from '../../utils/problemUtils';
import './ProblemCard.css';

interface ProblemCardProps {
  problem: Problem;
  onView: () => void;
}

const ProblemCard: React.FC<ProblemCardProps> = ({ problem, onView }) => {
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { icon: React.ReactNode; text: string; className: string }> = {
      pending: { icon: <ClockCircleOutlined />, text: '待补充', className: 'status-pending' },
      completed: { icon: <CheckCircleOutlined />, text: '已完成', className: 'status-completed' },
      archived: { icon: <DatabaseOutlined />, text: '已归档', className: 'status-archived' },
    };
    return configs[status] || { icon: null, text: status, className: 'status-unknown' };
  };

  const statusConfig = getStatusConfig(problem.status);
  const isOCR = problem.source === 'OCR识别';
  const previewContent = problem.content?.length > 150
    ? problem.content.substring(0, 150) + '...'
    : problem.content;

  return (
    <motion.div
      className="problem-card"
      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="problem-card-header">
        <div className="problem-meta">
          <code className="problem-id">{problem.problem_id}</code>
          <Tag className={`source-tag ${isOCR ? 'source-ocr' : 'source-manual'}`}>
            {isOCR ? <CameraOutlined /> : <DatabaseOutlined />}
            <span>{problem.source}</span>
          </Tag>
        </div>
        <Tag className={`status-tag ${statusConfig.className}`} icon={statusConfig.icon}>
          {statusConfig.text}
        </Tag>
      </div>

      <div className="problem-content">
        <p className="problem-text">{previewContent || '暂无内容'}</p>
      </div>

      <div className="problem-footer">
        <div className="problem-info">
          {problem.question_type && (
            <Tag color={getQuestionTypeColor(problem.question_type)}>
              <TagOutlined className="info-icon" />
              {getQuestionTypeLabel(problem.question_type)}
            </Tag>
          )}
          {problem.difficulty && (
            <span className="difficulty-display">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarFilled
                  key={i}
                  className={`star ${i < problem.difficulty! ? 'star-filled' : 'star-empty'}`}
                />
              ))}
            </span>
          )}
          <span className="create-time">
            {new Date(problem.created_at).toLocaleDateString('zh-CN')}
          </span>
        </div>
        <button className="view-button" onClick={onView}>
          <EyeOutlined />
          <span>查看</span>
        </button>
      </div>
    </motion.div>
  );
};

export default ProblemCard;
