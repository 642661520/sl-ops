<template>
  <div class="flex flex-col items-center justify-center py-12 text-gray-400">
    <span class="i-carbon-incomplete text-5xl text-gray-300 dark:text-gray-600" />
    <p class="mt-3 text-sm">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    description?: string
  }>(),
  {
    description: '暂无数据',
  },
)
</script>
