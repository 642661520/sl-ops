<template>
  <div class="page-container">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">仪表盘</h1>
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
    </div>

    <!-- 统计卡片 -->
    <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <app-card>
        <div class="flex items-center gap-4">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30"
          >
            <span class="i-carbon-data-center text-2xl text-blue-600 dark:text-blue-400"></span>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ stats.servers }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">服务器总数</p>
          </div>
        </div>
      </app-card>

      <app-card>
        <div class="flex items-center gap-4">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30"
          >
            <span
              class="i-carbon-cics-system-group text-2xl text-green-600 dark:text-green-400"
            ></span>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ stats.services }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">服务总数</p>
          </div>
        </div>
      </app-card>

      <app-card>
        <div class="flex items-center gap-4">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30"
          >
            <span class="i-carbon-checkmark text-2xl text-emerald-600 dark:text-emerald-400"></span>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ stats.running }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">运行中</p>
          </div>
        </div>
      </app-card>

      <app-card>
        <div class="flex items-center gap-4">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30"
          >
            <span class="i-carbon-close text-2xl text-red-600 dark:text-red-400"></span>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ stats.stopped }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">已停止</p>
          </div>
        </div>
      </app-card>
    </div>

    <!-- 服务器监控总览 -->
    <app-card title="服务器监控总览" class="mb-6">
      <app-table
        :columns="overviewColumns"
        :data="overviewData"
        :loading="overviewLoading"
        empty-text="暂无监控数据"
      >
        <template #cell-cpuUsage="{ value }">
          <div class="flex items-center gap-2">
            <div class="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                class="h-full rounded-full transition-all"
                :class="getUsageColor(Number(value))"
                :style="{ width: value + '%' }"
              ></div>
            </div>
            <span class="text-xs tabular-nums">{{ value }}%</span>
          </div>
        </template>
        <template #cell-memoryUsage="{ value }">
          <div class="flex items-center gap-2">
            <div class="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                class="h-full rounded-full transition-all"
                :class="getUsageColor(Number(value))"
                :style="{ width: value + '%' }"
              ></div>
            </div>
            <span class="text-xs tabular-nums">{{ value }}%</span>
          </div>
        </template>
        <template #cell-diskUsage="{ value }">
          <div class="flex items-center gap-2">
            <div class="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                class="h-full rounded-full transition-all"
                :class="getUsageColor(Number(value))"
                :style="{ width: value + '%' }"
              ></div>
            </div>
            <span class="text-xs tabular-nums">{{ value }}%</span>
          </div>
        </template>
      </app-table>
    </app-card>

    <!-- 趋势图表 -->
    <app-card>
      <template #header>
        <div class="flex flex-wrap items-center gap-4">
          <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">性能趋势</h3>
          <div class="w-52">
            <app-select
              v-model="selectedServerId"
              :options="serverOptions"
              placeholder="选择服务器"
            />
          </div>
          <div class="flex gap-1">
            <button
              v-for="tab in chartTabs"
              :key="tab.key"
              class="rounded-md px-3 py-1 text-xs font-medium transition-colors"
              :class="
                activeTab === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'
              "
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>
      </template>
      <div class="h-64">
        <v-chart
          v-if="chartOption"
          :option="chartOption"
          :autoresize="true"
          class="h-full w-full"
        />
        <div v-else class="flex-center h-full text-sm text-gray-400">加载中...</div>
      </div>
    </app-card>
  </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'
import type { TableColumn } from '@/components/ui/AppTable.vue'

// 统计
const stats = reactive({
  servers: 5,
  services: 10,
  running: 8,
  stopped: 2,
})

const lastUpdated = ref('--')
const refreshing = ref(false)

function updateTime() {
  lastUpdated.value = new Date().toLocaleTimeString('zh-CN')
}

async function manualRefresh() {
  refreshing.value = true
  await Promise.all([loadOverview(), loadChartData()])
  updateTime()
  refreshing.value = false
}

// 监控总览
const overviewLoading = ref(false)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const overviewData = ref<any[]>([])

const overviewColumns: TableColumn[] = [
  { key: 'hostName', title: '主机名' },
  { key: 'cpuUsage', title: 'CPU' },
  { key: 'memoryUsage', title: '内存' },
  { key: 'diskUsage', title: '磁盘' },
]

function getUsageColor(value: number) {
  if (value > 80) return 'bg-red-500'
  if (value > 60) return 'bg-amber-500'
  return 'bg-green-500'
}

// 图表
const activeTab = ref('cpu')
const selectedServerId = ref('')
const serverOptions = ref<{ label: string; value: string }[]>([{ label: '全部服务器', value: '' }])
const chartTabs = [
  { key: 'cpu', label: 'CPU' },
  { key: 'memory', label: '内存' },
  { key: 'disk', label: '磁盘' },
  { key: 'network', label: '网络' },
]

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']

interface ChartSeries {
  name: string
  data: { timestamp: number; value: number }[]
}

const chartSeries = ref<ChartSeries[]>([])

const chartOption = computed(() => {
  if (!chartSeries.value.length) return null
  return {
    grid: { top: 10, right: 20, bottom: 20, left: 50 },
    legend: {
      data: chartSeries.value.map((s) => s.name),
      bottom: 0,
      textStyle: { fontSize: 11, color: '#9ca3af' },
    },
    xAxis: {
      type: 'time' as const,
      axisLabel: { fontSize: 10, color: '#9ca3af' },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: {
        fontSize: 10,
        color: '#9ca3af',
        formatter: activeTab.value === 'network' ? '{value} bps' : '{value}%',
      },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
    },
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: '#fff',
      borderColor: '#e5e7eb',
      textStyle: { color: '#374151', fontSize: 12 },
    },
    series: chartSeries.value.map((s, i) => ({
      name: s.name,
      type: 'line' as const,
      data: s.data.map((p) => [p.timestamp, p.value]),
      smooth: true,
      showSymbol: false,
      lineStyle: { color: COLORS[i % COLORS.length], width: 2 },
      areaStyle: {
        color: {
          type: 'linear' as const,
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: COLORS[i % COLORS.length] + '30' },
            { offset: 1, color: COLORS[i % COLORS.length] + '05' },
          ],
        },
      },
    })),
  }
})

async function loadChartData() {
  const params = {
    duration: 1800,
    step: 60,
    serverId: selectedServerId.value || undefined,
  }

  // 单个服务器：直接请求
  if (selectedServerId.value) {
    const res = await fetchMetric(activeTab.value, params)
    const hostName =
      serverOptions.value.find((o) => o.value === selectedServerId.value)?.label ||
      selectedServerId.value
    chartSeries.value = res ? [{ name: hostName, data: res }] : []
    return
  }

  // 全部服务器：并行请求每台服务器
  const serverIds = serverOptions.value.filter((o) => o.value !== '').map((o) => o.value)
  const results = await Promise.all(
    serverIds.map(async (id) => {
      const res = await fetchMetric(activeTab.value, { ...params, serverId: id })
      const opt = serverOptions.value.find((o) => o.value === id)
      return { name: opt?.label || id, data: res || [] }
    }),
  )
  chartSeries.value = results.filter((r) => r.data.length > 0)
}

async function fetchMetric(
  tab: string,
  p: Record<string, unknown>,
): Promise<{ timestamp: number; value: number }[] | null> {
  try {
    let res: { data?: unknown } | null = null
    switch (tab) {
      case 'cpu':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        res = await Apis.monitor.getCpuUsage({ params: p as any }).send()
        break
      case 'memory':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        res = await Apis.monitor.getMemoryUsage({ params: p as any }).send()
        break
      case 'disk':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        res = await Apis.monitor.getDiskUsage({ params: p as any }).send()
        break
      case 'network':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        res = await Apis.monitor.getNetworkUsage({ params: p as any }).send()
        break
    }
    if (!res?.data) return null
    // network 返回 { rx, tx }，取 rx 和 tx 合并或取 rx
    if (tab === 'network' && (res.data as { rx?: unknown }).rx) {
      return (res.data as { rx: { timestamp: number; value: number }[] }).rx
    }
    return Array.isArray(res.data) ? (res.data as { timestamp: number; value: number }[]) : []
  } catch {
    return null
  }
}

async function loadOverview() {
  try {
    const res = await Apis.monitor.getOverview().send()
    overviewData.value = res.data || []
    stats.servers = overviewData.value.length
  } catch {
    /* mock */
  }
}

async function loadServers() {
  try {
    const res = await Apis.asset.list_1({ params: {} }).send()
    const list = res.data || []
    serverOptions.value = [
      { label: '全部服务器', value: '' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...list.map((s: any) => ({ label: s.hostName, value: s.id })),
    ]
  } catch {
    /* mock */
  }
}

watch(activeTab, () => {
  loadChartData()
})

watch(selectedServerId, () => {
  loadChartData()
})

onMounted(async () => {
  await loadServers()
  await manualRefresh()
})

// 每 30 秒自动刷新监控数据（不立即触发，首次由 onMounted 加载）
useIntervalFn(
  async () => {
    await Promise.all([loadOverview(), loadChartData()])
    updateTime()
  },
  30000,
  { immediate: false },
)
</script>
