<template>
  <aside
    class="flex flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-800"
    :class="collapsed ? 'w-16' : 'w-56'"
  >
    <!-- Logo 区域 -->
    <div class="flex h-14 items-center border-b border-gray-100 px-3 dark:border-gray-700">
      <div class="flex items-center gap-2 overflow-hidden">
        <div
          class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-white"
        >
          <span class="text-sm font-bold">S</span>
        </div>
        <Transition name="fade">
          <span
            v-if="!collapsed"
            class="text-base font-bold whitespace-nowrap text-gray-900 dark:text-gray-100"
          >
            sl-ops
          </span>
        </Transition>
      </div>
    </div>

    <!-- 导航菜单 -->
    <nav class="flex-1 overflow-y-auto px-2 py-3">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200"
        :class="
          isActive(item.path)
            ? 'bg-primary/10 text-primary'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50'
        "
        :title="collapsed ? item.label : ''"
      >
        <span :class="item.icon" class="text-lg flex-shrink-0"></span>
        <Transition name="fade">
          <span v-if="!collapsed" class="whitespace-nowrap">{{ item.label }}</span>
        </Transition>
      </router-link>
    </nav>

    <!-- 底部折叠按钮 -->
    <div class="border-t border-gray-100 px-2 py-3 dark:border-gray-700">
      <button
        class="flex w-full cursor-pointer items-center justify-center rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
        @click="emit('toggle')"
      >
        <span
          class="i-carbon-side-panel-open text-lg transition-transform duration-300"
          :class="{ 'rotate-180': collapsed }"
        ></span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const route = useRoute()

const menuItems = [
  { path: '/', label: '仪表盘', icon: 'i-carbon-dashboard' },
  { path: '/servers', label: '服务器资产', icon: 'i-carbon-data-center' },
  { path: '/services', label: '服务管理', icon: 'i-carbon-cics-system-group' },
  { path: '/control', label: '服务管控', icon: 'i-carbon-terminal' },
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
