# 快速开始

欢迎使用 Orcinus AI 开发者 API。本文档将帮助你快速完成接口调用的基础配置。

## 第一步：获取API密钥

登录控制台，在「密钥管理」页面创建新的 API Key。请妥善保管你的密钥，不要在前端代码或公开仓库中泄露。

```bash
# 示例请求格式
curl https://api.dianacody.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "orcinus-chat-v1",
    "messages": [{"role": "user", "content": "你好"}]
  }'
```
python代码：
```python
# 示例请求格式
import numpy as np
import pandas as pd
import torch
import torch.nn as nn

printf('hello')
nn.Conv2d(10,20,30)
```
java代码：
```java
# 示例请求格式
import java.util.ArrayList;

public static void Hello(String s) {
  System.out.println('hfjie');
}
```
c++代码：
```c++
# include<stdio>
# include<iostream>

using namespace std;

void main(int argc, char** argv) {
  printf("%s\n", s);
}
```


## 第二步：测试连通性

使用上面的 curl 命令替换你的真实 API Key，发送测试请求。如果返回正常的 JSON 结果，说明你已经完成基础配置。

## 第三步：测试文字

使用上面的 curl 命令替换你的真实 API Key，发送测试请求。如果返回正常的 JSON 结果，说明你已经完成基础配置。
使用上面的 curl 命令替换你的真实 API Key，发送测试请求。如果返回正常的 JSON 结果，说明你已经完成基础配置。
使用上面的 curl 命令替换你的真实 API Key，发送测试请求。如果返回正常的 JSON 结果，说明你已经完成基础配置。
使用上面的 curl 命令替换你的真实 API Key，发送测试请求。如果返回正常的 JSON 结果，说明你已经完成基础配置。
使用上面的 curl 命令替换你的真实 API Key，发送测试请求。如果返回正常的 JSON 结果，说明你已经完成基础配置。
使用上面的 curl 命令替换你的真实 API Key，发送测试请求。如果返回正常的 JSON 结果，说明你已经完成基础配置。

### 3.1 测试一段小文字
使用上面的 curl 命令替换你的真实 API Key，发送测试请求。如果返回正常的 JSON 结果，说明你已经完成基础配置。
使用上面的 curl 命令替换你的真实 API Key，发送测试请求。如果返回正常的 JSON 结果，说明你已经完成基础配置。
使用上面的 curl 命令替换你的真实 API Key，发送测试请求。如果返回正常的 JSON 结果，说明你已经完成基础配置。

#### 3.1.1 小文字测试样例
使用上面的 curl 命令替换你的真实 API Key，发送测试请求。如果返回正常的 JSON 结果，说明你已经完成基础配置。

### 3.2 测试一段大文字
使用上面的 curl 命令替换你的真实 API Key，发送测试请求。如果返回正常的 JSON 结果，说明你已经完成基础配置。
使用上面的 curl 命令替换你的真实 API Key，发送测试请求。如果返回正常的 JSON 结果，说明你已经完成基础配置。
使用上面的 curl 命令替换你的真实 API Key，发送测试请求。如果返回正常的 JSON 结果，说明你已经完成基础配置。

## 第四步：测试文字

使用上面的 curl 命令替换你的真实 API Key，发送测试请求。如果返回正常的 JSON 结果，说明你已经完成基础配置。
使用上面的 curl 命令替换你的真实 API Key，发送测试请求。如果返回正常的 JSON 结果，说明你已经完成基础配置。
使用上面的 curl 命令替换你的真实 API Key，发送测试请求。如果返回正常的 JSON 结果，说明你已经完成基础配置。
使用上面的 curl 命令替换你的真实 API Key，发送测试请求。如果返回正常的 JSON 结果，说明你已经完成基础配置。
使用上面的 curl 命令替换你的真实 API Key，发送测试请求。如果返回正常的 JSON 结果，说明你已经完成基础配置。
使用上面的 curl 命令替换你的真实 API Key，发送测试请求。如果返回正常的 JSON 结果，说明你已经完成基础配置。

## 第五步：测试文字

使用上面的 curl 命令替换你的真实 API Key，发送测试请求。如果返回正常的 JSON 结果，说明你已经完成基础配置。
使用上面的 curl 命令替换你的真实 API Key，发送测试请求。如果返回正常的 JSON 结果，说明你已经完成基础配置。
使用上面的 curl 命令替换你的真实 API Key，发送测试请求。如果返回正常的 JSON 结果，说明你已经完成基础配置。
使用上面的 curl 命令替换你的真实 API Key，发送测试请求。如果返回正常的 JSON 结果，说明你已经完成基础配置。
使用上面的 curl 命令替换你的真实 API Key，发送测试请求。如果返回正常的 JSON 结果，说明你已经完成基础配置。
使用上面的 curl 命令替换你的真实 API Key，发送测试请求。如果返回正常的 JSON 结果，说明你已经完成基础配置。

## 基础请求规范

所有接口均支持 HTTPS 调用，请求超时建议设置为 30 秒。返回数据格式为标准 JSON，错误时会在 `error` 字段返回详细错误信息。
