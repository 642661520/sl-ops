<template>
  <div v-if="totalPages > 1" class="flex items-center justify-center gap-1">
    <button
      class="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-gray-800"
      :disabled="current <= 1"
      @click="go(current - 1)"
    >
      <span class="i-carbon-chevron-left text-sm"></span>
    </button>
    <button
      v-for="p in displayPages"
      :key="p"
      class="min-w-8 cursor-pointer rounded-lg px-2 py-1.5 text-sm transition-colors"
      :class="{
        'bg-primary text-white': p === current,
        'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800': p !== current,
      }"
      @click="go(p)"
    >
      {{ p }}
    </button>
    <button
      class="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-gray-800"
      :disabled="current >= totalPages"
      @click="go(current + 1)"
    >
      <span class="i-carbon-chevron-right text-sm"></span>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    current: number
    total: number
    pageSize?: number
  }>(),
  {
    pageSize: 10,
  },
)

const emit = defineEmits<{
  change: [page: number]
}>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

const displayPages = computed(() => {
  const pages: number[] = []
  const max = 5
  let start = Math.max(1, props.current - Math.floor(max / 2))
  let end = start + max - 1
  if (end > totalPages.value) {
    end = totalPages.value
    start = Math.max(1, end - max + 1)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

function go(page: number) {
  if (page >= 1 && page <= totalPages.value && page !== props.current) {
    emit('change', page)
  }
}
</script>
