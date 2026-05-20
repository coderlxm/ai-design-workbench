特别说明，以下生图模型使用 聊天生成API 请求：
gemini-2.5-flash-image（又名 Nano Banana）
gemini-3-pro-image-preview（又名 Nano Banana Pro）


curl -X POST "${AIGATEWAY_URL}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AIGATEWAY_TOKEN}" \
  -d '{
    "model": "gemini-3-pro-image-preview",
    "stream": true,
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "text": "Generate a new image as per my requirements: A Chinese model wearing this dress, everything else unchanged",
                    "type": "text"
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://xxxxx.jpg"
                    }
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://xxxxx.jpg"
                    }
                }
            ]
        }
    ]
}'


图片base64输入示例
{
    "messages": [
    {
      "role": "user",
      "content": [
        {"type": "text", "text": "请解答图片中的题目"},
        {"type": "image_url", "image_url": {"url": "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAABAAAAAQ...."}}
      ]
    }
  ]
}
          