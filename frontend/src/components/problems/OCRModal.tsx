/**
 * OCR 识别模态框组件
 */
import React, { useState } from 'react';
import {
  Modal,
  Upload,
  message,
  Progress,
  Button,
  Space,
  Result,
  Descriptions,
  Tag
} from 'antd';
import {
  UploadOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  PlusOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { recognizeAndSave, type OCRResult } from '../../services/ocrService';

const { Dragger } = Upload;

interface OCRModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (problemId: string) => void;
}

const OCRModal: React.FC<OCRModalProps> = ({ visible, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'success'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [progress, setProgress] = useState(0);

  // 处理文件选择
  const handleFileSelect = async (file: File) => {
    // 验证文件大小
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      message.error('文件大小不能超过 5MB');
      return false;
    }

    // 验证文件类型
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件');
      return false;
    }

    setUploadedFile(file);
    setCurrentStep('processing');
    setProgress(0);

    // 模拟进度动画
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // 调用 OCR API
      const result = await recognizeAndSave(file);

      clearInterval(progressInterval);
      setProgress(100);

      if (result.success) {
        setOcrResult(result);
        setCurrentStep('success');
        onSuccess?.(result.problem_id!);
        message.success('OCR 识别成功！');
      } else {
        message.error(`识别失败：${result.error}`);
        setCurrentStep('upload');
      }
    } catch (error: any) {
      clearInterval(progressInterval);
      message.error(error.message || 'OCR 识别失败');
      setCurrentStep('upload');
    }

    return false; // 阻止自动上传
  };

  // 继续识别
  const handleContinue = () => {
    setUploadedFile(null);
    setOcrResult(null);
    setProgress(0);
    setCurrentStep('upload');
  };

  // 查看详情
  const handleViewDetail = () => {
    if (ocrResult?.problem_id) {
      window.location.href = `/problems/${ocrResult.problem_id}`;
    }
  };

  // 上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: 'image/jpeg,image/jpg,image/png',
    beforeUpload: handleFileSelect,
    showUploadList: false,
  };

  return (
    <Modal
      title="OCR 图像识别"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
      destroyOnClose
    >
      {currentStep === 'upload' && (
        <div style={{ padding: '20px 0' }}>
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ fontSize: 64, color: '#1890ff' }} />
            </p>
            <p className="ant-upload-text">点击或拖拽图片到此处上传</p>
            <p className="ant-upload-hint">
              支持 JPG、PNG 格式，建议分辨率 ≥ 1024x768
            </p>
          </Dragger>

          <div style={{ marginTop: 24, color: '#666' }}>
            <p>提示：</p>
            <ul style={{ paddingLeft: 20 }}>
              <li>单次上传一张图片，每张图片应仅包含一道题目</li>
              <li>确保图片清晰，文字无模糊</li>
              <li>建议使用试卷、教材的高清扫描件</li>
            </ul>
          </div>
        </div>
      )}

      {currentStep === 'processing' && (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>🔍</div>
          <h3>正在识别中...</h3>
          <Progress percent={progress} status="active" style={{ marginBottom: 16 }} />
          <p style={{ color: '#666' }}>
            预计剩余时间：{progress < 100 ? '几秒' : '完成中...'}
          </p>

          <div style={{ marginTop: 32, textAlign: 'left', maxWidth: 400, margin: '0 auto' }}>
            <p>识别步骤：</p>
            <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
              <li>✅ 1. 上传图片完成</li>
              <li>{progress < 50 ? '⏳' : '✅'} 2. OCR 文字识别...</li>
              <li>{progress < 80 ? '⏳' : '✅'} 3. 正在保存到题库...</li>
            </ul>
          </div>
        </div>
      )}

      {currentStep === 'success' && ocrResult && (
        <div style={{ padding: '20px 0' }}>
          <Result
            status="success"
            title="识别成功！"
            subTitle="题目已自动保存到题库"
            extra={[
              <Button type="primary" key="detail" icon={<EyeOutlined />} onClick={handleViewDetail}>
                查看详情
              </Button>,
              <Button key="continue" icon={<PlusOutlined />} onClick={handleContinue}>
                继续识别
              </Button>,
              <Button key="close" onClick={onClose}>
                关闭
              </Button>,
            ]}
          />

          <Descriptions
            title="识别信息"
            bordered
            column={1}
            style={{ marginTop: 24 }}
          >
            <Descriptions.Item label="题目ID">{ocrResult.problem_id}</Descriptions.Item>
            <Descriptions.Item label="OCR置信度">
              <Tag
                color={
                  ocrResult.confidence_score! >= 0.9
                    ? 'green'
                    : ocrResult.confidence_score! >= 0.7
                    ? 'orange'
                    : 'red'
                }
              >
                {(ocrResult.confidence_score! * 100).toFixed(1)}%
              </Tag>
              {ocrResult.confidence_score! >= 0.9 && (
                <Tag color="green" style={{ marginLeft: 8 }}>
                  高质量
                </Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="处理时长">
              {ocrResult.processing_time_ms}ms
            </Descriptions.Item>
            <Descriptions.Item label="识别字数">{ocrResult.words_count} 个字符</Descriptions.Item>
          </Descriptions>

          {ocrResult.content && (
            <div style={{ marginTop: 24 }}>
              <h4>识别内容预览：</h4>
              <div
                style={{
                  padding: 16,
                  background: '#f5f5f5',
                  borderRadius: 4,
                  marginTop: 8,
                  maxHeight: 200,
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {ocrResult.content}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default OCRModal;
