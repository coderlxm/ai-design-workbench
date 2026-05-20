# 豆包 API 对接说明（开发环境）

## 固定配置
- API Key（按当前需求直接前端固定）：`ark-a23be4d7-7563-4555-a8b2-6349db42552b-c9f9b`
- 接口：`POST https://ark.cn-beijing.volces.com/api/v3/images/generations`
- 模型：`doubao-seedream-5-0-260128`

## 当前代码接入点
- 服务文件：`src/services/doubaoImage.ts`
- 线稿阶段：`generateLineArtWithDoubao`
- 最终生图阶段：`generateFinalArtworkWithDoubao`
- 工作流调用：`src/composables/useGenerationFlow.ts`

## CORS 处理（已实现）
- 浏览器不直连豆包域名，走 Vite 本地代理：
  - 前端请求路径：`/api/doubao/images/generations`
  - 代理转发目标：`https://ark.cn-beijing.volces.com/api/v3/images/generations`
  - 配置文件：`vite.config.ts`

## 请求示例（与当前实现一致）
```bash
curl https://ark.cn-beijing.volces.com/api/v3/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ARK_API_KEY" \
  -d '{
    "model": "doubao-seedream-5-0-260128",
    "prompt": "请将输入图片转为极简黑白线稿",
    "image": ["data:image/png;base64,..."],
    "size": "2K",
    "output_format": "png",
    "response_format": "url",
    "watermark": false
  }'
```
