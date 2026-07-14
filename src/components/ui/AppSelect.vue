<template>
  <div ref="selectRef" class="relative">
    <button
      class="flex w-full cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm transition-all duration-200"
      :class="{
        'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800': !disabled,
        'cursor-not-allowed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50':
          disabled,
        'ring-2 ring-primary/50': open && !disabled,
      }"
      :disabled="disabled"
      @click="toggle"
    >
      <span
        class="min-w-0 flex-1 truncate text-left"
        :class="{
          'text-gray-400': !selectedLabel && !disabled,
          'text-gray-300 dark:text-gray-600': !selectedLabel && disabled,
          'text-gray-900 dark:text-gray-100': selectedLabel && !disabled,
          'text-gray-400 dark:text-gray-500': selectedLabel && disabled,
        }"
      >
        {{ selectedLabel || placeholder }}
      </span>
      <span
        class="i-carbon-chevron-down ml-1 shrink-0 text-sm transition-transform duration-200"
        :class="{
          'text-gray-400': !disabled,
          'text-gray-300 dark:text-gray-600': disabled,
          'rotate-180': open,
        }"
      ></span>
    </button>
    <Transition name="select">
      <div
        v-if="open"
        class="absolute z-50 w-full rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-gray-800"
        :class="dropUp ? 'bottom-full mb-1' : 'top-full mt-1'"
      >
        <button
          v-for="opt in options"
          :key="opt.value"
          class="w-full cursor-pointer truncate px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          :class="{
            'bg-primary/10 text-primary': opt.value === modelValue,
            'text-gray-700 dark:text-gray-300': opt.value !== modelValue,
          }"
          @click="select(opt.value)"
        >
          {{ opt.label }}
        </button>
        <div v-if="options.length === 0" class="px-3 py-4 text-center text-sm text-gray-400">
          暂无选项
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    options?: { label: string; value: string | number }[]
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    modelValue: '',
    options: () => [],
    placeholder: '请选择',
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const open = ref(false)
const selectRef = ref<HTMLElement>()
const dropUp = ref(false)

const selectedLabel = computed(() => {
  const opt = props.options.find((o) => o.value === props.modelValue)
  return opt?.label || ''
})

function toggle() {
  if (open.value) {
    open.value = false
    return
  }
  // 检测下方空间是否足够，不够则向上弹出
  if (selectRef.value) {
    const rect = selectRef.value.getBoundingClientRect()
    const estimatedHeight = Math.min(props.options.length, 6) * 36 + 16
    dropUp.value = rect.bottom + estimatedHeight > window.innerHeight && rect.top > estimatedHeight
  }
  open.value = true
}

function select(value: string | number) {
  emit('update:modelValue', value)
  open.value = false
}

function handleClickOutside(e: MouseEvent) {
  if (selectRef.value && !selectRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.select-enter-active,
.select-leave-active {
  transition: all 0.15s ease;
}
.select-enter-from,
.select-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
