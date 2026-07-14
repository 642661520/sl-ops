<template>
  <div
    class="relative flex items-center rounded-lg border transition-all duration-200"
    :class="{
      'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800': !disabled,
      'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-500':
        disabled,
      'ring-2 ring-primary/50': focused && !disabled,
    }"
  >
    <span
      v-if="$slots.prefix"
      class="ml-3"
      :class="disabled ? 'text-gray-300 dark:text-gray-600' : 'text-gray-400'"
    >
      <slot name="prefix"></slot>
    </span>
    <input
      ref="inputRef"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="w-full border-none bg-transparent px-3 py-2 text-sm outline-none disabled:cursor-not-allowed"
      :class="
        disabled
          ? 'text-gray-400 placeholder-gray-300 dark:text-gray-500 dark:placeholder-gray-600'
          : 'text-gray-900 placeholder-gray-400 dark:text-gray-100'
      "
      @input="handleInput"
      @focus="focused = true"
      @blur="focused = false"
    />
    <button
      v-if="clearable && modelValue && !disabled"
      class="mr-2 cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
      @click="handleClear"
    >
      <span class="i-carbon-close text-sm"></span>
    </button>
    <span
      v-if="$slots.suffix"
      class="mr-3"
      :class="disabled ? 'text-gray-300 dark:text-gray-600' : 'text-gray-400'"
    >
      <slot name="suffix"></slot>
    </span>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    disabled?: boolean
    clearable?: boolean
    type?: string
  }>(),
  {
    modelValue: '',
    type: 'text',
    clearable: false,
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const focused = ref(false)
const inputRef = ref<HTMLInputElement>()

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function handleClear() {
  emit('update:modelValue', '')
  inputRef.value?.focus()
}
</script>
