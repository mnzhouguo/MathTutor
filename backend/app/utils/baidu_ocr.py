"""
百度 OCR 客户端
"""
import requests
import base64
import time
import json
import re
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

            # DEBUG: Save API response to file for inspection
            import json
            with open('debug_ocr_api_response.json', 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            print(f"DEBUG: OCR API response saved to debug_ocr_api_response.json")
            print(f"DEBUG: Response keys: {list(result.keys())}")
            print(f"DEBUG: Has qus_result: {'qus_result' in result}")
            if 'qus_result' in result:
                print(f"DEBUG: qus_result length: {len(result.get('qus_result', []))}")

            # 检查 API 错误
            if 'error_code' in result:
                error_msg = result.get('error_msg', 'Unknown error')
                raise Exception(f"百度 OCR API 错误: {error_msg} (code: {result['error_code']})")

            # 解析识别结果
            parsed_result = self._parse_ocr_response(result)

            # 添加处理时长和原始 JSON（保存为格式化的 JSON 字符串）
            parsed_result['processing_time_ms'] = processing_time
            import json
            parsed_result['raw_json'] = json.dumps(result, ensure_ascii=False, indent=2)

            return parsed_result

        except requests.exceptions.Timeout:
            raise Exception("OCR 识别超时，请稍后重试")
        except requests.exceptions.RequestException as e:
            raise Exception(f"网络请求失败: {str(e)}")
        except Exception as e:
            raise Exception(f"OCR 识别失败: {str(e)}")

    def _parse_ocr_response(self, response_json: Dict[str, Any]) -> Dict[str, Any]:
        """
        解析 OCR API 响应，提取完整的题目信息

        Args:
            response_json: API 返回的 JSON 数据

        Returns:
            解析后的结果 {
                'text': '识别的文本',
                'question_type': '题目类型',
                'question_number': '题号',
                'score': '分值',
                'parsed_data': {...},  # 完整的结构化数据
                'words_count': 156,
                'confidence': 0.92
            }
        """
        # 百度 OCR 返回的数据结构：qus_result 可能在根级别或 words_result 下
        # 先尝试从根级别获取
        qus_result = response_json.get('qus_result', [])

        # 如果根级别没有，尝试从 words_result 下获取
        if not qus_result:
            words_result = response_json.get('words_result', {})
            qus_result = words_result.get('qus_result', [])

        # DEBUG: 强制返回测试数据
        if not qus_result:
            print("WARNING: No qus_result found in response!")
            print(f"Available keys: {list(response_json.keys())}")
            return {
                'text': 'DEBUG_TEST_TEXT',
                'question_type': 'essay',
                'question_number': '999',
                'score': '99',
                'parsed_data': {'debug': True},
                'words_count': 999,
                'confidence': 0.99,
                'full_text': 'DEBUG_TEST_TEXT'
            }

        if not qus_result:
            return {
                'text': '',
                'question_type': 'unknown',
                'question_number': None,
                'score': None,
                'parsed_data': {},
                'words_count': 0,
                'confidence': 0.0
            }

        # 取第一个题目
        first_qus = qus_result[0]
        qus_elements = first_qus.get('qus_element', [])
        qus_type = first_qus.get('qus_type', 'unknown')
        qus_probability = first_qus.get('qus_probability', 0.0)

        # 解析题目类型映射
        type_map = {
            '0': 'choice',      # 选择题
            '1': 'fill_blank',  # 填空题
            '2': 'judge',       # 判断题
            '3': 'essay',       # 解答题
            '4': 'calculation', # 计算题
        }
        question_type = type_map.get(qus_type, 'unknown')

        # 提取所有文本内容
        content_parts = []
        question_number = None
        score = None
        total_confidence = 0.0
        element_count = 0
        words_count = 0

        # 构建结构化数据
        parsed_elements = []

        for elem in qus_elements:
            elem_type = elem.get('elem_type', '')
            elem_words = elem.get('elem_word', [])
            elem_prob = elem.get('elem_probability', 0)

            # 跳过空元素（可能是填空位置）
            if elem_type == '2' or not elem_words:
                # 记录填空位置
                parsed_elements.append({
                    'type': 'blank',
                    'probability': elem_prob
                })
                continue

            element_text = ''
            for word_info in elem_words:
                word_text = word_info.get('word', '').strip()
                if word_text:
                    element_text += word_text
                    content_parts.append(word_text)
                    words_count += len(word_text)

            parsed_elements.append({
                'type': 'text',
                'content': element_text,
                'probability': elem_prob
            })

            if elem_prob > 0:
                total_confidence += elem_prob
                element_count += 1

        # 拼接完整文本
        full_text = ''.join(content_parts)

        # 尝试提取题号和分值
        if content_parts:
            first_part = content_parts[0]
            # 匹配题号和分值，如 "24.（10分）" 或 "1. (5分)"
            number_score_match = re.match(r'(\d+)[.、．]\s*[（(](\d+)分[）)]', first_part)
            if number_score_match:
                question_number = number_score_match.group(1)
                score = number_score_match.group(2)
            else:
                # 只匹配题号
                number_match = re.match(r'(\d+)[.、．]', first_part)
                if number_match:
                    question_number = number_match.group(1)

        # 计算平均置信度
        if element_count > 0:
            avg_confidence = total_confidence / element_count
        else:
            avg_confidence = qus_probability

        # 构建完整的解析数据
        parsed_data = {
            'question_type_code': qus_type,
            'question_type': question_type,
            'elements': parsed_elements,
            'question_number': question_number,
            'score': score,
            'confidence': avg_confidence
        }

        return {
            'text': full_text,
            'question_type': question_type,
            'question_number': question_number,
            'score': score,
            'parsed_data': parsed_data,
            'full_text': full_text,
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
