import { defineMock } from '@alova/mock'
import serversData from './data/servers.json'

let servers = JSON.parse(JSON.stringify(serversData)) as typeof serversData
let nextId = servers.length + 1

export default defineMock(
  {
    '[GET]/server/list': ({ query }: { query: Record<string, string> }) => {
      let result = [...servers]
      if (query.hostIp) {
        result = result.filter((s) => s.hostIp.includes(query.hostIp))
      }
      if (query.hostName) {
        result = result.filter((s) => s.hostName.includes(query.hostName))
      }
      return { code: 200, msg: 'success', data: result }
    },

    '[GET]/server/{id}': ({ params }: { params: { id: string } }) => {
      const srv = servers.find((s) => s.id === params.id)
      if (!srv) {
        return { code: 404, msg: '服务器不存在', data: null }
      }
      return { code: 200, msg: 'success', data: srv }
    },

    '[POST]/server': ({ data }: { data: any }) => {
      const newSrv = {
        id: `srv-${String(nextId++).padStart(3, '0')}`,
        hostIp: data.hostIp || '',
        hostName: data.hostName || '',
        sshPort: data.sshPort || 22,
        sshUsername: data.sshUsername || '',
        nodeExporterPort: data.nodeExporterPort || 9100,
      }
      servers.push(newSrv)
      return { code: 200, msg: '创建成功', data: newSrv.id }
    },

    '[PUT]/server': ({ data }: { data: any }) => {
      const idx = servers.findIndex((s) => s.id === data.id)
      if (idx === -1) {
        return { code: 404, msg: '服务器不存在', data: false }
      }
      servers[idx] = { ...servers[idx], ...data }
      return { code: 200, msg: '更新成功', data: true }
    },

    '[DELETE]/server/{id}': ({ params }: { params: { id: string } }) => {
      const idx = servers.findIndex((s) => s.id === params.id)
      if (idx === -1) {
        return { code: 404, msg: '服务器不存在', data: false }
      }
      servers.splice(idx, 1)
      return { code: 200, msg: '删除成功', data: true }
    },
  },
  true,
)
