# chat-messages remote_url curl 复现记录（2026-05-20）

## 请求命令
```bash
curl -v -X POST 'http://roosync-new.luteos.com/v1/chat-messages' \
  --header 'Authorization: Bearer app-FazlnlyHy6kLjJdbNVvVWZoP' \
  --header 'Content-Type: application/json' \
  --data-raw '{"inputs":{},"query":"1","response_mode":"blocking","conversation_id":"","user":"abc-123","files":[{"type":"image","transfer_method":"remote_url","url":"https://cloud.dify.ai/logo/logo-site.png"}]}'
```

## 响应现象
- DNS 可解析，TCP 可连接：`Connected to roosync-new.luteos.com (198.18.0.150) port 80`
- 请求体已完整发送：`upload completely sent off: 197 bytes`
- 服务端未返回任何 HTTP status/header，直接断开连接。
- curl 结果：`curl: (52) Empty reply from server`

## 关键输出（原始）
```text
* Host roosync-new.luteos.com:80 was resolved.
* IPv4: 198.18.0.150
*   Trying 198.18.0.150:80...
* Connected to roosync-new.luteos.com (198.18.0.150) port 80
> POST /v1/chat-messages HTTP/1.1
> Host: roosync-new.luteos.com
> User-Agent: curl/8.7.1
> Accept: */*
> Authorization: Bearer app-FazlnlyHy6kLjJdbNVvVWZoP
> Content-Type: application/json
> Content-Length: 197
>
} [197 bytes data]
* upload completely sent off: 197 bytes
* Empty reply from server
* Closing connection
curl: (52) Empty reply from server
```
