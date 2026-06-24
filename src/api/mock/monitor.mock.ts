import { defineMock } from '@alova/mock'
import overviewData from './data/overview.json'

// 每台服务器的基准值（对应 overview 数据）
const serverProfiles: Record<
  string,
  { cpu: number; memory: number; disk: number; rx: number; tx: number }
> = {
  'srv-001': { cpu: 23, memory: 61, disk: 45, rx: 35, tx: 20 },
  'srv-002': { cpu: 47, memory: 73, disk: 52, rx: 60, tx: 45 },
  'srv-003': { cpu: 12, memory: 35, disk: 28, rx: 10, tx: 8 },
  'srv-004': { cpu: 68, memory: 82, disk: 71, rx: 80, tx: 65 },
  'srv-005': { cpu: 55, memory: 90, disk: 83, rx: 50, tx: 35 },
}

// 生成模拟时序数据点
function generateMetricPoints(count: number, baseValue: number, variance: number) {
  const now = Date.now()
  const points = []
  for (let i = 0; i < count; i++) {
    points.push({
      timestamp: now - (count - 1 - i) * 60000,
      value: Math.max(0, Math.min(100, baseValue + (Math.random() - 0.5) * variance)),
    })
  }
  return points
}

// 根据 serverId 获取基准值，未指定则使用平均
function getProfile(serverId?: string) {
  if (serverId && serverProfiles[serverId]) {
    return serverProfiles[serverId]
  }
  // 全部服务器：取平均值
  const keys = Object.keys(serverProfiles)
  const avg = (field: keyof (typeof serverProfiles)['srv-001']) =>
    keys.reduce((sum, k) => sum + serverProfiles[k][field], 0) / keys.length
  return {
    cpu: avg('cpu'),
    memory: avg('memory'),
    disk: avg('disk'),
    rx: avg('rx'),
    tx: avg('tx'),
  }
}

export default defineMock(
  {
    '[GET]/monitor/overview': ({ query }: { query: Record<string, string> }) => {
      if (query.serverId) {
        const item = overviewData.find((s: any) => s.serverId === query.serverId)
        return { code: 200, msg: 'success', data: item ? [item] : [] }
      }
      return { code: 200, msg: 'success', data: overviewData }
    },

    '[GET]/monitor/network': ({ query }: { query: Record<string, string> }) => {
      const p = getProfile(query.serverId)
      const count = 30
      return {
        code: 200,
        msg: 'success',
        data: {
          rx: generateMetricPoints(count, p.rx, 25),
          tx: generateMetricPoints(count, p.tx, 15),
        },
      }
    },

    '[GET]/monitor/memory': ({ query }: { query: Record<string, string> }) => {
      const p = getProfile(query.serverId)
      return {
        code: 200,
        msg: 'success',
        data: generateMetricPoints(30, p.memory, 12),
      }
    },

    '[GET]/monitor/disk': ({ query }: { query: Record<string, string> }) => {
      const p = getProfile(query.serverId)
      return {
        code: 200,
        msg: 'success',
        data: generateMetricPoints(30, p.disk, 8),
      }
    },

    '[GET]/monitor/cpu': ({ query }: { query: Record<string, string> }) => {
      const p = getProfile(query.serverId)
      return {
        code: 200,
        msg: 'success',
        data: generateMetricPoints(30, p.cpu, 20),
      }
    },
  },
  true,
)
