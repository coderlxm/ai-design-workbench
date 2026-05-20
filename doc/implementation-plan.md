# AI 设计工作台 MVP 实现方案

## 1. 方案目标

本方案用于实现 `mvp_spec.md` 定义的第一阶段 MVP，目标是完成从“场景图/模特图输入”到“最终生成图输出”的完整前端工作流闭环，并且严格对齐 `design/DESIGN.md` 所约束的视觉与交互风格。

本阶段的边界如下：

- 只做前端 MVP，不接真实后端。
- 图片资源由本地 `image` 目录提供，作为场景图、模特图的静态资源池。
- 生成能力先做工作流编排、prompt 组合、结果预览与记录保存，模型调用层预留适配接口。
- 页面结构、组件层级、颜色、字号、间距、交互态必须以设计稿为准。

所有涉及模型接口补充的位置都必须显式保留注释，统一使用 `TODO(model-api)` 标记，方便后续你接入真实模型时快速定位。

## 2. 技术选型

### 2.1 核心栈

- Vue `3.5.x` 最新 stable
- TypeScript
- Vite
- Vue Router
- Pinia
- VueUse
- pnpm

### 2.2 辅助能力

- `cropperjs` 或同类裁剪库，用于场景图主体裁剪
- `vue-i18n` 暂不作为 MVP 必选项，当前全部文案先固定中文
- `dayjs` 用于生成记录时间戳展示
- `@vueuse/core` 用于本地存储、媒体查询、事件监听等常用能力
- `vitest` + `@vue/test-utils` 用于基础组件测试

### 2.4 模型接口接入策略

当前阶段不实现真实模型调用，但所有与模型有关的能力都必须提前预留清晰的接入点，并在代码中保留明确注释，方便后续补充接口时直接替换。

统一约定如下：

- 所有模型请求统一封装到 `src/services/model/` 或 `src/services/generation/` 下。
- 每个待接入位置都必须写明 `TODO(model-api)` 注释，说明这里未来接哪类模型接口、输入是什么、输出是什么。
- 对于线稿生成、场景反推、最终生图三类能力，先保留方法签名和返回数据结构，不在组件内部直接拼接口。
- 如果某一块当前只做 mock，也必须保留和真实接口一致的数据结构，减少后续替换成本。

建议的注释格式示例：

```ts
// TODO(model-api): 这里接入场景逆向模型接口
// 入参：scene image + product theme + output ratio
// 出参：scene prompt string
```

### 2.3 设计实现原则

- 用 CSS 变量承载设计稿色板和字号，不把视觉散落在各组件内。
- 以“固定-流体-固定”三栏布局为骨架，严格复刻 `design/DESIGN.md`。
- 组件职责清晰拆分，避免一个大页面承载全部逻辑。
- 图片、prompt、生成记录三类状态分离管理，便于后续替换真实接口。

## 3. 初始化约定

### 3.1 Git

- 仓库已初始化为 Git 项目。
- 默认分支使用 `main`。
- `.gitignore` 采用最小必要集合，避免把依赖、构建产物、环境文件和系统垃圾文件提交进仓库。

### 3.2 pnpm

- 使用 `pnpm` 作为唯一包管理器。
- 根目录增加 `packageManager` 标识，避免团队成员混用 npm/yarn。
- 后续安装依赖、启动、构建、测试命令全部以 `pnpm` 为准。

### 3.3 建议脚手架命令

```bash
pnpm create vite . --template vue-ts
pnpm install
```

如果需要更完整的工程约束，后续可再补：

```bash
pnpm add vue-router pinia @vueuse/core dayjs cropperjs
pnpm add -D vitest @vue/test-utils jsdom
```

## 4. 目录结构

建议采用以下结构，确保功能、状态、资源和样式都能长期维护：

```text
.
├── design/
│   ├── DESIGN.md
│   ├── code.html
│   └── screen.png
├── doc/
│   └── implementation-plan.md
├── image/
│   ├── scenes/
│   ├── models/
│   ├── templates/
│   └── thumbnails/
├── public/
├── src/
│   ├── assets/
│   │   ├── styles/
│   │   │   ├── tokens.css
│   │   │   ├── base.css
│   │   │   └── layout.css
│   │   └── icons/
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   ├── workflow/
│   │   ├── upload/
│   │   ├── prompt/
│   │   ├── preview/
│   │   └── result/
│   ├── composables/
│   ├── constants/
│   ├── mocks/
│   ├── router/
│   ├── services/
│   ├── stores/
│   ├── types/
│   ├── utils/
│   ├── views/
│   ├── App.vue
│   └── main.ts
├── .gitignore
├── package.json
├── pnpm-lock.yaml
└── vite.config.ts
```

### 4.1 `image` 目录约定

用户会把模特图和场景图放到 `image` 目录里。考虑到无后端、图片总量约 15 张、单张约 5MB，建议：

- `image/scenes/`：场景参考图
- `image/models/`：模特六视图
- `image/thumbnails/`：预生成缩略图

资源访问采用静态方式，不进入打包依赖树，避免 Vite 构建时把大图打进产物。

## 5. 页面与路由

### 5.1 路由设计

当前仅保留必要路由：

- `/`：AI 设计工作台主页面
- `/records`：生成记录页，或作为主页面内二级面板也可以
- `/docs`：可选，展示操作说明和 prompt 规则

如果想保持极简，也可以只做单页应用，所有状态通过左侧流程、中心工作区和右侧控制面板切换完成。

### 5.2 页面组成

主页面必须包含三栏：

- 左侧：工作流步骤、状态和记录入口
- 中间：图片预览、裁剪、模板选择、最终结果展示
- 右侧：场景逆向 prompt、模特逆向 prompt、最终 prompt、任务状态和日志

这和设计稿的 `Fixed-Fluid-Fixed` 布局保持一致。

## 6. 组件拆分

### 6.1 布局层

- `AppShell.vue`：页面骨架，负责顶部栏、左右栏和主内容区布局
- `TopBar.vue`：产品主题、比例、模型选择、保存/导出入口
- `WorkflowRail.vue`：左侧步骤流与当前状态
- `InspectorPanel.vue`：右侧 prompt 与任务状态区

### 6.2 输入层

- `ReferenceUploadCard.vue`：模板选择/场景图上传卡片
- `ImageDropzone.vue`：拖拽上传区
- `CropWorkspace.vue`：裁剪与主体框选区域
- `ModelReferenceGrid.vue`：模特六视图上传区

### 6.3 Prompt 层

- `ScenePromptCard.vue`：场景逆向 prompt 展示与编辑
- `ModelPromptCard.vue`：模特逆向 prompt 展示与编辑
- `FinalPromptComposer.vue`：最终 prompt 组合预览
- `PromptToolbar.vue`：复制、重写、锁定、重置等操作

> 注：上述组件只负责展示、编辑和组合，不直接调用模型接口。真实模型调用统一放在 `src/services/`，并在实现处保留 `TODO(model-api)` 注释。

### 6.4 结果层

- `LineArtPreview.vue`：极简线稿预览
- `GenerationPreview.vue`：最终生图预览
- `ResultActions.vue`：预览、下载、重试、保存
- `GenerationHistoryList.vue`：生成记录列表

### 6.5 通用层

- `StatusBadge.vue`
- `ProgressBar.vue`
- `IconButton.vue`
- `BaseCard.vue`
- `BaseTextarea.vue`
- `BaseSelect.vue`
- `BaseDialog.vue`

## 7. 状态管理

建议用 Pinia 拆成 4 个 store，避免单 store 过大：

- `useWorkspaceStore`
  - 当前步骤
  - 页面级布局状态
  - 当前选中的模板/场景/模特

- `useAssetStore`
  - 场景图、模特图元数据
  - 缩略图路径
  - 视图标签
  - 图片校验结果

- `usePromptStore`
  - 场景 prompt
  - 模特 prompt
  - 最终 prompt
  - prompt 锁定状态、手动编辑痕迹

- `useGenerationStore`
  - 生成中状态
  - 结果图
  - 生成历史
  - 错误和重试次数

### 7.1 持久化

由于没有后端，以下数据建议持久化到 `localStorage` 或 `IndexedDB`：

- 当前工作流进度
- 手动编辑后的 prompt
- 选择的场景/模特索引
- 最近一次生成记录

大文本和小型 JSON 结构可以用 `localStorage`，如果后续要保存用户上传的文件引用或较大草稿，再切换到 `IndexedDB`。

### 7.2 模型接入预留字段

为了后续补充模型接口时不改动主流程，建议在 store / service 层提前保留以下字段：

- `modelProvider`
- `modelVariant`
- `modelStatus`
- `modelInput`
- `modelOutput`
- `modelError`
- `modelRequestId`

这些字段当前可以先为空值或 mock 值，但状态命名要固定，避免后续接口补齐时再做大范围重构。

## 8. 图片资源策略

### 8.1 资源规模考虑

当前图片预计 15 张左右，每张约 5MB，总量接近 75MB。前端实现时不能把它们当成普通 UI 小图无脑加载，否则会导致：

- 首屏加载变慢
- 内存占用过高
- 低端设备卡顿

### 8.2 处理策略

- 场景图使用缩略图列表展示，点击后再加载大图。
- 大图采用按需加载，不在初始页面一次性引入。
- 六视图按网格展示，每张图独立懒加载。
- 如果后续要做裁剪，裁剪弹层只在选中具体图片时挂载。
- 资源元数据通过 `manifest.json` 或 `src/mocks/image-manifest.ts` 统一管理，避免硬编码。

### 8.3 推荐字段

每张图片建议至少包含：

- `id`
- `type`：scene/template/model
- `title`
- `description`
- `ratio`
- `viewTag`：front/left/right/back/half/full
- `thumb`
- `source`
- `width`
- `height`
- `promptHints`

## 9. 核心业务实现方式

### 9.1 场景图选择与上传

- 支持本地上传场景图入口。
- 上传后生成缩略图，展示预览。
- 提供主体裁剪能力，裁剪结果作为后续线稿和场景反推基础。
- 做基础校验：
  - 格式是否为 JPG / PNG / WEBP
  - 是否可读
  - 是否符合最小尺寸要求
  - 是否有人物或主体可识别

### 9.2 线稿生成

- 前端先实现“生成结果卡片”和“重新生成”交互。
- 如果没有真实模型接口，则先用 mock service 生成线稿占位结果，并保持接口形状不变。
- 输出图严格使用白底黑线风格的静态结果样式，避免出现文字、彩色元素和水印。
- 对应模型接入点必须写 `TODO(model-api)` 注释，标明未来这里接“场景图 -> 线稿图”模型。

### 9.3 场景 prompt 逆向

- 将用户输入的产品主题、美国场景设定、构图信息组合到固定 prompt 模板中。
- 允许用户在生成后继续编辑。
- 右侧面板展示“自动生成版”和“手动编辑版”的切换状态。
- 场景反推的真实模型接口先预留在 service 层，并在调用位置写明 `TODO(model-api)`，后续补充时只替换 service 实现。

### 9.4 模特图上传

- 六视图按照网格展示。
- 正面、左侧面、右侧面标记为必填质量项，缺失时给提示但不阻断流程。
- 背面、半身、全身作为增强项。
- 支持替换、删除、重新上传。
- 这里同样预留模型服务方法，组件只读写 store，不直连接口；实现位置需保留清晰的 `TODO(model-api)` 说明。

### 9.5 模特 prompt 逆向

- 根据模特图元数据和用户输入生成一段完整中文描述。
- 当多张图存在明显冲突时，显示“参考图特征不一致”提示。
- 不输出姓名、品牌、身份等无关信息。
- 这里同样预留模型服务方法，组件只读写 store，不直连接口；实现位置需保留清晰的 `TODO(model-api)` 说明。

### 9.6 最终 prompt 组合与生成

最终 prompt 由以下部分拼装：

- 产品主题 prompt
- 场景逆向 prompt
- 模特逆向 prompt
- 构图约束
- 线稿参考约束
- 模特一致性约束
- 禁止项
- 输出质量要求

实现上建议把拼装逻辑抽到 `src/services/promptComposer.ts`，保证后续接模型时可复用。
- `promptComposer` 只负责组装，不承担网络请求；真正的最终生图接口接入点也要单独写 `TODO(model-api)` 注释，避免和纯字符串拼装耦合。

### 9.7 生成记录保存

每次生成都保存一个完整记录对象，包括：

- 输入图片信息
- 线稿图
- 场景 prompt
- 模特 prompt
- 最终 prompt
- 生成结果图
- 时间戳
- 重试次数
- 用户修改痕迹

## 10. 与设计稿的对齐策略

### 10.1 视觉基线

必须严格复用设计稿的以下基线：

- 绿色主色 `#02b96b`
- 三栏布局
- 白色工作区 + 浅灰侧栏
- 低阴影、强调边框
- Inter + JetBrains Mono 字体组合
- 按钮、输入框、卡片的圆角和间距

### 10.2 交互态

需要补齐设计稿已有但实现时容易遗漏的状态：

- hover
- active
- disabled
- loading
- error
- empty
- success

### 10.3 响应式

设计稿以桌面端为主，但仍需保证：

- 1280px 以上保持三栏
- 中等屏幕允许右侧面板折叠
- 移动端改为单栏堆叠，左侧流程和右侧面板收进抽屉

## 11. 工程规范

- 统一使用 `<script setup lang="ts">`
- 组件按“基础组件 -> 业务组件 -> 页面组件”分层
- 业务逻辑放 composable 或 service，不堆在组件里
- 样式优先使用设计 token 和少量局部样式，不滥用全局覆盖
- 所有静态数据和 mock 结构都要有类型
- 重要交互要留测试点，例如 prompt 拼装、步骤流转、图片选择、记录保存

## 12. MVP 交付拆分

### 第 1 阶段：工程骨架

- 初始化 Vue3.5 + TypeScript + Vite + pnpm
- 建立路由、Pinia、全局样式、设计 token
- 初始化 Git 和 `.gitignore`

### 第 2 阶段：工作台布局

- 完成顶部栏、三栏布局、基础步骤流
- 接入设计稿色板、字体、间距、按钮、卡片样式

### 第 3 阶段：参考图输入

- 上传、预览、裁剪
- 模特六视图上传

### 第 4 阶段：prompt 工作流

- 场景反推
- 最终 prompt 组合预览与编辑

### 第 5 阶段：结果区与记录

- 线稿预览
- 最终图预览
- 重试、下载、保存
- 生成历史记录

### 第 6 阶段：质量收口

- 空状态、错误态、加载态
- 图片大资源优化
- 组件测试与交互检查

## 13. 风险与应对

- 风险：没有后端，生图环节无法真实产出。  
  应对：先实现 prompt 编排、状态流转和结果容器，生成接口留服务适配层。

- 风险：单张 5MB 图片过大。  
  应对：缩略图与大图分离、懒加载、按需挂载裁剪器。

- 风险：设计稿要求严格，容易出现实现偏差。  
  应对：把颜色、字号、边框、间距、圆角全部抽成 token，页面按设计稿逐项对照验收。

- 风险：工作流状态复杂。  
  应对：Pinia 分 store 管理，prompt 与资产拆开保存。

- 风险：后续补模型接口时遗漏接入点。  
  应对：所有模型相关 service、store 状态和按钮事件都提前写 `TODO(model-api)` 注释，并统一放在 `src/services/model/` 下，便于逐个替换。

## 14. 建议的下一步

如果开始进入实现，建议按以下顺序推进：

1. 创建 Vue3.5 + Vite + pnpm 工程。
2. 补齐 `src/assets/styles/tokens.css` 和三栏布局。
3. 搭建工作台主页面和组件骨架。
4. 接入 `image` 目录的静态资源清单。
5. 实现 prompt 拼装、记录保存和 mock 生成流。
