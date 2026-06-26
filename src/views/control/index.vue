<template>
  <div class="page-container">
    <div class="sticky top-0 z-10 -mx-4 -mt-4 mb-6 bg-gray-50 px-4 pb-3 pt-4 dark:bg-gray-900">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">服务管控</h1>
        <app-button variant="default" size="sm" @click="refreshStatuses">
          <span class="i-carbon-renew" :class="{ 'animate-spin': refreshing }"></span>
          刷新状态
        </app-button>
      </div>
    </div>

    <!-- 服务卡片网格 -->
    <div v-if="!loading" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <app-card v-for="svc in services" :key="svc.id">
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
            <p class="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
              {{ svc.description || '暂无描述' }}
            </p>
          </div>
          <div class="ml-3 flex-shrink-0">
            <span
              class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
              :class="
                statusMap[svc.id] === 'running'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              "
            >
              <span
                class="i-carbon-circle-filled text-[8px]"
                :class="statusMap[svc.id] === 'running' ? 'text-green-500' : 'text-gray-400'"
              ></span>
              {{ statusMap[svc.id] === 'running' ? '运行中' : '已停止' }}
            </span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="mt-4 flex gap-2">
          <app-button
            variant="default"
            size="sm"
            :disabled="statusMap[svc.id] === 'running' || actionLoading[svc.id]"
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
            :disabled="actionLoading[svc.id]"
            :loading="actionLoading[svc.id] && actionTarget[svc.id] === 'restart'"
            @click="executeAction(svc, 'restart')"
          >
            <span class="i-carbon-restart text-amber-500"></span>
            重启
          </app-button>
        </div>
      </app-card>
    </div>

    <!-- 加载态 -->
    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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

    <!-- 空状态 -->
    <app-empty v-if="!loading && services.length === 0" description="暂无服务数据" />
  </div>
</template>

<script setup lang="ts">
import { MESSAGE_KEY } from '@/composables/useMessage'
import type { MessageInstance } from '@/composables/useMessage'
import { DIALOG_KEY } from '@/composables/useDialog'
import type { DialogInstance } from '@/composables/useDialog'

const message = inject<MessageInstance>(MESSAGE_KEY)!
const dialog = inject<DialogInstance>(DIALOG_KEY)!

const loading = ref(false)
const refreshing = ref(false)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const services = ref<any[]>([])

// 状态映射
const statusMap = ref<Record<string, string>>({})

// 操作加载状态
const actionLoading = reactive<Record<string, boolean>>({})
const actionTarget = reactive<Record<string, string>>({})

function getTypeLabel(type: string) {
  const map: Record<string, string> = { docker: 'Docker', systemctl: 'Systemctl', custom: 'Custom' }
  return map[type] || type
}

function getTypeTag(type: string) {
  const map: Record<string, string> = { docker: 'info', systemctl: 'success', custom: 'warning' }
  return (map[type] || 'info') as 'info' | 'success' | 'warning' | 'danger'
}

async function loadServices() {
  loading.value = true
  try {
    const res = await Apis.service.list({ params: {} }).send()
    services.value = res.data || []
  } catch {
    services.value = []
  } finally {
    loading.value = false
  }
}

async function refreshStatuses() {
  refreshing.value = true
  const results = await Promise.all(
    services.value.map(async (svc) => {
      try {
        const res = await Apis.serviceControl.getStatus({ params: { serviceId: svc.id } }).send()
        return { id: svc.id, status: res.data || 'stopped' }
      } catch {
        return { id: svc.id, status: 'stopped' }
      }
    }),
  )
  for (const r of results) {
    statusMap.value[r.id] = r.status
  }
  refreshing.value = false
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function executeAction(svc: any, action: string) {
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: { serviceId: svc.id, action: action as any },
          })
          .send()
        message.success(res.data || `${actionLabel[action]}操作已执行`)
        // 更新状态
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

onMounted(async () => {
  await loadServices()
  await refreshStatuses()
})

// 每 10 秒刷新服务运行状态
useIntervalFn(refreshStatuses, 10000, { immediate: false })
</script>
