# sl-ops

## 0.1.0

### Minor Changes

- 52afb80: ✨ feat(api): 适配后端接口更新

  - 移除 custom 服务类型及自定义命令字段
  - 新增 POST /api/login 登录接口，auth store 接入真实 API
  - 新增 GET /api/service/discover/{serverId} 远程服务发现
  - beforeRequest 自动携带 Bearer token
  - responded 统一检查业务 code，非 200 抛出 msg 错误
  - 401 响应自动清除 token 跳转登录页
  - 新增登录/发现/网络 mock，清理 services mock 数据

- 13ecc20: ✨ feat(dashboard): 离线检测与网络上下行图表

  - 总览表合并资产列表，全零指标标记离线
  - 新增离线服务器统计卡片，5 列网格
  - 网络图表上下行双线、固定语义色、可读速率单位
  - 图表三态区分：加载中 / 离线 / 无数据
  - 服务器下拉标记离线主机

- 905e063: ♻️ refactor(pages): 合并服务管理和服务管控

  - 卡片式页面融入 CRUD、远程服务发现、搜索筛选
  - 已有服务标记删除线，编辑模式锁定关键字段
  - 卡片网格自适应最小宽度防止按钮挤压
  - 删除独立服务管理页和路由，侧边栏合并为一项

### Patch Changes

- c92ba7f: ♻️ refactor(api): 重构 API 工具函数和实例创建逻辑
- 0851864: 🔧 chore(deps): 将依赖版本迁移至 catalog 并调整 linter 配置
- e6c4a17: 🔧 chore(theme): 完善暗色模式样式适配
- 49f7e2c: ✨ feat(dashboard): 增强仪表盘功能并扩展模拟数据
- 979b5ba: 🐛 fix(app): 修复组件状态管理并优化类型与代码风格
- 34acac2: ♻️ refactor(style): 代码格式统一调整
- 8c27682: ♻️ refactor(api): 统一 API 路径前缀并扩展服务状态枚举
- dae9072: 🐛 fix(router): 将路由模式从 history 改为 hash
- d7a64a1: ✨ feat(app): 新增运维管理平台核心功能
- 954d270: 🔧 chore(branding): 统一品牌标识，使用 Logo 图片并更新为中文名称
- 8f118ba: 💄 style(ui): 弹窗滚动条、全局样式、命名优化

  - AppModal 滚动局限内容区，header/footer 固定
  - 新增全局 6px 滚动条，亮暗双模式
  - "仪表盘"→"监控中心"、"服务器资产"→"主机管理"
  - 删除登录页演示账号提示、资产页编辑密码提示
