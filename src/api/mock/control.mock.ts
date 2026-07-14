import { defineMock } from '@alova/mock'

// 模拟服务运行状态存储 (1: 运行中, 2: 已停止, 3: 异常, 4: 部分运行)
const statusMap: Record<string, number> = {
  'svc-001': 1,
  'svc-002': 1,
  'svc-003': 1,
  'svc-004': 1,
  'svc-005': 1,
  'svc-006': 2,
  'svc-007': 1,
  'svc-008': 1,
  'svc-009': 2,
  'svc-010': 1,
}

export default defineMock(
  {
    '[POST]/api/control/execute': ({ data }: { data: { serviceId: string; action: string } }) => {
      const { serviceId, action } = data
      if (!(serviceId in statusMap)) {
        return { code: 404, msg: '服务不存在', data: '服务不存在' }
      }

      const actionMap: Record<string, number> = {
        start: 1,
        stop: 2,
        restart: 1,
      }

      // 模拟操作延迟后更新状态
      if (actionMap[action] !== undefined) {
        statusMap[serviceId] = actionMap[action]
      }

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

    '[GET]/api/control/status': ({ query }: { query: { serviceId: string } }) => {
      const status = statusMap[query.serviceId]
      if (status === undefined) {
        return { code: 404, msg: '服务不存在', data: null }
      }
      return { code: 200, msg: 'success', data: status }
    },

    '[POST]/api/control/status/batch': ({
      data,
    }: {
      data: { serviceIds: string[] }
    }) => {
      const list = (data.serviceIds || []).map((id) => ({
        serviceId: id,
        status: statusMap[id] ?? 2,
      }))
      return { code: 200, msg: 'success', data: list }
    },
  },
  true,
)
