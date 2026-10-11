# 向量嵌入接口

## 接口地址

`POST https://api.dianacody.com/v1/embeddings`

## 功能说明

将文本转换为 1024 维向量，用于语义搜索、RAG 知识库等场景。

## 请求示例

```bash
curl https://api.dianacody.com/v1/embeddings \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"input": "测试文本", "model": "orcinus-embedding-v1"}'
```
