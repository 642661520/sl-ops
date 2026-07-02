import { defineMock } from '@alova/mock'
import overviewData from './data/overview.json'
import serversData from './data/servers.json'

// 根据服务器数据动态生成基准值
const serverProfiles: Record<
  string,
  { cpu: number; memory: number; disk: number; rx: number; tx: number }
> = {}
for (const s of serversData as { id: string }[]) {
  // 用 id 的 hashCode 生成稳定的基准值
  let hash = 0
  for (let i = 0; i < s.id.length; i++) {
    hash = ((hash << 5) - hash + s.id.charCodeAt(i)) | 0
  }
  const absHash = Math.abs(hash)
  serverProfiles[s.id] = {
    cpu: 10 + (absHash % 70),
    memory: 20 + (absHash % 65),
    disk: 15 + (absHash % 60),
    rx: 5 + (absHash % 85),
    tx: 3 + (absHash % 60),
  }
}

// 生成模拟时序数据点（百分比类指标：0-100）
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

// 生成网络流量时序数据点（bps）
function generateNetworkPoints(count: number, baseMbps: number, variance: number) {
  const now = Date.now()
  const points = []
  for (let i = 0; i < count; i++) {
    points.push({
      timestamp: now - (count - 1 - i) * 60000,
      value: Math.round(Math.max(0, baseMbps + (Math.random() - 0.5) * variance) * 1e6),
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
  const avg = (field: keyof (typeof serverProfiles)[string]) =>
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
    '[GET]/api/monitor/overview': ({ query }: { query: Record<string, string> }) => {
      if (query.serverId) {
        const item = overviewData.find(
          (s: Record<string, unknown>) => s.serverId === query.serverId,
        )
        return { code: 200, msg: 'success', data: item ? [item] : [] }
      }
      return { code: 200, msg: 'success', data: overviewData }
    },

    '[GET]/api/monitor/network': ({ query }: { query: Record<string, string> }) => {
      const p = getProfile(query.serverId)
      const count = 30
      return {
        code: 200,
        msg: 'success',
        data: {
          rx: generateNetworkPoints(count, p.rx, 25),
          tx: generateNetworkPoints(count, p.tx, 15),
        },
      }
    },

    '[GET]/api/monitor/memory': ({ query }: { query: Record<string, string> }) => {
      const p = getProfile(query.serverId)
      return {
        code: 200,
        msg: 'success',
        data: generateMetricPoints(30, p.memory, 12),
      }
    },

    '[GET]/api/monitor/disk': ({ query }: { query: Record<string, string> }) => {
      const p = getProfile(query.serverId)
      return {
        code: 200,
        msg: 'success',
        data: generateMetricPoints(30, p.disk, 8),
      }
    },

    '[GET]/api/monitor/cpu': ({ query }: { query: Record<string, string> }) => {
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
