<template>
  <button
    class="inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    :class="[variantClasses, sizeClasses, { 'w-full': block }]"
    :disabled="disabled || loading"
    @click="emit('click', $event)"
  >
    <span v-if="loading" class="i-carbon-circle-dash animate-spin text-base"></span>
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'default' | 'danger' | 'text'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    disabled?: boolean
    block?: boolean
  }>(),
  {
    variant: 'default',
    size: 'md',
    loading: false,
    disabled: false,
    block: false,
  },
)

const emit = defineEmits<{
  click: [e: MouseEvent]
}>()

const variantClasses = computed(() => {
  const d = props.disabled || props.loading
  if (d) {
    const map: Record<string, string> = {
      primary: 'bg-primary/40 text-white/70 cursor-not-allowed',
      default:
        'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed dark:bg-gray-800/50 dark:text-gray-500 dark:border-gray-700',
      danger: 'bg-red-300 text-white/80 cursor-not-allowed dark:bg-red-800/40 dark:text-white/50',
      text: 'text-gray-300 cursor-not-allowed dark:text-gray-600',
    }
    return map[props.variant] || map.default
  }
  const map: Record<string, string> = {
    primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-pressed shadow-sm',
    default:
      'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700',
    danger:
      'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 dark:hover:bg-red-400 dark:active:bg-red-300 shadow-sm',
    text: 'text-gray-600 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800 dark:active:bg-gray-700',
  }
  return map[props.variant] || map.default
})

const sizeClasses = computed(() => {
  const map: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
  }
  return map[props.size] || map.md
})
</script>
