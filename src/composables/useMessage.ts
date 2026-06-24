import type { InjectionKey, Ref } from 'vue'

export interface MessageInstance {
  success(msg: string): void
  error(msg: string): void
  warning(msg: string): void
  info(msg: string): void
}

export interface MessageItem {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  content: string
}

export const MESSAGE_KEY: InjectionKey<MessageInstance> = Symbol('message')

let msgId = 0

export function createMessage(messages: Ref<MessageItem[]>): MessageInstance {
  function add(type: MessageItem['type'], content: string) {
    const id = ++msgId
    messages.value = [...messages.value, { id, type, content }]
    setTimeout(() => {
      messages.value = messages.value.filter((m) => m.id !== id)
    }, 3000)
  }

  return {
    success: (msg: string) => add('success', msg),
    error: (msg: string) => add('error', msg),
    warning: (msg: string) => add('warning', msg),
    info: (msg: string) => add('info', msg),
  }
}
