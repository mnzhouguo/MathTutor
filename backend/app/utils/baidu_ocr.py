"""
百度 OCR 客户端
"""
import requests
import base64
import time
from typing import Dict, Any, Optional
from app.core.config import get_settings

settings = get_settings()


class BaiduOCRClient:
    """百度 OCR API 客户端"""

    def __init__(self):
        self.api_key = settings.baidu_ocr_api_key
        self.secret_key = settings.baidu_ocr_secret_key
        self._access_token = None
        self._token_expiry = None

    def get_access_token(self) -> str:
        """
        获取 Access Token（带缓存）

        使用 AK，SK 生成鉴权签名
        """
        # 检查 token 是否有效
        if self._access_token and self._token_expiry:
            if time.time() < self._token_expiry:
                return self._access_token

        # 获取新 token
        url = "https://aip.baidubce.com/oauth/2.0/token"
        params = {
            "grant_type": "client_credentials",
            "client_id": self.api_key,
            "client_secret": self.secret_key
        }

        try:
            response = requests.post(url, params=params, timeout=10)
            response.raise_for_status()
            result = response.json()

            access_token = result.get("access_token")
            if not access_token:
                raise ValueError("Failed to get access token")

            # 缓存 token（有效期 30 天，提前 1 天刷新）
            self._access_token = access_token
            self._token_expiry = time.time() + (29 * 24 * 3600)

            return access_token

        except Exception as e:
            raise Exception(f"获取 Access Token 失败: {str(e)}")

    def recognize_paper_cut_edu(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        使用教育场景识别接口识别图片

        Args:
            image_bytes: 图片二进制数据

        Returns:
            识别结果字典
        """
        # 获取 access token
        access_token = self.get_access_token()

        # 构建 URL
        url = f"https://aip.baidubce.com/rest/2.0/ocr/v1/paper_cut_edu?access_token={access_token}"

        # 编码图片
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')

        # 请求参数
        payload = {
            'image': image_base64,
            'language_type': 'CHN_ENG',
            'detect_direction': 'false',
            'words_type': 'handprint_mix',
            'splice_text': 'false',
            'enhance': 'false'
        }

        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        }

        try:
            start_time = time.time()
            response = requests.post(
                url,
                data=payload,
                headers=headers,
                timeout=30
            )
            response.raise_for_status()

            processing_time = int((time.time() - start_time) * 1000)
            result = response.json()

            # 检查 API 错误
            if 'error_code' in result:
                error_msg = result.get('error_msg', 'Unknown error')
                raise Exception(f"百度 OCR API 错误: {error_msg} (code: {result['error_code']})")

            # 解析识别结果
            parsed_result = self._parse_ocr_response(result)

            # 添加处理时长
            parsed_result['processing_time_ms'] = processing_time
            parsed_result['raw_json'] = str(result)

            return parsed_result

        except requests.exceptions.Timeout:
            raise Exception("OCR 识别超时，请稍后重试")
        except requests.exceptions.RequestException as e:
            raise Exception(f"网络请求失败: {str(e)}")
        except Exception as e:
            raise Exception(f"OCR 识别失败: {str(e)}")

    def _parse_ocr_response(self, response_json: Dict[str, Any]) -> Dict[str, Any]:
        """
        解析 OCR API 响应

        Args:
            response_json: API 返回的 JSON 数据

        Returns:
            解析后的结果 {
                'text': '识别的文本',
                'words_count': 156,
                'confidence': 0.92
            }
        """
        text_parts = []
        total_confidence = 0.0
        element_count = 0
        words_count = 0

        # 提取文字和置信度
        words_result = response_json.get('words_result', {})
        qus_result = words_result.get('qus_result', [])

        for qus in qus_result:
            qus_elements = qus.get('qus_element', [])
            for elem in qus_elements:
                elem_content = elem.get('elem_content', '')
                elem_prob = elem.get('elem_probability', 0)

                if elem_content:
                    text_parts.append(elem_content)
                    words_count += len(elem_content)

                if elem_prob > 0:
                    total_confidence += elem_prob
                    element_count += 1

        # 计算平均置信度
        avg_confidence = total_confidence / element_count if element_count > 0 else 0.0

        return {
            'text': ''.join(text_parts),
            'words_count': words_count,
            'confidence': round(avg_confidence, 4)
        }

    def assess_quality(self, confidence: float) -> Dict[str, Any]:
        """
        评估识别质量

        Args:
            confidence: 置信度 (0-1)

        Returns:
            质量评估结果 {
                'grade': 'A',
                'action': 'auto_approve',
                'label': '✓ 高质量',
                'color': 'green'
            }
        """
        if confidence >= 0.90:
            return {
                'grade': 'A',
                'action': 'auto_approve',
                'label': '✓ 高质量',
                'color': 'green'
            }
        elif confidence >= 0.70:
            return {
                'grade': 'B',
                'action': 'manual_review',
                'label': '⚠ 需确认',
                'color': 'orange'
            }
        else:
            return {
                'grade': 'C',
                'action': 're_enter',
                'label': '✗ 低质量',
                'color': 'red'
            }
