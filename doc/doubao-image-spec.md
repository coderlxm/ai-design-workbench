# image

`string/array`

输入的图片信息，支持 URL 或 Base64 编码。其中，`doubao-seedream-5.0-lite/4.5/4.0` 支持单图或多图输入（查看多图融合示例）。

* **图片URL**：请确保图片URL可被访问。
* **Base64编码**：请遵循此格式 `data:image/<图片格式>;base64,<Base64编码>` 。注意 `<图片格式>` 需小写，如 `data:image/png;base64,<base64_image>` 。

## 说明

* **传入单张图片要求**：
  * **图片格式**：`jpeg`、`png`（`doubao-seedream-5.0-lite/4.5/4.0` 模型新增支持 `webp`、`bmp`、`tiff`、`gif`、`heic`、`heif` 格式 `new`）
  * **宽高比（宽/高）范围**：
    * `[1/16, 16]`（适用模型：`doubao-seedream-5.0-lite/4.5/4.0`）
  * **宽高长度 (px)**：`> 14`
  * **大小**：不超过 `30MB`
  * **总像素**：不超过 `6000x6000=36000000 px`（对单张图宽度和高度的像素乘积限制，而不是对宽度或高度的单独值进行限制）
* `doubao-seedream-5.0-lite/4.5/4.0` 最多支持传入 `14` 张参考图。
