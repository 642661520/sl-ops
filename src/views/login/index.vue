<template>
  <div class="flex min-h-screen">
    <!-- 左侧品牌区 -->
    <div
      class="relative hidden w-[480px] flex-col justify-center overflow-hidden bg-gray-900 p-12 lg:flex"
    >
      <!-- 装饰背景 -->
      <div class="absolute inset-0 opacity-20">
        <div class="absolute -top-20 -left-20 h-80 w-80 rounded-full border border-white/20"></div>
        <div class="absolute top-1/3 right-0 h-60 w-60 rounded-full border border-white/10"></div>
        <div
          class="absolute -bottom-10 left-1/4 h-40 w-40 rounded-full border border-white/15"
        ></div>
        <div class="absolute top-10 right-20 h-2 w-2 rounded-full bg-white/30"></div>
        <div class="absolute bottom-1/4 right-1/3 h-1.5 w-1.5 rounded-full bg-white/20"></div>
        <div class="absolute top-1/2 left-10 h-1 w-1 rounded-full bg-white/25"></div>
        <!-- 连线装饰 -->
        <svg class="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <line
            x1="15%"
            y1="30%"
            x2="60%"
            y2="50%"
            stroke="white"
            stroke-width="0.5"
            opacity="0.15"
          />
          <line
            x1="40%"
            y1="60%"
            x2="80%"
            y2="40%"
            stroke="white"
            stroke-width="0.5"
            opacity="0.1"
          />
        </svg>
      </div>

      <div class="relative z-10">
        <div class="mb-4 flex items-center gap-3">
          <img src="/logo.svg" alt="Logo" class="h-10 w-10" />
          <span class="text-2xl font-bold tracking-wide text-white">运维管理平台</span>
        </div>
        <p class="mt-6 max-w-xs text-base leading-relaxed text-gray-400">
          统一管理服务器资产、服务运行状态，实时监控系统资源，高效运维尽在掌控。
        </p>

        <!-- 特性小点 -->
        <div class="mt-10 space-y-3">
          <div class="flex items-center gap-3 text-sm text-gray-400">
            <span class="i-carbon-checkmark text-green-400"></span>
            服务器资产统一纳管
          </div>
          <div class="flex items-center gap-3 text-sm text-gray-400">
            <span class="i-carbon-checkmark text-green-400"></span>
            服务运行状态实时监控
          </div>
          <div class="flex items-center gap-3 text-sm text-gray-400">
            <span class="i-carbon-checkmark text-green-400"></span>
            一键启停远程服务管控
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录表单 -->
    <div class="flex flex-1 items-center justify-center bg-gray-50 p-8 dark:bg-gray-900">
      <div class="w-full max-w-sm">
        <!-- 移动端Logo -->
        <div class="mb-10 text-center lg:hidden">
          <div class="mb-2 flex items-center justify-center gap-2">
            <img src="/logo.svg" alt="Logo" class="h-10 w-10" />
            <span class="text-xl font-bold text-gray-900 dark:text-white">运维管理平台</span>
          </div>
        </div>

        <h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">登录</h1>
        <p class="mb-8 text-sm text-gray-500 dark:text-gray-400">输入您的账号信息以访问平台</p>

        <form class="space-y-5" @submit.prevent="handleLogin">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >用户名</label
            >
            <app-input v-model="username" placeholder="请输入用户名" :clearable="false">
              <template #prefix>
                <span class="i-carbon-user-avatar"></span>
              </template>
            </app-input>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >密码</label
            >
            <app-input
              v-model="password"
              type="password"
              placeholder="请输入密码"
              :clearable="false"
            >
              <template #prefix>
                <span class="i-carbon-password"></span>
              </template>
            </app-input>
          </div>

          <div
            v-if="errorMsg"
            class="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
          >
            <span class="i-carbon-close"></span>
            {{ errorMsg }}
          </div>

          <app-button variant="primary" size="lg" :block="true" :loading="loading" class="mt-2">
            登 录
          </app-button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { MESSAGE_KEY } from '@/composables/useMessage'
import type { MessageInstance } from '@/composables/useMessage'

const router = useRouter()
const authStore = useAuthStore()
const message = inject<MessageInstance>(MESSAGE_KEY)!

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  errorMsg.value = ''
  if (!username.value || !password.value) {
    errorMsg.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  try {
    await authStore.login(username.value, password.value)
    message.success('登录成功')
    router.replace('/')
  } catch (e: unknown) {
    errorMsg.value = (e as { message?: string }).message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>
