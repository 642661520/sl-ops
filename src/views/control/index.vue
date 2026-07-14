<template>
  <div class="page-container flex flex-col h-full pb-0">
    <!-- 顶部：标题 + 搜索 -->
    <div class="mb-6 shrink-0">
      <div class="mb-4 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">服务管理</h1>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-3 text-xs text-gray-400">
            <span class="i-carbon-time"></span>
            <span>每 30s 刷新 · 上次：{{ lastUpdated }}</span>
            <button
              class="cursor-pointer rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              @click="manualRefresh"
            >
              <span class="i-carbon-renew text-sm" :class="{ 'animate-spin': refreshing }"></span>
            </button>
          </div>
          <app-button variant="primary" size="sm" @click="openCreate">
            <span class="i-carbon-add"></span>
            新增服务
          </app-button>
        </div>
      </div>

      <!-- 搜索筛选 -->
      <app-card>
        <div class="flex flex-wrap gap-3">
          <div class="w-56">
            <app-input v-model="searchName" placeholder="搜索服务名称" :clearable="true">
              <template #prefix>
                <span class="i-carbon-search"></span>
              </template>
            </app-input>
          </div>
          <div class="w-40">
            <app-select v-model="searchType" :options="searchTypeOptions" placeholder="服务类型" />
          </div>
          <div class="w-48">
            <app-select
              v-model="searchServerId"
              :options="searchServerOptions"
              placeholder="所属服务器"
            />
          </div>
          <app-button variant="default" size="sm" @click="loadServices">
            <span class="i-carbon-search"></span>
            查询
          </app-button>
        </div>
      </app-card>
    </div>

    <!-- 中间：可滚动的卡片区域 -->
    <div class="flex-1 overflow-y-auto min-h-0">
      <!-- 服务卡片网格 -->
      <div
        v-if="!loading"
        class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        style="grid-template-columns: repeat(auto-fill, minmax(380px, 1fr))"
      >
        <app-card v-for="svc in pagedServices" :key="svc.id">
          <div class="flex items-start justify-between">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <h4 class="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {{ svc.serviceName }}
                </h4>
                <app-tag :type="getTypeTag(svc.serviceType)">
                  {{ getTypeLabel(svc.serviceType) }}
                </app-tag>
              </div>
              <p class="mt-1 truncate text-xs text-gray-400 dark:text-gray-500">
                {{ serverNameMap[svc.serverId] || svc.serverId }}
              </p>
              <p class="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                {{ svc.description || '暂无描述' }}
              </p>
            </div>
            <div class="ml-3 flex flex-shrink-0 items-center gap-1">
              <app-button
                variant="default"
                size="sm"
                :loading="refreshingSingle[svc.id] || refreshing"
                @click="refreshSingleStatus(svc.id)"
              >
                刷新
              </app-button>
              <span
                class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                :class="[
                  getStatusClass(statusMap[svc.id]),
                  { 'status-pulse': refreshingSingle[svc.id] || refreshing },
                ]"
              >
                <span
                  class="i-carbon-circle-filled text-[8px]"
                  :class="[
                    getStatusDotClass(statusMap[svc.id]),
                    { 'animate-ping': refreshingSingle[svc.id] || refreshing },
                  ]"
                ></span>
                {{ getStatusText(statusMap[svc.id]) }}
              </span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="mt-4 flex gap-2">
            <app-button
              variant="default"
              size="sm"
              :disabled="
                statusMap[svc.id] === 'running' || !statusMap[svc.id] || actionLoading[svc.id]
              "
              :loading="actionLoading[svc.id] && actionTarget[svc.id] === 'start'"
              @click="executeAction(svc, 'start')"
            >
              <span class="i-carbon-play text-green-500"></span>
              启动
            </app-button>
            <app-button
              variant="default"
              size="sm"
              :disabled="statusMap[svc.id] !== 'running' || actionLoading[svc.id]"
              :loading="actionLoading[svc.id] && actionTarget[svc.id] === 'stop'"
              @click="executeAction(svc, 'stop')"
            >
              <span class="i-carbon-stop text-red-500"></span>
              停止
            </app-button>
            <app-button
              variant="default"
              size="sm"
              :disabled="!statusMap[svc.id] || actionLoading[svc.id]"
              :loading="actionLoading[svc.id] && actionTarget[svc.id] === 'restart'"
              @click="executeAction(svc, 'restart')"
            >
              <span class="i-carbon-restart text-amber-500"></span>
              重启
            </app-button>
            <div class="ml-auto flex gap-1">
              <app-button variant="text" size="sm" @click="openEdit(svc)">
                <span class="i-carbon-edit"></span>
              </app-button>
              <app-button variant="text" size="sm" @click="handleDelete(svc)">
                <span class="i-carbon-trash-can text-red-500"></span>
              </app-button>
            </div>
          </div>
        </app-card>
      </div>

      <!-- 加载态 -->
      <div
        v-else
        class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        style="grid-template-columns: repeat(auto-fill, minmax(380px, 1fr))"
      >
        <div
          v-for="i in 6"
          :key="i"
          class="animate-pulse rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="mb-3 h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div class="mb-8 h-3 w-1/2 rounded bg-gray-100 dark:bg-gray-700"></div>
          <div class="flex gap-2">
            <div class="h-8 w-16 rounded bg-gray-100 dark:bg-gray-700"></div>
            <div class="h-8 w-16 rounded bg-gray-100 dark:bg-gray-700"></div>
            <div class="h-8 w-16 rounded bg-gray-100 dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div
      v-if="!loading && services.length > 0"
      class="border-t border-gray-100 py-3 dark:border-gray-700"
    >
      <div class="flex items-center justify-between min-h-8">
        <span class="text-sm text-gray-500 dark:text-gray-400">共 {{ services.length }} 条</span>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>每页</span>
            <div class="w-22">
              <app-select v-model="pageSize" :options="pageSizeOptions" placeholder="条数" />
            </div>
            <span>条</span>
          </div>
          <app-pagination
            :current="currentPage"
            :total="services.length"
            :page-size="pageSize"
            @change="currentPage = $event"
          />
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <app-empty v-if="!loading && services.length === 0" description="暂无服务数据" />

    <!-- 新增/编辑弹窗 -->
    <app-modal
      :visible="modalVisible"
      :title="editingId ? '编辑服务' : '新增服务'"
      :loading="submitting"
      @confirm="handleSubmit"
      @cancel="closeModal"
    >
      <div class="space-y-4">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >服务名称</label
          >
          <app-input
            v-model="form.serviceName"
            :disabled="!!editingId"
            placeholder="请输入服务名称"
          />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >服务类型</label
          >
          <app-select
            v-model="form.serviceType"
            :options="typeOptions"
            :disabled="!!editingId"
            placeholder="请选择服务类型"
          />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >所属服务器</label
          >
          <app-select
            v-model="form.serverId"
            :options="serverOptions"
            :disabled="!!editingId"
            placeholder="请选择服务器"
            @update:model-value="(v: string | number) => onServerChange(v as string)"
          />
        </div>

        <!-- 已有远程服务快捷选择（仅新增模式） -->
        <div v-if="!editingId && form.serverId">
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >选择已有服务</label
          >
          <div class="mb-2">
            <app-input v-model="remoteKeyword" placeholder="搜索筛选..." :clearable="true">
              <template #prefix>
                <span class="i-carbon-search text-xs"></span>
              </template>
            </app-input>
          </div>
          <div
            v-if="remoteServiceOptions.length === 0"
            class="py-2 text-center text-xs text-gray-400"
          >
            无匹配服务
          </div>
          <div v-else class="flex flex-wrap gap-1.5">
            <button
              v-for="name in remoteServiceOptions"
              :key="name"
              :disabled="allServiceNames.has(name)"
              class="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs transition-colors"
              :class="
                allServiceNames.has(name)
                  ? 'cursor-not-allowed border-gray-100 bg-gray-100/50 text-gray-300 line-through dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-600'
                  : 'cursor-pointer text-gray-600 hover:border-primary/40 hover:bg-primary/5 hover:text-primary dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-primary/40 dark:hover:bg-primary/10'
              "
              @click="form.serviceName = name"
            >
              {{ name }}
            </button>
          </div>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >描述</label
          >
          <app-input v-model="form.description" placeholder="请输入服务描述" />
        </div>
      </div>
    </app-modal>
  </div>
</template>

<script setup lang="ts">
import { MESSAGE_KEY } from '@/composables/useMessage'
import type { MessageInstance } from '@/composables/useMessage'
import { DIALOG_KEY } from '@/composables/useDialog'
import type { DialogInstance } from '@/composables/useDialog'

const message = inject<MessageInstance>(MESSAGE_KEY)!
const dialog = inject<DialogInstance>(DIALOG_KEY)!

interface ServiceForm {
  serviceName: string
  serviceType: 'docker' | 'systemctl'
  serverId: string
  description: string
}

interface ServerOption {
  id: string
  hostName: string
  hostIp: string
}

interface ServiceItem {
  id: string
  serverId: string
  serviceName: string
  serviceType: string
  description: string
}

const loading = ref(false)
const refreshing = ref(false)
const refreshingSingle = reactive<Record<string, boolean>>({})
const lastUpdated = ref('--')
const services = ref<ServiceItem[]>([])
const searchName = ref('')
const searchType = ref('')
const searchServerId = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(12)
const pageSizeOptions = [
  { label: '12 条', value: 12 },
  { label: '24 条', value: 24 },
  { label: '48 条', value: 48 },
]
const pagedServices = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return services.value.slice(start, start + pageSize.value)
})

// 状态映射
const statusMap = ref<Record<string, string>>({})

// 操作加载状态
const actionLoading = reactive<Record<string, boolean>>({})
const actionTarget = reactive<Record<string, string>>({})

// 服务器选项
const serverOptions = ref<{ label: string; value: string }[]>([])
const serverNameMap = ref<Record<string, string>>({})

// 弹窗
const modalVisible = ref(false)
const editingId = ref('')
const submitting = ref(false)
const typeOptions = [
  { label: 'Docker', value: 'docker' },
  { label: 'Systemctl', value: 'systemctl' },
]

const searchTypeOptions = [{ label: '全部类型', value: '' }, ...typeOptions]

const searchServerOptions = computed(() => [
  { label: '全部服务器', value: '' },
  ...serverOptions.value,
])

const emptyForm = (): ServiceForm => ({
  serviceName: '',
  serviceType: 'docker' as const,
  serverId: '',
  description: '',
})

const form = reactive<ServiceForm>(emptyForm())

// 远程已有服务
const remoteServices = ref<{ docker: string[]; systemctl: string[] }>({ docker: [], systemctl: [] })
const remoteKeyword = ref('')

const remoteServiceOptions = computed(() => {
  if (!form.serverId) return []
  return remoteServices.value[form.serviceType as 'docker' | 'systemctl'] || []
})

const allServiceNames = ref(new Set<string>())

async function fetchAllServiceNames() {
  try {
    const res = await Apis.service.list({ params: {} }).send()
    const names = new Set<string>()
    for (const svc of (res.data || []) as ServiceItem[]) {
      if (svc.serviceName) names.add(svc.serviceName)
    }
    allServiceNames.value = names
  } catch {
    allServiceNames.value = new Set()
  }
}

// --- 状态相关 ---

function statusCodeToLabel(code: number): string {
  const map: Record<number, string> = { 1: 'running', 2: 'stopped', 3: 'error', 4: 'degraded' }
  return map[code] || 'stopped'
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    running: '运行中',
    stopped: '已停止',
    error: '异常',
    degraded: '部分运行',
    unknown: '未知',
  }
  return map[status] || '未知'
}

function getStatusClass(status: string) {
  if (status === 'running')
    return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  if (status === 'degraded')
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
  if (status === 'error') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  if (status === 'unknown') return 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
  return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
}

function getStatusDotClass(status: string) {
  if (status === 'running') return 'text-green-500'
  if (status === 'degraded') return 'text-yellow-500'
  if (status === 'error') return 'text-red-500'
  if (status === 'unknown') return 'text-gray-300 dark:text-gray-600'
  return 'text-gray-400'
}

function getTypeLabel(type: string) {
  const map: Record<string, string> = { docker: 'Docker', systemctl: 'Systemctl' }
  return map[type] || type
}

function getTypeTag(type: string) {
  const map: Record<string, string> = { docker: 'default', systemctl: 'default' }
  return (map[type] || 'default') as 'info' | 'success' | 'warning' | 'danger' | 'default'
}

// --- 数据加载 ---

async function loadServices() {
  loading.value = true
  try {
    const res = await Apis.service
      .list({
        params: {
          serviceName: searchName.value || undefined,
          serviceType: (searchType.value || undefined) as ServiceForm['serviceType'] | undefined,
          serverId: searchServerId.value || undefined,
        },
      })
      .send()
    services.value = (res.data || []) as ServiceItem[]
    currentPage.value = 1
  } catch {
    services.value = []
  } finally {
    loading.value = false
  }
  await refreshStatuses()
}

async function loadServers() {
  try {
    const res = await Apis.asset.list_1({ params: {} }).send()
    const list = (res.data || []) as ServerOption[]
    const map: Record<string, string> = {}
    serverOptions.value = list.map((s) => {
      map[s.id] = s.hostName
      return { label: `${s.hostName} (${s.hostIp})`, value: s.id }
    })
    serverNameMap.value = map
  } catch {
    serverOptions.value = []
    serverNameMap.value = {}
  }
}

async function refreshStatuses() {
  refreshing.value = true
  const ids = pagedServices.value.map((s) => s.id)
  if (ids.length > 0) {
    try {
      const res = await Apis.serviceControl.batchStatus({ data: { serviceIds: ids } }).send()
      for (const item of res.data || []) {
        statusMap.value[item.serviceId] = statusCodeToLabel(item.status)
      }
    } catch {
      for (const id of ids) {
        statusMap.value[id] = 'stopped'
      }
    }
  }
  updateTime()
  refreshing.value = false
}

async function refreshSingleStatus(serviceId: string) {
  refreshingSingle[serviceId] = true
  try {
    const res = await Apis.serviceControl.getStatus({ params: { serviceId } }).send()
    statusMap.value[serviceId] = statusCodeToLabel(res.data ?? 0)
  } catch {
    statusMap.value[serviceId] = 'stopped'
  } finally {
    refreshingSingle[serviceId] = false
  }
}

function updateTime() {
  lastUpdated.value = new Date().toLocaleTimeString('zh-CN')
}

async function manualRefresh() {
  await refreshStatuses()
  updateTime()
}

// --- 远程服务发现 ---

async function fetchRemoteServices(serverId: string, keyword?: string) {
  try {
    const res = await Apis.service
      .discover({ pathParams: { serverId }, params: { keyword: keyword || undefined } })
      .send()
    remoteServices.value = (res.data || { docker: [], systemctl: [] }) as {
      docker: string[]
      systemctl: string[]
    }
  } catch {
    remoteServices.value = { docker: [], systemctl: [] }
  }
}

async function onServerChange(serverId: string) {
  remoteKeyword.value = ''
  if (!serverId) {
    remoteServices.value = { docker: [], systemctl: [] }
    return
  }
  await fetchRemoteServices(serverId)
}

const debouncedSearch = useDebounceFn((keyword: string) => {
  if (form.serverId) fetchRemoteServices(form.serverId, keyword)
}, 300)

watch(remoteKeyword, (val) => debouncedSearch(val))

// --- 启停操作 ---

function executeAction(svc: ServiceItem, action: string) {
  const actionLabel: Record<string, string> = { start: '启动', stop: '停止', restart: '重启' }
  dialog.show({
    title: `确认${actionLabel[action]}`,
    content: `确定要${actionLabel[action]}服务「${svc.serviceName}」吗？`,
    async onConfirm() {
      actionLoading[svc.id] = true
      actionTarget[svc.id] = action
      try {
        const res = await Apis.serviceControl
          .executeControl({
            data: { serviceId: svc.id, action: action as 'start' | 'stop' | 'restart' },
          })
          .send()
        message.success(res.data || `${actionLabel[action]}操作已执行`)
        if (action === 'start' || action === 'restart') {
          statusMap.value[svc.id] = 'running'
        } else if (action === 'stop') {
          statusMap.value[svc.id] = 'stopped'
        }
      } catch (e: unknown) {
        message.error((e as { message?: string }).message || '操作失败')
      } finally {
        actionLoading[svc.id] = false
        actionTarget[svc.id] = ''
      }
    },
  })
}

// --- CRUD ---

async function openCreate() {
  editingId.value = ''
  Object.assign(form, emptyForm())
  modalVisible.value = true
  await fetchAllServiceNames()
}

function openEdit(svc: ServiceItem) {
  editingId.value = svc.id
  Object.assign(form, {
    serviceName: svc.serviceName || '',
    serviceType: svc.serviceType || 'docker',
    serverId: svc.serverId || '',
    description: svc.description || '',
  })
  modalVisible.value = true
}

function closeModal() {
  modalVisible.value = false
  remoteServices.value = { docker: [], systemctl: [] }
  remoteKeyword.value = ''
}

async function handleSubmit() {
  if (!form.serviceName) {
    message.warning('请输入服务名称')
    return
  }
  submitting.value = true
  try {
    if (editingId.value) {
      await Apis.service
        .update({
          data: {
            id: editingId.value,
            serviceName: form.serviceName,
            serviceType: form.serviceType,
            description: form.description,
          },
        })
        .send()
      message.success('更新成功')
    } else {
      await Apis.service.create({ data: form as ServiceForm }).send()
      message.success('创建成功')
    }
    closeModal()
    await loadServices()
  } catch (e: unknown) {
    message.error((e as { message?: string }).message || '操作失败')
  } finally {
    submitting.value = false
  }
}

function handleDelete(svc: ServiceItem) {
  dialog.show({
    title: '删除服务',
    content: `确定要删除服务「${svc.serviceName}」吗？此操作不可撤销。`,
    type: 'danger',
    async onConfirm() {
      try {
        await Apis.service.delete_({ pathParams: { id: svc.id } }).send()
        message.success('删除成功')
        await loadServices()
      } catch (e: unknown) {
        message.error((e as { message?: string }).message || '删除失败')
      }
    },
  })
}

// --- 初始化 ---

onMounted(async () => {
  await Promise.all([loadServices(), loadServers()])
})

watch(currentPage, () => refreshStatuses())

watch(pageSize, () => {
  currentPage.value = 1
  refreshStatuses()
})

useIntervalFn(refreshStatuses, 30000, { immediate: false })
</script>

<style scoped>
@keyframes status-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.96);
  }
}
.status-pulse {
  animation: status-pulse 0.8s ease-in-out infinite;
}
</style>
