<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
    <router-view />
    <AppMessage :messages="messages" />
    <AppDialog :state="dialogState" @cancel="closeDialog" @confirm="closeDialog" />
  </div>
</template>

<script setup lang="ts">
import type { MessageItem } from '@/composables/useMessage'
import { createMessage, MESSAGE_KEY } from '@/composables/useMessage'
import type { DialogState } from '@/composables/useDialog'
import { createDialog, DIALOG_KEY } from '@/composables/useDialog'

// 暗色模式
useDark()

// 消息系统
const messages = ref<MessageItem[]>([])
const messageInstance = createMessage(messages)
provide(MESSAGE_KEY, messageInstance)

// 弹窗系统
const dialogState = ref<DialogState>({
  visible: false,
  title: '',
  content: '',
  confirmText: '确定',
  cancelText: '取消',
  type: 'default',
  loading: false,
  onConfirm: null,
})
const dialogInstance = createDialog(dialogState)
provide(DIALOG_KEY, dialogInstance)

function closeDialog() {
  dialogState.value.visible = false
  dialogState.value.onConfirm = null
}

// 全局扩展 window 类型,让 useMessage/useDialog 能够获取实例
// 由于 auto-import 可能不识别 MESSAGE_KEY/DIALOG_KEY inject,
// 这里直接在 App 组件中 provide,子组件中使用 inject 获取
</script>
