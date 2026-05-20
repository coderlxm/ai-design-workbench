app-FazlnlyHy6kLjJdbNVvVWZoP      api_key

curl -X POST 'https://roosync-new.luteos.com/v1/chat-messages' \
--header 'Authorization: Bearer {api_key}' \
--header 'Content-Type: application/json' \
--data-raw '{
  "inputs": {},
  "query": "1",
  "response_mode": "blocking",
  "conversation_id": "",
  "user": "abc-123",
  "files": [
      {
          "type": "image",
          "transfer_method": "remote_url",
          "url": "https://cloud.dify.ai/logo/logo-site.png"
      }
  ]
}'

---

## 当前前端接入说明

- 对接目标：场景反推（功能三）
- 接入文件：`src/services/sceneReverse.ts`
- 工作流调用：`src/composables/useGenerationFlow.ts` 的 `generateScenePrompt`

### 请求链路
1. `POST /v1/files/upload` 上传图片（`multipart/form-data`）：
   - `file=<binary>`
   - `user=<user-id>`
   - 返回 `id` 作为 `upload_file_id`
2. `POST /v1/chat-messages` 发送反推请求，`files` 使用：
   - `type: image`
   - `transfer_method: local_file`
   - `upload_file_id: <id>`
3. 从返回体 `answer` 字段提取场景提示词并回填右侧 Prompt 面板。

### 当前约定
- 不使用 base64 传图。
- 场景图走 Dify 标准上传接口，再通过 `local_file` 引用。

### 本地代理
- 开发环境通过 Vite 代理：
  - 前端路径：`/api/scene-reverse/*`
  - 转发目标：`https://roosync-new.luteos.com/v1/*`
