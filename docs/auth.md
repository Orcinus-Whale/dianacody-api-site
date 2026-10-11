# 鉴权说明

Orcinus AI API 使用 Bearer Token 进行身份鉴权。

## 请求头格式

所有请求必须在 HTTP Header 中携带 Authorization 字段：

```
Authorization: Bearer YOUR_API_KEY
```

## 密钥权限

不同 API Key 支持调用的接口范围不同，你可以在控制台为每个密钥配置独立的权限，遵循最小权限原则。

## 常见鉴权错误

如果返回 401 错误，请检查：
1. 密钥是否正确拼写
2. 密钥是否已经被禁用
3. 是否正确携带了 Bearer 前缀
