---
'sl-ops': minor
---

✨ feat(api): 适配后端接口更新

- 移除 custom 服务类型及自定义命令字段
- 新增 POST /api/login 登录接口，auth store 接入真实 API
- 新增 GET /api/service/discover/{serverId} 远程服务发现
- beforeRequest 自动携带 Bearer token
- responded 统一检查业务 code，非 200 抛出 msg 错误
- 401 响应自动清除 token 跳转登录页
- 新增登录/发现/网络 mock，清理 services mock 数据
