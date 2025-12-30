/**
 * 题目详情页面
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Button,
  Descriptions,
  Tag,
  Space,
  message,
  Modal,
  Input,
  Select,
  Rate
} from 'antd';
import {
  ArrowLeftOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  RotateRightOutlined,
  DownloadOutlined,
  ReloadOutlined,
  EditOutlined,
  SaveOutlined,
  RollbackOutlined
} from '@ant-design/icons';
import { getProblemDetail, updateProblem, type Problem } from '../services/ocrService';

const ProblemDetailPage: React.FC = () => {
  const { problemId } = useParams<{ problemId: string }>();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Problem>>({});
  const [imageScale, setImageScale] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);

  // 获取题目详情
  const fetchProblemDetail = async () => {
    if (!problemId) return;

    setLoading(true);
    try {
      const data = await getProblemDetail(problemId);
      setProblem(data);
      setEditForm(data);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblemDetail();
  }, [problemId]);

  // 开始编辑
  const handleEdit = () => {
    setEditing(true);
    setEditForm(problem!);
  };

  // 取消编辑
  const handleCancel = () => {
    setEditing(false);
    setEditForm(problem!);
  };

  // 保存修改
  const handleSave = async () => {
    try {
      const updated = await updateProblem(problemId!, editForm);
      setProblem(updated);
      setEditing(false);
      message.success('保存成功');
    } catch (error: any) {
      message.error(error.message);
    }
  };

  // 重新识别
  const handleReRecognize = () => {
    Modal.confirm({
      title: '确认重新识别',
      content: '确定要重新识别吗？这将覆盖当前的识别结果。',
      onOk: async () => {
        message.info('重新识别功能开发中...');
      },
    });
  };

  // 图片操作
  const handleZoomIn = () => setImageScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setImageScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setImageRotation((prev) => (prev + 90) % 360);
  const handleDownload = () => {
    if (!problem?.ocr_record_id) return;
    message.info('下载功能开发中...');
  };

  if (loading) {
    return <Card loading={loading} />;
  }

  if (!problem) {
    return (
      <Card>
        <p>题目不存在</p>
        <Button onClick={() => navigate('/problems')}>返回列表</Button>
      </Card>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* 顶部导航 */}
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/problems')}>
            返回题库
          </Button>
          <span style={{ fontSize: 18, fontWeight: 'bold' }}>
            题目详情 - {problem.problem_id}
          </span>
        </Space>
      </Card>

      <Row gutter={16}>
        {/* 左侧：原始图片区域 */}
        <Col span={10}>
          <Card title="原始图片" style={{ height: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Space>
                <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} disabled={!problem.ocr_record_id} />
                <Button onClick={() => setImageScale(1)} disabled={!problem.ocr_record_id}>
                  重置
                </Button>
                <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} disabled={!problem.ocr_record_id} />
                <Button icon={<RotateRightOutlined />} onClick={handleRotate} disabled={!problem.ocr_record_id} />
                <Button icon={<DownloadOutlined />} onClick={handleDownload} disabled={!problem.ocr_record_id}>
                  下载
                </Button>
              </Space>
            </div>

            <div
              style={{
                border: '1px solid #d9d9d9',
                borderRadius: 4,
                padding: 16,
                minHeight: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fafafa',
              }}
            >
              {problem.ocr_record_id ? (
                <img
                  src={`http://localhost:8000/uploads/ocr/test.jpg`}
                  alt="原始图片"
                  style={{
                    maxWidth: '100%',
                    transform: `scale(${imageScale}) rotate(${imageRotation}deg)`,
                    transition: 'transform 0.3s',
                  }}
                />
              ) : (
                <p style={{ color: '#999' }}>无原始图片</p>
              )}
            </div>

            <Descriptions size="small" column={1} style={{ marginTop: 16 }}>
              <Descriptions.Item label="文件名">
                {problem.ocr_record_id ? 'question_001.jpg' : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="分辨率">
                {problem.ocr_record_id ? '2048x1536' : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="大小">
                {problem.ocr_record_id ? '1.2 MB' : '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* 右侧：识别结果与操作区域 */}
        <Col span={14}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* 题目基本信息 */}
            <Card
              title="📋 题目信息"
              extra={
                <Space>
                  {editing ? (
                    <>
                      <Button icon={<SaveOutlined />} type="primary" onClick={handleSave}>
                        保存
                      </Button>
                      <Button icon={<RollbackOutlined />} onClick={handleCancel}>
                        取消
                      </Button>
                    </>
                  ) : (
                    <Button icon={<EditOutlined />} onClick={handleEdit}>
                      编辑
                    </Button>
                  )}
                </Space>
              }
            >
              <Descriptions column={2} size="small">
                <Descriptions.Item label="题目ID">{problem.problem_id}</Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {new Date(problem.created_at).toLocaleString('zh-CN')}
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag
                    color={
                      problem.status === 'completed'
                        ? 'green'
                        : problem.status === 'pending'
                        ? 'orange'
                        : 'default'
                    }
                  >
                    {problem.status === 'completed' ? '已完成' : problem.status === 'pending' ? '待补充' : problem.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="质量等级">
                  {problem.quality_score && (
                    <Tag
                      color={
                        problem.quality_score === 'A'
                          ? 'green'
                          : problem.quality_score === 'B'
                          ? 'orange'
                          : 'red'
                      }
                    >
                      {problem.quality_score}级
                    </Tag>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 识别结果 */}
            <Card title="✍️ 识别结果">
              {editing ? (
                <Input.TextArea
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  rows={10}
                  placeholder="识别内容"
                />
              ) : (
                <div
                  style={{
                    padding: 16,
                    background: '#f5f5f5',
                    borderRadius: 4,
                    whiteSpace: 'pre-wrap',
                    maxHeight: 300,
                    overflow: 'auto',
                  }}
                >
                  {problem.content}
                </div>
              )}
            </Card>

            {/* OCR 质量报告 */}
            {problem.ocr_record_id && (
              <Card title="📊 OCR 质量报告">
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="置信度">
                    <Tag color="green">92%</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="质量评级">
                    <Tag color="green">⭐⭐⭐⭐⭐</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="识别准确率">95%</Descriptions.Item>
                  <Descriptions.Item label="处理时长">2.3 秒</Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {/* 题目元数据 */}
            <Card title="🎯 题目元数据">
              <Descriptions column={1} layout="vertical" size="small">
                <Descriptions.Item label="题型">
                  {editing ? (
                    <Select
                      value={editForm.question_type}
                      onChange={(value) => setEditForm({ ...editForm, question_type: value })}
                      style={{ width: 200 }}
                    >
                      <Select.Option value="选择题">选择题</Select.Option>
                      <Select.Option value="填空题">填空题</Select.Option>
                      <Select.Option value="计算题">计算题</Select.Option>
                      <Select.Option value="应用题">应用题</Select.Option>
                      <Select.Option value="证明题">证明题</Select.Option>
                    </Select>
                  ) : (
                    problem.question_type || '-'
                  )}
                </Descriptions.Item>

                <Descriptions.Item label="难度等级">
                  {editing ? (
                    <Rate
                      value={editForm.difficulty || 0}
                      onChange={(value) => setEditForm({ ...editForm, difficulty: value })}
                    />
                  ) : (
                    problem.difficulty ? (
                      <span style={{ color: '#faad14' }}>
                        {'★'.repeat(problem.difficulty)}
                        {'☆'.repeat(5 - problem.difficulty)}
                      </span>
                    ) : (
                      '-'
                    )
                  )}
                </Descriptions.Item>

                <Descriptions.Item label="标签">
                  {problem.tags || '-'}
                </Descriptions.Item>

                <Descriptions.Item label="来源">{problem.source}</Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 操作按钮 */}
            <Card>
              <Space>
                <Button icon={<ReloadOutlined />} onClick={handleReRecognize}>
                  重新识别
                </Button>
                <Button danger>删除题目</Button>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default ProblemDetailPage;
