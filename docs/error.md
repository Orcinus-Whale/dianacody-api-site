# 错误码说明

所有错误返回均遵循统一格式：

```json
{
  "error": {
    "code": "invalid_api_key",
    "message": "API密钥无效"
  }
}
```

## 常见错误码

| HTTP状态码 | 错误码 | 说明 |
|------------|--------|------|
| 401 | invalid_api_key | 密钥无效或已过期 |
| 429 | rate_limit_exceeded | 请求频率超限 |
| 400 | invalid_request | 请求参数错误 |
| 500 | internal_error | 服务端内部错误 |

## 重试策略

遇到 5xx 错误或 429 限流时，建议使用指数退避算法进行重试，最多重试3次。
