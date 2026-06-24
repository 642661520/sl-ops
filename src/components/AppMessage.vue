<template>
  <TransitionGroup
    name="msg"
    tag="div"
    class="pointer-events-none fixed top-4 right-4 z-9999 flex flex-col gap-2"
  >
    <div
      v-for="item in messages"
      :key="item.id"
      class="pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-lg bg-white py-3 pr-4 pl-3 shadow-lg transition-all dark:bg-gray-800"
    >
      <!-- 左侧强调条 -->
      <div class="absolute top-0 left-0 h-full w-1" :class="barClass[item.type]"></div>
      <span
        class="mt-0.5 flex-shrink-0 text-base"
        :class="[iconClass[item.type], colorClass[item.type]]"
      ></span>
      <p class="text-sm leading-5 text-gray-700 dark:text-gray-200">
        {{ item.content }}
      </p>
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
import type { MessageItem } from '@/composables/useMessage'

defineProps<{
  messages: MessageItem[]
}>()

const barClass: Record<string, string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
}

const iconClass: Record<string, string> = {
  success: 'i-carbon-checkmark-filled',
  error: 'i-carbon-close-filled',
  warning: 'i-carbon-warning-filled',
  info: 'i-carbon-information-filled',
}

const colorClass: Record<string, string> = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
}
</script>

<style scoped>
.msg-enter-active {
  transition: all 0.25s ease-out;
}
.msg-leave-active {
  transition: all 0.2s ease-in;
}
.msg-enter-from {
  opacity: 0;
  transform: translateX(60px) scale(0.95);
}
.msg-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
