import requests

# 从环境变量获取配置（和 curl 用法一致）
import os
AIGATEWAY_URL = 'https://aigateway.edgecloudapp.com/v1/781fd50a39c9a94604c015c35441bf9b/lute-openai-img'
AIGATEWAY_TOKEN = ''

# 请求头
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer c1b25389ed7444c08620b37f5394108a"
}

# 请求体
data = {
    "model": "gpt-image-2",
    "output_format": "b64_json",
    "prompt": "海边的落日"
}

# 发送 POST 请求
response = requests.post(AIGATEWAY_URL, headers=headers, json=data)

# 查看结果
print("状态码:", response.status_code)
print("返回结果:", response.json())


这个是gpt-image-2 的

---

## 当前前端接入说明

- 对接目标：最终生图阶段的模型切换（`gpt-image-2`）
- 接入文件：`src/services/gptImage2.ts`
- 切换逻辑：`src/composables/useGenerationFlow.ts`

### 当前请求约定
- 请求地址通过 Vite 代理：
  - 前端路径：`/api/gpt-image-2`
  - 转发目标：`https://aigateway.edgecloudapp.com/v1/781fd50a39c9a94604c015c35441bf9b/lute-openai-img`
- 请求体：
  - `model: "gpt-image-2"`
  - `prompt: <最终组合提示词>`
  - `output_format: "b64_json"`（按当前联调约定优先取 base64）

### 返回处理
- 优先读取 base64 字段（如 `data[0].b64_json`）并转成 `data:image/png;base64,...`。
- 如接口返回 URL（`data[0].url` 或 `output`），则直接使用 URL。
