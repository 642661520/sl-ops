<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="state.visible" class="fixed inset-0 z-9998 flex items-center justify-center">
        <!-- 遮罩 -->
        <div class="absolute inset-0 bg-black/50 transition-opacity" @click="handleCancel"></div>
        <!-- 弹窗 -->
        <div
          class="relative w-100 max-w-[90vw] rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
        >
          <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {{ state.title }}
          </h3>
          <p class="mb-6 text-sm text-gray-600 dark:text-gray-400">
            {{ state.content }}
          </p>
          <div class="flex justify-end gap-3">
            <app-button variant="default" size="sm" @click="handleCancel">
              {{ state.cancelText }}
            </app-button>
            <app-button
              :variant="state.type === 'danger' ? 'danger' : 'primary'"
              size="sm"
              :loading="localLoading"
              @click="handleConfirm"
            >
              {{ state.confirmText }}
            </app-button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { DialogState } from '@/composables/useDialog'

const props = defineProps<{
  state: DialogState
}>()

const emit = defineEmits<{
  cancel: []
  confirm: []
}>()

const localLoading = ref(false)

function handleCancel() {
  emit('cancel')
}

async function handleConfirm() {
  if (localLoading.value) return
  if (props.state.onConfirm) {
    localLoading.value = true
    try {
      await props.state.onConfirm()
      emit('confirm')
    } finally {
      localLoading.value = false
    }
  } else {
    emit('confirm')
  }
}
</script>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: all 0.2s ease;
}
.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}
.dialog-enter-from > div:last-child,
.dialog-leave-to > div:last-child {
  transform: scale(0.95);
}
</style>
