import { defineMock } from '@alova/mock'
import servicesData from './data/services.json'

let services = JSON.parse(JSON.stringify(servicesData)) as typeof servicesData
let nextId = services.length + 1

export default defineMock(
  {
    '[GET]/service/list': ({ query }: { query: Record<string, string> }) => {
      let result = [...services]
      if (query.serverId) {
        result = result.filter((s) => s.serverId === query.serverId)
      }
      if (query.serviceName) {
        result = result.filter((s) => s.serviceName.includes(query.serviceName))
      }
      if (query.serviceType) {
        result = result.filter((s) => s.serviceType === query.serviceType)
      }
      return { code: 200, msg: 'success', data: result }
    },

    '[GET]/service/{id}': ({ params }: { params: { id: string } }) => {
      const svc = services.find((s) => s.id === params.id)
      if (!svc) {
        return { code: 404, msg: '服务不存在', data: null }
      }
      return { code: 200, msg: 'success', data: svc }
    },

    '[POST]/service': ({ data }: { data: any }) => {
      const newSvc = {
        id: `svc-${String(nextId++).padStart(3, '0')}`,
        serverId: data.serverId || '',
        serviceName: data.serviceName || '',
        serviceType: data.serviceType || 'docker',
        description: data.description || '',
        startCommand: data.startCommand,
        stopCommand: data.stopCommand,
        restartCommand: data.restartCommand,
        statusCommand: data.statusCommand,
      }
      services.push(newSvc)
      return { code: 200, msg: '创建成功', data: newSvc.id }
    },

    '[PUT]/service': ({ data }: { data: any }) => {
      const idx = services.findIndex((s) => s.id === data.id)
      if (idx === -1) {
        return { code: 404, msg: '服务不存在', data: false }
      }
      services[idx] = { ...services[idx], ...data }
      return { code: 200, msg: '更新成功', data: true }
    },

    '[DELETE]/service/{id}': ({ params }: { params: { id: string } }) => {
      const idx = services.findIndex((s) => s.id === params.id)
      if (idx === -1) {
        return { code: 404, msg: '服务不存在', data: false }
      }
      services.splice(idx, 1)
      return { code: 200, msg: '删除成功', data: true }
    },
  },
  true,
)
