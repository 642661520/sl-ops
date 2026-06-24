<template>
  <TransitionGroup name="msg" tag="div" class="fixed top-4 right-4 z-9999 flex flex-col gap-2">
    <div
      v-for="item in messages"
      :key="item.id"
      class="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all"
      :class="{
        'bg-green-500 text-white': item.type === 'success',
        'bg-red-500 text-white': item.type === 'error',
        'bg-amber-500 text-white': item.type === 'warning',
        'bg-blue-500 text-white': item.type === 'info',
      }"
    >
      <span
        class="text-base"
        :class="{
          'i-carbon-checkmark': item.type === 'success',
          'i-carbon-close': item.type === 'error',
          'i-carbon-warning-alt': item.type === 'warning',
          'i-carbon-information': item.type === 'info',
        }"
      />
      {{ item.content }}
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
import type { MessageItem } from '@/composables/useMessage'

defineProps<{
  messages: MessageItem[]
}>()
</script>

<style scoped>
.msg-enter-active,
.msg-leave-active {
  transition: all 0.3s ease;
}
.msg-enter-from {
  opacity: 0;
  transform: translateX(40px);
}
.msg-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
</style>
