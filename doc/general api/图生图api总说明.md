图像编辑API说明
cURL请求示例
图像编辑
curl -X POST "${AIGATEWAY_URL}" \
  -H "Authorization: Bearer ${AIGATEWAY_TOKEN}" \
  -F "image=@test2.png" \
  -F "prompt=图片里添加水印: 网宿科技" \
  -F "size=1024x1024"

特别说明，以下生图模型使用 聊天生成API 请求：
gemini-2.5-flash-image（又名 Nano Banana）
gemini-3-pro-image-preview（又名 Nano Banana Pro）

请求方法
POST
请求URL
${AIGATEWAY_URL} ,如 https://aigateway.edgecloudapp.com/v1/xxx/yyy
请求头
请求头
取值
说明
Content-Type
multipart/form-data; boundary=${boundary}
固定值，标识请求主体为表单文件格式，${boundary}由请求工具自动生成
Authorization
Bearer ${AIGATEWAY_TOKEN}

请求主体
请求主体为multipart/form-data格式，包含待编辑图片文件与配置参数，具体说明如下：
参数名称
类型
说明
取值范围
默认值
必填
model
string
编辑图像使用的模型名称
-
通道配置的默认模型
否
prompt
string
图像编辑的核心提示词（如“添加水印”“调整为动漫风格”）
-
-
是
image
file|string|array
待编辑的图片文件或图片URL示例如："image=@body-lotion.png"、"image[]=@body-lotion.png"、"image=http://xxx/body-lotion.png"
支持PNG、JPG等常见格式
-
是
mask
file
可选的遮罩文件，仅一张
-
-
否
n
integer
生成编辑后图像的数量（部分模型仅支持1张，会忽略该字段）
>0
1
否
size
string
编辑后图像的宽高像素（部分模型仅支持特定分辨率）
不同模型不同取值
-
否
response_format
string
编辑后图像的返回格式（部分模型仅支持特定格式，会忽略该字段）
url、b64_json
-
否
响应状态码（通用）
状态码
说明
200
请求成功，返回编辑后的图像数据
401
访问被拒绝，拒绝原因见响应主体。
可能原因：缺少Authorization请求头、token无效或过期等
403
访问被拒绝，拒绝原因见响应主体。
可能原因：请求主体格式错误、缺少必填参数（如image、prompt）等
500
服务器内部错误，错误原因见响应主体
响应头
响应头
取值
说明
Content-Type
application/json
固定值，标识响应主体为JSON格式
响应主体
参数名称
类型
说明
created
字符串
编辑后图像的创建时间戳（Unix时间格式）
data
对象数组
编辑后的图像数组，数组长度与请求参数n一致（部分模型固定为1）
data对象属性说明
属性名称
类型
说明
url
字符串
编辑后图像的URL地址，仅当response_format=url时返回（必填）
b64_json
字符串
编辑后图像内容的Base64编码，仅当response_format=b64_json时返回（必填）
响应示例（url格式）
{
  "created": 1754372091,
  "data": [
    {
      "url": "https://wcs-upload.edgecloudapp.com/example-path?X-Tos-Credential=<REDACTED>&X-Tos-Date=<REDACTED>&X-Tos-SignedHeaders=host"
    }
  ]
}
