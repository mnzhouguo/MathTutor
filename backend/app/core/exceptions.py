"""
统一异常定义
"""
from typing import Optional


class MathTutorException(Exception):
    """
    基础异常类

    所有业务异常都应该继承此类
    """

    def __init__(
        self,
        message: str,
        code: str = "INTERNAL_ERROR",
        status_code: int = 400,
        details: Optional[dict] = None
    ):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}
        super().__init__(message)

    def to_dict(self) -> dict:
        """转换为字典格式"""
        return {
            "success": False,
            "error": self.message,
            "error_code": self.code,
            "details": self.details
        }


class NotFoundException(MathTutorException):
    """资源未找到异常"""

    def __init__(self, resource: str, identifier: str = ""):
        message = f"{resource} '{identifier}' 不存在" if identifier else f"{resource} 不存在"
        super().__init__(
            message=message,
            code="NOT_FOUND",
            status_code=404
        )


class ValidationException(MathTutorException):
    """数据验证异常"""

    def __init__(self, message: str, field: Optional[str] = None):
        details = {"field": field} if field else {}
        super().__init__(
            message=message,
            code="VALIDATION_ERROR",
            status_code=400,
            details=details
        )


class BusinessRuleException(MathTutorException):
    """业务规则违反异常"""

    def __init__(self, message: str, rule: Optional[str] = None):
        details = {"rule": rule} if rule else {}
        super().__init__(
            message=message,
            code="BUSINESS_RULE_VIOLATION",
            status_code=400,
            details=details
        )


class ExternalServiceException(MathTutorException):
    """外部服务异常"""

    def __init__(self, service: str, detail: str):
        super().__init__(
            message=f"{service} 服务异常: {detail}",
            code="EXTERNAL_SERVICE_ERROR",
            status_code=502,
            details={"service": service, "detail": detail}
        )


class ConfigurationException(MathTutorException):
    """配置错误异常"""

    def __init__(self, message: str):
        super().__init__(
            message=message,
            code="CONFIGURATION_ERROR",
            status_code=500
        )


class AuthenticationException(MathTutorException):
    """认证异常"""

    def __init__(self, message: str = "认证失败"):
        super().__init__(
            message=message,
            code="AUTHENTICATION_FAILED",
            status_code=401
        )


class AuthorizationException(MathTutorException):
    """授权异常"""

    def __init__(self, message: str = "权限不足"):
        super().__init__(
            message=message,
            code="AUTHORIZATION_FAILED",
            status_code=403
        )
