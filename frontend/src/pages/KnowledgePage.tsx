import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { SearchOutlined, BlockOutlined, FileTextOutlined, BulbOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Input, Progress } from 'antd';
import { useKnowledgeStore } from '../store/knowledgeStore';
import type { GradeType, SemesterType } from '../types/knowledge';
import GradeSelector from '../components/knowledge/GradeSelector';
import ModuleCard from '../components/knowledge/ModuleCard';
import './KnowledgePage.css';

const { Search } = Input;

const KnowledgePage = () => {
  const {
    currentCurriculum,
    currentGrade,
    currentSemester,
    expandedModules,
    searchQuery,
    loading,
    loadMockData,
    setCurrentGrade,
    setCurrentSemester,
    toggleModule,
    setSearchQuery,
  } = useKnowledgeStore();

  useEffect(() => {
    // Load mock data only once on mount
    loadMockData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGradeChange = (grade: GradeType) => {
    setCurrentGrade(grade);
  };

  const handleSemesterChange = (semester: SemesterType) => {
    setCurrentSemester(semester);
  };

  const filteredModules = currentCurriculum?.modules.filter((module) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      module.module_name.toLowerCase().includes(query) ||
      module.topics.some(
        (topic) =>
          topic.topic_name.toLowerCase().includes(query) ||
          topic.knowledge_points.some(
            (kp) =>
              kp.kp_name.toLowerCase().includes(query) ||
              (kp.detail && kp.detail.toLowerCase().includes(query))
          )
      )
    );
  });

  if (loading || !currentCurriculum) {
    return (
      <div className="knowledge-page loading">
        <div className="loading-spinner">加载中...</div>
      </div>
    );
  }

  return (
    <div className="knowledge-page">
      {/* 背景网格 */}
      <div className="grid-background" />

      {/* 头部 */}
      <div className="knowledge-header">
        <GradeSelector
          currentGrade={currentGrade}
          currentSemester={currentSemester}
          onGradeChange={handleGradeChange}
          onSemesterChange={handleSemesterChange}
        />

        {/* 搜索框 */}
        <div className="search-container">
          <Search
            placeholder="搜索模块/专题/知识点..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="knowledge-search"
          />
        </div>
      </div>

      {/* 统计信息 - 紧凑条 */}
      <div className="knowledge-stats">
        <div className="stat-item">
          <BlockOutlined className="stat-icon" />
          <div className="stat-content">
            <div className="stat-value">{currentCurriculum.total_modules}</div>
            <div className="stat-label">模块</div>
          </div>
        </div>

        <div className="stat-divider" />

        <div className="stat-item">
          <FileTextOutlined className="stat-icon" />
          <div className="stat-content">
            <div className="stat-value">{currentCurriculum.total_topics}</div>
            <div className="stat-label">专题</div>
          </div>
        </div>

        <div className="stat-divider" />

        <div className="stat-item">
          <BulbOutlined className="stat-icon" />
          <div className="stat-content">
            <div className="stat-value">{currentCurriculum.total_kps}</div>
            <div className="stat-label">知识点</div>
          </div>
        </div>

        <div className="stat-divider" />

        <div className="stat-item">
          <CheckCircleOutlined className="stat-icon stat-icon--primary" />
          <div className="stat-content">
            <div className="stat-value stat-value--primary">
              {currentCurriculum.mastered_kps}
            </div>
            <div className="stat-label">已掌握</div>
          </div>
        </div>

        <div className="stat-divider" />

        <div className="over-progress-section">
          <span className="over-progress-label">整体进度</span>
          <div className="over-progress-bar-wrapper">
            <Progress
              percent={Math.round(currentCurriculum.overall_progress || 0)}
              strokeColor="#1A56DB"
              trailColor="#E5E7EB"
              strokeWidth={8}
              showInfo={false}
            />
          </div>
          <span className="over-progress-percentage">
            {Math.round(currentCurriculum.overall_progress || 0)}%
          </span>
        </div>
      </div>

      {/* 模块卡片 */}
      <div className="modules-container">
        {filteredModules && filteredModules.length > 0 ? (
          filteredModules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ModuleCard
                module={module}
                isExpanded={expandedModules.has(module.module_id)}
                onToggle={toggleModule}
              />
            </motion.div>
          ))
        ) : (
          <div className="empty-state">
            <SearchOutlined style={{ fontSize: 48, color: '#D1D5DB' }} />
            <p>未找到相关知识内容</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgePage;
