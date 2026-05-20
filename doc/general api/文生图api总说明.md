图像生成API说明
cURL请求示例
图像生成
curl -X POST "${AIGATEWAY_URL}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AIGATEWAY_TOKEN}" \
  -d '{
    "prompt": "海边的落日",
    "size": "1440x900"
  }'

特别说明，以下生图模型使用 聊天生成API 请求：
gemini-2.5-flash-image（又名 Nano Banana）
gemini-3-pro-image-preview（又名 Nano Banana Pro）

请求方法
POST
请求URL
${AIGATEWAY_URL} ,如 https://aigateway.edgecloudapp.com/v1/xxx/yyy
3.4 请求头
请求头
取值
Content-Type
application/json
Authorization
Bearer ${AIGATEWAY_TOKEN}
3.5 请求主体
请求主体为JSON对象，包含图像生成的配置参数，具体说明如下：
参数名称
类型
说明
取值范围
默认值
必填
model
string
生成图像使用的模型名称
-
根据AI网关配置
否
prompt
string|object
生成图像的核心提示词，描述图像内容与风格
-
-
是
n
integer
生成图像的数量（部分模型可能限制为1）
>0
1
否
response_format
string
图像返回格式（部分模型可能限制格式）
url、b64_json
url
否
size
string
图像宽高像素（部分模型可能限制分辨率）
不同模型不同取值
1024x1024
否
style
string
图像风格（仅OpenAI系支持）
-
-
否
quality
string
图像质量（可能影响生成时间和输出效果，仅OpenAI系支持）
-
auto
否
user
string
用户标识，用于指定生成请求用户（仅OpenAI系支持）
-
-
否
补充说明：特定模型的特殊配置
	•	Stable-Diffusion-XL 支持的 size：“768x768”、“1024x1024”、“1536x1536”、“2048x2048”、“1024x768”、“2048x1536”、“768x1024”、“1536x2048”、“1024x576”、“2048x1152”、“576x1024”、“1152x2048”，默认值为 “1024x1024”。
	•	Stable-Diffusion-XL 支持的 style：“Base”（基础风格）、“3D Model”（3D模型）、“Analog Film”（模拟胶片）、“Anime”（动漫）、“Cinematic”（电影）、“Comic Book”（漫画）、“Craft Clay”（工艺黏土）、“Digital Art”（数字艺术）、“Enhance”（增强）、“Fantasy Art”（幻想艺术）、“Isometric”（等距风格）、“Line Art”（线条艺术）、“Lowpoly”（低多边形）、“Neonpunk”（霓虹朋克）、“Origami”（折纸）、“Photographic”（摄影）、“Pixel Art”（像素艺术）、“Texture”（纹理），默认值为 “Base”。
3.6 响应状态码（通用）
状态码
说明
200
请求成功，返回生成的图像数据
401
访问被拒绝，拒绝原因见响应主体。
可能原因：缺少Authorization请求头、token无效或过期等
403
访问被拒绝，拒绝原因见响应主体。
可能原因：请求主体JSON格式错误、缺少必填参数（如prompt）等
500
服务器内部错误，错误原因见响应主体
3.7 响应头
响应头
取值
说明
Content-Type
application/json
固定值，标识响应主体为JSON格式
3.8 响应主体
响应主体为JSON对象，包含图像生成时间与图像数据，具体说明如下：
参数名称
类型
说明
created
字符串
图像创建的时间戳（Unix时间格式）
data
对象数组
生成的图像数组，数组长度与请求参数n一致（部分模型固定为1）
data对象属性说明
属性名称
类型
说明
url
字符串
图像的URL地址，仅当response_format=url时返回（必填）
b64_json
字符串
图像内容的Base64编码，仅当response_format=b64_json时返回（必填）
响应示例（url格式）
{
  "created": 1754372091,
  "data": [
    {
      "url": "https://wcs-upload.edgecloudapp.com/example-path?X-Tos-Credential=<REDACTED>&X-Tos-Date=<REDACTED>&X-Tos-SignedHeaders=host"
    }
  ]
}
响应示例（b64_json格式）
{
  "created": 1754372401,
  "data": [
    {
      "b64_json": "/9j/4AAQSkZJRgABAQAAAQABAAD/4QBjRXhpZgAATU0AKgAA..."
    }
  ]
}
