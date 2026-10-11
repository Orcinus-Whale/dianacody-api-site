# 对话补全接口

## 接口地址

`POST https://api.dianacody.com/v1/chat/completions`

## 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| model | string | 是 | 模型名称 |
| messages | array | 是 | 对话消息列表 |
| temperature | float | 否 | 采样温度，默认0.7 |
| stream | boolean | 否 | 是否流式返回，默认false |

## 响应示例

```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "你好，我是Orcinus AI"
    },
    "finish_reason": "stop"
  }]
}
```
