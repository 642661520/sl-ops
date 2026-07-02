<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="fixed inset-0 z-9990 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 transition-opacity" @click="handleCancel"></div>
        <div
          class="relative flex max-h-[85vh] flex-col rounded-xl bg-white shadow-2xl dark:bg-gray-800"
          :style="{ width: width || '520px' }"
        >
          <div
            class="flex-shrink-0 flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700"
          >
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {{ title }}
            </h3>
            <button
              class="cursor-pointer rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              @click="handleCancel"
            >
              <span class="i-carbon-close text-lg"></span>
            </button>
          </div>
          <div class="flex-1 overflow-auto px-6 py-4">
            <slot></slot>
          </div>
          <div
            v-if="showFooter"
            class="flex-shrink-0 flex justify-end gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-700"
          >
            <slot name="footer">
              <app-button variant="default" size="sm" @click="handleCancel">
                {{ cancelText }}
              </app-button>
              <app-button variant="primary" size="sm" :loading="loading" @click="handleConfirm">
                {{ confirmText }}
              </app-button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    visible: boolean
    title?: string
    width?: string
    confirmText?: string
    cancelText?: string
    loading?: boolean
    showFooter?: boolean
  }>(),
  {
    title: '',
    confirmText: '确定',
    cancelText: '取消',
    loading: false,
    showFooter: true,
  },
)

const emit = defineEmits<{
  confirm: []
  cancel: []
  'update:visible': [value: boolean]
}>()

function handleCancel() {
  emit('cancel')
  emit('update:visible', false)
}

function handleConfirm() {
  emit('confirm')
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
