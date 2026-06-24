import type { InjectionKey, Ref } from 'vue'

export interface DialogOptions {
  title: string
  content: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'default'
  onConfirm: () => void | Promise<void>
}

export interface DialogInstance {
  show(opts: DialogOptions): void
}

export interface DialogState {
  visible: boolean
  title: string
  content: string
  confirmText: string
  cancelText: string
  type: 'danger' | 'default'
  loading: boolean
  onConfirm: (() => void | Promise<void>) | null
}

export const DIALOG_KEY: InjectionKey<DialogInstance> = Symbol('dialog')

export function createDialog(state: Ref<DialogState>): DialogInstance {
  function show(opts: DialogOptions) {
    state.value = {
      visible: true,
      title: opts.title,
      content: opts.content,
      confirmText: opts.confirmText || '确定',
      cancelText: opts.cancelText || '取消',
      type: opts.type || 'default',
      loading: false,
      onConfirm: opts.onConfirm,
    }
  }

  return { show }
}
