/**
 * 题库管理页面 - 全屏流式布局设计
 */
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  CameraOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  FilterOutlined,
  TagOutlined,
  StarFilled,
  CloseOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Input, Tag, Button, Select, Empty } from 'antd';
import { problemsApi, type Problem } from '../api/problemsApi';
import OCRModal from '../components/problems/OCRModal';
import ProblemCard from '../components/problems/ProblemCard';
import { QuestionType, QUESTION_TYPE_LABELS } from '../utils/problemUtils';
import './ProblemListPage.css';

const { Search } = Input;
const { Option } = Select;

interface FilterState {
  difficulty: number[];
  source: string[];
  status: string[];
  questionType: string[];
}

const ProblemListPage: React.FC = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [ocrModalVisible, setOcrModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    difficulty: [],
    source: [],
    status: [],
    questionType: [],
  });

  // 获取题目列表
  const fetchProblems = async (page: number = 1, size: number = 20) => {
    setLoading(true);
    try {
      const response = await problemsApi.getList(page, size);
      setProblems(response.items);
      setPagination({
        current: response.page,
        pageSize: response.size,
        total: response.total,
      });
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchProblems();
  }, []);

  // 过滤逻辑
  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      // 搜索过滤
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchSearch =
          problem.content?.toLowerCase().includes(query) ||
          problem.problem_id?.toLowerCase().includes(query);
        if (!matchSearch) return false;
      }

      // 难度过滤
      if (filters.difficulty.length > 0 && problem.difficulty) {
        if (!filters.difficulty.includes(problem.difficulty)) return false;
      }

      // 来源过滤
      if (filters.source.length > 0) {
        if (!filters.source.includes(problem.source)) return false;
      }

      // 状态过滤
      if (filters.status.length > 0) {
        if (!filters.status.includes(problem.status)) return false;
      }

      // 题型过滤
      if (filters.questionType.length > 0) {
        if (!filters.questionType.includes(problem.question_type)) return false;
      }

      return true;
    });
  }, [problems, searchQuery, filters]);

  // 统计数据
  const stats = useMemo(() => ({
    total: pagination.total,
    ocr: problems.filter((p) => p.source === 'OCR识别').length,
    pending: problems.filter((p) => p.status === 'pending').length,
    completed: problems.filter((p) => p.status === 'completed').length,
  }), [pagination.total, problems]);

  // OCR 识别成功回调
  const handleOCRSuccess = (problemId: string) => {
    fetchProblems(pagination.current, pagination.pageSize);
  };

  // 加载更多
  const loadMore = () => {
    if (pagination.current * pagination.pageSize < pagination.total) {
      fetchProblems(pagination.current + 1, pagination.pageSize);
    }
  };

  return (
    <div className="problem-list-page">
      {/* 顶部导航栏 */}
      <div className="problem-header">
        <div className="header-left">
          <FileTextOutlined className="page-icon" />
          <div>
            <h1 className="page-title">题库管理中心</h1>
            <p className="page-subtitle">智能管理您的数学题目集合</p>
          </div>
        </div>

        <div className="header-actions">
          <Button
            type="primary"
            size="large"
            className="ocr-button"
            icon={<CameraOutlined />}
            onClick={() => setOcrModalVisible(true)}
          >
            OCR 识别
          </Button>
          <Button
            size="large"
            className={`filter-toggle ${filterVisible ? 'active' : ''}`}
            icon={<FilterOutlined />}
            onClick={() => setFilterVisible(!filterVisible)}
          >
            筛选
          </Button>
          <Search
            placeholder="搜索题目内容、ID..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="problem-search"
          />
          <Button
            icon={<ReloadOutlined />}
            className="refresh-button"
            onClick={() => fetchProblems(pagination.current, pagination.pageSize)}
          >
            刷新
          </Button>
        </div>
      </div>

      {/* 筛选面板 */}
      <AnimatePresence>
        {filterVisible && (
          <motion.div
            className="filter-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="filter-content">
              <div className="filter-group">
                <label className="filter-label">
                  <TagOutlined /> 难度
                </label>
                <Select
                  mode="multiple"
                  placeholder="选择难度"
                  value={filters.difficulty}
                  onChange={(value) => setFilters({ ...filters, difficulty: value })}
                  className="filter-select"
                  allowClear
                >
                  {[1, 2, 3, 4, 5].map((level) => (
                    <Option key={level} value={level}>
                      <div className="difficulty-option">
                        <StarFilled className="star-icon" />
                        <span>{'★'.repeat(level)}{'☆'.repeat(5 - level)}</span>
                      </div>
                    </Option>
                  ))}
                </Select>
              </div>

              <div className="filter-group">
                <label className="filter-label">
                  <DatabaseOutlined /> 来源
                </label>
                <Select
                  mode="multiple"
                  placeholder="选择来源"
                  value={filters.source}
                  onChange={(value) => setFilters({ ...filters, source: value })}
                  className="filter-select"
                  allowClear
                >
                  <Option value="OCR识别">OCR识别</Option>
                  <Option value="手动录入">手动录入</Option>
                </Select>
              </div>

              <div className="filter-group">
                <label className="filter-label">
                  <ClockCircleOutlined /> 状态
                </label>
                <Select
                  mode="multiple"
                  placeholder="选择状态"
                  value={filters.status}
                  onChange={(value) => setFilters({ ...filters, status: value })}
                  className="filter-select"
                  allowClear
                >
                  <Option value="pending">待补充</Option>
                  <Option value="completed">已完成</Option>
                  <Option value="archived">已归档</Option>
                </Select>
              </div>

              <div className="filter-group">
                <label className="filter-label">
                  <TagOutlined /> 题型
                </label>
                <Select
                  mode="multiple"
                  placeholder="选择题型"
                  value={filters.questionType}
                  onChange={(value) => setFilters({ ...filters, questionType: value })}
                  className="filter-select"
                  allowClear
                >
                  <Option value={QuestionType.CHOICE}>{QUESTION_TYPE_LABELS[QuestionType.CHOICE]}</Option>
                  <Option value={QuestionType.JUDGE}>{QUESTION_TYPE_LABELS[QuestionType.JUDGE]}</Option>
                  <Option value={QuestionType.FILL_BLANK}>{QUESTION_TYPE_LABELS[QuestionType.FILL_BLANK]}</Option>
                  <Option value={QuestionType.ESSAY}>{QUESTION_TYPE_LABELS[QuestionType.ESSAY]}</Option>
                  <Option value={QuestionType.OTHER}>{QUESTION_TYPE_LABELS[QuestionType.OTHER]}</Option>
                </Select>
              </div>

              <Button
                className="clear-filters-button"
                icon={<CloseOutlined />}
                onClick={() =>
                  setFilters({
                    difficulty: [],
                    source: [],
                    status: [],
                    questionType: [],
                  })
                }
              >
                清空筛选
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 统计信息条 */}
      <div className="problem-stats">
        <div className="stat-item">
          <DatabaseOutlined className="stat-icon" />
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">总题目</div>
          </div>
        </div>

        <div className="stat-divider" />

        <div className="stat-item">
          <CameraOutlined className="stat-icon stat-icon--purple" />
          <div className="stat-content">
            <div className="stat-value">{stats.ocr}</div>
            <div className="stat-label">OCR识别</div>
          </div>
        </div>

        <div className="stat-divider" />

        <div className="stat-item">
          <ClockCircleOutlined className="stat-icon stat-icon--orange" />
          <div className="stat-content">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">待补充</div>
          </div>
        </div>

        <div className="stat-divider" />

        <div className="stat-item">
          <CheckCircleOutlined className="stat-icon stat-icon--green" />
          <div className="stat-content">
            <div className="stat-value stat-value--green">{stats.completed}</div>
            <div className="stat-label">已完成</div>
          </div>
        </div>

        <div className="stat-divider" />

        <div className="filter-summary">
          {filteredProblems.length !== problems.length && (
            <>
              <span className="filter-summary-label">筛选结果:</span>
              <span className="filter-summary-count">{filteredProblems.length}</span>
              <span className="filter-summary-total">/ {problems.length}</span>
            </>
          )}
        </div>
      </div>

      {/* 题目卡片列表 */}
      <div className="problems-container">
        {loading && problems.length === 0 ? (
          <div className="loading-state">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>加载中...</p>
            </div>
          </div>
        ) : filteredProblems.length > 0 ? (
          <>
            <div className="problems-grid">
              {filteredProblems.map((problem, index) => (
                <motion.div
                  key={problem.id || problem.problem_id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  layout
                >
                  <ProblemCard problem={problem} onView={() => navigate(`/problems/${problem.problem_id}`)} />
                </motion.div>
              ))}
            </div>

            {pagination.current * pagination.pageSize < pagination.total && (
              <motion.div
                className="load-more-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  size="large"
                  className="load-more-button"
                  onClick={loadMore}
                  loading={loading}
                >
                  加载更多
                </Button>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                searchQuery || Object.values(filters).some((f) => f.length > 0)
                  ? '未找到匹配的题目'
                  : '暂无题目数据'
              }
            />
          </motion.div>
        )}
      </div>

      {/* OCR 识别模态框 */}
      <OCRModal
        visible={ocrModalVisible}
        onClose={() => setOcrModalVisible(false)}
        onSuccess={handleOCRSuccess}
      />
    </div>
  );
};

export default ProblemListPage;
