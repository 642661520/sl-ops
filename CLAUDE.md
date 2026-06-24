# CLAUDE.md

## 项目概述

sl-ops 是一个**运维管理平台**，基于 Vue 3 + TypeScript + Vite 构建，用于运维相关管理功能。

## 技术栈

| 类别      | 技术                                       |
| --------- | ------------------------------------------ |
| 框架      | Vue 3 (Composition API + `<script setup>`) |
| 语言      | TypeScript ~5.8                            |
| 构建      | Vite 6 + pnpm                              |
| UI 组件库 | Naive UI 2                                 |
| CSS 方案  | UnoCSS (Wind4 preset + Attributify)        |
| 路由      | Vue Router 4                               |
| API 层    | Alova 3 (基于 OpenAPI 自动生成)            |
| 图表      | ECharts 5 + vue-echarts 8                  |
| 工具库    | VueUse                                     |
| 包管理    | pnpm (catalog 统一版本)                    |

## 关键命令

```bash
pnpm dev            # 启动开发服务器
pnpm build          # 类型检查 + 生产构建
pnpm check          # 并行 oxlint + oxfmt + type-check
pnpm check:fix      # 自动格式化后检查
pnpm lint           # ESLint 缓存模式
pnpm knip           # 死代码检测
pnpm changeset:add  # 添加变更记录
```

## 目录结构

```
src/
├── api/          # Alova 自动生成的 API 调用层（类型安全）
├── components/   # 公共组件（自动注册，无需 import）
├── composables/  # 组合式函数（自动导入）
├── router/       # Vue Router 路由
├── stores/       # Pinia 状态管理（按需添加）
├── utils/        # 工具函数
└── views/        # 页面组件
```

## 关键约定

### 组件自动导入

- **组件**: `src/components/` 下的 `.vue` 文件通过 unplugin-vue-components 自动注册，无需手动 import
- **Naive UI 组件**: 使用 kebab-case（如 `<n-button>`）自动注册
- **API**: Vue 3 API（`ref`、`computed`、`watch` 等）自动导入
- **VueUse**: 所有 `@vueuse/core` 函数自动导入
- **Vue Router**: `useRouter`、`useRoute` 等自动导入

### 类型安全

- 使用 `vue-tsc --build` 进行类型检查
- `tsconfig.json` 使用 project references 分离 app/node 端配置
- 自动生成的类型文件：`src/auto-imports.d.ts`、`src/components.d.ts`

### 样式

- 优先使用 UnoCSS 原子类（Wind4 preset）
- 支持 Attributify 模式：`<div flex="~ items-center">`
- Naive UI 组件通过 ConfigProvider 统一主题

### API 调用

- 通过 `alovaInstance`（`src/api/index.ts` 导出）发起请求
- OpenAPI 文件放入项目后执行 `pnpm alova` 生成类型安全的 API 层
- 自定义 ESLint 规则确保 API 调用必须 `.send()` 或 `await`

### 代码质量

- **oxlint + oxfmt**: 零配置快速检查和格式化
- **ESLint**: 补充 Vue/TS 特定规则（`vue/block-order`、`vue/attribute-hyphenation` 等）
- **Knip**: 检测未使用的代码和依赖
- **Changeset**: 管理版本和 changelog

## 引用的 Skills

- [[vue-best-practices]] — Vue 3 编码规范
- [[naive-ui-components]] — Naive UI 使用约定
- [[api-development]] — Alova 使用规范
- [[unocss-usage]] — UnoCSS 使用规范

## 环境变量

| 变量                | 说明           |
| ------------------- | -------------- |
| `VITE_API_BASE_URL` | API 基础路径   |
| `VITE_SERVICE_PORT` | 开发服务器端口 |
| `VITE_MOCK`         | 是否启用 Mock  |
