import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import './FeatureCard.css';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  color: string;
  isPrimary?: boolean;
  index: number;
  onClick?: () => void;
}

/**
 * FeatureCard - 交互式功能卡片
 * 支持微交互反馈，根据不同级别显示不同视觉深度
 */
const FeatureCard = ({
  icon,
  title,
  description,
  color,
  isPrimary = false,
  index,
  onClick
}: FeatureCardProps) => {
  return (
    <motion.div
      className={`feature-card ${isPrimary ? 'feature-card-primary' : ''}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0, 0, 0.2, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
    >
      {/* 图标容器 - 带光晕效果 */}
      <motion.div
        className="feature-icon-wrapper"
        style={{ backgroundColor: `${color}15` }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className="feature-icon" style={{ color }}>
          {icon}
        </div>
      </motion.div>

      {/* 卡片内容 */}
      <div className="feature-content">
        <h3 className="feature-title">{title}</h3>
        <p className="feature-description">{description}</p>
      </div>

      {/* 交互指示器 */}
      {isPrimary && (
        <motion.div
          className="feature-badge"
          style={{ backgroundColor: color }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 + index * 0.1, type: 'spring' }}
        >
          核心功能
        </motion.div>
      )}

      {/* 悬停时的光晕效果 */}
      <motion.div
        className="feature-glow"
        style={{ backgroundColor: color }}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 0.1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default FeatureCard;
