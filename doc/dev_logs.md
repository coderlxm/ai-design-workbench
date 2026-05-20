# Dev Logs

## 2026-05-20
- 移除“肖像授权确认”相关功能与校验。
- 删除模特上传区授权勾选 UI、事件与状态字段。
- 调整最终生成前置校验：仅保留场景图与模特必需视图检查。
- 同步更新流程文案与验收/规格文档，避免保留过期描述。
- 对接豆包图片生成 API（开发环境）：新增 `src/services/doubaoImage.ts`，线稿生成与最终生图改为调用豆包接口。
- 新增 Vite 代理 `/api/doubao -> https://ark.cn-beijing.volces.com/api/v3`，规避浏览器跨域限制。
- 更新 `doc/api.md`：补充固定 key、接入点、代理策略与请求样例。
- 新增普通用户演示文档 `doc/demo-guide.md`，覆盖启动步骤、标准演示流程、现场讲解建议与常见问题。
- 将 `image/模特`、`image/人物场景` 图片按当前架构融合为 `image/models` 与 `image/scenes` 的 demo 资源，并重命名为标准文件名。
- 首页初始化逻辑增强：自动加载 demo 场景与模特必需视图，满足条件时自动跳转到“线稿提取”步骤，免上传即可开始主流程。
- 本地素材扫描范围收敛为 `image/scenes` 与 `image/models`，避免原始临时目录素材被重复打包。
- 新增 `doc/mvp-review-conclusion.md`：按 `mvp_spec.md` 对当前实现做整体审查，输出“可演示但与最小 MVP 规范部分不一致”的结论与缺口清单。
- 按最新 MVP 变更，彻底移除“模特反推”流程节点：删除步骤定义、页面节点、状态字段、事件链路、Prompt 组合依赖与记录字段中的相关项。
- 同步更新规格与说明文档：`mvp_spec.md`、`ui_spec.md`、`doc/acceptance-checklist.md`、`doc/demo-guide.md`、`doc/implementation-plan.md`、`doc/mvp-review-conclusion.md`。
- 对接 `doc/api3.md` 场景反推接口：新增 `src/services/sceneReverse.ts`，实现“上传场景图 -> chat-messages 反推 -> 回填场景 prompt”完整链路。
- 更新 `useGenerationFlow` 与 `HomeView`：场景反推改为异步真实接口调用，并在最终生成前自动补齐场景反推结果。
- 新增 Vite 代理 `/api/scene-reverse -> http://roosync-new.luteos.com/v1`，避免浏览器跨域问题。
- 更新 `doc/api3.md`，补充当前接入说明与请求链路。
- 根据接口现状移除不存在的 `/v1/files/upload` 依赖，场景反推改为仅走 `chat-messages + remote_url`。
- 场景反推改为 base64 传图：`chat-messages` 请求中统一传 `data:image/...;base64,...`，不再依赖公网 URL 可达性。
- 按 `doc/difyupload.md` 回滚为 Dify 标准上传链路：`/v1/files/upload` 上传图片后，在 `chat-messages` 中使用 `transfer_method=local_file` + `upload_file_id`；移除场景反推的 base64 方案。
- 对接 `doc/api4.md`：新增 `gpt-image-2` 生成服务并接入“模型选择”分支，`selectedModelProvider=gpt-image-2` 时走独立接口。
- 新增 Vite 代理 `/api/gpt-image-2 -> aigateway`；返回优先按 base64 解析，兼容 URL 返回。
- 为避免 base64 图片写爆 localStorage，持久化层新增过滤：`data:image/*` 不落库；同时增加 `localStorage.setItem` 容错日志。

## 记录约定
- 从本次开始，后续代码与文档修改统一记录在 `doc/dev_logs.md`。
- 修复场景反推上传易触发网关异常问题：在 `src/services/sceneReverse.ts` 增加上传前图片压缩（最长边 1600、JPEG 质量分级、上限 2MB）与网络层异常兜底提示，避免超大原图直接透传导致请求失败。
- 场景反推链路强制切换 HTTPS：将 Vite 代理 `/api/scene-reverse` 目标由 `http://roosync-new.luteos.com` 改为 `https://roosync-new.luteos.com`，并同步更新 `doc/api3.md` 示例与代理说明，规避 HTTP 301 重定向引发的不稳定。
- gpt-image-2 最终生图链路加固：`src/services/gptImage2.ts` 改为“b64 优先解析”，新增 `output` 顶层 URL 兜底与 `data:image/*` 兼容处理；请求体显式补充 `n: 1`，确保单图输出。
- 同步修正文档 `doc/api4.md`：示例请求 `output_format` 更新为 `b64_json`，并补充 URL 回退字段说明（`data[0].url` / `output`）。
