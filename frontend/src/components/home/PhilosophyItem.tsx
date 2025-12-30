import { motion } from 'framer-motion';
import './PhilosophyItem.css';

interface PhilosophyItemProps {
  title: string;
  description: string;
  index: number;
}

/**
 * PhilosophyItem - 设计理念条目
 */
const PhilosophyItem = ({ title, description, index }: PhilosophyItemProps) => {
  return (
    <motion.div
      className="philosophy-item"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0, 0, 0.2, 1] }}
      whileHover={{ y: -4 }}
    >
      {/* 内容 */}
      <div className="philosophy-content">
        <h3 className="philosophy-title">{title}</h3>
        <p className="philosophy-description">{description}</p>
      </div>

      {/* 装饰性元素 */}
      <motion.div
        className="philosophy-decoration"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.1 + 0.3, ease: 'easeInOut' }}
      />
    </motion.div>
  );
};

export default PhilosophyItem;
