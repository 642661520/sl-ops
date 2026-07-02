import { defineMock } from '@alova/mock'
import servicesData from './data/services.json'

const services = JSON.parse(JSON.stringify(servicesData)) as typeof servicesData
let nextId = services.length + 1

export default defineMock(
  {
    '[GET]/api/service/list': ({ query }: { query: Record<string, string> }) => {
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

    '[GET]/api/service/{id}': ({ params }: { params: { id: string } }) => {
      const svc = services.find((s) => s.id === params.id)
      if (!svc) {
        return { code: 404, msg: '服务不存在', data: null }
      }
      return { code: 200, msg: 'success', data: svc }
    },

    '[POST]/api/service': ({ data }: { data: Record<string, unknown> }) => {
      const newSvc = {
        id: `svc-${String(nextId++).padStart(3, '0')}`,
        serverId: String(data.serverId || ''),
        serviceName: String(data.serviceName || ''),
        serviceType: String(data.serviceType || 'docker'),
        description: String(data.description || ''),
      }
      services.push(newSvc)
      return { code: 200, msg: '创建成功', data: newSvc.id }
    },

    '[PUT]/api/service': ({ data }: { data: Record<string, unknown> }) => {
      const idx = services.findIndex((s) => s.id === data.id)
      if (idx === -1) {
        return { code: 404, msg: '服务不存在', data: false }
      }
      services[idx] = { ...services[idx], ...(data as object) }
      return { code: 200, msg: '更新成功', data: true }
    },

    '[DELETE]/api/service/{id}': ({ params }: { params: { id: string } }) => {
      const idx = services.findIndex((s) => s.id === params.id)
      if (idx === -1) {
        return { code: 404, msg: '服务不存在', data: false }
      }
      services.splice(idx, 1)
      return { code: 200, msg: '删除成功', data: true }
    },

    '[GET]/api/service/discover/{serverId}': ({
      params,
      query,
    }: {
      params: { serverId: string }
      query: { keyword?: string }
    }) => {
      const dockerMap: Record<string, string[]> = {
        'srv-001': ['nginx-prod', 'mysql-master', 'redis-cache'],
        'srv-002': ['jenkins-master', 'sonarqube', 'nexus-oss'],
        'srv-003': ['kafka-broker-1', 'kafka-broker-2', 'zookeeper'],
        'srv-004': ['postgres-main', 'pgbouncer', 'redis-sentinel'],
      }
      const systemctlMap: Record<string, string[]> = {
        'srv-001': ['sshd', 'nginx', 'fail2ban'],
        'srv-002': ['docker', 'jenkins-agent', 'cron'],
        'srv-003': ['sshd', 'firewalld', 'rsyslog'],
        'srv-004': ['sshd', 'postgresql', 'prometheus-node-exporter'],
      }
      const filter = (arr: string[]) =>
        query.keyword ? arr.filter((n) => n.includes(query.keyword!)) : arr
      return {
        code: 200,
        msg: 'success',
        data: {
          docker: filter(dockerMap[params.serverId] || ['app-container', 'sidecar-container']),
          systemctl: filter(systemctlMap[params.serverId] || ['sshd', 'cron', 'systemd-journald']),
        },
      }
    },
  },
  true,
)
