<template>
  <div
    class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
  >
    <!-- Loading 状态 -->
    <div v-if="loading" class="p-8">
      <div class="animate-pulse space-y-3">
        <div v-for="i in 5" :key="i" class="flex gap-4">
          <div
            v-for="col in columns.length"
            :key="col"
            class="h-4 flex-1 rounded bg-gray-200 dark:bg-gray-700"
            :style="{ width: columns[col - 1]?.width }"
          />
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!data || data.length === 0">
      <AppEmpty :description="emptyText" />
    </div>

    <!-- 数据表格 -->
    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr
            class="border-b border-gray-100 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/50"
          >
            <th
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
              :style="{ width: col.width }"
              :class="{
                'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200':
                  col.sortable,
              }"
              @click="col.sortable && handleSort(col.key)"
            >
              <span class="flex items-center gap-1">
                {{ col.title }}
                <span
                  v-if="col.sortable && sortKey === col.key"
                  class="i-carbon-chevron-down text-xs transition-transform"
                  :class="{ 'rotate-180': sortOrder === 'desc' }"
                />
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, idx) in sortedData"
            :key="idx"
            class="border-b border-gray-50 transition-colors hover:bg-gray-50/50 dark:border-gray-700/50 dark:hover:bg-gray-700/30"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
            >
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]" :index="idx">
                {{ row[col.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface TableColumn {
  key: string
  title: string
  width?: string
  sortable?: boolean
}

const props = withDefaults(
  defineProps<{
    columns: TableColumn[]
    data: Record<string, any>[]
    loading?: boolean
    emptyText?: string
  }>(),
  {
    loading: false,
    emptyText: '暂无数据',
  },
)

const sortKey = ref('')
const sortOrder = ref<'asc' | 'desc'>('asc')

const sortedData = computed(() => {
  if (!sortKey.value) return props.data
  return [...props.data].sort((a, b) => {
    const va = a[sortKey.value]
    const vb = b[sortKey.value]
    const cmp = va < vb ? -1 : va > vb ? 1 : 0
    return sortOrder.value === 'asc' ? cmp : -cmp
  })
})

function handleSort(key: string) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}
</script>
