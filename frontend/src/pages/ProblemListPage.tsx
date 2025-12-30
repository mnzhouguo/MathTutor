/**
 * 题库管理列表页面
 */
import React, { useEffect, useState } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Tag,
  Statistic,
  Row,
  Col,
  message,
  Modal
} from 'antd';
import {
  CameraOutlined,
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { getProblems, type Problem } from '../services/ocrService';
import OCRModal from '../components/problems/OCRModal';

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

  // 获取题目列表
  const fetchProblems = async (page: number = 1, size: number = 20) => {
    setLoading(true);
    try {
      const response = await getProblems(page, size);
      setProblems(response.items);
      setPagination({
        current: response.page,
        pageSize: response.size,
        total: response.total,
      });
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchProblems();
  }, []);

  // 表格列定义
  const columns: ColumnsType<Problem> = [
    {
      title: 'ID',
      dataIndex: 'problem_id',
      key: 'problem_id',
      width: 150,
      render: (text: string) => <code>{text}</code>,
    },
    {
      title: '题目内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (text: string) => (
        <div style={{ maxWidth: 400 }}>
          {text.length > 100 ? `${text.substring(0, 100)}...` : text}
        </div>
      ),
    },
    {
      title: '题型',
      dataIndex: 'question_type',
      key: 'question_type',
      width: 100,
      render: (type: string) => type || '-',
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 120,
      render: (difficulty: number) => {
        if (!difficulty) return '-';
        const stars = '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
        return <span style={{ color: '#faad14' }}>{stars}</span>;
      },
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 100,
      render: (source: string) => {
        const color = source === 'OCR识别' ? 'blue' : 'default';
        return <Tag color={color}>{source}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          pending: { text: '待补充', color: 'orange' },
          completed: { text: '已完成', color: 'green' },
          archived: { text: '已归档', color: 'default' },
        };
        const { text, color } = statusMap[status] || { text: status, color: 'default' };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/problems/${record.problem_id}`)}
        >
          查看
        </Button>
      ),
    },
  ];

  // OCR 识别成功回调
  const handleOCRSuccess = (problemId: string) => {
    message.success(`题目 ${problemId} 已成功保存`);
    fetchProblems(pagination.current, pagination.pageSize);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        {/* 顶部操作栏 */}
        <Space
          style={{
            marginBottom: 24,
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          <Space>
            <Button
              type="primary"
              size="large"
              icon={<CameraOutlined />}
              onClick={() => setOcrModalVisible(true)}
            >
              OCR 图像识别
            </Button>
            <Button icon={<SearchOutlined />}>筛选</Button>
            <Input.Search
              placeholder="搜索题目..."
              style={{ width: 300 }}
              onSearch={(value) => console.log('搜索:', value)}
            />
          </Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchProblems(pagination.current, pagination.pageSize)}
          >
            刷新
          </Button>
        </Space>

        {/* 统计卡片 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic title="总题目数" value={pagination.total} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="OCR识别"
                value={problems.filter((p) => p.source === 'OCR识别').length}
                suffix="道"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="待补充元数据"
                value={problems.filter((p) => p.status === 'pending').length}
                suffix="道"
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="已入库"
                value={problems.filter((p) => p.status === 'completed').length}
                suffix="道"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 题目列表表格 */}
        <Table
          columns={columns}
          dataSource={problems}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 道题目`,
            onChange: (page, pageSize) => {
              fetchProblems(page, pageSize);
            },
          }}
        />
      </Card>

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
