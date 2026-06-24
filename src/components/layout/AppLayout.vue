<template>
  <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
    <!-- 侧边栏 -->
    <AppSidebar :collapsed="collapsed" @toggle="collapsed = !collapsed" />

    <!-- 右侧内容区 -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- 顶栏 -->
      <AppHeader :collapsed="collapsed" @toggle="collapsed = !collapsed" />

      <!-- 页面内容 -->
      <main class="flex-1 overflow-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const collapsed = ref(false)
</script>
