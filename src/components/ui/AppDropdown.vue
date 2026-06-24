<template>
  <div ref="dropdownRef" class="relative inline-block">
    <div @click="toggle">
      <slot name="trigger"></slot>
    </div>
    <Transition name="dropdown">
      <div
        v-if="open"
        class="absolute right-0 z-50 mt-2 min-w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-gray-800"
      >
        <slot></slot>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const open = ref(false)
const dropdownRef = ref<HTMLElement>()

function toggle() {
  open.value = !open.value
}

function handleClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

defineExpose({ close: () => (open.value = false) })

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
