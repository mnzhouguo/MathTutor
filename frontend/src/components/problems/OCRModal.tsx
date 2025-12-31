/**
 * OCR 识别模态框组件 - 学术极简主义设计
 */
import React, { useState } from 'react';
import {
  Modal,
  Upload,
  message,
  Progress,
  Button,
  Descriptions,
  Tag
} from 'antd';
import {
  InboxOutlined,
  EyeOutlined,
  PlusOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { problemsApi, type OCRResult } from '../../api/problemsApi';
import './OCRModal.css';

const { Dragger } = Upload;

interface OCRModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (problemId: string) => void;
}

const OCRModal: React.FC<OCRModalProps> = ({ visible, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'success'>('upload');
  const [, setUploadedFile] = useState<File | null>(null);
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
      const result = await problemsApi.recognizeAndSave(file);

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
      title={
        <div className="ocr-modal-title">
          <span className="title-icon">📷</span>
          <span>OCR 图像识别</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
      className="ocr-modal"
      centered
    >
      {currentStep === 'upload' && (
        <div className="ocr-upload-step">
          <Dragger {...uploadProps} className="ocr-uploader">
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽图片到此处上传</p>
            <p className="ant-upload-hint">
              支持 JPG、PNG 格式，建议分辨率 ≥ 1024x768
            </p>
          </Dragger>

          <div className="ocr-upload-tips">
            <p className="tips-title">💡 提示：</p>
            <ul className="tips-list">
              <li>单次上传一张图片，每张图片应仅包含一道题目</li>
              <li>确保图片清晰，文字无模糊</li>
              <li>建议使用试卷、教材的高清扫描件</li>
            </ul>
          </div>
        </div>
      )}

      {currentStep === 'processing' && (
        <div className="ocr-processing-step">
          <div className="processing-animation">
            <div className="pulse-ring"></div>
            <div className="pulse-ring delay-1"></div>
            <div className="pulse-ring delay-2"></div>
            <span className="processing-icon">🔍</span>
          </div>
          <h3 className="processing-title">正在识别中...</h3>
          <Progress
            percent={progress}
            status="active"
            strokeColor={{
              '0%': '#1A56DB',
              '100%': '#8B5CF6',
            }}
            className="processing-progress"
          />
          <p className="processing-status">
            预计剩余时间：{progress < 100 ? '几秒' : '完成中...'}
          </p>

          <div className="processing-steps">
            <p className="steps-title">识别步骤：</p>
            <ul className="steps-list">
              <li className="step-completed">✅ 1. 上传图片完成</li>
              <li className={progress < 50 ? 'step-pending' : 'step-completed'}>
                {progress < 50 ? '⏳' : '✅'} 2. OCR 文字识别...
              </li>
              <li className={progress < 80 ? 'step-pending' : 'step-completed'}>
                {progress < 80 ? '⏳' : '✅'} 3. 正在保存到题库...
              </li>
            </ul>
          </div>
        </div>
      )}

      {currentStep === 'success' && ocrResult && (
        <div className="ocr-success-step">
          <div className="success-animation">
            <div className="success-checkmark">✓</div>
          </div>
          <h3 className="success-title">识别成功！</h3>
          <p className="success-subtitle">题目已自动保存到题库</p>

          <div className="success-actions">
            <Button
              type="primary"
              size="large"
              className="action-button action-button-primary"
              icon={<EyeOutlined />}
              onClick={handleViewDetail}
            >
              查看详情
            </Button>
            <Button
              size="large"
              className="action-button action-button-secondary"
              icon={<PlusOutlined />}
              onClick={handleContinue}
            >
              继续识别
            </Button>
            <Button
              size="large"
              className="action-button action-button-default"
              onClick={onClose}
            >
              关闭
            </Button>
          </div>

          <Descriptions
            title="识别信息"
            bordered={false}
            column={1}
            className="ocr-descriptions"
          >
            <Descriptions.Item label="题目ID">
              <code className="result-code">{ocrResult.problem_id}</code>
            </Descriptions.Item>
            <Descriptions.Item label="OCR置信度">
              <Tag
                className={`confidence-tag confidence-${
                  ocrResult.confidence_score! >= 0.9
                    ? 'high'
                    : ocrResult.confidence_score! >= 0.7
                    ? 'medium'
                    : 'low'
                }`}
              >
                {(ocrResult.confidence_score! * 100).toFixed(1)}%
              </Tag>
              {ocrResult.confidence_score! >= 0.9 && (
                <Tag className="quality-tag" color="success">
                  高质量
                </Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="处理时长">
              <span className="result-value">{ocrResult.processing_time_ms}ms</span>
            </Descriptions.Item>
            <Descriptions.Item label="识别字数">
              <span className="result-value">{ocrResult.words_count} 个字符</span>
            </Descriptions.Item>
          </Descriptions>

          {ocrResult.content && (
            <div className="ocr-content-preview">
              <h4 className="preview-title">识别内容预览：</h4>
              <div className="preview-content">
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
