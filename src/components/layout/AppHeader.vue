<template>
  <header
    class="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800"
  >
    <!-- 左侧 -->
    <div class="flex items-center gap-3">
      <button
        class="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
        @click="emit('toggle')"
      >
        <span class="i-carbon-side-panel-open text-lg" :class="{ 'rotate-180': collapsed }" />
      </button>
      <div class="text-sm text-gray-500">
        <span class="text-gray-400">{{ pageTitle }}</span>
      </div>
    </div>

    <!-- 右侧 -->
    <div class="flex items-center gap-2">
      <!-- 主题切换 -->
      <button
        class="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
        @click="toggleDark()"
      >
        <span class="i-carbon-sun text-lg dark:i-carbon-moon" />
      </button>

      <!-- 通知 -->
      <button
        class="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
      >
        <span class="i-carbon-notification text-lg" />
      </button>

      <!-- 用户下拉 -->
      <app-dropdown>
        <template #trigger>
          <button
            class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span class="i-carbon-user-avatar text-xl text-gray-500 dark:text-gray-400" />
            <span class="text-sm text-gray-700 dark:text-gray-300">{{ username }}</span>
          </button>
        </template>
        <div class="w-36">
          <button
            class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            @click="handleLogout"
          >
            <span class="i-carbon-logout text-base" />
            退出登录
          </button>
        </div>
      </app-dropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { MESSAGE_KEY } from '@/composables/useMessage'
import type { MessageInstance } from '@/composables/useMessage'

defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const message = inject<MessageInstance>(MESSAGE_KEY)!

const isDark = useDark()

function toggleDark() {
  isDark.value = !isDark.value
}

const username = computed(() => authStore.userInfo?.username || '用户')

const pageTitle = computed(() => {
  const map: Record<string, string> = {
    dashboard: '仪表盘',
    services: '服务管理',
    servers: '服务器资产',
    control: '服务管控',
  }
  return map[String(route.name)] || ''
})

function handleLogout() {
  authStore.logout()
  message.success('已退出登录')
  router.replace('/login')
}
</script>
