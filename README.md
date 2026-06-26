# 运维管理平台

运维管理平台

## 技术栈

- **框架**: Vue 3 + TypeScript + Vite
- **UI**: Naive UI + UnoCSS (Wind4 preset)
- **路由**: Vue Router 4
- **API**: Alova (OpenAPI 自动生成)
- **图表**: ECharts + vue-echarts
- **工具**: VueUse、Knip、Changeset
- **代码质量**: ESLint + oxlint + oxfmt

## 开始开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 代码检查
pnpm check

# 构建
pnpm build
```

## 目录结构

```
运维管理平台/
├── src/
│   ├── api/          # Alova 自动生成的 API 层
│   ├── components/   # 公共组件
│   ├── composables/  # 组合式函数
│   ├── router/       # 路由配置
│   ├── stores/       # 状态管理
│   ├── utils/        # 工具函数
│   ├── views/        # 页面组件
│   ├── App.vue
│   ├── env.d.ts
│   └── main.ts
├── public/           # 静态资源
├── scripts/          # 脚本工具
├── alova.config.ts   # Alova 配置
├── eslint.config.ts  # ESLint 配置
├── uno.config.ts     # UnoCSS 配置
└── vite.config.ts    # Vite 配置
```
