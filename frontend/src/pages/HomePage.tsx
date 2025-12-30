import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOutlined,
  FormOutlined,
  ExperimentOutlined,
  LineChartOutlined,
  BarChartOutlined,
  NodeIndexOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import HeroCanvas from '../components/home/HeroCanvas';
import FeatureCard from '../components/home/FeatureCard';
import PhilosophyItem from '../components/home/PhilosophyItem';
import FlowTimeline from '../components/home/FlowTimeline';
import '../styles/design-tokens.css';
import './HomePage.css';

/**
 * HomePage - MathTutor 首页
 * 学术极简主义 + 数学实验室美学
 */
const HomePage = () => {
  const navigate = useNavigate();

  // 功能模块数据
  const features = [
    {
      icon: <ExperimentOutlined />,
      title: '互动式 1 对 1 智能教学',
      description: '苏格拉底式渐进式教学，三级提示系统，授人以渔的方法论提炼',
      color: '#1A56DB',
      isPrimary: true,
      id: 'teaching',
    },
    {
      icon: <BookOutlined />,
      title: '知识体系展示',
      description: '构建层次化的知识体系导航系统，可视化学科地图',
      color: '#10B981',
      id: 'knowledge',
    },
    {
      icon: <FormOutlined />,
      title: '题库管理与结构化分解',
      description: 'AI 驱动的题目结构化分解，智能标注知识点',
      color: '#8B5CF6',
      id: 'questions',
    },
    {
      icon: <LineChartOutlined />,
      title: '动态实验工具系统',
      description: '可视化实验工具，将抽象概念转化为直观图形',
      color: '#F59E0B',
      id: 'experiments',
    },
  ];

  // 辅助功能
  const auxiliaryFeatures = [
    {
      icon: <BarChartOutlined />,
      title: '学习报告生成',
      description: '多维度学习分析报告',
      color: '#EF4444',
      id: 'report',
    },
    {
      icon: <NodeIndexOutlined />,
      title: '知识扩展',
      description: '基于知识图谱的推荐',
      color: '#EC4899',
      id: 'expand',
    },
    {
      icon: <ClockCircleOutlined />,
      title: '复习模式',
      description: '科学复习规划系统',
      color: '#14B8A6',
      id: 'review',
    },
  ];

  // 设计理念
  const philosophies = [
    {
      title: '授人以渔',
      description: '授人以鱼不如授人以渔。教会学生解决一类问题的通用方法论',
    },
    {
      title: '支架式教学',
      description: '通过结构化的支架式提示引导学生主动思考，而非直接给出答案',
    },
    {
      title: '苏格拉底式教学',
      description: 'AI教师扮演苏格拉底式导师角色，引导式提问激发思考',
    },
    {
      title: '动态可视化',
      description: '通过动态可视化的实验工具，将抽象的数学概念转化为直观的图形',
    },
  ];

  // 学习流程
  const flowSteps = [
    {
      number: 1,
      title: '知识学习',
      description: '浏览知识体系，选择专题学习，理解知识点的内在联系',
    },
    {
      number: 2,
      title: '题目练习',
      description: '选择典型题目进行练习，系统提供支架式提示帮助',
    },
    {
      number: 3,
      title: '实验演示',
      description: '使用可视化实验工具，直观理解抽象概念和定理',
    },
    {
      number: 4,
      title: '方法论总结',
      description: '提炼解题方法论，掌握解决一类问题的通用方法',
    },
    {
      number: 5,
      title: '学习报告',
      description: '生成多维度学习报告，了解学习进度和薄弱环节',
    },
    {
      number: 6,
      title: '知识扩展',
      description: '基于知识图谱推荐相关知识，拓展学习广度和深度',
    },
    {
      number: 7,
      title: '科学复习',
      description: '基于艾宾浩斯遗忘曲线，智能规划复习时机和内容',
    },
  ];

  return (
    <div className="home-page">
      {/* =========================================
          HERO SECTION - 极简有力
          ========================================= */}
      <section className="hero-section grid-texture">
        <div className="hero-container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0, 0, 0.2, 1] }}
          >
            {/* 左侧 - 文字内容 */}
            <div className="hero-left">
              {/* 顶部标签 */}
              <motion.div
                className="hero-badge"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <span className="badge-dot"></span>
                <span>初中数学 · AI 驱动</span>
              </motion.div>

              {/* 主标题 */}
              <h1 className="hero-title">
                <motion.span
                  className="title-line"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  授人以渔的
                </motion.span>
                <motion.span
                  className="title-line title-emphasis"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  AI 数学教练
                </motion.span>
              </h1>

              {/* CTA 按钮组 */}
              <motion.div
                className="hero-actions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <button
                  className="cta-button cta-primary"
                  onClick={() => navigate('/knowledge')}
                >
                  开始学习
                  <span className="button-arrow">→</span>
                </button>
                <button className="cta-button cta-secondary">
                  了解更多
                </button>
              </motion.div>

              {/* 底部统计 */}
              <motion.div
                className="hero-stats"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <div className="stat-item">
                  <span className="stat-number">7</span>
                  <span className="stat-label">功能模块</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-number">AI</span>
                  <span className="stat-label">智能驱动</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-number">1v1</span>
                  <span className="stat-label">个性辅导</span>
                </div>
              </motion.div>
            </div>

            {/* 右侧 - 动态画布 */}
            <motion.div
              className="hero-right"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0, 0, 0.2, 1] }}
            >
              <HeroCanvas />
            </motion.div>
          </motion.div>

          {/* 滚动提示 */}
          <motion.div
            className="scroll-indicator"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 1,
              duration: 0.8,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <span>向下滚动</span>
            <span className="scroll-arrow">↓</span>
          </motion.div>
        </div>
      </section>

      {/* =========================================
        CORE FEATURES - 核心功能区（重点突出）
        ========================================= */}
      <section className="features-section">
        <div className="section-container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label">核心功能</span>
            <h2 className="section-title">智能学习引擎</h2>
            <p className="section-description">
              AI 驱动的 1 对 1 辅导，覆盖学习全流程的智能教学系统
            </p>
          </motion.div>

          <div className="features-grid-primary">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.id}
                {...feature}
                index={index}
                onClick={() => {
                  if (feature.id === 'knowledge') {
                    navigate('/knowledge');
                  }
                }}
              />
            ))}
          </div>

          {/* 辅助功能 */}
          <motion.div
            className="auxiliary-features"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {auxiliaryFeatures.map((feature) => (
              <div key={feature.id} className="auxiliary-item">
                <div className="auxiliary-icon" style={{ color: feature.color }}>
                  {feature.icon}
                </div>
                <div className="auxiliary-content">
                  <h4 className="auxiliary-title">{feature.title}</h4>
                  <p className="auxiliary-desc">{feature.description}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* =========================================
        PHILOSOPHY - 设计理念（数学公式隐喻）
        ========================================= */}
      <section className="philosophy-section grid-texture-fine">
        <div className="section-container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label">设计理念</span>
            <h2 className="section-title">核心教学理念</h2>
            <p className="section-description">
              基于苏格拉底式教学和支架式教学，通过方法论提炼和动态可视化，帮助学生建立数学思维
            </p>
          </motion.div>

          <div className="philosophy-grid">
            {philosophies.map((philosophy, index) => (
              <PhilosophyItem
                key={index}
                {...philosophy}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
        LEARNING FLOW - 学习流程（动态时间线）
        ========================================= */}
      <section className="flow-section">
        <div className="section-container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label">学习流程</span>
            <h2 className="section-title">完整的学习闭环</h2>
            <p className="section-description">
              从知识学习到复习巩固，形成科学的学习闭环
            </p>
          </motion.div>

          <FlowTimeline steps={flowSteps} />
        </div>
      </section>

      {/* =========================================
        FINAL CTA - 最终行动召唤
        ========================================= */}
      <section className="cta-section">
        <motion.div
          className="cta-container"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="cta-title">开始你的数学探索之旅</h2>
          <p className="cta-description">
            让 AI 成为你学习数学的最佳伙伴
          </p>
          <button
            className="cta-button-large"
            onClick={() => navigate('/knowledge')}
          >
            立即开始学习
            <span className="button-arrow">→</span>
          </button>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;
