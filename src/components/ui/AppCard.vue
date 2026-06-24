<template>
  <div
    class="rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    :class="paddingClass"
  >
    <div
      v-if="title || $slots.header"
      class="mb-3 flex items-center gap-2 border-b border-gray-100 pb-3 dark:border-gray-700"
    >
      <slot name="header">
        <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">
          {{ title }}
        </h3>
      </slot>
    </div>
    <slot></slot>
    <div v-if="$slots.footer" class="mt-4 border-t border-gray-100 pt-3 dark:border-gray-700">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    padding?: 'none' | 'sm' | 'md'
  }>(),
  {
    padding: 'md',
  },
)

const paddingClass = computed(() => {
  const map: Record<string, string> = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
  }
  return map.padding || map.md
})
</script>
