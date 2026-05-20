# MVP 流程实现审查结论

- 审查日期：2026-05-20
- 对照基线：`mvp_spec.md`（最小 MVP 核心流程）
- 验证方式：代码对照 + `pnpm build` + `pnpm test`

## 结论摘要
当前版本**可以用于现场演示主流程**（场景/模特输入、线稿、Prompt 组合、最终出图、记录回看），但与 `mvp_spec.md` 对齐度为**部分达标**，仍有 5 个关键缺口。建议结论：**可演示，不建议作为“已完整满足最小 MVP 规范”验收通过**。

## 对照结果（按功能）
- 功能一 场景输入：基础能力达标（上传、预览、裁剪），但缺少“人物/清晰度/可生成性自动检测”。
- 功能二 线稿生成：已接豆包 API，可重试，主流程可用。
- 功能三 场景 prompt 反推：目前为模板文案拼接，非基于图片的 AI 逆向。
- 功能四 模特输入：六视图上传/替换/删除可用，但“缺失视图仅提示不阻断”与规范不一致。
- 功能五 最终生成：Prompt 组合、生成、下载、重试、记录页可用。
- 记录归档：仅保存最终图与两段 Prompt，未完整保存“线稿图 + 最终模型入参 + 可换场景/换模特资产”。

## 关键缺口（按优先级）
1. P1：场景“AI 逆向”未真正实现，仅静态模板。
   - 证据：`src/services/promptComposer.ts:4-12`
2. P1：模特必需视图被强制阻断，和规范“仅提示不阻断”冲突。
   - 规范：`mvp_spec.md:77`
   - 实现：`src/composables/useGenerationFlow.ts:52-53`
3. P2：生成记录缺少过程资产与模型入参。
   - 规范：`mvp_spec.md:137-141`
   - 实现结构：`src/types/workflow.ts:34-43`、`src/composables/useGenerationFlow.ts:87-96`
4. P2：顶部“模型选择”当前不影响实际调用，实际固定豆包模型。
   - UI/状态：`src/components/layout/TopBar.vue:37-40`、`src/stores/workspace.ts:10`
   - 实际调用：`src/services/doubaoImage.ts:4`
5. P2：缺少场景图质量与人物存在性检测。
   - 规范：`mvp_spec.md:28`
   - 现状上传逻辑：`src/components/preview/SceneInputPanel.vue:27-31`

## 工程验证结论
- `pnpm build`：通过。
- `pnpm test`：失败（无测试文件）。
  - 证据：`package.json:11`（`vitest run`），当前仓库无 `*.test.*`。

## 建议验收口径
- 对外演示口径：可按“流程已打通、可端到端生图演示”表述。
- 内部研发口径：建议标注为“Demo Ready / Spec Partially Met”。

## 建议下一步（最小修补顺序）
1. 将场景反推接入真实多模态接口，替换模板文案生成。
2. 调整模特缺失视图策略为“警告不阻断”（或同步修订规格文档）。
3. 扩展记录结构，补存线稿 URL、输入素材引用、最终模型入参快照。
4. 让“模型选择”驱动实际服务路由，避免 UI 与行为脱节。
5. 增加最小测试集（1 个流程级 store/composable 测试 + 1 个组件交互测试）。
