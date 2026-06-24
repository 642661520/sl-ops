import { defineMock } from '@alova/mock'

// 模拟服务运行状态存储
const statusMap: Record<string, string> = {
  'svc-001': 'running',
  'svc-002': 'running',
  'svc-003': 'running',
  'svc-004': 'running',
  'svc-005': 'running',
  'svc-006': 'stopped',
  'svc-007': 'running',
  'svc-008': 'running',
  'svc-009': 'stopped',
  'svc-010': 'running',
}

export default defineMock(
  {
    '[POST]/control/execute': ({ data }: { data: { serviceId: string; action: string } }) => {
      const { serviceId, action } = data
      if (!statusMap[serviceId]) {
        return { code: 404, msg: '服务不存在', data: '服务不存在' }
      }

      const actionMap: Record<string, string> = {
        start: 'running',
        stop: 'stopped',
        restart: 'running',
      }

      // 模拟操作延迟后更新状态
      statusMap[serviceId] = actionMap[action] || statusMap[serviceId]

      const actionLabel: Record<string, string> = {
        start: '启动',
        stop: '停止',
        restart: '重启',
      }

      return {
        code: 200,
        msg: '操作成功',
        data: `服务 ${serviceId} ${actionLabel[action] || action}操作已执行`,
      }
    },

    '[GET]/control/status': ({ query }: { query: { serviceId: string } }) => {
      const status = statusMap[query.serviceId]
      if (!status) {
        return { code: 404, msg: '服务不存在', data: null }
      }
      // 模拟状态随机变化
      const statusLabel = status === 'running' ? 'running' : 'stopped'
      return { code: 200, msg: 'success', data: statusLabel }
    },
  },
  true,
)
