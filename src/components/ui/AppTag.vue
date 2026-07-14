<template>
  <span
    class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
    :class="typeClasses"
  >
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    type?: 'default' | 'info' | 'success' | 'warning' | 'danger'
  }>(),
  {
    type: 'default',
  },
)

const typeClasses = computed(() => {
  const map: Record<string, string> = {
    default: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  }
  return map[props.type] || map.default
})
</script>
