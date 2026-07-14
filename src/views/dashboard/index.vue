<template>
  <div class="page-container">
    <div class="sticky top-0 z-10 -mx-4 -mt-4 mb-6 bg-gray-50 px-4 pb-3 pt-4 dark:bg-gray-900">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">监控中心</h1>
        <div class="flex items-center gap-3 text-xs text-gray-400">
          <span class="i-carbon-time"></span>
          <span>每 {{ selectedStep }}s 刷新 · 上次：{{ lastUpdated }}</span>
          <div class="w-24">
            <app-select v-model="selectedStep" :options="stepOptions" placeholder="步长" />
          </div>
          <button
            class="cursor-pointer rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            @click="manualRefresh"
          >
            <span class="i-carbon-renew text-sm" :class="{ 'animate-spin': refreshing }"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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
            class="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30"
          >
            <span class="i-carbon-close-outline text-2xl text-red-600 dark:text-red-400"></span>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {{ stats.offlineServers }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">离线服务器</p>
          </div>
        </div>
      </app-card>

      <app-card>
        <div class="flex items-center gap-4">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30"
          >
            <span class="i-carbon-warning text-2xl text-amber-600 dark:text-amber-400"></span>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ stats.highCpu }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">CPU 告警 (&gt;80%)</p>
          </div>
        </div>
      </app-card>

      <app-card>
        <div class="flex items-center gap-4">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30"
          >
            <span class="i-carbon-warning-alt text-2xl text-red-600 dark:text-red-400"></span>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {{ stats.highMemory }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">内存告警 (&gt;80%)</p>
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
        <template #cell-status="{ row }">
          <div class="flex items-center gap-1.5">
            <span
              class="h-2 w-2 rounded-full"
              :class="row.online ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'"
            ></span>
            <span
              class="text-xs"
              :class="
                row.online
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-400 dark:text-gray-500'
              "
            >
              {{ row.online ? '在线' : '离线' }}
            </span>
          </div>
        </template>
        <template #cell-cpuUsage="{ value, row }">
          <template v-if="row.online">
            <div class="flex items-center gap-2">
              <div class="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  class="h-full rounded-full transition-all"
                  :class="getUsageColor(Number(value))"
                  :style="{ width: value + '%' }"
                ></div>
              </div>
              <span class="text-xs tabular-nums" :class="{ 'pulse-highlight': isRefreshing }"
                >{{ Number(value).toFixed(2) }}%</span
              >
            </div>
          </template>
          <span v-else class="text-xs text-gray-300 dark:text-gray-600">--</span>
        </template>
        <template #cell-memoryUsage="{ value, row }">
          <template v-if="row.online">
            <div class="flex items-center gap-2">
              <div class="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  class="h-full rounded-full transition-all"
                  :class="getUsageColor(Number(value))"
                  :style="{ width: value + '%' }"
                ></div>
              </div>
              <span class="text-xs tabular-nums" :class="{ 'pulse-highlight': isRefreshing }"
                >{{ Number(value).toFixed(2) }}%</span
              >
            </div>
          </template>
          <span v-else class="text-xs text-gray-300 dark:text-gray-600">--</span>
        </template>
        <template #cell-diskUsage="{ value, row }">
          <template v-if="row.online">
            <div class="flex items-center gap-2">
              <div class="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  class="h-full rounded-full transition-all"
                  :class="getUsageColor(Number(value))"
                  :style="{ width: value + '%' }"
                ></div>
              </div>
              <span class="text-xs tabular-nums" :class="{ 'pulse-highlight': isRefreshing }"
                >{{ Number(value).toFixed(2) }}%</span
              >
            </div>
          </template>
          <span v-else class="text-xs text-gray-300 dark:text-gray-600">--</span>
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
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400">范围</span>
            <div class="w-28">
              <app-select
                v-model="selectedDuration"
                :options="durationOptions"
                placeholder="时间范围"
              />
            </div>
          </div>
          <div class="flex gap-1">
            <button
              v-for="tab in chartTabs"
              :key="tab.key"
              class="cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-colors"
              :class="
                activeTab === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
              "
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>
      </template>
      <div class="h-80">
        <div v-if="chartLoading" class="flex-center h-full text-sm text-gray-400">加载中...</div>
        <div v-else-if="selectedOffline" class="flex-center h-full text-sm text-gray-400">
          该服务器离线，暂无监控数据
        </div>
        <v-chart
          v-else-if="chartOption"
          :option="chartOption"
          :autoresize="true"
          :update-options="{ notMerge: true, lazyUpdate: true }"
          class="h-full w-full"
        />
        <div v-else class="flex-center h-full text-sm text-gray-400">暂无数据</div>
      </div>
    </app-card>
  </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'
import type { TableColumn } from '@/components/ui/AppTable.vue'

// 统计
const stats = reactive({
  servers: 0,
  services: 0,
  offlineServers: 0,
  highCpu: 0,
  highMemory: 0,
})

const lastUpdated = ref('--')
const refreshing = ref(false)

function updateTime() {
  lastUpdated.value = new Date().toLocaleTimeString('zh-CN')
}

async function manualRefresh() {
  if (refreshing.value) return
  refreshing.value = true
  try {
    await Promise.all([loadOverview(), loadServices()])
    await loadChartData()
    updateTime()
    refreshKey.value++
  } finally {
    refreshing.value = false
  }
}

// 监控总览
interface OverviewItem {
  serverId: string
  hostName: string
  online: boolean
  cpuUsage?: string
  memoryUsage?: string
  diskUsage?: string
}

interface MetricParams {
  serverId?: string
  duration?: number
  step?: number
}

interface ServerInfo {
  id: string
  hostName: string
}

const overviewLoading = ref(false)
const overviewData = ref<OverviewItem[]>([])
const refreshKey = ref(0)
const isRefreshing = ref(false)

watch(refreshKey, () => {
  isRefreshing.value = true
  setTimeout(() => {
    isRefreshing.value = false
  }, 1200)
})

const allServers = ref<ServerInfo[]>([])

const overviewColumns: TableColumn[] = [
  { key: 'hostName', title: '主机名' },
  { key: 'status', title: '状态', width: '90px' },
  { key: 'cpuUsage', title: 'CPU' },
  { key: 'memoryUsage', title: '内存' },
  { key: 'diskUsage', title: '磁盘' },
]

function getUsageColor(value: number) {
  if (value > 80) return 'bg-red-500'
  if (value > 60) return 'bg-amber-500'
  return 'bg-green-500'
}

function formatBitrate(bps: number) {
  if (bps >= 1e9) return `${(bps / 1e9).toFixed(2)} Gbps`
  if (bps >= 1e6) return `${(bps / 1e6).toFixed(2)} Mbps`
  if (bps >= 1e3) return `${(bps / 1e3).toFixed(1)} Kbps`
  return `${bps} bps`
}

// 图表
const activeTab = ref('cpu')
const selectedServerId = ref('')
const selectedDuration = ref('900')
const selectedStep = ref('5')
const durationOptions = [
  { label: '15 分钟', value: '900' },
  { label: '30 分钟', value: '1800' },
  { label: '1 小时', value: '3600' },
  { label: '3 小时', value: '10800' },
  { label: '6 小时', value: '21600' },
]
const stepOptions = [
  { label: '5 秒', value: '5' },
  { label: '15 秒', value: '15' },
  { label: '30 秒', value: '30' },
  { label: '1 分钟', value: '60' },
]
const serverOptions = computed(() => {
  const onlineIds = new Set(overviewData.value.filter((s) => s.online).map((s) => s.serverId))
  return [
    { label: '全部服务器', value: '' },
    ...allServers.value.map((s) => ({
      label: onlineIds.has(s.id) ? s.hostName : `${s.hostName}（离线）`,
      value: s.id,
    })),
  ]
})
const chartTabs = [
  { key: 'cpu', label: 'CPU' },
  { key: 'memory', label: '内存' },
  { key: 'disk', label: '磁盘' },
  { key: 'network', label: '网络' },
]

const isDark = useDark()

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']
const RX_COLOR = '#3b82f6'
const TX_COLOR = '#f59e0b'

function getSeriesColor(name: string, index: number) {
  if (name.includes('下行')) return RX_COLOR
  if (name.includes('上行')) return TX_COLOR
  return COLORS[index % COLORS.length]
}

// 根据深色模式动态调整 ECharts 样式颜色
const chartColors = computed(() => ({
  textColor: isDark.value ? '#6b7280' : '#9ca3af',
  axisLineColor: isDark.value ? '#374151' : '#e5e7eb',
  splitLineColor: isDark.value ? '#1f2937' : '#f3f4f6',
  tooltipBg: isDark.value ? '#1f2937' : '#fff',
  tooltipBorder: isDark.value ? '#374151' : '#e5e7eb',
  tooltipText: isDark.value ? '#e5e7eb' : '#374151',
}))

interface ChartSeries {
  name: string
  data: { timestamp: number; value: number }[]
}

const chartSeries = ref<ChartSeries[]>([])
const chartLoading = ref(false)

const selectedOffline = computed(() => {
  if (!selectedServerId.value) return false
  const srv = overviewData.value.find((s) => s.serverId === selectedServerId.value)
  return srv && !srv.online
})

const chartOption = computed(() => {
  if (!chartSeries.value.length) return null
  const c = chartColors.value
  return {
    animation: true,
    animationDuration: 800,
    animationEasing: 'linear' as const,
    grid: { top: 10, right: 20, bottom: 50, left: 50 },
    color: chartSeries.value.map((s, i) => getSeriesColor(s.name, i)),
    legend: {
      data: chartSeries.value.map((s) => s.name),
      bottom: 12,
      itemGap: 12,
      textStyle: { fontSize: 10, color: c.textColor },
    },
    xAxis: {
      type: 'time' as const,
      axisLabel: { fontSize: 10, color: c.textColor },
      axisLine: { lineStyle: { color: c.axisLineColor } },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: {
        fontSize: 10,
        color: c.textColor,
        formatter: activeTab.value === 'network' ? formatBitrate : '{value}%',
      },
      splitLine: { lineStyle: { color: c.splitLineColor } },
    },
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: c.tooltipBg,
      borderColor: c.tooltipBorder,
      textStyle: { color: c.tooltipText, fontSize: 12 },
      valueFormatter: (value: unknown) => {
        if (activeTab.value === 'network') return formatBitrate(value as number)
        return `${value}%`
      },
    },
    series: chartSeries.value.map((s, i) => {
      const color = getSeriesColor(s.name, i)
      return {
        name: s.name,
        type: 'line' as const,
        data: s.data.map((p) => [p.timestamp, p.value]),
        showSymbol: false,
        animationDelay: i * 80,
        animationDurationUpdate: 500,
        lineStyle: { color, width: 2 },
        areaStyle: {
          color: {
            type: 'linear' as const,
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: color + '30' },
              { offset: 1, color: color + '05' },
            ],
          },
        },
      }
    }),
  }
})

async function loadChartData() {
  if (selectedOffline.value) {
    chartSeries.value = []
    chartLoading.value = false
    return
  }
  const isFirstLoad = chartSeries.value.length === 0
  if (isFirstLoad) chartLoading.value = true
  try {
    const params = {
      duration: Number(selectedDuration.value),
      step: Number(selectedStep.value),
      serverId: selectedServerId.value || undefined,
    }

    // 单个服务器：直接请求
    if (selectedServerId.value) {
      const hostName =
        serverOptions.value.find((o) => o.value === selectedServerId.value)?.label ||
        selectedServerId.value
      const series = await fetchMetric(activeTab.value, params)
      if (!series) {
        chartSeries.value = []
        return
      }
      chartSeries.value = series.map((s) => ({ ...s, name: `${hostName} ${s.name}` }))
      return
    }

    // 全部服务器：并行请求每台服务器
    const serverIds = serverOptions.value.filter((o) => o.value !== '').map((o) => o.value)
    const results = await Promise.all(
      serverIds.map(async (id) => {
        const series = await fetchMetric(activeTab.value, { ...params, serverId: id })
        const opt = serverOptions.value.find((o) => o.value === id)
        return { name: opt?.label || id, series: series || [] }
      }),
    )
    chartSeries.value = results
      .filter((r) => r.series.length > 0)
      .flatMap((r) => r.series.map((s) => ({ ...s, name: `${r.name} ${s.name}` })))
  } finally {
    chartLoading.value = false
  }
}

async function fetchMetric(tab: string, p: MetricParams): Promise<ChartSeries[] | null> {
  try {
    let res: { data?: unknown } | null = null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params = p as any
    switch (tab) {
      case 'cpu':
        res = await Apis.monitor.getCpuUsage({ params }).send()
        break
      case 'memory':
        res = await Apis.monitor.getMemoryUsage({ params }).send()
        break
      case 'disk':
        res = await Apis.monitor.getDiskUsage({ params }).send()
        break
      case 'network':
        res = await Apis.monitor.getNetworkUsage({ params }).send()
        break
    }
    if (!res?.data) return null
    if (tab === 'network' && (res.data as { rx?: unknown }).rx) {
      const net = res.data as {
        rx: { timestamp: number; value: number }[]
        tx: { timestamp: number; value: number }[]
      }
      return [
        { name: '下行', data: net.rx || [] },
        { name: '上行', data: net.tx || [] },
      ]
    }
    const list = Array.isArray(res.data) ? (res.data as { timestamp: number; value: number }[]) : []
    return [{ name: '', data: list }]
  } catch {
    return null
  }
}

async function loadOverview() {
  const isFirstLoad = overviewData.value.length === 0
  if (isFirstLoad) overviewLoading.value = true
  try {
    const res = await Apis.monitor.getOverview().send()
    const data = (res.data || []) as {
      serverId?: string
      cpuUsage: string
      memoryUsage: string
      diskUsage: string
    }[]
    const overviewMap = new Map(data.map((s) => [s.serverId, s]))

    overviewData.value = allServers.value.map((srv): OverviewItem => {
      const ov = overviewMap.get(srv.id)
      const hasMetrics =
        ov && (Number(ov.cpuUsage) > 0 || Number(ov.memoryUsage) > 0 || Number(ov.diskUsage) > 0)
      if (ov && hasMetrics) {
        return {
          serverId: srv.id,
          hostName: srv.hostName,
          online: true,
          cpuUsage: ov.cpuUsage,
          memoryUsage: ov.memoryUsage,
          diskUsage: ov.diskUsage,
        }
      }
      return { serverId: srv.id, hostName: srv.hostName, online: false }
    })

    stats.servers = allServers.value.length
    stats.offlineServers = overviewData.value.filter((s) => !s.online).length
    stats.highCpu = data.filter((s) => Number(s.cpuUsage) > 80).length
    stats.highMemory = data.filter((s) => Number(s.memoryUsage) > 80).length
  } catch {
    overviewData.value = allServers.value.map((srv) => ({
      serverId: srv.id,
      hostName: srv.hostName,
      online: false,
    }))
    stats.servers = allServers.value.length
    stats.offlineServers = allServers.value.length
    stats.highCpu = 0
    stats.highMemory = 0
  } finally {
    overviewLoading.value = false
  }
}

async function loadServices() {
  try {
    const res = await Apis.service.list({ params: {} }).send()
    stats.services = (res.data || []).length
  } catch {
    stats.services = 0
  }
}

async function loadServers() {
  try {
    const res = await Apis.asset.list_1({ params: {} }).send()
    const list = (res.data || []) as ServerInfo[]
    allServers.value = list.map((s) => ({ id: s.id, hostName: s.hostName }))
  } catch {
    allServers.value = []
  }
}

watch(activeTab, () => {
  loadChartData()
})

watch(selectedServerId, () => {
  loadChartData()
})

watch(selectedDuration, () => {
  loadChartData()
})

const refreshDelay = computed(() => Number(selectedStep.value) * 1000)

const { start: startAutoRefresh, stop: stopAutoRefresh } = useTimeoutFn(
  async () => {
    refreshing.value = true
    try {
      await Promise.all([loadOverview(), loadServices()])
      await loadChartData()
      updateTime()
      refreshKey.value++
    } finally {
      refreshing.value = false
      startAutoRefresh()
    }
  },
  refreshDelay,
  { immediate: false },
)

watch(selectedStep, async () => {
  stopAutoRefresh()
  await loadChartData()
  startAutoRefresh()
})

onMounted(async () => {
  await loadServers()
  await manualRefresh()
  startAutoRefresh()
})
</script>

<style scoped>
@keyframes pulse-highlight {
  0% {
    color: inherit;
  }
  30% {
    color: #4f46e5;
  }
  100% {
    color: inherit;
  }
}
.pulse-highlight {
  animation: pulse-highlight 1s ease-in-out;
}
</style>
