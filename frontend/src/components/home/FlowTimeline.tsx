import { motion } from 'framer-motion';
import './FlowTimeline.css';

interface FlowStep {
  number: number;
  title: string;
  description: string;
  icon?: string;
}

interface FlowTimelineProps {
  steps: FlowStep[];
}

/**
 * FlowTimeline - 动态学习流程时间线
 * 带滚动触发动画的流程图
 */
const FlowTimeline = ({ steps }: FlowTimelineProps) => {
  return (
    <div className="flow-timeline">
      {steps.map((step, index) => (
        <motion.div
          key={step.number}
          className="flow-step"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: index * 0.15, ease: [0, 0, 0.2, 1] }}
          whileHover={{ x: 8 }}
        >
          {/* 步骤编号 */}
          <div className="step-number-wrapper">
            <motion.div
              className="step-number"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 + 0.3, type: 'spring', stiffness: 200 }}
            >
              {String(step.number).padStart(2, '0')}
            </motion.div>
            {index < steps.length - 1 && (
              <motion.div
                className="step-connector"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + 0.4, duration: 0.5, ease: 'easeInOut' }}
                style={{ transformOrigin: 'top' }}
              />
            )}
          </div>

          {/* 步骤内容 */}
          <div className="step-content">
            <h3 className="step-title">{step.title}</h3>
            <p className="step-description">{step.description}</p>

            {/* 进度指示器 */}
            <motion.div
              className="step-progress"
              initial={{ width: 0 }}
              whileInView={{ width: `${((index + 1) / steps.length) * 100}%` }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 + 0.5, duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          {/* 悬停时的背景光效 */}
          <motion.div
            className="step-glow"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 0.05 }}
            transition={{ duration: 0.2 }}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default FlowTimeline;
