import type { Module } from '../../types/knowledge';
import { motion } from 'framer-motion';
import { CaretDownOutlined } from '@ant-design/icons';
import './ModuleCard.css';

interface ModuleCardProps {
  module: Module;
  isExpanded: boolean;
  onToggle: (moduleId: string) => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, isExpanded, onToggle }) => {
  const progressColor =
    module.progress_percentage! >= 80
      ? '#10B981'
      : module.progress_percentage! >= 50
      ? '#3B82F6'
      : module.progress_percentage! >= 30
      ? '#F59E0B'
      : '#9CA3AF';

  return (
    <motion.div
      className={`module-card ${isExpanded ? 'expanded' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="module-card-header" onClick={() => onToggle(module.module_id)}>
        <div className="module-header-main">
          <h3 className="module-name">{module.module_name}</h3>
          {module.module_tag && <span className="module-tag">{module.module_tag}</span>}
        </div>

        <p className="module-overview">{module.overview}</p>

        <div className="module-stats">
          <span className="stat-item">{module.total_topics} 个专题</span>
          <span className="stat-item">{module.total_kps} 个知识点</span>
        </div>

        <div className="module-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${module.progress_percentage}%`,
                backgroundColor: progressColor,
              }}
            />
          </div>
          <span className="progress-label" style={{ color: progressColor }}>
            {module.progress_percentage}%
          </span>
        </div>

        <CaretDownOutlined className={`expand-icon ${isExpanded ? 'rotated' : ''}`} />
      </div>

      {isExpanded && (
        <motion.div
          className="module-topics"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {module.topics.map((topic) => (
            <div key={topic.id} className="topic-item">
              <div className="topic-header">
                <h4 className="topic-name">{topic.topic_name}</h4>
                {topic.alias && <span className="topic-alias">{topic.alias}</span>}
              </div>
              <div className="topic-stats">
                <span className="topic-stat">
                  {topic.mastered_kps}/{topic.total_kps} 已掌握
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default ModuleCard;
